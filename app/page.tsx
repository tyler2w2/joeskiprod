"use client";

import { useCallback, useMemo, useRef, useState, useEffect } from "react";

type Track = {
  name: string;
  description: string;
  src: string;
  comingSoon?: boolean;
};

function formatTime(time: number) {
  if (!Number.isFinite(time) || time <= 0) return "0:00";
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60)
    .toString()
    .padStart(2, "0");
  return `${minutes}:${seconds}`;
}

interface ProgressBarProps {
  active: boolean;
  currentTime: number;
  duration: number;
  onSeek: (time: number) => void;
}

function ProgressBar({ active, currentTime, duration, onSeek }: ProgressBarProps) {
  const barRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const [localTime, setLocalTime] = useState<number | null>(null);

  const max = active ? duration : 0;
  const shownTime = active ? (localTime !== null ? localTime : currentTime) : 0;
  const percent = max > 0 ? Math.min((shownTime / max) * 100, 100) : 0;

  const getTimeFromX = useCallback(
    (clientX: number): number => {
      if (!barRef.current || max <= 0) return 0;
      const rect = barRef.current.getBoundingClientRect();
      const x = Math.min(Math.max(clientX - rect.left, 0), rect.width);
      return (x / rect.width) * max;
    },
    [max]
  );

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!active || max <= 0) return;
    e.preventDefault();
    barRef.current?.setPointerCapture(e.pointerId);
    dragging.current = true;
    setLocalTime(getTimeFromX(e.clientX));
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging.current) return;
    setLocalTime(getTimeFromX(e.clientX));
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging.current) return;
    dragging.current = false;
    const t = getTimeFromX(e.clientX);
    setLocalTime(null);
    onSeek(t);
    barRef.current?.releasePointerCapture(e.pointerId);
  };

  if (!active && localTime !== null) setLocalTime(null);

  return (
    <div className="mt-3 w-full select-none">
      <div
        ref={barRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className={`group relative h-1.5 w-full rounded-full ${
          active && max > 0 ? "cursor-pointer" : "cursor-default"
        } bg-neutral-800 transition-all duration-150 hover:h-2`}
        style={{ touchAction: "none" }}
      >
        <div
          className="pointer-events-none absolute left-0 top-0 h-full rounded-full bg-white transition-[width] duration-75"
          style={{ width: `${percent}%` }}
        />
        {active && max > 0 && (
          <div
            className="pointer-events-none absolute top-1/2 h-3 w-3 -translate-y-1/2 rounded-full bg-white opacity-0 shadow-md transition-opacity group-hover:opacity-100"
            style={{ left: `calc(${percent}% - 6px)` }}
          />
        )}
      </div>
      <div className="mt-1 flex justify-between text-xs text-neutral-600">
        <span>{active ? formatTime(shownTime) : "0:00"}</span>
        <span>{active && max ? formatTime(max) : "--:--"}</span>
      </div>
    </div>
  );
}

function Vinyl({ spinning, size = 192 }: { spinning: boolean; size?: number }) {
  return (
    <div
      className={`relative flex items-center justify-center rounded-full border border-neutral-700 bg-neutral-950/70 shadow-2xl shadow-black/40 ${
        spinning ? "animate-spin [animation-duration:8s]" : ""
      }`}
      style={{ width: size, height: size }}
    >
      <div className="rounded-full border border-neutral-800 bg-neutral-900" style={{ width: size * 0.83, height: size * 0.83 }}>
        <div className="absolute left-1/2 rounded-full bg-neutral-600" style={{ top: 16, width: 4, height: 32, transform: "translateX(-50%)" }} />
        <div className="absolute left-1/2 top-1/2 rounded-full border border-neutral-800 bg-neutral-950/80" style={{ width: 64, height: 64, transform: "translate(-50%, -50%)" }} />
      </div>
      <div className="absolute h-4 w-4 rounded-full border border-neutral-700 bg-neutral-950" />
    </div>
  );
}

function PlayPauseIcon({ playing }: { playing: boolean }) {
  return playing ? (
    <div className="flex gap-1">
      <span className="h-4 w-1.5 rounded-sm bg-black" />
      <span className="h-4 w-1.5 rounded-sm bg-black" />
    </div>
  ) : (
    <div className="ml-1 h-0 w-0 border-y-[9px] border-l-[14px] border-y-transparent border-l-black" />
  );
}

const COMING_SOON_SLOTS = 9;

