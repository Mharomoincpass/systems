"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import Head from "next/head";
import { ArrowLeft, ChevronLeft, ChevronRight, Tv, Play, ShieldAlert, RefreshCw, Lock, ShieldCheck } from "lucide-react";
import Hls from "hls.js";

const SEASONS = [
  { id: 1, episodes: 11, label: "Season 1" },
  { id: 2, episodes: 10, label: "Season 2" },
  { id: 3, episodes: 10, label: "Season 3" },
  { id: 4, episodes: 10, label: "Season 4" },
  { id: 5, episodes: 10, label: "Season 5" },
  { id: 6, episodes: 10, label: "Season 6" },
  { id: 7, episodes: 10, label: "Season 7" },
  { id: 8, episodes: 10, label: "Season 8" },
  { id: 9, episodes: 10, label: "Season 9" },
];

const SOURCES = [
  { id: "direct", name: "Direct" },
  { id: "xpass", name: "Server 1", buildUrl: (s, e) => `https://play.xpass.top/e/tv/60625/${s}/${e}` },
  { id: "vidsrc", name: "Server 2", buildUrl: (s, e) => `https://vidsrc.to/embed/tv/60625/${s}/${e}` },
];

const AUTH_KEY = "mharomo_rm_human_token";
const AUTH_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

