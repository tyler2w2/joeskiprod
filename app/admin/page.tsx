"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Link from "next/link";

type Track = {
  name: string;
  description: string;
  src: string;
  price?: string;
  buyLink?: string;
  featured?: boolean;
  comingSoon?: boolean;
};

type SiteSettings = {
  tagline: string;
  bio: string;
  email: string;
  instagram: string;
  youtube: string;
  discord: string;
};

type Stats = Record<string, { plays: number; views: number }>;

// ─── Icons ────────────────────────────────────────────────────────────────────

const LockIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const TrashIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="3,6 5,6 21,6" />
    <path d="M19,6v14a2,2 0 0,1-2,2H7a2,2,0,0,1-2-2V6m3,0V4a2,2,0,0,1,2-2h4a2,2,0,0,1,2,2v2" />
  </svg>
);

const UploadIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17,8 12,3 7,8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);

const GripIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="9" cy="6" r="1" fill="currentColor" /><circle cx="15" cy="6" r="1" fill="currentColor" />
    <circle cx="9" cy="12" r="1" fill="currentColor" /><circle cx="15" cy="12" r="1" fill="currentColor" />
    <circle cx="9" cy="18" r="1" fill="currentColor" /><circle cx="15" cy="18" r="1" fill="currentColor" />
  </svg>
);

const EditIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

const StarIcon = ({ filled }: { filled?: boolean }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
    <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
  </svg>
);

const EyeIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const PlayIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" stroke="none">
    <polygon points="5,3 19,12 5,21" />
  </svg>
);

const SaveIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
    <polyline points="17,21 17,13 7,13 7,21" />
    <polyline points="7,3 7,8 15,8" />
  </svg>
);

// ─── Input component ──────────────────────────────────────────────────────────

function Input({ label, value, onChange, placeholder, type = "text" }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string;
}) {
  return (
    <div>
      <label className="block text-xs text-neutral-500 mb-1.5 uppercase tracking-wide">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-neutral-700 bg-neutral-800/60 px-4 py-2.5 text-sm text-neutral-100 placeholder-neutral-600 outline-none focus:border-neutral-500 transition-colors"
      />
    </div>
  );
}

// ─── Tab button ───────────────────────────────────────────────────────────────