export default function Page() {
  const [allTracks, setAllTracks] = useState<Track[]>([]);

  useEffect(() => {
    fetch("/api/tracks")
      .then((r) => r.json())
      .then((data: Track[]) => setAllTracks(data));
  }, []);

  const featuredTrack = useMemo(
    () => allTracks.find((t) => t.name === "LOVE 162 D MAJ @JOESKI7") ?? allTracks[0],
    [allTracks]
  );

  const musicSlots: Track[] = useMemo(() => [
    ...allTracks,
    ...Array.from({ length: COMING_SOON_SLOTS }, () => ({
      name: "Coming Soon",
      description: "Coming soon.",
      src: "",
      comingSoon: true,
    })),
  ], [allTracks]);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const activeTrack = currentTrack ?? featuredTrack;

  const playTrack = useCallback(async (track: Track) => {
    const audio = audioRef.current;
    if (!audio || !track.src) return;
    if (activeTrack?.name !== track.name) {
      audio.pause();
      audio.src = track.src;
      audio.load();
      setCurrentTrack(track);
      setCurrentTime(0);
      setDuration(0);
      try { await audio.play(); setIsPlaying(true); } catch { setIsPlaying(false); }
      return;
    }
    if (audio.paused) {
      try { await audio.play(); setIsPlaying(true); } catch { setIsPlaying(false); }
    } else {
      audio.pause();
      setIsPlaying(false);
    }
  }, [activeTrack]);

  const handleSeek = useCallback((time: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = time;
    setCurrentTime(time);
  }, []);

  if (!featuredTrack) {
    return (
      <div className="min-h-screen bg-neutral-950 text-neutral-100 flex items-center justify-center">
        <p className="text-neutral-500 text-sm">Loading…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <audio
        ref={audioRef}
        preload="metadata"
        src={featuredTrack.src}
        onTimeUpdate={() => { if (audioRef.current) setCurrentTime(audioRef.current.currentTime || 0); }}
        onLoadedMetadata={() => { if (audioRef.current) setDuration(audioRef.current.duration || 0); }}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => setIsPlaying(false)}
      />

      <div className="mx-auto flex max-w-6xl flex-col px-6 py-10 sm:px-8 lg:px-12">
        <header className="flex items-center justify-between border-b border-neutral-800 pb-6">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-neutral-500">Music Portfolio</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-5xl">joeski</h1>
          </div>
          <nav className="hidden gap-6 text-sm text-neutral-400 md:flex">
            <a href="#music" className="transition hover:text-white">Music</a>
            <a href="#contact" className="transition hover:text-white">Contact</a>
          </nav>
        </header>

        <section className="grid gap-12 py-20 lg:grid-cols-[1.35fr_0.95fr] lg:items-center">
          <div className="flex min-h-[420px] flex-col justify-center">
            <h2 className="max-w-3xl text-4xl font-semibold leading-[0.95] tracking-tight sm:text-6xl">
              Joeski&apos;s music portfolio with all his best producers and collabs
            </h2>
            <div className="mt-8 flex flex-wrap gap-4">
              <a href="#music" className="rounded-2xl border border-neutral-700 bg-white px-5 py-3 text-sm font-medium text-black transition-all duration-300 ease-out hover:-translate-y-0.5 hover:opacity-90">Explore music</a>
              <a href="#contact" className="rounded-2xl border border-neutral-800 px-5 py-3 text-sm font-medium text-neutral-200 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-neutral-600 hover:bg-neutral-900/40">Book / Contact</a>
            </div>
          </div>

          <div className="rounded-[2rem] border border-neutral-800/80 bg-neutral-900/50 p-6 shadow-[0_20px_80px_rgba(0,0,0,0.35)] backdrop-blur-xl">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-neutral-500">Featured</p>
                <h3 className="mt-2 text-xl font-medium">Latest release</h3>
              </div>
              <span className={`rounded-full border px-3 py-1 text-xs uppercase tracking-[0.25em] transition-colors duration-300 ${
                isPlaying && activeTrack?.name === featuredTrack.name
                  ? "border-red-500/60 bg-red-500/10 text-red-400"
                  : "border-neutral-700 text-neutral-400"
              }`}>
                {isPlaying && activeTrack?.name === featuredTrack.name ? "playing" : "live"}
              </span>
            </div>
            <div className="pt-5">
              <div className="relative flex aspect-square items-center justify-center rounded-[1.5rem] border border-neutral-800 bg-gradient-to-br from-neutral-800 to-neutral-950">
                <Vinyl spinning={isPlaying && activeTrack?.name === featuredTrack.name} />
                <button
                  onClick={() => void playTrack(featuredTrack)}
                  className="absolute flex h-14 w-14 items-center justify-center rounded-full border border-neutral-700 bg-white text-black transition-all duration-300 ease-out hover:scale-105 active:scale-95"
                >
                  <PlayPauseIcon playing={isPlaying && activeTrack?.name === featuredTrack.name} />
                </button>
              </div>
              <div className="mt-5">
                <h4 className="text-lg font-medium">{featuredTrack.name}</h4>
                <ProgressBar active={activeTrack?.name === featuredTrack.name} currentTime={currentTime} duration={duration} onSeek={handleSeek} />
              </div>
            </div>
          </div>
        </section>

        <section id="music" className="py-8">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-neutral-500">Selected works</p>
              <h3 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">Music</h3>
            </div>
          </div>
          <div className="space-y-3">
            {musicSlots.map((track, index) => {
              const isComingSoon = track.comingSoon;
              const isActive = activeTrack?.name === track.name;
              const playing = isPlaying && isActive;
              return (
                <div key={`${track.name}-${index}`} className="grid gap-5 rounded-[1.75rem] border border-neutral-800 bg-neutral-900/40 p-5 transition-all duration-200 ease-out hover:border-neutral-700 hover:bg-neutral-900/60 sm:grid-cols-[1.2fr_2fr_auto] sm:items-center">
                  <div>
                    <p className="text-sm text-neutral-500">Beat · 2026</p>
                    <h4 className="mt-1 text-xl font-medium">{track.name}</h4>
                  </div>
                  <div>
                    <p className="text-sm leading-6 text-neutral-400">{track.description}</p>
                    <ProgressBar active={isActive} currentTime={currentTime} duration={duration} onSeek={handleSeek} />
                  </div>
                  <div className="flex items-center gap-4 sm:justify-end">
                    <span className="text-sm text-neutral-500">{isActive && duration ? formatTime(duration) : isComingSoon ? "--:--" : "MP3"}</span>
                    <button
                      onClick={() => { if (!isComingSoon) void playTrack(track); }}
                      disabled={isComingSoon}
                      className="rounded-full border border-neutral-700 px-4 py-2 text-sm text-neutral-200 transition-all duration-200 ease-out hover:border-neutral-500 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {isComingSoon ? "Soon" : playing ? "Pause" : "Listen"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section id="about" className="py-16">
          <div className="rounded-[2rem] border border-neutral-800/80 bg-neutral-900/50 p-6 shadow-[0_20px_80px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:p-8">
            <div className="flex flex-col gap-6 border-b border-neutral-800 pb-6 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-neutral-500">Archive</p>
                <h3 className="mt-3 text-2xl font-semibold tracking-tight">Releases</h3>
              </div>
              <div className="grid gap-3 text-sm text-neutral-400 sm:grid-cols-3">
                <div className="rounded-2xl border border-neutral-800 px-4 py-3">Purchasing available</div>
                <div className="rounded-2xl border border-neutral-800 px-4 py-3">Custom production</div>
                <div className="rounded-2xl border border-neutral-800 px-4 py-3">Collabs open</div>
              </div>
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {allTracks.slice(0, 4).map((release) => {
                const isActive = activeTrack?.name === release.name;
                const playing = isPlaying && isActive;
                return (
                  <div key={`${release.name}-bottom`} className="group relative flex flex-col items-center justify-center rounded-[1.75rem] border border-neutral-800 p-6 transition-all duration-200 ease-out hover:border-neutral-700 hover:bg-neutral-900/60">
                    <div className="relative flex h-40 w-40 items-center justify-center">
                      <Vinyl spinning={playing} size={160} />
                      <button onClick={() => void playTrack(release)} className="absolute flex h-12 w-12 items-center justify-center rounded-full bg-white text-black transition-all duration-200 ease-out group-hover:scale-105 active:scale-95">
                        <PlayPauseIcon playing={playing} />
                      </button>
                    </div>
                    <h4 className="mt-5 text-center text-base font-medium">{release.name}</h4>
                    <ProgressBar active={isActive} currentTime={currentTime} duration={duration} onSeek={handleSeek} />
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section id="contact" className="border-t border-neutral-800 py-10">
          <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-neutral-500">Contact</p>
              <h3 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">For collaborations, purchasing, or producing</h3>
              <p className="mt-4 text-sm text-neutral-400">Credits to @Smileralt on discord — DM for any inquiries</p>
            </div>
            <div className="space-y-3 text-sm text-neutral-400">
              <p><a href="mailto:prodjoeski@gmail.com" className="transition hover:text-white">Email — prodjoeski@gmail.com</a></p>
              <p><a href="https://instagram.com/prod.joeski" target="_blank" rel="noreferrer" className="transition hover:text-white">Instagram — @prod.joeski</a></p>
              <p><a href="https://youtube.com/@prodjoeski" target="_blank" rel="noreferrer" className="transition hover:text-white">YouTube — @prodjoeski</a></p>
              <p>Discord — joeski7</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
