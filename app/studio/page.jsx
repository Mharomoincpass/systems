"use client";

import Link from "next/link";
import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import {
  Image as ImageIcon,
  Download,
  Trash2,
  Upload,
  X,
  RefreshCw,
  ChevronDown,
  LayoutGrid,
  ScrollText,
} from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  prepareReferenceImageDataUrl,
  referenceUploadErrorMessage,
} from "@/lib/prepareReferenceImage";
import {
  galleryItemFromApi,
  persistStudioMedia,
} from "@/lib/studioGalleryClient";
import {
  DEFAULT_IMAGE_MODEL_ID,
  STUDIO_IMAGE_MODELS,
  getImageModelLabel,
  getImageModelMeta,
  getImageModelPriceDisplay,
  getImageModelMode,
  getImageModelModeLabel,
  getImageModelModeShort,
  IMAGE_MODEL_MODES,
  modelSupportsReferenceImage,
  STUDIO_IMAGE_TO_IMAGE_MODELS,
  STUDIO_TEXT_TO_IMAGE_MODELS,
} from "@/lib/studioImageModels";

const ASPECT_RATIOS = [
  { id: "1:1", label: "1:1" },
  { id: "16:9", label: "16:9" },
  { id: "9:16", label: "9:16" },
  { id: "4:3", label: "4:3" },
  { id: "3:4", label: "3:4" },
];

const QUICK_PROMPTS = [
  "A basket of fresh red crisp honeycrisp apples on a rustic oak table, soft morning sunlight, 8k photographic",
  "Futuristic minimalist pavilion made of curved concrete and travertine in sunlit dunes",
  "Macro shot of water droplets on a deep red glossy apple skin, studio macro photography",
  "Overhead drone view of an apple orchard in autumn with red apples and golden afternoon light",
];

const STUDIO_TABS = ["image", "gallery", "logs"];

const STUDIO_NAV_TABS = [
  { id: "image", label: "Image", icon: ImageIcon },
  { id: "gallery", label: "Gallery", icon: LayoutGrid },
  { id: "logs", label: "Logs", icon: ScrollText },
];

const UPDATES_SUBSCRIBED_KEY = "frsion-updates-subscribed";
const UPDATES_SESSION_KEY = "frsion-updates-prompt-session";

function normalizeStudioTab(id) {
  if (id === "gallery" || id === "logs") return id;
  if (id === "image" || id === "video" || id === "music") return "image";
  return null;
}

function isStudioTab(id) {
  return STUDIO_TABS.includes(id);
}

function readPersistedStudioTab() {
  if (typeof window === "undefined") return null;
  const fromUrl = normalizeStudioTab(
    new URLSearchParams(window.location.search).get("tab")
  );
  if (fromUrl) return fromUrl;
  try {
    const stored = normalizeStudioTab(sessionStorage.getItem("frsion-studio-tab"));
    if (stored) return stored;
  } catch {
    /* ignore */
  }
  return null;
}

function formatAdminTime(ms) {
  return new Date(ms).toLocaleString();
}

function persistStudioTab(tabId) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem("frsion-studio-tab", tabId);
  } catch {
    /* ignore */
  }
  const url = new URL(window.location.href);
  url.searchParams.set("tab", tabId);
  window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
}

function readAdminViewFromUrl() {
  if (typeof window === "undefined") return { open: false, tab: "logs" };
  const params = new URLSearchParams(window.location.search);
  const open = params.get("admin") === "1";
  const tab = params.get("adminTab") === "emails" ? "emails" : "logs";
  return { open, tab };
}

function persistAdminView(open, adminTabId = "logs") {
  if (typeof window === "undefined") return;
  try {
    if (open) sessionStorage.setItem("frsion-admin-open", "1");
    else sessionStorage.removeItem("frsion-admin-open");
  } catch {
    /* ignore */
  }
  const url = new URL(window.location.href);
  if (open) {
    url.searchParams.set("admin", "1");
    url.searchParams.set("adminTab", adminTabId);
  } else {
    url.searchParams.delete("admin");
    url.searchParams.delete("adminTab");
  }
  window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
}