function Tab({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 text-sm rounded-xl transition-all ${
        active ? "bg-white text-black font-medium" : "text-neutral-400 hover:text-white"
      }`}
    >
      {children}
    </button>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function AdminPage() {
  const [passkey, setPasskey] = useState("");
  const [authed, setAuthed] = useState(false);
  const [authError, setAuthError] = useState("");
  const [activeTab, setActiveTab] = useState<"tracks" | "upload" | "site" | "stats">("tracks");

  // Tracks
  const [tracks, setTracks] = useState<Track[]>([]);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [editingTrack, setEditingTrack] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Track>>({});
  const [saving, setSaving] = useState(false);

  // Upload
  const [file, setFile] = useState<File | null>(null);
  const [trackName, setTrackName] = useState("");
  const [trackPrice, setTrackPrice] = useState("");
  const [trackBuyLink, setTrackBuyLink] = useState("");
  const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading" | "success" | "error">("idle");
  const [uploadMessage, setUploadMessage] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Site settings
  const [site, setSite] = useState<SiteSettings>({
    tagline: "", bio: "", email: "", instagram: "", youtube: "", discord: "",
  });
  const [siteSaving, setSiteSaving] = useState(false);
  const [siteSaved, setSiteSaved] = useState(false);

  // Stats
  const [stats, setStats] = useState<Stats>({});
  const [statsLoading, setStatsLoading] = useState(false);

  const fetchTracks = useCallback(async () => {
    const res = await fetch("/api/tracks");
    setTracks(await res.json());
  }, []);

  const fetchSite = useCallback(async () => {
    const res = await fetch("/api/site");
    setSite(await res.json());
  }, []);

  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    const res = await fetch(`/api/plays?passkey=${encodeURIComponent(passkey)}`);
    if (res.ok) setStats(await res.json());
    setStatsLoading(false);
  }, [passkey]);

  useEffect(() => {
    if (authed) { fetchTracks(); fetchSite(); }
  }, [authed, fetchTracks, fetchSite]);

  useEffect(() => {
    if (authed && activeTab === "stats") fetchStats();
  }, [authed, activeTab, fetchStats]);

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    fetch("/api/tracks", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ passkey, name: "__check__" }),
    }).then((res) => {
      if (res.status === 401) setAuthError("Wrong passkey. Try again.");
      else { setAuthed(true); setAuthError(""); }
    });
  }

  // ─── Upload ────────────────────────────────────────────────────────────────

  function handleFileSelect(f: File) {
    setFile(f);
    if (!trackName) setTrackName(f.name.replace(/\.mp3$/i, ""));
  }

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!file || !trackName) return;
    setUploadStatus("uploading");
    const formData = new FormData();
    formData.append("file", file);
    formData.append("name", trackName);
    formData.append("description", "");
    if (trackPrice) formData.append("price", trackPrice);
    if (trackBuyLink) formData.append("buyLink", trackBuyLink);

    const res = await fetch("/api/upload", {
      method: "POST",
      headers: { "x-passkey": passkey },
      body: formData,
    });

    if (res.ok) {
      setUploadStatus("success");
      setUploadMessage(`"${trackName}" uploaded!`);
      setFile(null); setTrackName(""); setTrackPrice(""); setTrackBuyLink("");
      if (fileInputRef.current) fileInputRef.current.value = "";
      fetchTracks();
      setTimeout(() => setUploadStatus("idle"), 3000);
    } else {
      const data = await res.json();
      setUploadStatus("error");
      setUploadMessage(data.error || "Upload failed.");
    }
  }

  // ─── Track management ──────────────────────────────────────────────────────

  async function handleDelete(name: string) {
    if (!confirm(`Delete "${name}"?`)) return;
    await fetch("/api/tracks", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ passkey, name }),
    });
    fetchTracks();
  }

  async function handlePatch(name: string, updates: Partial<Track>) {
    await fetch("/api/tracks", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ passkey, name, updates }),
    });
    fetchTracks();
  }

  function startEdit(track: Track) {
    setEditingTrack(track.name);
    setEditForm({ name: track.name, description: track.description, price: track.price ?? "", buyLink: track.buyLink ?? "" });
  }

  async function saveEdit(originalName: string) {
    setSaving(true);
    await handlePatch(originalName, editForm);
    setEditingTrack(null);
    setSaving(false);
  }

  // Drag reorder
  async function handleDragEnd() {
    if (dragIndex === null || dragOverIndex === null || dragIndex === dragOverIndex) {
      setDragIndex(null); setDragOverIndex(null); return;
    }
    const reordered = [...tracks];
    const [moved] = reordered.splice(dragIndex, 1);
    reordered.splice(dragOverIndex, 0, moved);
    setTracks(reordered);
    setDragIndex(null); setDragOverIndex(null);
    await fetch("/api/tracks", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ passkey, tracks: reordered }),
    });
  }

  // ─── Site settings ─────────────────────────────────────────────────────────

  async function saveSite(e: React.FormEvent) {
    e.preventDefault();
    setSiteSaving(true);
    await fetch("/api/site", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ passkey, settings: site }),
    });
    setSiteSaving(false);
    setSiteSaved(true);
    setTimeout(() => setSiteSaved(false), 3000);
  }

  // ─── Login screen ──────────────────────────────────────────────────────────

  if (!authed) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <div className="rounded-[2rem] border border-neutral-800 bg-neutral-900/50 p-8 shadow-[0_20px_80px_rgba(0,0,0,0.4)] backdrop-blur-xl">
            <div className="flex flex-col items-center gap-4 pb-6 border-b border-neutral-800">
              <div className="flex h-12 w-12 items-center justify-center rounded-full border border-neutral-700 bg-neutral-800 text-neutral-300">
                <LockIcon />
              </div>
              <div className="text-center">
                <p className="text-xs uppercase tracking-[0.35em] text-neutral-500">Admin</p>
                <h1 className="mt-1 text-xl font-semibold text-neutral-100">joeski panel</h1>
              </div>
            </div>
            <form onSubmit={handleLogin} className="mt-6 space-y-4">
              <div>
                <label className="block text-xs text-neutral-500 mb-2 tracking-wide uppercase">Passkey</label>
                <input
                  type="password" value={passkey} onChange={(e) => setPasskey(e.target.value)}
                  placeholder="Enter your passkey" autoFocus
                  className="w-full rounded-xl border border-neutral-700 bg-neutral-800/60 px-4 py-3 text-sm text-neutral-100 placeholder-neutral-600 outline-none focus:border-neutral-500 transition-colors"
                />
              </div>
              {authError && <p className="text-xs text-red-400">{authError}</p>}
              <button type="submit" className="w-full rounded-xl bg-white px-4 py-3 text-sm font-medium text-black transition-all duration-200 hover:opacity-90 active:scale-95">
                Enter
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // ─── Admin panel ───────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <div className="mx-auto max-w-5xl px-6 py-10 sm:px-8">

        {/* Header */}
        <header className="flex items-center justify-between border-b border-neutral-800 pb-6 mb-8">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-neutral-500">Admin Panel</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight">joeski</h1>
          </div>
          <Link href="/" className="rounded-xl border border-neutral-700 px-4 py-2 text-sm text-neutral-400 transition hover:text-white hover:border-neutral-500">
            ← Back to site
          </Link>
        </header>

        {/* Tabs */}
        <div className="flex gap-1 mb-8 bg-neutral-900/50 border border-neutral-800 rounded-2xl p-1 w-fit">
          <Tab active={activeTab === "tracks"} onClick={() => setActiveTab("tracks")}>Tracks</Tab>
          <Tab active={activeTab === "upload"} onClick={() => setActiveTab("upload")}>Upload</Tab>
          <Tab active={activeTab === "stats"} onClick={() => setActiveTab("stats")}>Stats</Tab>
          <Tab active={activeTab === "site"} onClick={() => setActiveTab("site")}>Site</Tab>
        </div>

        {/* ── TRACKS TAB ── */}
        {activeTab === "tracks" && (
          <section>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold">Live tracks <span className="text-neutral-500 font-normal text-base">({tracks.length})</span></h2>
              <p className="text-xs text-neutral-600">Drag to reorder</p>
            </div>
            <div className="space-y-2">
              {tracks.length === 0 && (
                <p className="text-sm text-neutral-600 py-8 text-center">No tracks yet. Go to Upload.</p>
              )}
              {tracks.map((track, index) => (
                <div
                  key={track.name}
                  draggable={editingTrack !== track.name}
                  onDragStart={() => setDragIndex(index)}
                  onDragEnter={() => setDragOverIndex(index)}
                  onDragEnd={handleDragEnd}
                  onDragOver={(e) => e.preventDefault()}
                  className={`rounded-[1.25rem] border transition-all duration-150 ${
                    dragOverIndex === index ? "border-white/40 bg-neutral-800" : "border-neutral-800 bg-neutral-900/40 hover:border-neutral-700"
                  }`}
                >
                  {editingTrack === track.name ? (
                    /* Edit mode */
                    <div className="p-5 space-y-3">
                      <div className="grid gap-3 sm:grid-cols-2">
                        <Input label="Name" value={editForm.name ?? ""} onChange={(v) => setEditForm(f => ({ ...f, name: v }))} />
                        <Input label="Price (e.g. £25)" value={editForm.price ?? ""} onChange={(v) => setEditForm(f => ({ ...f, price: v }))} placeholder="£25" />
                      </div>
                      <Input label="Buy Link (optional)" value={editForm.buyLink ?? ""} onChange={(v) => setEditForm(f => ({ ...f, buyLink: v }))} placeholder="https://airbit.com/..." />
                      <div className="flex gap-2 pt-1">
                        <button onClick={() => saveEdit(track.name)} disabled={saving}
                          className="flex items-center gap-1.5 rounded-xl bg-white px-4 py-2 text-xs font-medium text-black hover:opacity-90 disabled:opacity-50">
                          <SaveIcon /> {saving ? "Saving…" : "Save"}
                        </button>
                        <button onClick={() => setEditingTrack(null)}
                          className="rounded-xl border border-neutral-700 px-4 py-2 text-xs text-neutral-400 hover:text-white">
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Normal row */
                    <div className="flex items-center gap-3 px-4 py-3.5 cursor-grab active:cursor-grabbing">
                      <div className="text-neutral-700 shrink-0"><GripIcon /></div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium truncate">{track.name}</p>
                          {track.featured && <span className="text-yellow-400"><StarIcon filled /></span>}
                          {track.comingSoon && <span className="text-xs text-neutral-500 border border-neutral-700 rounded-full px-2 py-0.5">hidden</span>}
                        </div>
                        <div className="flex items-center gap-3 mt-0.5">
                          {track.price && <span className="text-xs text-green-400">{track.price}</span>}
                          {track.buyLink && <span className="text-xs text-neutral-600 truncate max-w-[160px]">{track.buyLink}</span>}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1 shrink-0">
                        {/* Featured toggle */}
                        <button onClick={() => handlePatch(track.name, { featured: !track.featured })}
                          title={track.featured ? "Remove featured" : "Set as featured"}
                          className={`flex h-7 w-7 items-center justify-center rounded-full border transition-all ${
                            track.featured ? "border-yellow-500/60 bg-yellow-500/10 text-yellow-400" : "border-neutral-800 text-neutral-600 hover:border-yellow-500/40 hover:text-yellow-500"
                          }`}>
                          <StarIcon filled={track.featured} />
                        </button>
                        {/* Coming soon toggle */}
                        <button onClick={() => handlePatch(track.name, { comingSoon: !track.comingSoon })}
                          title={track.comingSoon ? "Make visible" : "Hide (coming soon)"}
                          className={`flex h-7 w-7 items-center justify-center rounded-full border transition-all text-xs font-bold ${
                            track.comingSoon ? "border-neutral-500/60 bg-neutral-500/10 text-neutral-300" : "border-neutral-800 text-neutral-600 hover:border-neutral-500"
                          }`}>
                          {track.comingSoon ? "S" : "V"}
                        </button>
                        {/* Edit */}
                        <button onClick={() => startEdit(track)}
                          className="flex h-7 w-7 items-center justify-center rounded-full border border-neutral-800 text-neutral-600 transition-all hover:border-blue-500/40 hover:text-blue-400">
                          <EditIcon />
                        </button>
                        {/* Delete */}
                        <button onClick={() => handleDelete(track.name)}
                          className="flex h-7 w-7 items-center justify-center rounded-full border border-neutral-800 text-neutral-600 transition-all hover:border-red-500/60 hover:text-red-400">
                          <TrashIcon />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <p className="mt-4 text-xs text-neutral-600">
              ⭐ = featured (shown in hero) &nbsp;·&nbsp; V/S = visible/soon (hidden from site)
            </p>
          </section>
        )}

        {/* ── UPLOAD TAB ── */}
        {activeTab === "upload" && (
          <section>
            <h2 className="text-lg font-semibold mb-6">Add a new beat</h2>
            <div className="rounded-[2rem] border border-neutral-800 bg-neutral-900/50 p-6">
              <form onSubmit={handleUpload} className="space-y-5">
                <div
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={(e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) handleFileSelect(f); }}
                  onClick={() => fileInputRef.current?.click()}
                  className={`flex flex-col items-center justify-center gap-3 rounded-[1.5rem] border-2 border-dashed p-10 cursor-pointer transition-all duration-200 ${
                    dragOver ? "border-white bg-white/5" : file ? "border-green-500/60 bg-green-500/5" : "border-neutral-700 hover:border-neutral-500 hover:bg-neutral-800/30"
                  }`}
                >
                  <div className="text-neutral-500"><UploadIcon /></div>
                  {file ? (
                    <p className="text-sm text-green-400 font-medium">{file.name}</p>
                  ) : (
                    <>
                      <p className="text-sm text-neutral-400">Drop an MP3 here, or click to browse</p>
                      <p className="text-xs text-neutral-600">MP3 files only</p>
                    </>
                  )}
                  <input ref={fileInputRef} type="file" accept=".mp3,audio/mpeg" className="hidden"
                    onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileSelect(f); }} />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Input label="Track Name" value={trackName} onChange={setTrackName} placeholder="e.g. DARK 160 DMIN @JOESKI7" />
                  <Input label="Price (optional)" value={trackPrice} onChange={setTrackPrice} placeholder="£25" />
                </div>
                <Input label="Buy Link (optional)" value={trackBuyLink} onChange={setTrackBuyLink} placeholder="https://airbit.com/your-beat" />

                {uploadMessage && (
                  <p className={`text-sm ${uploadStatus === "success" ? "text-green-400" : "text-red-400"}`}>{uploadMessage}</p>
                )}

                <button type="submit" disabled={!file || !trackName || uploadStatus === "uploading"}
                  className="rounded-xl bg-white px-6 py-3 text-sm font-medium text-black transition-all hover:opacity-90 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed">
                  {uploadStatus === "uploading" ? "Uploading…" : "Upload Track"}
                </button>
              </form>
            </div>
          </section>
        )}

        {/* ── STATS TAB ── */}
        {activeTab === "stats" && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold">All-time stats</h2>
              <button onClick={fetchStats} className="text-xs text-neutral-500 hover:text-white transition">Refresh</button>
            </div>

            {statsLoading ? (
              <p className="text-sm text-neutral-500">Loading…</p>
            ) : (
              <div className="space-y-2">
                {tracks.length === 0 && <p className="text-sm text-neutral-600">No tracks yet.</p>}
                {[...tracks].sort((a, b) => {
                  const ap = (stats[a.name]?.plays ?? 0);
                  const bp = (stats[b.name]?.plays ?? 0);
                  return bp - ap;
                }).map((track, i) => {
                  const s = stats[track.name] ?? { plays: 0, views: 0 };
                  const maxPlays = Math.max(...tracks.map(t => stats[t.name]?.plays ?? 0), 1);
                  const pct = Math.round((s.plays / maxPlays) * 100);
                  return (
                    <div key={track.name} className="rounded-[1.25rem] border border-neutral-800 bg-neutral-900/40 px-5 py-4">
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-neutral-600 w-4 shrink-0">#{i + 1}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{track.name}</p>
                          <div className="mt-2 h-1 w-full rounded-full bg-neutral-800">
                            <div className="h-full rounded-full bg-white transition-all duration-500" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                        <div className="flex items-center gap-4 shrink-0 text-xs text-neutral-400">
                          <span className="flex items-center gap-1.5"><PlayIcon />{s.plays.toLocaleString()}</span>
                          <span className="flex items-center gap-1.5"><EyeIcon />{s.views.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {/* ── SITE TAB ── */}
        {activeTab === "site" && (
          <section>
            <h2 className="text-lg font-semibold mb-6">Site settings</h2>
            <form onSubmit={saveSite} className="space-y-6">
              <div className="rounded-[2rem] border border-neutral-800 bg-neutral-900/50 p-6 space-y-4">
                <p className="text-xs uppercase tracking-[0.35em] text-neutral-500 mb-2">Appearance</p>
                <Input label="Hero tagline" value={site.tagline} onChange={(v) => setSite(s => ({ ...s, tagline: v }))}
                  placeholder="Joeski's music portfolio…" />
                <Input label="Bio / subtext" value={site.bio} onChange={(v) => setSite(s => ({ ...s, bio: v }))}
                  placeholder="DM for any inquiries…" />
              </div>

              <div className="rounded-[2rem] border border-neutral-800 bg-neutral-900/50 p-6 space-y-4">
                <p className="text-xs uppercase tracking-[0.35em] text-neutral-500 mb-2">Social links</p>
                <Input label="Email" value={site.email} onChange={(v) => setSite(s => ({ ...s, email: v }))} placeholder="prodjoeski@gmail.com" />
                <Input label="Instagram handle" value={site.instagram} onChange={(v) => setSite(s => ({ ...s, instagram: v }))} placeholder="prod.joeski" />
                <Input label="YouTube handle" value={site.youtube} onChange={(v) => setSite(s => ({ ...s, youtube: v }))} placeholder="@prodjoeski" />
                <Input label="Discord username" value={site.discord} onChange={(v) => setSite(s => ({ ...s, discord: v }))} placeholder="joeski7" />
              </div>

              <button type="submit" disabled={siteSaving}
                className="flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-medium text-black transition-all hover:opacity-90 active:scale-95 disabled:opacity-50">
                <SaveIcon /> {siteSaving ? "Saving…" : siteSaved ? "Saved!" : "Save settings"}
              </button>
            </form>
          </section>
        )}

      </div>
    </div>
  );
}
