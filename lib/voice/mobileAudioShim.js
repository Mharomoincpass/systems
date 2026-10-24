/**
 * Mobile audio & browser compatibility shim for ElevenLabs Conversational AI.
 * Resolves iOS Safari & iOS Chrome WebKit issues, mobile autoplay restrictions,
 * AudioWorklet loading, and microphone permissions.
 */

let unlockedCtx = null;
let permissionsPatched = false;
let getUserMediaPatched = false;

function createMockPermissionStatus(name = "microphone") {
  const target = new EventTarget();
  return {
    state: "granted",
    name,
    onchange: null,
    addEventListener: (type, listener, options) =>
      target.addEventListener(type, listener, options),
    removeEventListener: (type, listener, options) =>
      target.removeEventListener(type, listener, options),
    dispatchEvent: (event) => target.dispatchEvent(event),
  };
}

/**
 * Patch `navigator.permissions.query` for WebKit (iOS Safari / iOS Chrome / iOS Edge / iOS Firefox).
 * WebKit WKWebView either:
 * 1) Omits `navigator.permissions.query` entirely (TypeError: navigator.permissions.query is not a function).
 * 2) Throws a fatal TypeError: "'microphone' is not a valid enum value of type PermissionName".
 * @elevenlabs/client calls `navigator.permissions.query({ name: "microphone" })` unconditionally,
 * which crashes the call immediately on iOS Chrome if unpatched.
 */
export function patchPermissionsQuery() {
  if (typeof window === "undefined" || !window.navigator || permissionsPatched) return;
  permissionsPatched = true;

  const safeQuery = async function (descriptor) {
    const permName = descriptor?.name;
    if (permName === "microphone" || permName === "camera") {
      return createMockPermissionStatus(permName);
    }
    return createMockPermissionStatus(permName || "microphone");
  };

  try {
    if (!window.navigator.permissions) {
      Object.defineProperty(window.navigator, "permissions", {
        value: { query: safeQuery },
        configurable: true,
        writable: true,
        enumerable: true,
      });
    } else {
      const origQuery = window.navigator.permissions.query?.bind(window.navigator.permissions);
      const queryWrapper = async function (descriptor) {
        if (!origQuery) {
          return safeQuery(descriptor);
        }
        try {
          return await origQuery(descriptor);
        } catch (err) {
          if (
            descriptor?.name === "microphone" ||
            descriptor?.name === "camera" ||
            err?.name === "TypeError"
          ) {
            return safeQuery(descriptor);
          }
          throw err;
        }
      };

      try {
        Object.defineProperty(window.navigator.permissions, "query", {
          value: queryWrapper,
          configurable: true,
          writable: true,
          enumerable: true,
        });
      } catch {
        window.navigator.permissions.query = queryWrapper;
      }

      if (window.Permissions && window.Permissions.prototype) {
        try {
          Object.defineProperty(window.Permissions.prototype, "query", {
            value: queryWrapper,
            configurable: true,
            writable: true,
            enumerable: true,
          });
        } catch {
          // ignore
        }
      }
    }
  } catch (e) {
    console.warn("Permissions query patch warning:", e);
  }
}

/**
 * Patch `navigator.mediaDevices.getUserMedia` for WebKit (iOS Safari / iOS Chrome).
 * Handles:
 * 1) OverconstrainedError: Some versions of WebKit reject constraints like { voiceIsolation: true }
 *    or sampleRate constraints that @elevenlabs/client passes.
 * 2) Ensures fallback to standard clean audio constraint if overconstrained.
 */
export function patchGetUserMedia() {
  if (
    typeof window === "undefined" ||
    !window.navigator?.mediaDevices?.getUserMedia ||
    getUserMediaPatched
  ) {
    return;
  }
  getUserMediaPatched = true;

  const origGUM = window.navigator.mediaDevices.getUserMedia.bind(
    window.navigator.mediaDevices
  );

  window.navigator.mediaDevices.getUserMedia = async function (constraints) {
    try {
      return await origGUM(constraints);
    } catch (err) {
      // If overconstrained or invalid constraint on iOS WebKit, retry with clean standard constraints
      if (
        constraints &&
        typeof constraints === "object" &&
        constraints.audio &&
        (err?.name === "OverconstrainedError" ||
          err?.name === "TypeError" ||
          err?.name === "ConstraintNotSatisfiedError")
      ) {
        console.warn(
          "getUserMedia overconstrained on iOS WebKit, falling back to standard audio constraints:",
          err?.message
        );
        try {
          return await origGUM({
            audio: {
              echoCancellation: true,
              noiseSuppression: true,
            },
          });
        } catch {
          return await origGUM({ audio: true });
        }
      }
      throw err;
    }
  };
}

