/**
 * Mobile audio & browser compatibility shim for ElevenLabs Conversational AI.
 * Resolves iOS Safari WebKit issues, mobile autoplay restrictions, and Android audio routing.
 */

let unlockedCtx = null;
let permissionsPatched = false;

/**
 * Patch `navigator.permissions.query` for WebKit (iOS Safari / iOS Chrome / Firefox).
 * WebKit throws a fatal TypeError: "'microphone' is not a valid enum value of type PermissionName".
 * @elevenlabs/client calls `navigator.permissions.query({ name: "microphone" })` without a try-catch,
 * which crashes the call immediately on all iOS devices.
 */
export function patchPermissionsQuery() {
  if (typeof window === "undefined" || !window.navigator || permissionsPatched) return;
  permissionsPatched = true;

  const createMockStatus = (name) => {
    const target = new EventTarget();
    return {
      state: "granted",
      name: name || "microphone",
      onchange: null,
      addEventListener: target.addEventListener.bind(target),
      removeEventListener: target.removeEventListener.bind(target),
      dispatchEvent: target.dispatchEvent.bind(target),
    };
  };

  if (!window.navigator.permissions) {
    try {
      Object.defineProperty(window.navigator, "permissions", {
        value: {
          query: async (desc) => createMockStatus(desc?.name),
        },
        configurable: true,
        writable: true,
      });
    } catch {
      // ignore
    }
    return;
  }

  const origQuery = window.navigator.permissions.query?.bind(window.navigator.permissions);
  if (typeof origQuery === "function") {
    window.navigator.permissions.query = async function (descriptor) {
      try {
        return await origQuery(descriptor);
      } catch (err) {
        if (
          descriptor?.name === "microphone" ||
          descriptor?.name === "camera" ||
          err?.name === "TypeError"
        ) {
          return createMockStatus(descriptor?.name);
        }
        throw err;
      }
    };
  }
}

/**
 * Detect iOS (iPhone, iPad, iPod, or iPad running iPadOS desktop mode).
 */
export function isIosDevice() {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent || "";
  const platform = navigator.platform || "";
  return (
    /iPad|iPhone|iPod/.test(ua) ||
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
 * Web browsers block microphone access unless in a secure context (HTTPS / localhost).
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
        "Microphone access is not supported in this browser. Please use Safari on iOS or Chrome on Android.",
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
    // 1-sample 44-byte silent WAV
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
 * On iOS Safari, WebKit has a bug where routing Web Audio to MediaStreamDestination
 * attached to an <audio> tag fails or produces silence.
 * We attach the analyser directly to the hardware AudioContext destination on mobile.
 */
export function attachMobileAudioOutput(conversation) {
  if (!conversation?.output) return;

  const output = conversation.output;

  // 1. Resume AudioContext if suspended by mobile power management
  if (output.context && output.context.state === "suspended") {
    output.context.resume().catch(() => {});
  }

  // 2. On mobile/iOS devices, connect output analyser directly to hardware speaker destination
  if (isMobileDevice() && output.analyser && output.context) {
    try {
      output.analyser.connect(output.context.destination);
      // Mute the auxiliary HTMLAudioElement to avoid echoing on devices where both play
      if (output.audioElement) {
        output.audioElement.muted = true;
      }
    } catch (e) {
      console.warn("Direct hardware destination connect warning:", e);
    }
  }

  // 3. Ensure HTMLAudioElement playback is initiated
  if (output.audioElement) {
    output.audioElement.play().catch(() => {});
  }
}