export default function FrsionStudioPage() {
  const [activeTab, setActiveTabState] = useState(() => {
    if (typeof window === "undefined") return "image";
    return readPersistedStudioTab() || "image";
  });

  const setActiveTab = useCallback((tabId) => {
    if (!isStudioTab(tabId)) return;
    setActiveTabState(tabId);
    persistStudioTab(tabId);
  }, []);

  useEffect(() => {
    const tab = readPersistedStudioTab();
    if (tab) {
      setActiveTabState(tab);
      persistStudioTab(tab);
    }
  }, []);
  const [galleryFilter, setGalleryFilter] = useState("all");
  const [credits, setCredits] = useState(null);
  const [creditDetails, setCreditDetails] = useState(null);
  const [isLoadingCredits, setIsLoadingCredits] = useState(false);
  const [showCreditsTooltip, setShowCreditsTooltip] = useState(false);
  const [adminLoginOpen, setAdminLoginOpen] = useState(false);
  const [adminPanelOpen, setAdminPanelOpen] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminData, setAdminData] = useState(null);
  const [adminTab, setAdminTabState] = useState(() => readAdminViewFromUrl().tab);

  const setAdminTab = useCallback((tabId) => {
    const next = tabId === "emails" ? "emails" : "logs";
    setAdminTabState(next);
    persistAdminView(true, next);
  }, []);
  const [mailSubject, setMailSubject] = useState("");
  const [mailBody, setMailBody] = useState("");
  const [mailSending, setMailSending] = useState(false);
  const [updatesOpen, setUpdatesOpen] = useState(false);
  const [updatesEmail, setUpdatesEmail] = useState("");
  const [updatesLoading, setUpdatesLoading] = useState(false);

  // Shared prompt state
  const [prompt, setPrompt] = useState("");
  const [negativePrompt, setNegativePrompt] = useState("");

  // Image settings
  const [imageStyle, setImageStyle] = useState("");
  const [aspectRatio, setAspectRatio] = useState("1:1");
  const [imageModel, setImageModel] = useState(DEFAULT_IMAGE_MODEL_ID);
  const [referenceImage, setReferenceImage] = useState("");
  const [referenceUploading, setReferenceUploading] = useState(false);

  // Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [progressText, setProgressText] = useState("");
  const [progressPct, setProgressPct] = useState(0);
  const [statusNote, setStatusNote] = useState("");

  // Creations list + selected active item
  const [creations, setCreations] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [galleryPreviewItem, setGalleryPreviewItem] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [generationHistory, setGenerationHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const fileInputRef = useRef(null);
  const [engineDropdownOpen, setEngineDropdownOpen] = useState(false);
  const [engineModeFilter, setEngineModeFilter] = useState("all");
  const engineDropdownRef = useRef(null);

  const selectedImageModel =
    getImageModelMeta(imageModel) ||
    STUDIO_IMAGE_MODELS.find((m) => m.id === imageModel) ||
    STUDIO_IMAGE_MODELS[0];

  const imageModelSupportsRef = modelSupportsReferenceImage(imageModel);
  const selectedImageModelMode = getImageModelMode(selectedImageModel);

  const engineDropdownSections = useMemo(() => {
    if (engineModeFilter === IMAGE_MODEL_MODES.TEXT_TO_IMAGE) {
      return [{ id: "t2i", title: "Text→Image", models: STUDIO_TEXT_TO_IMAGE_MODELS }];
    }
    if (engineModeFilter === IMAGE_MODEL_MODES.IMAGE_TO_IMAGE) {
      return [{ id: "i2i", title: "Image→Image", models: STUDIO_IMAGE_TO_IMAGE_MODELS }];
    }
    return [
      { id: "t2i", title: "Text→Image", models: STUDIO_TEXT_TO_IMAGE_MODELS },
      { id: "i2i", title: "Image→Image", models: STUDIO_IMAGE_TO_IMAGE_MODELS },
    ];
  }, [engineModeFilter]);

  useEffect(() => {
    if (imageModelSupportsRef) return;
    setReferenceImage("");
  }, [imageModel, imageModelSupportsRef]);

  useEffect(() => {
    if (!getImageModelMeta(imageModel)) {
      setImageModel(DEFAULT_IMAGE_MODEL_ID);
    }
  }, [imageModel]);

  useEffect(() => {
    if (!engineDropdownOpen) return;
    const onPointerDown = (e) => {
      if (engineDropdownRef.current?.contains(e.target)) return;
      setEngineDropdownOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [engineDropdownOpen]);

  const handleReferenceUpload = async (e) => {
    const input = e.target;
    const file = input.files?.[0];
    if (!file) return;

    setReferenceUploading(true);
    try {
      const dataUrl = await prepareReferenceImageDataUrl(file);
      setReferenceImage(dataUrl);
      toast.success("Reference image attached");
    } catch (err) {
      const code = err?.message || "read_failed";
      toast.error(referenceUploadErrorMessage(code));
      setReferenceImage("");
    } finally {
      setReferenceUploading(false);
      input.value = "";
    }
  };

  const openReferenceFilePicker = () => {
    const input = fileInputRef.current;
    if (!input) return;
    input.value = "";
    input.click();
  };

  const fetchCredits = useCallback(async () => {
    setIsLoadingCredits(true);
    try {
      const res = await fetch("/api/studio/credits");
      const data = await res.json();
      if (data && data.success) {
        setCredits(data.balance);
        setCreditDetails(data);
      }
    } catch (err) {
      console.warn("Failed to fetch Pollinations credits:", err);
    } finally {
      setIsLoadingCredits(false);
    }
  }, []);

  useEffect(() => {
    fetchCredits();
  }, [fetchCredits]);

  useEffect(() => {
    try {
      const host = window.location.hostname;
      if (host === "localhost" || host === "127.0.0.1") return undefined;
      const subscribed = localStorage.getItem(UPDATES_SUBSCRIBED_KEY) === "1";
      const shownThisSession = sessionStorage.getItem(UPDATES_SESSION_KEY) === "1";
      if (!subscribed && !shownThisSession) {
        sessionStorage.setItem(UPDATES_SESSION_KEY, "1");
        const timer = setTimeout(() => setUpdatesOpen(true), 600);
        return () => clearTimeout(timer);
      }
    } catch {
      /* ignore storage */
    }
    return undefined;
  }, []);

  useEffect(() => {
    const path = `${window.location.pathname}${window.location.search}`;
    fetch("/api/studio/visit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ path }),
    }).catch(() => {});
  }, []);

  const loadAdminDashboard = useCallback(async () => {
    const res = await fetch("/api/studio/admin/dashboard", {
      credentials: "include",
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      if (res.status === 401) {
        setAdminPanelOpen(false);
        persistAdminView(false);
      }
      throw new Error(data?.error || "Could not load admin data");
    }
    setAdminData(data);
    return data;
  }, []);

  useEffect(() => {
    if (!adminPanelOpen) return;
    loadAdminDashboard().catch((err) => {
      toast.error(err?.message || "Admin refresh failed");
    });
    const interval = setInterval(() => {
      loadAdminDashboard().catch(() => {});
    }, 10000);
    return () => clearInterval(interval);
  }, [adminPanelOpen, loadAdminDashboard]);

  useEffect(() => {
    const { open, tab } = readAdminViewFromUrl();
    let shouldOpen = open;
    if (!shouldOpen) {
      try {
        shouldOpen = sessionStorage.getItem("frsion-admin-open") === "1";
      } catch {
        shouldOpen = false;
      }
    }
    if (tab === "emails" || tab === "logs") {
      setAdminTabState(tab);
    }
    if (!shouldOpen) return;

    loadAdminDashboard()
      .then(() => {
        setAdminPanelOpen(true);
        persistAdminView(true, tab);
      })
      .catch(() => {
        setAdminPanelOpen(false);
        persistAdminView(false);
      });
  }, [loadAdminDashboard]);

  const handleAdminLogin = async (e) => {
    e?.preventDefault();
    setAdminLoading(true);
    try {
      const res = await fetch("/api/studio/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ password: adminPassword }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data?.error || "Invalid password");
        return;
      }
      setAdminPassword("");
      setAdminLoginOpen(false);
      setAdminPanelOpen(true);
      persistAdminView(true, adminTab);
      await loadAdminDashboard();
    } catch (err) {
      toast.error(err?.message || "Login failed");
    } finally {
      setAdminLoading(false);
    }
  };

  const dismissUpdatesPopup = () => {
    setUpdatesOpen(false);
  };

  const markUpdatesSubscribed = () => {
    try {
      localStorage.setItem(UPDATES_SUBSCRIBED_KEY, "1");
    } catch {
      /* ignore */
    }
  };

  const handleUpdatesSubscribe = async (e) => {
    e?.preventDefault();
    const email = updatesEmail.trim();
    if (!email) {
      toast.error("Enter an email address");
      return;
    }
    setUpdatesLoading(true);
    try {
      const res = await fetch("/api/studio/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data?.error || "Could not save email");
        return;
      }
      markUpdatesSubscribed();
      setUpdatesOpen(false);
      if (data.alreadySubscribed) {
        toast.success("You’re already on the list — bomboclat.");
      } else if (data.welcomeQueued && !data.welcomeSent) {
        toast.success("You’re on the list. Welcome email is queued — admin needs ZeptoMail FROM + valid API key.");
      } else {
        toast.success("You’re in. Check your inbox for the welcome email.");
      }
    } catch (err) {
      toast.error(err?.message || "Subscribe failed");
    } finally {
      setUpdatesLoading(false);
    }
  };

  const handleAdminLogout = async () => {
    await fetch("/api/studio/admin/logout", {
      method: "POST",
      credentials: "include",
    }).catch(() => {});
    setAdminPanelOpen(false);
    setAdminData(null);
    setAdminTabState("logs");
    persistAdminView(false);
  };

  const adminUnifiedFeed = useMemo(() => {
    const visits = (adminData?.visits || []).map((v) => ({
      id: `visit-${v.id}`,
      at: v.at,
      kind: "visit",
      ip: v.ip,
      path: v.path,
      visitKind: v.kind,
      userAgent: v.userAgent,
    }));
    const logs = (adminData?.logs || []).map((l) => ({
      id: `log-${l.id}`,
      at: l.at,
      kind: "log",
      level: l.level,
      message: l.message,
      meta: l.meta,
    }));
    return [...visits, ...logs].sort((a, b) => b.at - a.at);
  }, [adminData]);

  const handleDeleteSubscriber = async (subscriberId) => {
    if (!subscriberId) return;
    try {
      const res = await fetch(
        `/api/studio/admin/subscribers/${encodeURIComponent(subscriberId)}`,
        { method: "DELETE", credentials: "include" }
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data?.error || "Could not delete subscriber");
        return;
      }
      toast.success("Subscriber removed");
      await loadAdminDashboard();
    } catch (err) {
      toast.error(err?.message || "Delete failed");
    }
  };

  const handleAdminBroadcast = async (e) => {
    e?.preventDefault();
    const subs = adminData?.subscribers?.length || 0;
    if (subs === 0) {
      toast.error("No subscribers to email yet.");
      return;
    }
    if (!mailSubject.trim() || !mailBody.trim()) {
      toast.error("Subject and body are required.");
      return;
    }
    setMailSending(true);
    try {
      const res = await fetch("/api/studio/admin/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          subject: mailSubject.trim(),
          body: mailBody.trim(),
          sendToAll: true,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data?.error || "Bulk send failed");
        return;
      }
      toast.success(
        data.deliveredLive > 0
          ? `Sent ${data.deliveredLive}/${data.total} via ZeptoMail`
          : `Saved ${data.queuedOutbox || data.sent}/${data.total} to outbox — set ZEPTOMAIL_API_KEY and ZEPTOMAIL_FROM`
      );
      await loadAdminDashboard();
    } catch (err) {
      toast.error(err?.message || "Bulk send failed");
    } finally {
      setMailSending(false);
    }
  };

  const loadGenerationHistory = useCallback(async () => {
    setHistoryLoading(true);
    try {
      const res = await fetch("/api/studio/generation-history");
      const data = await res.json();
      if (data?.ok && Array.isArray(data.items)) {
        setGenerationHistory(data.items);
      }
    } catch (err) {
      console.warn("Failed to load generation history:", err);
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  const loadGallery = useCallback(async () => {
    try {
      const res = await fetch("/api/studio/gallery");
      const data = await res.json();
      if (data?.success && Array.isArray(data.items)) {
        setCreations(data.items);
        // Studio stage stays empty after refresh; only drop preview if item expired from gallery.
        setSelectedItem((prev) => {
          if (!prev) return null;
          return data.items.some((i) => i.id === prev.id) ? prev : null;
        });
      }
    } catch (err) {
      console.warn("Failed to load gallery:", err);
    }
  }, []);

  useEffect(() => {
    loadGallery();
  }, [loadGallery]);

  useEffect(() => {
    const interval = setInterval(loadGallery, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [loadGallery]);

  useEffect(() => {
    if (activeTab === "logs") {
      loadGenerationHistory();
    }
  }, [activeTab, loadGenerationHistory]);

  useEffect(() => {
    if (activeTab === "gallery" || activeTab === "logs") return;
    setGalleryPreviewItem(null);
  }, [activeTab]);

  const registerCreation = async (draft, savePayload) => {
    let item = draft;
    if (savePayload) {
      try {
        const saved = await persistStudioMedia(savePayload);
        item = { ...draft, ...saved };
      } catch (err) {
        console.warn("Gallery save failed:", err);
        toast.error(err?.message || "Could not save to gallery");
      }
    }
    setCreations((prev) => {
      const without = prev.filter((c) => c.id !== item.id);
      return [item, ...without];
    });
    setSelectedItem(item);
    return item;
  };

  const handleGenerate = async (e) => {
    e?.preventDefault();
    const trimmedPrompt =
      prompt.trim() ||
      QUICK_PROMPTS[Math.floor(Math.random() * QUICK_PROMPTS.length)];

    if (!prompt.trim()) {
      setPrompt(trimmedPrompt);
    }

    setIsGenerating(true);
    setProgressPct(20);
    setStatusNote("");

    try {
      setProgressText("Generating AI image...");
      const res = await fetch("/api/studio/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "image",
          prompt: trimmedPrompt,
          negativePrompt,
          style: imageStyle,
          aspectRatio,
          model: imageModel,
          referenceImage,
        }),
      });

      setProgressPct(75);
      const data = await res.json().catch(() => ({}));
      const finalUrl = data.url || data.dataUrl;

      if (res.ok && finalUrl) {
        const draft = {
          id: Date.now().toString(),
          type: "image",
          url: finalUrl,
          prompt: trimmedPrompt,
          style: imageStyle,
          aspectRatio,
          provider: data.provider || getImageModelLabel(imageModel),
          createdAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };
        const item = galleryItemFromApi(data, draft);
        await registerCreation(item, item.url.startsWith("/api/") ? null : {
          type: "image",
          prompt: trimmedPrompt,
          provider: draft.provider,
          url: finalUrl,
          meta: { style: imageStyle, aspectRatio },
        });
      } else {
        const errMsg = data?.error || "Image generation failed";
        setStatusNote(errMsg);
        toast.error(errMsg);
      }
    } catch (err) {
      console.error("Studio generate error:", err);
      setStatusNote(err?.message || "Generation error occurred");
    } finally {
      setIsGenerating(false);
      setProgressPct(100);
      setTimeout(() => setProgressPct(0), 400);
      fetchCredits();
      loadGenerationHistory();
    }
  };

  const openHistoryPreview = (entry) => {
    if (entry.status !== "success" || !entry.mediaUrl) return;
    setGalleryPreviewItem({
      id: entry.mediaId || entry.id,
      type: "image",
      url: entry.mediaUrl,
      prompt: entry.prompt,
      provider: entry.provider,
      createdAt: entry.atLabel,
    });
  };

  const handleDownload = (item) => {
    if (!item?.url) return;
    const a = document.createElement("a");
    a.href = item.url;
    const ext = item.type === "image" ? "jpg" : "bin";
    a.download = `studio-${item.type}-${item.id}.${ext}`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const handleCopyPrompt = (item) => {
    navigator.clipboard.writeText(item.prompt || "");
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const handleDelete = async (id) => {
    try {
      await fetch(`/api/studio/gallery/${encodeURIComponent(id)}`, { method: "DELETE" });
    } catch (err) {
      console.warn("Gallery delete failed:", err);
    }
    setCreations((prev) => {
      const next = prev.filter((c) => c.id !== id);
      if (selectedItem?.id === id) {
        setSelectedItem(next[0] || null);
      }
      return next;
    });
    if (galleryPreviewItem?.id === id) {
      setGalleryPreviewItem(null);
    }
  };

  const filteredCreations = creations.filter((c) => {
    if (c.type !== "image") return false;
    return galleryFilter === "all" ? true : c.type === galleryFilter;
  });

  const galleryFilterButtons = (
    <div className="flex items-center gap-1">
      {["all", "image"].map((f) => (
        <button
          key={f}
          type="button"
          onClick={() => setGalleryFilter(f)}
          className={`px-2 py-0.5 text-[10px] font-mono uppercase border cursor-pointer ${
            galleryFilter === f
              ? "bg-black text-white border-black"
              : "bg-white text-zinc-600 border-zinc-200 hover:border-black"
          }`}
        >
          {f}
        </button>
      ))}
    </div>
  );

  const renderStudioNavTab = (tab, { compact = false } = {}) => {
    const Icon = tab.icon;
    const active = activeTab === tab.id;
    return (
      <button
        key={tab.id}
        type="button"
        onClick={() => setActiveTab(tab.id)}
        className={`flex items-center justify-center gap-1.5 font-mono font-semibold transition-colors cursor-pointer touch-manipulation ${
          compact
            ? `flex-1 flex-col min-h-[3.25rem] py-2 text-[10px] uppercase tracking-wide border-t-2 ${
                active ? "text-black border-black bg-zinc-50" : "text-zinc-500 border-transparent"
              }`
            : `px-4 py-1.5 min-h-[44px] text-xs ${
                active
                  ? "bg-black text-white"
                  : "bg-white text-black hover:bg-zinc-100"
              }`
        }`}
      >
        <Icon className={compact ? "w-5 h-5" : "w-3.5 h-3.5"} />
        {tab.label}
      </button>
    );
  };

  return (
    <div className="h-[100dvh] w-screen overflow-hidden bg-white text-black flex flex-col font-sans select-none pb-[calc(3.75rem+env(safe-area-inset-bottom,0px))] lg:pb-0">
      {/* Top Header Bar: Clean Stark Monochrome */}
      <header className="shrink-0 border-b border-zinc-200 px-3 sm:px-6 pt-safe bg-white z-10">
        <div className="relative flex items-center justify-between gap-2 min-h-12 lg:min-h-14">
          <div className="flex items-center gap-2 min-w-0">
            <Link
              href="/"
              className="font-mono font-bold text-sm sm:text-base tracking-tight text-black shrink-0 hover:underline underline-offset-4"
            >
              FrsionOS
            </Link>
            <Link
              href="/studio/voice"
              className="text-[10px] font-mono font-bold uppercase text-zinc-500 hover:text-black shrink-0"
            >
              Voice AI
            </Link>
            <div className="relative min-w-0">
            <button
              type="button"
              onClick={() => {
                fetchCredits();
                setShowCreditsTooltip((v) => !v);
              }}
              onMouseEnter={() => setShowCreditsTooltip(true)}
              onMouseLeave={() => setShowCreditsTooltip(false)}
              className="border border-black px-2 py-1 sm:px-2.5 sm:py-0.5 text-[10px] sm:text-xs font-mono font-medium hover:bg-black hover:text-white transition-colors cursor-pointer flex items-center gap-1 max-w-[11rem] sm:max-w-none truncate touch-manipulation min-h-[36px] sm:min-h-0"
              title="Resets to 0.4 Pollen in 24 hours. Tap to refresh balance."
            >
              <span className="truncate">
                <span className="hidden sm:inline">Credits: </span>
                {credits === null
                  ? "…"
                  : `${Number(credits).toFixed(3)}`}
                <span className="hidden sm:inline"> Pollen</span>
              </span>
              <RefreshCw
                className={`w-3 h-3 shrink-0 ${isLoadingCredits ? "animate-spin" : "opacity-60"}`}
              />
            </button>

            {showCreditsTooltip && (
              <div className="absolute left-0 top-full mt-2 w-64 bg-white border border-black p-3 shadow-xl z-50 text-[11px] font-mono select-text text-left">
                <p className="text-[10px] font-bold text-black bg-zinc-100 border border-zinc-200 px-2 py-1.5 mb-2 leading-snug">
                  Resets to 0.4 Pollen in 24 hours
                </p>
                {creditDetails ? (
                  <>
                    <div className="font-bold border-b border-zinc-200 pb-1.5 mb-2 flex items-center justify-between text-black">
                      <span>Pollinations.ai Balance</span>
                      <span
                        className="inline-block w-2 h-2 rounded-full bg-emerald-500"
                        title="Connected"
                      />
                    </div>
                    <div className="space-y-1 text-zinc-700">
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Live Pollen:</span>
                        <span className="font-bold text-black">
                          {Number(creditDetails.balance || 0).toFixed(4)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-500">USD Value:</span>
                        <span className="text-black">
                          ${Number(creditDetails.balance || 0).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Tier / Promo:</span>
                        <span className="text-black">
                          {Number(creditDetails.tier || 0).toFixed(4)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Paid Credits:</span>
                        <span className="text-black">
                          {Number(creditDetails.paid || 0).toFixed(4)}
                        </span>
                      </div>
                      {creditDetails.profile?.username && (
                        <div className="flex justify-between pt-1.5 mt-1 border-t border-zinc-200 text-[10px] text-zinc-600">
                          <span>Account:</span>
                          <span className="font-bold text-black truncate max-w-[140px]">
                            @{creditDetails.profile.username}
                          </span>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <p className="text-[10px] text-zinc-500 mb-1">Loading balance…</p>
                )}
                <div className="mt-2.5 pt-1.5 border-t border-zinc-100 text-[10px] text-zinc-400 text-center">
                  Click badge to refresh live balance
                </div>
              </div>
            )}
          </div>
          </div>

          <div className="hidden lg:flex items-center border border-black p-0.5 absolute left-1/2 -translate-x-1/2">
            {STUDIO_NAV_TABS.map((tab) => renderStudioNavTab(tab))}
          </div>

          <button
            type="button"
            onClick={() => setAdminLoginOpen(true)}
            className="w-10 h-10 sm:w-8 sm:h-8 shrink-0 border border-black bg-white text-black hover:bg-black hover:text-white text-xs font-mono font-bold transition-colors cursor-pointer flex items-center justify-center touch-manipulation"
            title="Admin"
            aria-label="Admin"
          >
            A
          </button>
        </div>
      </header>

      {!adminPanelOpen && (
      <nav
        className="lg:hidden fixed bottom-0 inset-x-0 z-40 border-t border-zinc-200 bg-white/95 backdrop-blur-sm pb-safe"
        aria-label="Studio sections"
      >
        <div className="flex items-stretch divide-x divide-zinc-200">
          {STUDIO_NAV_TABS.map((tab) => renderStudioNavTab(tab, { compact: true }))}
        </div>
      </nav>
      )}

      {activeTab === "gallery" ? (
        <div className="flex-1 min-h-0 flex flex-col bg-white overflow-hidden">
          <div className="shrink-0 px-4 py-3 border-b border-zinc-200 flex flex-wrap items-center justify-between gap-2">
            <div>
              <span className="text-[11px] font-mono font-bold uppercase text-black block">
                Gallery ({filteredCreations.length})
              </span>
              <span className="text-[9px] font-mono text-zinc-500">
                Saved on server · auto-deleted after 24 hours
              </span>
            </div>
            {galleryFilterButtons}
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto p-3">
            {filteredCreations.length === 0 ? (
              <div className="h-full min-h-[12rem] flex items-center justify-center border border-dashed border-zinc-300 text-xs font-mono text-zinc-400">
                Empty gallery. Generations appear here for 24 hours — create from Image.
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-2">
                {filteredCreations.map((item) => {
                  const active = galleryPreviewItem?.id === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setGalleryPreviewItem(item)}
                      className={`group relative aspect-square border bg-zinc-100 overflow-hidden cursor-pointer transition-colors ${
                        active ? "border-black ring-1 ring-black" : "border-zinc-200 hover:border-black"
                      }`}
                      title={item.prompt}
                    >
                      {item.type === "image" && (
                        <img src={item.url} alt="" className="w-full h-full object-cover" />
                      )}
                      <span className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-[8px] font-mono uppercase px-1 py-0.5 truncate">
                        {item.type}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {galleryPreviewItem && (
            <div
              className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
              onClick={() => setGalleryPreviewItem(null)}
              role="dialog"
              aria-modal="true"
              aria-label="Gallery preview"
            >
              <div
                className="bg-white border border-black w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden shadow-xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="shrink-0 flex items-center justify-between gap-2 px-3 py-2 border-b border-zinc-200">
                  <div className="min-w-0 text-[10px] font-mono uppercase text-zinc-600 truncate">
                    {galleryPreviewItem.type} · {galleryPreviewItem.provider} ·{" "}
                    {galleryPreviewItem.createdAt}
                  </div>
                  <button
                    type="button"
                    onClick={() => setGalleryPreviewItem(null)}
                    className="shrink-0 p-1 text-zinc-500 hover:text-black cursor-pointer"
                    aria-label="Close preview"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex-1 min-h-0 flex items-center justify-center p-4 overflow-hidden bg-zinc-50">
                  {galleryPreviewItem.type === "image" && (
                    <img
                      src={galleryPreviewItem.url}
                      alt={galleryPreviewItem.prompt}
                      className="max-h-[min(60vh,720px)] max-w-full object-contain border border-zinc-300"
                    />
                  )}
                </div>

                <div className="shrink-0 border-t border-zinc-200 p-3 flex flex-col sm:flex-row sm:items-center gap-3">
                  <p className="flex-1 text-xs font-mono text-black min-w-0 line-clamp-3">
                    {galleryPreviewItem.prompt}
                  </p>
                  <div className="flex flex-wrap gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleCopyPrompt(galleryPreviewItem)}
                      className="px-3 py-1.5 border border-zinc-300 hover:border-black text-xs font-mono cursor-pointer"
                    >
                      {copiedId === galleryPreviewItem.id ? "Copied" : "Copy Prompt"}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDownload(galleryPreviewItem)}
                      className="px-3 py-1.5 bg-black text-white text-xs font-mono cursor-pointer flex items-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Download
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(galleryPreviewItem.id)}
                      className="px-3 py-1.5 border border-zinc-300 hover:border-black text-xs font-mono cursor-pointer flex items-center gap-1.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : activeTab === "logs" ? (
        <div className="flex-1 min-h-0 flex flex-col bg-white overflow-hidden">
          <div className="shrink-0 px-4 py-3 border-b border-zinc-200 flex flex-wrap items-center justify-between gap-2">
            <div>
              <span className="text-[11px] font-mono font-bold uppercase text-black block">
                Generation history ({generationHistory.length})
              </span>
              <span className="text-[9px] font-mono text-zinc-500">
                Success & failed runs · kept 24 hours on server
              </span>
            </div>
            <button
              type="button"
              onClick={() => loadGenerationHistory()}
              disabled={historyLoading}
              className="px-2 py-1 text-[10px] font-mono uppercase border border-zinc-300 hover:border-black disabled:opacity-50 cursor-pointer flex items-center gap-1"
            >
              <RefreshCw className={`w-3 h-3 ${historyLoading ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto overflow-x-auto">
            {generationHistory.length === 0 ? (
              <div className="h-full min-h-[12rem] flex items-center justify-center border border-dashed border-zinc-300 m-3 text-xs font-mono text-zinc-400">
                {historyLoading ? "Loading history…" : "No generations logged yet."}
              </div>
            ) : (
              <table className="w-full text-[11px] font-mono">
                <thead className="sticky top-0 bg-zinc-50 border-b border-zinc-200 text-left text-[10px] uppercase text-zinc-600">
                  <tr>
                    <th className="px-3 py-2 font-semibold w-36">Time</th>
                    <th className="px-3 py-2 font-semibold w-20">Status</th>
                    <th className="px-3 py-2 font-semibold w-16">Preview</th>
                    <th className="px-3 py-2 font-semibold">Prompt</th>
                    <th className="px-3 py-2 font-semibold w-40">Engine</th>
                  </tr>
                </thead>
                <tbody>
                  {generationHistory.map((entry) => {
                    const ok = entry.status === "success";
                    return (
                      <tr
                        key={entry.id}
                        className="border-b border-zinc-100 align-top hover:bg-zinc-50"
                      >
                        <td className="px-3 py-2 text-zinc-600 whitespace-nowrap">
                          {entry.atLabel}
                        </td>
                        <td className="px-3 py-2">
                          <span
                            className={`inline-block px-1.5 py-0.5 text-[9px] font-bold uppercase border ${
                              ok
                                ? "border-black bg-black text-white"
                                : "border-red-600 text-red-700 bg-red-50"
                            }`}
                          >
                            {ok ? "OK" : "Fail"}
                          </span>
                        </td>
                        <td className="px-3 py-2">
                          {ok && entry.mediaUrl ? (
                            <button
                              type="button"
                              onClick={() => openHistoryPreview(entry)}
                              className="w-10 h-10 border border-zinc-200 hover:border-black overflow-hidden cursor-pointer bg-zinc-100"
                            >
                              <img
                                src={entry.mediaUrl}
                                alt=""
                                className="w-full h-full object-cover"
                              />
                            </button>
                          ) : (
                            <span className="text-zinc-300">—</span>
                          )}
                        </td>
                        <td className="px-3 py-2 min-w-0">
                          <p className="line-clamp-2 text-black" title={entry.prompt}>
                            {entry.prompt}
                          </p>
                          {!ok && entry.error && (
                            <p className="text-[10px] text-red-600 mt-1 line-clamp-2" title={entry.error}>
                              {entry.error}
                            </p>
                          )}
                        </td>
                        <td className="px-3 py-2 text-zinc-600">
                          <div className="truncate" title={entry.provider}>
                            {entry.provider}
                          </div>
                          {entry.aspectRatio && (
                            <div className="text-[9px] text-zinc-400">{entry.aspectRatio}</div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {galleryPreviewItem && (
            <div
              className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
              onClick={() => setGalleryPreviewItem(null)}
              role="dialog"
              aria-modal="true"
              aria-label="Generation preview"
            >
              <div
                className="bg-white border border-black w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden shadow-xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="shrink-0 flex items-center justify-between gap-2 px-3 py-2 border-b border-zinc-200">
                  <div className="min-w-0 text-[10px] font-mono uppercase text-zinc-600 truncate">
                    {galleryPreviewItem.provider} · {galleryPreviewItem.createdAt}
                  </div>
                  <button
                    type="button"
                    onClick={() => setGalleryPreviewItem(null)}
                    className="shrink-0 p-1 text-zinc-500 hover:text-black cursor-pointer"
                    aria-label="Close preview"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex-1 min-h-0 flex items-center justify-center p-4 overflow-hidden bg-zinc-50">
                  <img
                    src={galleryPreviewItem.url}
                    alt={galleryPreviewItem.prompt}
                    className="max-h-[min(60vh,720px)] max-w-full object-contain border border-zinc-300"
                  />
                </div>
                <div className="shrink-0 border-t border-zinc-200 p-3 flex flex-wrap gap-2">
                  <p className="flex-1 text-xs font-mono text-black min-w-0 line-clamp-3">
                    {galleryPreviewItem.prompt}
                  </p>
                  <button
                    type="button"
                    onClick={() => handleCopyPrompt(galleryPreviewItem)}
                    className="px-3 py-1.5 border border-zinc-300 hover:border-black text-xs font-mono cursor-pointer"
                  >
                    {copiedId === galleryPreviewItem.id ? "Copied" : "Copy Prompt"}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDownload(galleryPreviewItem)}
                    className="px-3 py-1.5 bg-black text-white text-xs font-mono cursor-pointer flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
      <div className="flex-1 min-h-0 flex flex-col lg:grid lg:grid-cols-12 overflow-hidden">
        {/* Preview first on mobile, left on desktop */}
        <main className="order-1 lg:order-2 col-span-12 lg:col-span-8 min-h-[38dvh] max-h-[45dvh] lg:max-h-none lg:min-h-0 h-auto lg:h-full flex flex-col bg-zinc-50 lg:bg-white overflow-hidden border-b lg:border-b-0 border-zinc-200">
          <div className="flex-1 min-h-0 flex flex-col p-3 sm:p-4 overflow-hidden relative">
            {isGenerating ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center">
                <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin mb-3" />
                <p className="text-xs font-mono font-bold uppercase text-black">
                  {progressText || "Synthesizing media..."}
                </p>
                {progressPct > 0 && (
                  <div className="w-48 max-w-full h-1 bg-zinc-200 mt-3 overflow-hidden">
                    <div
                      className="h-full bg-black transition-all duration-200"
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                )}
              </div>
            ) : selectedItem?.type === "image" ? (
              <div className="flex-1 min-h-0 flex flex-col">
                <div className="flex-1 min-h-0 flex items-center justify-center overflow-hidden">
                  <img
                    src={selectedItem.url}
                    alt={selectedItem.prompt}
                    className="max-h-full max-w-full object-contain border border-zinc-300 bg-white"
                  />
                </div>
                <div className="shrink-0 pt-2 lg:pt-3 border-t border-zinc-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="text-[10px] font-mono text-zinc-500 uppercase">
                      {selectedItem.type} · {selectedItem.provider}
                    </div>
                    <p className="text-xs font-mono text-black line-clamp-2 sm:truncate mt-0.5">
                      {selectedItem.prompt}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleCopyPrompt(selectedItem)}
                      className="flex-1 sm:flex-none min-h-[44px] sm:min-h-0 px-3 py-2 sm:py-1.5 border border-zinc-300 hover:border-black text-xs font-mono text-black transition-colors cursor-pointer touch-manipulation"
                    >
                      {copiedId === selectedItem.id ? "Copied" : "Copy"}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDownload(selectedItem)}
                      className="flex-1 sm:flex-none min-h-[44px] sm:min-h-0 px-3 py-2 sm:py-1.5 bg-black text-white hover:bg-zinc-800 text-xs font-mono transition-colors cursor-pointer flex items-center justify-center gap-1.5 touch-manipulation"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Save
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-4 text-zinc-400">
                <p className="text-xs font-mono uppercase tracking-wider text-zinc-500">
                  Preview
                </p>
                <p className="text-[10px] font-mono text-zinc-400 mt-1 max-w-xs">
                  Your image appears here after you generate
                </p>
              </div>
            )}
          </div>
        </main>

        <aside className="order-2 lg:order-1 col-span-12 lg:col-span-4 flex-1 min-h-0 lg:h-full border-r border-zinc-200 flex flex-col bg-white overflow-hidden">
          <form
            onSubmit={handleGenerate}
            className="flex-1 min-h-0 flex flex-col overflow-hidden"
          >
            <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-3 sm:p-4 space-y-4">
              {/* Prompt Textarea */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-black">
                    Prompt
                  </label>
                  {prompt && (
                    <button
                      type="button"
                      onClick={() => setPrompt("")}
                      className="text-[10px] font-mono text-zinc-500 hover:text-black cursor-pointer"
                    >
                      Clear
                    </button>
                  )}
                </div>
                <textarea
                  rows={3}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe image to generate..."
                  className="w-full border border-zinc-300 focus:border-black p-2.5 text-base sm:text-xs text-black font-mono placeholder:text-zinc-400 outline-none resize-none bg-white transition-colors"
                />
              </div>

              {/* IMAGE CONTROLS */}
                <>
                  <div>
                    <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-600 block mb-1.5">
                      Aspect Ratio
                    </label>
                    <div className="grid grid-cols-5 gap-1">
                      {ASPECT_RATIOS.map((ar) => {
                        const selected = aspectRatio === ar.id;
                        return (
                          <button
                            key={ar.id}
                            type="button"
                            onClick={() => setAspectRatio(ar.id)}
                            className={`py-2.5 sm:py-1.5 text-xs font-mono border transition-colors cursor-pointer touch-manipulation min-h-[44px] sm:min-h-0 ${
                              selected
                                ? "bg-black text-white border-black"
                                : "bg-white text-black border-zinc-200 hover:border-black"
                            }`}
                          >
                            {ar.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div ref={engineDropdownRef} className="relative">
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <label
                        htmlFor="image-engine-trigger"
                        className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-600"
                      >
                        Engine ({STUDIO_IMAGE_MODELS.length})
                      </label>
                      <div className="flex items-center gap-1">
                        {[
                          { id: "all", label: "All" },
                          {
                            id: IMAGE_MODEL_MODES.TEXT_TO_IMAGE,
                            label: "T2I",
                            title: "Text→Image — prompt only",
                          },
                          {
                            id: IMAGE_MODEL_MODES.IMAGE_TO_IMAGE,
                            label: "I2I",
                            title: "Image→Image — reference upload",
                          },
                        ].map((f) => {
                          const active = engineModeFilter === f.id;
                          return (
                            <button
                              key={f.id}
                              type="button"
                              title={f.title}
                              onClick={() => setEngineModeFilter(f.id)}
                              className={`px-1.5 py-0.5 text-[9px] font-mono font-bold border cursor-pointer transition-colors ${
                                active
                                  ? "bg-black text-white border-black"
                                  : "bg-white text-zinc-600 border-zinc-200 hover:border-black"
                              }`}
                            >
                              {f.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    <button
                      id="image-engine-trigger"
                      type="button"
                      aria-expanded={engineDropdownOpen}
                      aria-haspopup="listbox"
                      onClick={() => setEngineDropdownOpen((o) => !o)}
                      className="w-full border border-zinc-300 hover:border-black focus:border-black p-2.5 text-left bg-white transition-colors cursor-pointer flex items-start gap-2"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 min-w-0">
                          <span
                            className={`shrink-0 border px-1 py-px text-[8px] font-mono font-bold uppercase ${
                              selectedImageModelMode === IMAGE_MODEL_MODES.IMAGE_TO_IMAGE
                                ? "border-black bg-black text-white"
                                : "border-zinc-400 text-zinc-600 bg-zinc-50"
                            }`}
                          >
                            {getImageModelModeShort(selectedImageModelMode)}
                          </span>
                          <span className="text-[11px] font-mono font-semibold text-black truncate flex-1">
                            {selectedImageModel.label}
                          </span>
                          <span className="text-[9px] font-mono text-zinc-500 shrink-0">
                            {getImageModelPriceDisplay(selectedImageModel)}
                          </span>
                        </div>
                        <p className="text-[9px] font-mono text-zinc-500 mt-0.5 line-clamp-1 pl-0">
                          <span className="text-zinc-400">
                            {getImageModelModeLabel(selectedImageModelMode)}
                            {" · "}
                          </span>
                          {selectedImageModel.description}
                        </p>
                      </div>
                      <ChevronDown
                        className={`w-4 h-4 shrink-0 text-black mt-0.5 transition-transform ${
                          engineDropdownOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {engineDropdownOpen && (
                      <div className="absolute left-0 right-0 top-full mt-1 z-30 max-h-56 overflow-y-auto border border-black bg-white shadow-lg">
                        {engineDropdownSections.map((section) => (
                          <div key={section.id}>
                            <div className="sticky top-0 z-10 px-2.5 py-1 bg-zinc-100 border-b border-zinc-200 text-[9px] font-mono font-bold uppercase tracking-wider text-zinc-600 flex items-center justify-between">
                              <span>{section.title}</span>
                              <span className="font-normal normal-case text-zinc-500">
                                {section.models.length}
                              </span>
                            </div>
                            <ul role="listbox" aria-label={section.title}>
                              {section.models.map((m) => {
                                const selected = imageModel === m.id;
                                const mode = getImageModelMode(m);
                                const isI2I = mode === IMAGE_MODEL_MODES.IMAGE_TO_IMAGE;
                                return (
                                  <li key={m.id} role="option" aria-selected={selected}>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setImageModel(m.id);
                                        setEngineDropdownOpen(false);
                                      }}
                                      className={`w-full py-2 px-2.5 text-left transition-colors cursor-pointer border-b border-zinc-100 last:border-b-0 ${
                                        selected
                                          ? "bg-black text-white"
                                          : "bg-white text-black hover:bg-zinc-50"
                                      }`}
                                    >
                                      <div className="flex items-start gap-2">
                                        <span
                                          className={`shrink-0 mt-0.5 border px-1 py-px text-[8px] font-mono font-bold uppercase ${
                                            selected
                                              ? isI2I
                                                ? "border-white text-white"
                                                : "border-zinc-400 text-zinc-300"
                                              : isI2I
                                                ? "border-black bg-zinc-100 text-black"
                                                : "border-zinc-300 text-zinc-500"
                                          }`}
                                        >
                                          {getImageModelModeShort(mode)}
                                        </span>
                                        <div className="min-w-0 flex-1">
                                          <div className="flex items-start justify-between gap-2">
                                            <span className="text-[11px] font-mono font-semibold leading-tight">
                                              {m.label}
                                            </span>
                                            <span
                                              className={`text-[9px] font-mono shrink-0 ${
                                                selected ? "text-zinc-300" : "text-zinc-500"
                                              }`}
                                            >
                                              {getImageModelPriceDisplay(m)}
                                            </span>
                                          </div>
                                          <p
                                            className={`text-[9px] font-mono mt-0.5 line-clamp-2 leading-snug ${
                                              selected ? "text-zinc-300" : "text-zinc-500"
                                            }`}
                                          >
                              {m.description}
                            </p>
                          </div>
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
          </div>
                        ))}
                      </div>
                    )}

                  </div>

                  <div>
                    <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-600 block mb-1.5">
                      Negative Prompt (Optional)
                    </label>
                    <input
                      type="text"
                      value={negativePrompt}
                      onChange={(e) => setNegativePrompt(e.target.value)}
                      placeholder="low quality, blur, artifacts..."
                      className="w-full border border-zinc-300 focus:border-black p-2 text-xs font-mono text-black placeholder:text-zinc-400 outline-none bg-white transition-colors"
                    />
                  </div>

                  {imageModelSupportsRef && (
                    <div>
                      <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-600 block mb-1.5">
                        Reference Image
                      </label>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleReferenceUpload}
                        className="hidden"
                      />
                      {referenceImage ? (
                        <div className="relative border border-black p-1 h-14 flex items-center justify-between bg-zinc-50">
                          <img src={referenceImage} alt="Reference" className="h-full object-contain" />
                          <button
                            type="button"
                            onClick={() => setReferenceImage("")}
                            className="text-xs font-mono px-2 py-1 bg-black text-white hover:bg-zinc-800 cursor-pointer"
                          >
                            Remove
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          disabled={referenceUploading}
                          onClick={openReferenceFilePicker}
                          className="w-full border border-zinc-300 hover:border-black disabled:opacity-50 py-2 px-3 text-xs font-mono text-black text-left flex items-center justify-between cursor-pointer transition-colors"
                        >
                          <span>
                            {referenceUploading ? "Reading image…" : "Attach Reference Image"}
                          </span>
                          <Upload className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <p className="text-[9px] font-mono text-zinc-400 mt-1.5 leading-snug">
                        PNG, JPG, WEBP, GIF. OneDrive cloud-only files (0 bytes) must be
                        downloaded first: right-click → Always keep on this device.
                      </p>
                    </div>
                  )}
                </>
            </div>

            <div className="shrink-0 p-3 sm:p-4 pt-2 border-t border-zinc-200 bg-white">
              <button
                type="submit"
                disabled={isGenerating}
                className="w-full min-h-[48px] py-3 px-4 bg-black text-white hover:bg-zinc-800 disabled:bg-zinc-400 text-xs font-mono font-bold uppercase tracking-wider transition-colors cursor-pointer flex items-center justify-center gap-2 touch-manipulation"
              >
                {isGenerating ? (
                  <span>{progressText || "Processing..."}</span>
                ) : (
                  <span>Generate Image</span>
                )}
              </button>
            </div>
          </form>
        </aside>
      </div>
      )}

      <Dialog open={updatesOpen} onOpenChange={setUpdatesOpen}>
        <DialogContent
          showCloseButton
          overlayClassName="bg-white/60 backdrop-blur-md supports-backdrop-filter:backdrop-blur-md"
          className="sm:max-w-md rounded-none border-black font-mono ring-black/20"
        >
          <DialogHeader>
            <DialogTitle className="font-mono text-sm uppercase tracking-wider leading-snug">
              Bomboclat pussywagon updates
            </DialogTitle>
            <DialogDescription className="font-mono text-xs text-zinc-600 leading-relaxed">
              First time this session? Drop your email — we’ll hit you when a new FrsionOS
              feature drops (no spam circus, just release notes).
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdatesSubscribe} className="space-y-3">
            <input
              type="email"
              autoComplete="email"
              value={updatesEmail}
              onChange={(e) => setUpdatesEmail(e.target.value)}
              placeholder="you@domain.com"
              className="w-full border border-zinc-300 focus:border-black px-2.5 py-2 text-xs font-mono outline-none"
            />
            <button
              type="submit"
              disabled={updatesLoading || !updatesEmail.trim()}
              className="w-full py-2.5 bg-black text-white text-xs font-mono font-bold uppercase disabled:bg-zinc-400 cursor-pointer"
            >
              {updatesLoading ? "Saving…" : "Notify me"}
            </button>
            <button
              type="button"
              onClick={dismissUpdatesPopup}
              className="w-full py-2 text-[10px] font-mono uppercase text-zinc-500 hover:text-black cursor-pointer"
            >
              Not now
            </button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={adminLoginOpen} onOpenChange={setAdminLoginOpen}>
        <DialogContent
          showCloseButton
          className="sm:max-w-xs rounded-none border-black font-mono ring-black/20"
        >
          <DialogHeader>
            <DialogTitle className="font-mono text-sm uppercase tracking-wider">
              Admin access
            </DialogTitle>
            <DialogDescription className="font-mono text-xs text-zinc-500">
              Enter the admin password to open the panel.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAdminLogin} className="space-y-3">
            <input
              type="password"
              autoComplete="current-password"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              className="w-full border border-zinc-300 focus:border-black px-2.5 py-2 text-xs font-mono outline-none"
              placeholder="Password"
            />
            <button
              type="submit"
              disabled={adminLoading || !adminPassword}
              className="w-full py-2 bg-black text-white text-xs font-mono font-bold uppercase disabled:bg-zinc-400 cursor-pointer"
            >
              {adminLoading ? "Checking…" : "Enter"}
            </button>
          </form>
        </DialogContent>
      </Dialog>

      {adminPanelOpen && (
        <div className="fixed inset-0 z-[100] bg-white flex flex-col font-mono text-black">
          <header className="shrink-0 border-b border-zinc-200 px-4 py-3 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-sm font-bold uppercase tracking-wider">Admin panel</h1>
              <p className="text-[10px] text-zinc-500">
                Unified activity log · subscriber emails · bulk updates
              </p>
            </div>
            <div className="flex items-center border border-black p-0.5">
              {[
                { id: "logs", label: "Logs" },
                { id: "emails", label: "Emails" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setAdminTab(tab.id)}
                  className={`px-3 py-1 text-[10px] font-bold uppercase cursor-pointer ${
                    adminTab === tab.id
                      ? "bg-black text-white"
                      : "bg-white text-black hover:bg-zinc-100"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => loadAdminDashboard()}
                className="px-3 py-1.5 border border-zinc-300 hover:border-black text-[10px] uppercase cursor-pointer"
              >
                Refresh
              </button>
              <button
                type="button"
                onClick={handleAdminLogout}
                className="px-3 py-1.5 bg-black text-white text-[10px] uppercase cursor-pointer"
              >
                Log out
              </button>
            </div>
          </header>

          {adminTab === "logs" && (
            <div className="shrink-0 grid grid-cols-2 sm:grid-cols-4 gap-2 p-4 border-b border-zinc-200">
              {[
                { label: "Total visits", value: adminData?.stats?.totalVisits ?? "—" },
                { label: "Unique IPs", value: adminData?.stats?.uniqueIps ?? "—" },
                { label: "Log events", value: adminData?.stats?.totalLogs ?? "—" },
                { label: "Subscribers", value: adminData?.stats?.subscriberCount ?? "—" },
              ].map((stat) => (
                <div key={stat.label} className="border border-zinc-200 p-3">
                  <div className="text-[10px] uppercase text-zinc-500">{stat.label}</div>
                  <div className="text-lg font-bold">{stat.value}</div>
                </div>
              ))}
            </div>
          )}

          {adminTab === "logs" ? (
            <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
              <h2 className="shrink-0 px-4 py-2 text-[10px] font-bold uppercase border-b border-zinc-200 bg-zinc-50">
                Activity log (visits · IPs · server events)
              </h2>
              <div className="flex-1 min-h-0 overflow-auto">
                <table className="w-full text-[10px]">
                  <thead className="sticky top-0 bg-white border-b border-zinc-200 z-10">
                    <tr className="text-left text-zinc-500 uppercase">
                      <th className="px-3 py-2 font-semibold w-40">Time</th>
                      <th className="px-3 py-2 font-semibold w-16">Type</th>
                      <th className="px-3 py-2 font-semibold w-24">IP / Level</th>
                      <th className="px-3 py-2 font-semibold">Detail</th>
                    </tr>
                  </thead>
                  <tbody>
                    {adminUnifiedFeed.map((row) => (
                      <tr key={row.id} className="border-b border-zinc-100 align-top">
                        <td className="px-3 py-2 whitespace-nowrap text-zinc-600">
                          {formatAdminTime(row.at)}
                        </td>
                        <td className="px-3 py-2">
                          <span
                            className={`inline-block px-1 py-px text-[9px] font-bold uppercase border ${
                              row.kind === "visit"
                                ? "border-zinc-400 text-zinc-700"
                                : "border-black bg-black text-white"
                            }`}
                          >
                            {row.kind === "visit" ? "visit" : "log"}
                          </span>
                        </td>
                        <td className="px-3 py-2 font-semibold">
                          {row.kind === "visit" ? row.ip : row.level}
                        </td>
                        <td className="px-3 py-2 min-w-0">
                          {row.kind === "visit" ? (
                            <>
                              <span className="text-black">{row.path}</span>
                              <span className="text-zinc-500 ml-2">({row.visitKind})</span>
                            </>
                          ) : (
                            <>
                              <p className="text-black break-words">{row.message}</p>
                              {row.meta && Object.keys(row.meta).length > 0 && (
                                <pre className="mt-1 text-zinc-500 whitespace-pre-wrap break-all">
                                  {JSON.stringify(row.meta)}
                                </pre>
                              )}
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {!adminUnifiedFeed.length && (
                  <p className="p-4 text-xs text-zinc-400">No activity yet.</p>
                )}
              </div>
            </div>
          ) : (
            <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-2 overflow-hidden">
              <section className="min-h-0 flex flex-col border-b lg:border-b-0 lg:border-r border-zinc-200">
                <h2 className="shrink-0 px-4 py-2 text-[10px] font-bold uppercase border-b border-zinc-200 bg-zinc-50">
                  Subscriber emails ({adminData?.subscribers?.length ?? 0})
                </h2>
                <div className="flex-1 min-h-0 overflow-auto">
                  <table className="w-full text-[10px]">
                    <thead className="sticky top-0 bg-white border-b border-zinc-200">
                      <tr className="text-left text-zinc-500 uppercase">
                        <th className="px-3 py-2 font-semibold">Signed up</th>
                        <th className="px-3 py-2 font-semibold">Email</th>
                        <th className="px-3 py-2 font-semibold w-20 text-right">Delete</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(adminData?.subscribers || []).map((s) => (
                        <tr key={s.id} className="border-b border-zinc-100">
                          <td className="px-3 py-2 text-zinc-600 whitespace-nowrap">
                            {s.createdAtLabel}
                          </td>
                          <td className="px-3 py-2 font-semibold break-all">{s.email}</td>
                          <td className="px-3 py-2 text-right">
                            <button
                              type="button"
                              onClick={() => handleDeleteSubscriber(s.id)}
                              className="inline-flex items-center gap-1 px-2 py-1 border border-zinc-300 hover:border-black text-[9px] uppercase cursor-pointer"
                              title={`Remove ${s.email}`}
                            >
                              <Trash2 className="w-3 h-3" />
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {!adminData?.subscribers?.length && (
                    <p className="p-4 text-xs text-zinc-400">
                      No emails yet — they appear when someone uses the updates popup.
                    </p>
                  )}
                </div>
              </section>

              <section className="min-h-0 flex flex-col">
                <h2 className="shrink-0 px-4 py-2 text-[10px] font-bold uppercase border-b border-zinc-200 bg-zinc-50">
                  Email maker · bulk send
                </h2>
                <form
                  onSubmit={handleAdminBroadcast}
                  className="flex-1 min-h-0 flex flex-col p-4 gap-3 overflow-y-auto"
                >
                  <p className="text-[10px] text-zinc-500 leading-snug">
                    Compose a release note blast to every subscriber. With{" "}
                    <code className="text-black">ZEPTOMAIL_API_KEY</code> +{" "}
                    <code className="text-black">ZEPTOMAIL_FROM</code> set, mail delivers live;
                    otherwise copies queue to{" "}
                    <code className="text-black">storage/studio-admin/outbox.json</code>.
                  </p>
                  <div>
                    <label className="text-[10px] font-bold uppercase text-zinc-600 block mb-1">
                      Subject
                    </label>
                    <input
                      type="text"
                      value={mailSubject}
                      onChange={(e) => setMailSubject(e.target.value)}
                      placeholder="New FrsionOS feature just dropped"
                      className="w-full border border-zinc-300 focus:border-black px-2.5 py-2 text-xs outline-none"
                    />
                  </div>
                  <div className="flex-1 min-h-[8rem] flex flex-col">
                    <label className="text-[10px] font-bold uppercase text-zinc-600 block mb-1">
                      Body
                    </label>
                    <textarea
                      value={mailBody}
                      onChange={(e) => setMailBody(e.target.value)}
                      placeholder="Bomboclat pussywagon update: we shipped ..."
                      className="flex-1 min-h-[10rem] w-full border border-zinc-300 focus:border-black p-2.5 text-xs outline-none resize-y"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={
                      mailSending ||
                      !mailSubject.trim() ||
                      !mailBody.trim() ||
                      !(adminData?.subscribers?.length > 0)
                    }
                    className="w-full py-2.5 bg-black text-white text-xs font-bold uppercase disabled:bg-zinc-400 cursor-pointer"
                  >
                    {mailSending
                      ? "Sending…"
                      : `Bulk send to ${adminData?.subscribers?.length ?? 0} subscribers`}
                  </button>
                </form>
              </section>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