/**
 * Detect iOS (iPhone, iPad, iPod, CriOS Chrome, or iPad running iPadOS desktop mode).
 */
export function isIosDevice() {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent || "";
  const platform = navigator.platform || "";
  return (
    /iPad|iPhone|iPod/.test(ua) ||
    /CriOS|FxiOS|EdgiOS/.test(ua) ||
    /iPad|iPhone|iPod/.test(platform) ||
    (platform === "MacIntel" && navigator.maxTouchPoints > 1)
  );
}

/**
 * Detect Android devices.
 */
export function isAndroidDevice() {
  if (typeof navigator === "undefined") return false;
  return /android/i.test(navigator.userAgent || "");
}

/**
 * Detect any mobile or tablet device.
 */
export function isMobileDevice() {
  return isIosDevice() || isAndroidDevice();
}

/**
 * Checks environment security and browser media capabilities.
 */
export function checkMobileAudioSupport() {
  if (typeof window === "undefined") {
    return { ok: true };
  }

  const isLocal =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1" ||
    window.location.hostname === "0.0.0.0";

  if (!window.isSecureContext && !isLocal) {
    return {
      ok: false,
      reason: "insecure_context",
      message:
        "Microphone requires a secure connection (HTTPS). Open the site using https://",
    };
  }

  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    return {
      ok: false,
      reason: "no_getusermedia",
      message:
        "Microphone access is not supported in this browser. Please allow microphone access or open in Safari.",
    };
  }

  return { ok: true };
}

/**
 * Synchronously unlocks Web Audio AudioContext and HTMLAudioElement playback policies
 * directly inside the user's touch/click gesture window.
 */
export async function unlockUserGestureAudio() {
  if (typeof window === "undefined") return null;

  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (AudioCtx) {
      if (!unlockedCtx || unlockedCtx.state === "closed") {
        unlockedCtx = new AudioCtx();
      }
      if (unlockedCtx.state === "suspended") {
        await unlockedCtx.resume().catch(() => {});
      }
      // Play a 1-sample silent Web Audio buffer
      const buffer = unlockedCtx.createBuffer(1, 1, 22050);
      const source = unlockedCtx.createBufferSource();
      source.buffer = buffer;
      source.connect(unlockedCtx.destination);
      source.start(0);
    }

    // Unlock HTML5 media element autoplay policy with a silent data-URL audio
    const dummyAudio = new Audio();
    dummyAudio.src =
      "data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA";
    dummyAudio.volume = 0.01;
    await dummyAudio.play().catch(() => {});
  } catch (err) {
    console.warn("User gesture audio unlock warning:", err);
  }

  return unlockedCtx;
}

/**
 * Ensure audio output flows cleanly to phone speakers.
 * On iOS WebKit (Safari & Chrome), Web Audio MediaStreamDestination attached to an <audio> tag
 * fails or produces silence.
 * Connecting the analyser directly to output.context.destination routes audio to hardware speakers.
 */
export function attachMobileAudioOutput(conversation) {
  if (!conversation?.output) return;

  const output = conversation.output;

  // 1. Resume AudioContext if suspended by mobile power management
  if (output.context && output.context.state === "suspended") {
    output.context.resume().catch(() => {});
  }

  // 2. Route analyser directly to hardware speaker destination on mobile
  if (output.analyser && output.context) {
    try {
      output.analyser.connect(output.context.destination);
      // Mute the auxiliary HTMLAudioElement to avoid echoing if both play
      if (output.audioElement) {
        output.audioElement.muted = true;
      }
    } catch (e) {
      // already connected or non-fatal
    }
  }

  // 3. Ensure HTMLAudioElement playback is initiated
  if (output.audioElement) {
    output.audioElement.play().catch(() => {});
  }
}