export default function RickAndMortyPage() {
  const [isVerified, setIsVerified] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Captcha State
  const [captchaCode, setCaptchaCode] = useState("");
  const [userInput, setUserInput] = useState("");
  const [captchaError, setCaptchaError] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [loadTime] = useState(Date.now());
  const canvasRef = useRef(null);

  // Player State
  const [season, setSeason] = useState(9);
  const [episode, setEpisode] = useState(1);
  const [sourceId, setSourceId] = useState("direct");

  const videoRef = useRef(null);
  const hlsRef = useRef(null);

  // Check existing verification on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(AUTH_KEY);
      if (stored) {
        const timestamp = parseInt(stored, 10);
        if (!isNaN(timestamp) && Date.now() - timestamp < AUTH_EXPIRY_MS) {
          setIsVerified(true);
        } else {
          localStorage.removeItem(AUTH_KEY);
        }
      }
    } catch (e) {
      // LocalStorage access fail fallback
    } finally {
      setCheckingAuth(false);
    }
  }, []);

  // Generate randomized alphanumeric CAPTCHA
  const generateCaptcha = useCallback(() => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Omit ambiguous 0, O, 1, I
    let code = "";
    for (let i = 0; i < 5; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaCode(code);
    setUserInput("");
    setCaptchaError("");

    // Draw on Canvas
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Dark noise background
    ctx.fillStyle = "#09090b";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Background noise lines
    for (let i = 0; i < 7; i++) {
      ctx.strokeStyle = `rgba(255, 255, 255, ${0.1 + Math.random() * 0.2})`;
      ctx.lineWidth = 1 + Math.random() * 1.5;
      ctx.beginPath();
      ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
      ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height);
      ctx.stroke();
    }

    // Noise dots
    for (let i = 0; i < 60; i++) {
      ctx.fillStyle = `rgba(255, 255, 255, ${0.2 + Math.random() * 0.3})`;
      ctx.beginPath();
      ctx.arc(
        Math.random() * canvas.width,
        Math.random() * canvas.height,
        Math.random() * 1.5,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }

    // Draw individual characters with rotation and offset
    for (let i = 0; i < code.length; i++) {
      ctx.save();
      const x = 24 + i * 36;
      const y = 35 + (Math.random() - 0.5) * 8;
      const angle = ((Math.random() - 0.5) * 35 * Math.PI) / 180;

      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.font = "bold 28px monospace";
      ctx.fillStyle = "#ffffff";
      ctx.fillText(code[i], 0, 0);
      ctx.restore();
    }
  }, []);

  useEffect(() => {
    if (!isVerified && !checkingAuth) {
      generateCaptcha();
    }
  }, [isVerified, checkingAuth, generateCaptcha]);

  const handleVerifyCaptcha = (e) => {
    e.preventDefault();

    // 1. Honeypot check (filled only by automated bots)
    if (honeypot) {
      setCaptchaError("SECURITY_VIOLATION: BOT_TRIGGER_HONEYPOT");
      return;
    }

    // 2. Headless browser check
    if (typeof window !== "undefined" && window.navigator && window.navigator.webdriver) {
      setCaptchaError("ACCESS_DENIED: HEADLESS_AUTOMATION_DETECTED");
      return;
    }

    // 3. Human reaction time threshold (< 400ms is inhuman)
    if (Date.now() - loadTime < 400) {
      setCaptchaError("ACCESS_DENIED: ABNORMAL_TIMING");
      return;
    }

    // 4. Code match
    if (userInput.trim().toUpperCase() === captchaCode) {
      try {
        localStorage.setItem(AUTH_KEY, Date.now().toString());
      } catch (err) {}
      setIsVerified(true);
      setCaptchaError("");
    } else {
      setCaptchaError("INCORRECT CODE. PLEASE TRY AGAIN.");
      generateCaptcha();
    }
  };

  const handleLockSession = () => {
    try {
      localStorage.removeItem(AUTH_KEY);
    } catch (e) {}
    setIsVerified(false);
  };

  // Player Navigation & Logic
  const currentSeasonData = SEASONS.find((s) => s.id === season) || SEASONS[8];
  const maxEpisodes = currentSeasonData.episodes;
  const isDirectAvailable = season === 9;

  useEffect(() => {
    if (!isDirectAvailable && sourceId === "direct") {
      setSourceId("xpass");
    }
  }, [season, isDirectAvailable, sourceId]);

  const hlsUrl = `/videos/hls/ep${String(episode).padStart(2, "0")}/master.m3u8`;
  const mp4FallbackUrl = `/videos/Rick_and_Morty_S09E${String(episode).padStart(2, "0")}.mp4`;
  const activeSource = SOURCES.find((s) => s.id === sourceId) || SOURCES[0];
  const embedUrl = activeSource.buildUrl ? activeSource.buildUrl(season, episode) : "";

  // HLS stream management
  useEffect(() => {
    if (!isVerified || sourceId !== "direct" || !isDirectAvailable) return;

    const video = videoRef.current;
    if (!video) return;

    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = hlsUrl;
    } else if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: false,
        startFragPrefetch: true,
        progressive: true,
        backBufferLength: 30,
        maxBufferLength: 30,
        maxMaxBufferLength: 60,
        maxBufferSize: 60 * 1000 * 1000,
        maxBufferHole: 0.5,
        abrBandWidthFactor: 0.85,
        abrBandWidthUpFactor: 0.7,
        fragLoadingTimeOut: 20000,
        fragLoadingMaxRetry: 6,
        fragLoadingRetryDelay: 1000,
        fragLoadingMaxRetryTimeout: 8000,
        manifestLoadingTimeOut: 10000,
        manifestLoadingMaxRetry: 4,
      });

      hls.loadSource(hlsUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.ERROR, function (event, data) {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              hls.recoverMediaError();
              break;
            default:
              hls.destroy();
              video.src = mp4FallbackUrl;
              break;
          }
        }
      });

      hlsRef.current = hls;
    } else {
      video.src = mp4FallbackUrl;
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [isVerified, episode, season, sourceId, isDirectAvailable, hlsUrl, mp4FallbackUrl]);

  const handlePrevEpisode = () => {
    if (episode > 1) {
      setEpisode((prev) => prev - 1);
    } else if (season > 1) {
      const prevSeasonData = SEASONS.find((s) => s.id === season - 1);
      setSeason((s) => s - 1);
      setEpisode(prevSeasonData?.episodes || 10);
    }
  };

  const handleNextEpisode = () => {
    if (episode < maxEpisodes) {
      setEpisode((prev) => prev + 1);
    } else if (season < SEASONS.length) {
      setSeason((s) => s + 1);
      setEpisode(1);
    }
  };

  // Loading state
  if (checkingAuth) {
    return (
      <div className="min-h-[100dvh] bg-white text-black font-mono flex items-center justify-center p-4">
        <div className="text-xs tracking-widest uppercase">INITIALIZING SYSTEM GATEWAY...</div>
      </div>
    );
  }

  // --- CAPTCHA GATEWAY VIEW ---
  if (!isVerified) {
    return (
      <div className="min-h-[100dvh] bg-white text-black font-mono flex flex-col">
        {/* Anti-crawler Meta tags */}
        <head>
          <meta name="robots" content="noindex, nofollow, noarchive, nosnippet, noimageindex" />
          <meta name="googlebot" content="noindex, nofollow, noarchive" />
        </head>

        {/* Minimal Header */}
        <header className="border-b border-zinc-200 px-4 sm:px-8 py-3.5 flex items-center justify-between bg-white">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-zinc-600 hover:text-black transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Home
          </Link>
          <div className="text-[11px] text-zinc-500 uppercase tracking-widest font-bold">
            SECURITY GATEWAY
          </div>
        </header>

        {/* Centered Captcha Form */}
        <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
          <div className="w-full max-w-md border border-black bg-white p-6 sm:p-8 space-y-6">
            <div className="border-b border-zinc-200 pb-4">
              <div className="flex items-center gap-2 mb-1.5">
                <Lock className="w-4 h-4 text-black" />
                <h1 className="font-bold text-sm tracking-tight uppercase">
                  Human Verification Required
                </h1>
              </div>
              <p className="text-xs text-zinc-600">
                Automated crawlers and bot traffic are restricted. Solve the challenge below to access the repository.
              </p>
            </div>

            <form onSubmit={handleVerifyCaptcha} className="space-y-4">
              {/* Honeypot field (hidden from humans, trapped for bots) */}
              <input
                type="text"
                name="user_token_trap"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
                tabIndex={-1}
                autoComplete="off"
                className="hidden"
                aria-hidden="true"
              />

              {/* Captcha Canvas */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px] text-zinc-500 font-bold uppercase">
                  <span>Security Challenge</span>
                  <button
                    type="button"
                    onClick={generateCaptcha}
                    className="inline-flex items-center gap-1 text-black hover:underline"
                  >
                    <RefreshCw className="w-3 h-3" />
                    Refresh
                  </button>
                </div>

                <div className="flex justify-center border border-zinc-300 bg-zinc-950 p-3">
                  <canvas
                    ref={canvasRef}
                    width={220}
                    height={55}
                    className="block"
                  />
                </div>
              </div>

              {/* User Input */}
              <div className="space-y-1.5">
                <label htmlFor="captchaInput" className="text-[11px] font-bold text-zinc-700 uppercase">
                  Enter Code
                </label>
                <input
                  id="captchaInput"
                  type="text"
                  autoFocus
                  maxLength={6}
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value.toUpperCase())}
                  placeholder="5-CHARACTER CODE"
                  className="w-full px-3 py-2 text-sm font-mono uppercase tracking-widest border border-zinc-300 focus:border-black focus:outline-none transition-colors"
                />
              </div>

              {/* Error Notice */}
              {captchaError && (
                <div className="text-xs text-red-600 border border-red-200 bg-red-50 p-2 font-semibold">
                  {captchaError}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full py-2.5 bg-black text-white text-xs font-bold uppercase tracking-wider hover:bg-zinc-800 transition-colors"
              >
                Verify & Enter
              </button>
            </form>

            <div className="text-[10px] text-zinc-400 border-t border-zinc-200 pt-3">
              DEVICE: AUTHORIZED VIA BROWSER INTEGRITY CHECK
            </div>
          </div>
        </main>
      </div>
    );
  }

  // --- FULL PLAYER VIEW (AUTHENTICATED) ---
  return (
    <div className="min-h-[100dvh] bg-white text-black font-mono flex flex-col">
      <head>
        <meta name="robots" content="noindex, nofollow, noarchive, nosnippet, noimageindex" />
      </head>

      {/* Top Header */}
      <header className="shrink-0 border-b border-zinc-200 px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4 bg-white">
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-zinc-600 hover:text-black transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Home
          </Link>
          <span className="text-zinc-300">/</span>
          <div className="flex items-center gap-2 truncate">
            <Tv className="w-4 h-4 shrink-0 text-black" />
            <h1 className="font-bold text-sm sm:text-base tracking-tight truncate">
              Rick and Morty
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleLockSession}
            title="Lock Page"
            className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1.5 border border-zinc-300 hover:border-black transition-colors text-zinc-700"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-black" />
            Verified
          </button>
          <Link
            href="/studio"
            className="text-xs font-semibold px-3 py-1.5 border border-zinc-300 hover:border-black transition-colors"
          >
            Studio
          </Link>
          <Link
            href="/studio/voice"
            className="text-xs font-semibold px-3 py-1.5 border border-zinc-300 hover:border-black transition-colors"
          >
            Voice AI
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-3 sm:px-6 py-4 sm:py-6 flex flex-col gap-4 sm:gap-6">
        {/* Video Player */}
        <div className="w-full bg-black overflow-hidden border border-zinc-300 shadow-sm relative aspect-video flex items-center justify-center">
          {sourceId === "direct" && isDirectAvailable ? (
            <video
              ref={videoRef}
              controls
              playsInline
              preload="auto"
              className="w-full h-full object-contain bg-black"
            />
          ) : (
            <iframe
              key={`${season}-${episode}-${sourceId}`}
              src={embedUrl}
              title={`Rick and Morty S${season}E${episode}`}
              className="w-full h-full border-0 bg-black"
              allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
              allowFullScreen
            />
          )}
        </div>

        {/* Player Controls & Episode Info */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-zinc-200 pb-4">
          <div>
            <div className="text-[11px] uppercase tracking-wider text-zinc-500 mb-0.5">
              SEASON {season} • EPISODE {episode}
            </div>
            <h2 className="text-lg sm:text-xl font-bold tracking-tight">
              Rick and Morty — S{String(season).padStart(2, "0")}E{String(episode).padStart(2, "0")}
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={handlePrevEpisode}
              disabled={season === 1 && episode === 1}
              className="inline-flex items-center gap-1 px-3 py-1.5 border border-zinc-300 text-xs font-semibold hover:border-black disabled:opacity-30 disabled:pointer-events-none transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              Prev
            </button>
            <button
              type="button"
              onClick={handleNextEpisode}
              disabled={season === SEASONS.length && episode === maxEpisodes}
              className="inline-flex items-center gap-1 px-3 py-1.5 border border-zinc-300 text-xs font-semibold hover:border-black disabled:opacity-30 disabled:pointer-events-none transition-colors"
            >
              Next
              <ChevronRight className="w-3.5 h-3.5" />
            </button>

            {/* Source Selector */}
            <div className="flex items-center gap-1 sm:pl-2 sm:border-l sm:border-zinc-200">
              {SOURCES.map((src) => {
                if (src.id === "direct" && !isDirectAvailable) return null;
                const isActive = sourceId === src.id;
                return (
                  <button
                    key={src.id}
                    type="button"
                    onClick={() => setSourceId(src.id)}
                    className={`px-2.5 py-1.5 text-xs font-semibold transition-colors border ${
                      isActive
                        ? "bg-black text-white border-black"
                        : "bg-white text-zinc-700 border-zinc-300 hover:border-black"
                    }`}
                  >
                    {src.name}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Season Selector */}
        <div className="space-y-2">
          <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
            Select Season
          </p>
          <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {SEASONS.map((s) => {
              const isActive = season === s.id;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => {
                    setSeason(s.id);
                    if (episode > s.episodes) setEpisode(1);
                  }}
                  className={`shrink-0 px-3 py-1.5 text-xs font-semibold transition-colors border ${
                    isActive
                      ? "bg-black text-white border-black"
                      : "bg-white text-black border-zinc-300 hover:border-black"
                  }`}
                >
                  {s.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Episode Selector */}
        <div className="space-y-2">
          <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
            Select Episode (Season {season})
          </p>
          <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5 sm:gap-2">
            {Array.from({ length: maxEpisodes }, (_, i) => i + 1).map((epNum) => {
              const isActive = episode === epNum;
              return (
                <button
                  key={epNum}
                  type="button"
                  onClick={() => setEpisode(epNum)}
                  className={`flex flex-col items-center justify-center p-2.5 sm:p-3 text-center border transition-all ${
                    isActive
                      ? "bg-black text-white border-black"
                      : "bg-white text-zinc-800 border-zinc-200 hover:border-black"
                  }`}
                >
                  <Play className={`w-3.5 h-3.5 mb-1 ${isActive ? "text-white fill-white" : "text-zinc-400"}`} />
                  <span className="text-[11px] font-bold">EP {epNum}</span>
                </button>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
