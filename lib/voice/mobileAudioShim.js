/**
 * Mobile audio & browser compatibility shim for ElevenLabs Conversational AI.
 * Resolves iOS Safari & iOS Chrome WebKit issues, mobile autoplay restrictions,
 * AudioWorklet loading, microphone deadlocks, and permissions.
 */

let unlockedCtx = null;
let permissionsPatched = false;
let getUserMediaPatched = false;
let audioContextPatched = false;
let activeAudioStream = null;

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
 * WebKit WKWebView either omits `query` or throws on `'microphone'`.
 */
export function patchPermissionsQuery() {
  if (typeof window === "undefined" || !window.navigator || permissionsPatched) return;
  permissionsPatched = true;

  const safeQuery = async function (descriptor) {
    const permName = descriptor?.name;
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
        try {
          window.navigator.permissions.query = queryWrapper;
        } catch {}
      }

      if (window.Permissions && window.Permissions.prototype) {
        try {
          Object.defineProperty(window.Permissions.prototype, "query", {
            value: queryWrapper,
            configurable: true,
            writable: true,
            enumerable: true,
          });
        } catch {}
      }
    }
  } catch (e) {
    console.warn("Permissions query patch warning:", e);
  }
}

/**
 * Patch `navigator.mediaDevices.getUserMedia` & `getSupportedConstraints` for WebKit.
 * 1) Injects `sampleRate: true` into getSupportedConstraints so ElevenLabs uses native WebKit
 *    resampling instead of loading the slow 2MB `libsamplerate` JS worklet on mobile.
 * 2) Clones active stream tracks when called multiple times, preventing iOS single-client mic deadlocks.
 * 3) Catches OverconstrainedError and retries with standard audio.
 */
export function patchGetUserMedia() {
  if (
    typeof window === "undefined" ||
    !window.navigator?.mediaDevices ||
    getUserMediaPatched
  ) {
    return;
  }
  getUserMediaPatched = true;

  // 1. Bypass 2MB libsamplerate worklet by reporting sampleRate support
  if (typeof window.navigator.mediaDevices.getSupportedConstraints === "function") {
    const origConstraints = window.navigator.mediaDevices.getSupportedConstraints.bind(
      window.navigator.mediaDevices
    );
    window.navigator.mediaDevices.getSupportedConstraints = function () {
      const c = origConstraints();
      return { ...c, sampleRate: true };
    };
  }

  // 2. Patch getUserMedia to avoid iOS microphone hardware deadlocks
  const origGUM = window.navigator.mediaDevices.getUserMedia.bind(
    window.navigator.mediaDevices
  );

  window.navigator.mediaDevices.getUserMedia = async function (constraints) {
    // If an active stream already exists on iOS with live audio tracks, clone it to avoid hardware contention
    if (
      activeAudioStream &&
      activeAudioStream.getAudioTracks().some((t) => t.readyState === "live")
    ) {
      try {
        return activeAudioStream.clone();
      } catch {
        // fallback to normal capture
      }
    }

    try {
      const stream = await origGUM(constraints);
      activeAudioStream = stream;
      return stream;
    } catch (err) {
      if (
        constraints &&
        typeof constraints === "object" &&
        constraints.audio &&
        (err?.name === "OverconstrainedError" ||
          err?.name === "TypeError" ||
          err?.name === "ConstraintNotSatisfiedError")
      ) {
        console.warn(
          "getUserMedia overconstrained on iOS WebKit, retrying with standard audio constraints:",
          err?.message
        );
        try {
          const stream = await origGUM({
            audio: {
              echoCancellation: true,
              noiseSuppression: true,
            },
          });
          activeAudioStream = stream;
          return stream;
        } catch {
          const stream = await origGUM({ audio: true });
          activeAudioStream = stream;
          return stream;
        }
      }
      throw err;
    }
  };
}

/**
 * Patch AudioContext.prototype.resume on WebKit so it never hangs indefinitely
 * if called outside of transient user activation.
 */
export function patchAudioContext() {
  if (typeof window === "undefined" || audioContextPatched) return;
  audioContextPatched = true;

  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx || !AudioCtx.prototype) return;

  const origResume = AudioCtx.prototype.resume;
  if (typeof origResume === "function") {
    AudioCtx.prototype.resume = function () {
      // Race original resume with a 300ms timeout so callers never hang
      return Promise.race([
        origResume.apply(this),
        new Promise((resolve) => setTimeout(resolve, 300)),
      ]).catch(() => {});
    };
  }
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

  if (window.isSecureContext === false && !isLocal) {
    return {
      ok: false,
      reason: "insecure_context",
      message:
        "Microphone requires HTTPS. Please open https://mharomo.systems/studio/voice",
    };
  }

  if (
    typeof navigator !== "undefined" &&
    navigator.mediaDevices &&
    typeof navigator.mediaDevices.getUserMedia !== "function"
  ) {
    return {
      ok: false,
      reason: "no_getusermedia",
      message:
        "Microphone not available in this browser. In iOS Settings > Chrome, enable Microphone access.",
    };
  }

  return { ok: true };
}

/**
 * Synchronously unlocks Web Audio AudioContext and HTMLAudioElement playback policies
 * directly inside the user's touch/click gesture window. Does not block execution.
 */
export function unlockUserGestureAudio() {
  if (typeof window === "undefined") return null;

  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (AudioCtx) {
      if (!unlockedCtx || unlockedCtx.state === "closed") {
        unlockedCtx = new AudioCtx();
      }
      if (unlockedCtx.state === "suspended") {
        unlockedCtx.resume().catch(() => {});
      }
      // Play a 1-sample silent Web Audio buffer
      try {
        const buffer = unlockedCtx.createBuffer(1, 1, 22050);
        const source = unlockedCtx.createBufferSource();
        source.buffer = buffer;
        source.connect(unlockedCtx.destination);
        source.start(0);
      } catch {}
    }

    // Unlock HTML5 media element autoplay policy with a silent data-URL audio
    try {
      const dummyAudio = new Audio();
      dummyAudio.src =
        "data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA";
      dummyAudio.volume = 0.01;
      dummyAudio.play().catch(() => {});
    } catch {}
  } catch (err) {
    console.warn("User gesture audio unlock warning:", err);
  }

  return unlockedCtx;
}

/**
 * Ensure audio output flows cleanly to phone speakers.
 * Connects the analyser directly to output.context.destination.
 */
export function attachMobileAudioOutput(conversation) {
  if (!conversation?.output) return;

  const output = conversation.output;

  // 1. Resume AudioContext if suspended by mobile power management
  if (output.context && output.context.state === "suspended") {
    output.context.resume().catch(() => {});
  }

  // 2. Route analyser directly to hardware speaker destination
  if (output.analyser && output.context) {
    try {
      output.analyser.connect(output.context.destination);
      if (output.audioElement) {
        output.audioElement.muted = true;
      }
    } catch (e) {
      // ignore
    }
  }

  // 3. Ensure HTMLAudioElement playback is initiated
  if (output.audioElement) {
    output.audioElement.play().catch(() => {});
  }
}
