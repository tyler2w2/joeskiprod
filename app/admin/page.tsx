"use client";

import { useState, useRef, useCallback, useEffect } from "react";

type Track = {
  name: string;
  description: string;
  src: string;
};

function LockIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="3,6 5,6 21,6" />
      <path d="M19,6v14a2,2 0 0,1-2,2H7a2,2,0,0,1-2-2V6m3,0V4a2,2,0,0,1,2-2h4a2,2,0,0,1,2,2v2" />
    </svg>
  );
}

function UploadIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17,8 12,3 7,8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  );
}

function GripIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="9" cy="6" r="1" fill="currentColor" /><circle cx="15" cy="6" r="1" fill="currentColor" />
      <circle cx="9" cy="12" r="1" fill="currentColor" /><circle cx="15" cy="12" r="1" fill="currentColor" />
      <circle cx="9" cy="18" r="1" fill="currentColor" /><circle cx="15" cy="18" r="1" fill="currentColor" />
    </svg>
  );
}

export default function AdminPage() {
  const [passkey, setPasskey] = useState("");
  const [authed, setAuthed] = useState(false);
  const [authError, setAuthError] = useState("");
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading" | "success" | "error">("idle");
  const [uploadMessage, setUploadMessage] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // Upload form state
  const [file, setFile] = useState<File | null>(null);
  const [trackName, setTrackName] = useState("");
  const [description, setDescription] = useState("Contact me to buy.");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchTracks = useCallback(async () => {
    const res = await fetch("/api/tracks");
    const data = await res.json();
    setTracks(data);
  }, []);

  useEffect(() => {
    if (authed) fetchTracks();
  }, [authed, fetchTracks]);

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    // We validate by trying an authenticated request
    fetch("/api/tracks", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ passkey, name: "__check__" }),
    }).then((res) => {
      if (res.status === 401) {
        setAuthError("Wrong passkey. Try again.");
      } else {
        // 200 or 404 both mean auth passed
        setAuthed(true);
        setAuthError("");
      }
    });
  }

  function handleFileSelect(selectedFile: File) {
    setFile(selectedFile);
    if (!trackName) {
      // Auto-fill name from filename (strip .mp3)
      setTrackName(selectedFile.name.replace(/\.mp3$/i, ""));
    }
  }

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!file || !trackName) return;

    setUploadStatus("uploading");
    setUploadMessage("");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("name", trackName);
    formData.append("description", description);

    const res = await fetch("/api/upload", {
      method: "POST",
      headers: { "x-passkey": passkey },
      body: formData,
    });

    if (res.ok) {
      setUploadStatus("success");
      setUploadMessage(`"${trackName}" uploaded successfully!`);
      setFile(null);
      setTrackName("");
      setDescription("Contact me to buy.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      fetchTracks();
      setTimeout(() => setUploadStatus("idle"), 3000);
    } else {
      const data = await res.json();
      setUploadStatus("error");
      setUploadMessage(data.error || "Upload failed.");
    }
  }

  async function handleDelete(name: string) {
    if (!confirm(`Delete "${name}"?`)) return;
    setLoading(true);
    await fetch("/api/tracks", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ passkey, name }),
    });
    await fetchTracks();
    setLoading(false);
  }

  // Drag-to-reorder
  function handleDragStart(index: number) {
    setDragIndex(index);
  }

  function handleDragEnter(index: number) {
    setDragOverIndex(index);
  }

  async function handleDragEnd() {
    if (dragIndex === null || dragOverIndex === null || dragIndex === dragOverIndex) {
      setDragIndex(null);
      setDragOverIndex(null);
      return;
    }
    const reordered = [...tracks];
    const [moved] = reordered.splice(dragIndex, 1);
    reordered.splice(dragOverIndex, 0, moved);
    setTracks(reordered);
    setDragIndex(null);
    setDragOverIndex(null);

    // Save new order
    await fetch("/api/tracks", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ passkey, tracks: reordered }),
    });
  }

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
                  type="password"
                  value={passkey}
                  onChange={(e) => setPasskey(e.target.value)}
                  placeholder="Enter your passkey"
                  className="w-full rounded-xl border border-neutral-700 bg-neutral-800/60 px-4 py-3 text-sm text-neutral-100 placeholder-neutral-600 outline-none focus:border-neutral-500 transition-colors"
                  autoFocus
                />
              </div>
              {authError && (
                <p className="text-xs text-red-400">{authError}</p>
              )}
              <button
                type="submit"
                className="w-full rounded-xl bg-white px-4 py-3 text-sm font-medium text-black transition-all duration-200 hover:opacity-90 active:scale-95"
              >
                Enter
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <div className="mx-auto max-w-4xl px-6 py-10 sm:px-8">
        {/* Header */}
        <header className="flex items-center justify-between border-b border-neutral-800 pb-6 mb-10">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-neutral-500">Admin Panel</p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight">joeski — Track Manager</h1>
          </div>
          <a
            href="/"
            className="rounded-xl border border-neutral-700 px-4 py-2 text-sm text-neutral-400 transition hover:text-white hover:border-neutral-500"
          >
            ← Back to site
          </a>
        </header>

        {/* Upload Section */}
        <section className="mb-10">
          <div className="rounded-[2rem] border border-neutral-800 bg-neutral-900/50 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.3)] backdrop-blur-xl">
            <p className="text-xs uppercase tracking-[0.35em] text-neutral-500 mb-1">Upload</p>
            <h2 className="text-lg font-semibold mb-6">Add a new beat</h2>

            <form onSubmit={handleUpload} className="space-y-5">
              {/* Drop zone */}
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOver(false);
                  const dropped = e.dataTransfer.files[0];
                  if (dropped) handleFileSelect(dropped);
                }}
                onClick={() => fileInputRef.current?.click()}
                className={`flex flex-col items-center justify-center gap-3 rounded-[1.5rem] border-2 border-dashed p-10 cursor-pointer transition-all duration-200 ${
                  dragOver
                    ? "border-white bg-white/5"
                    : file
                    ? "border-green-500/60 bg-green-500/5"
                    : "border-neutral-700 hover:border-neutral-500 hover:bg-neutral-800/30"
                }`}
              >
                <div className="text-neutral-500">
                  <UploadIcon />
                </div>
                {file ? (
                  <p className="text-sm text-green-400 font-medium">{file.name}</p>
                ) : (
                  <>
                    <p className="text-sm text-neutral-400">Drop an MP3 here, or click to browse</p>
                    <p className="text-xs text-neutral-600">MP3 files only</p>
                  </>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".mp3,audio/mpeg"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleFileSelect(f);
                  }}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs text-neutral-500 mb-2 uppercase tracking-wide">Track Name</label>
                  <input
                    type="text"
                    value={trackName}
                    onChange={(e) => setTrackName(e.target.value)}
                    placeholder="e.g. DARK 160 DMIN @JOESKI7"
                    className="w-full rounded-xl border border-neutral-700 bg-neutral-800/60 px-4 py-3 text-sm text-neutral-100 placeholder-neutral-600 outline-none focus:border-neutral-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs text-neutral-500 mb-2 uppercase tracking-wide">Description</label>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Contact me to buy."
                    className="w-full rounded-xl border border-neutral-700 bg-neutral-800/60 px-4 py-3 text-sm text-neutral-100 placeholder-neutral-600 outline-none focus:border-neutral-500 transition-colors"
                  />
                </div>
              </div>

              {uploadMessage && (
                <p className={`text-sm ${uploadStatus === "success" ? "text-green-400" : "text-red-400"}`}>
                  {uploadMessage}
                </p>
              )}

              <button
                type="submit"
                disabled={!file || !trackName || uploadStatus === "uploading"}
                className="rounded-xl bg-white px-6 py-3 text-sm font-medium text-black transition-all duration-200 hover:opacity-90 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                {uploadStatus === "uploading" ? "Uploading…" : "Upload Track"}
              </button>
            </form>
          </div>
        </section>

        {/* Track List */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-neutral-500 mb-1">Manage</p>
              <h2 className="text-lg font-semibold">Live tracks ({tracks.length})</h2>
            </div>
            <p className="text-xs text-neutral-600">Drag to reorder</p>
          </div>

          {loading && <p className="text-sm text-neutral-500 mb-4">Saving…</p>}

          <div className="space-y-2">
            {tracks.length === 0 && (
              <p className="text-sm text-neutral-600 py-8 text-center">No tracks yet. Upload one above.</p>
            )}
            {tracks.map((track, index) => (
              <div
                key={track.name}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragEnter={() => handleDragEnter(index)}
                onDragEnd={handleDragEnd}
                onDragOver={(e) => e.preventDefault()}
                className={`flex items-center gap-4 rounded-[1.25rem] border px-5 py-4 transition-all duration-150 cursor-grab active:cursor-grabbing ${
                  dragOverIndex === index
                    ? "border-white/40 bg-neutral-800"
                    : "border-neutral-800 bg-neutral-900/40 hover:border-neutral-700"
                }`}
              >
                <div className="text-neutral-700 shrink-0">
                  <GripIcon />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{track.name}</p>
                  <p className="text-xs text-neutral-500 truncate">{track.description}</p>
                </div>
                <span className="text-xs text-neutral-600 shrink-0 hidden sm:block">Beat · 2026</span>
                <button
                  onClick={() => handleDelete(track.name)}
                  className="shrink-0 flex h-8 w-8 items-center justify-center rounded-full border border-neutral-800 text-neutral-600 transition-all hover:border-red-500/60 hover:bg-red-500/10 hover:text-red-400"
                  title="Delete track"
                >
                  <TrashIcon />
                </button>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
