"use client";

import { useEffect, useMemo, useRef, useState } from "react";

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

function getTrackSrc(fileName: string) {
  return `/${encodeURIComponent(fileName)}`;
}

export default function Page() {
  const allTracks = useMemo<Track[]>(
    () => [
      {
        name: "emin 155 @prod.joeski",
        description: "Contact me to buy.",
        src: getTrackSrc("emin 155 @prod.joeski.mp3"),
      },
      {
        name: "152eminor @prod.joeski",
        description: "Contact me to buy.",
        src: getTrackSrc("152eminor @prod.joeski.mp3"),
      },
      {
        name: "@prod.joeski @prod.fxckmedia 148 emin star",
        description: "Contact me to buy.",
        src: getTrackSrc("@prod.joeski @prod.fxckmedia 148 emin star.mp3"),
      },
      {
        name: "RAVER BMIN 161 @PROD.JOESKI",
        description: "Contact me to buy.",
        src: getTrackSrc("RAVER BMIN 161 @PROD.JOESKI.mp3"),
      },
      {
        name: "162 @prod.joeski",
        description: "Contact me to buy.",
        src: getTrackSrc("162 @prod.joeski.mp3"),
      },
      {
        name: "amaj 170 @prod.joeski",
        description: "Contact me to buy.",
        src: getTrackSrc("amaj 170 @prod.joeski.mp3"),
      },
      {
        name: "dminor 161 @prod.joeski",
        description: "Contact me to buy.",
        src: getTrackSrc("dminor 161 @prod.joeski.mp3"),
      },
      {
        name: "162 fminor @joeski7",
        description: "Contact me to buy.",
        src: getTrackSrc("162 fminor @joeski7.mp3"),
      },
      {
        name: "KARTEL 159 @JOESKI7",
        description: "Contact me to buy.",
        src: getTrackSrc("KARTEL 159 @JOESKI7.mp3"),
      },
      {
        name: "LOVE 162 D MAJ @JOESKI7",
        description: "Contact me to buy.",
        src: getTrackSrc("LOVE 162 D MAJ @JOESKI7.mp3"),
      },
      {
        name: "OUIJA BOARD 156 @PROD.JOESKI",
        description: "Contact me to buy.",
        src: getTrackSrc("OUIJA BOARD 156 @PROD.JOESKI.mp3"),
      },
    ],
    []
  );

  const featuredTrack =
    allTracks.find((track) => track.name === "LOVE 162 D MAJ @JOESKI7") ??
    allTracks[0];

  const musicSlots: Track[] = [
    ...allTracks,
    ...Array.from({ length: 9 }, () => ({
      name: "Coming Soon",
      description: "Coming soon.",
      src: "",
      comingSoon: true,
    })),
  ];

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [currentTrack, setCurrentTrack] = useState<Track>(featuredTrack);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const [isDragging, setIsDragging] = useState(false);
  const [dragTime, setDragTime] = useState(0);

  async function playTrack(track: Track) {
    const audio = audioRef.current;
    if (!audio || !track.src) return;

    const sameTrack = currentTrack.name === track.name;

    try {
      if (!sameTrack) {
        audio.pause();
        audio.src = track.src;
        audio.load();

        setCurrentTrack(track);
        setCurrentTime(0);
        setDuration(0);
        setDragTime(0);

        await audio.play();
        setIsPlaying(true);
        return;
      }

      if (audio.paused) {
        await audio.play();
        setIsPlaying(true);
      } else {
        audio.pause();
        setIsPlaying(false);
      }
    } catch (error) {
      console.error("Playback failed:", error);
      setIsPlaying(false);
    }
  }

  function seekTo(time: number) {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = time;
    setCurrentTime(time);
    setDragTime(time);
  }

  function ProgressBar({ track }: { track: Track }) {
    const barRef = useRef<HTMLDivElement | null>(null);
    const active = currentTrack.name === track.name;
    const max = active ? duration || 0 : 0;
    const shownTime = active ? (isDragging ? dragTime : currentTime) : 0;
    const percent = active && max > 0 ? Math.min((shownTime / max) * 100, 100) : 0;

    const calculateTimeFromPointer = (clientX: number) => {
      if (!barRef.current || max <= 0) return 0;
      const rect = barRef.current.getBoundingClientRect();
      const x = Math.min(Math.max(clientX - rect.left, 0), rect.width);
      const ratio = rect.width ? x / rect.width : 0;
      return ratio * max;
    };

    const startDrag = (clientX: number) => {
      if (!active || max <= 0) return;
      const nextTime = calculateTimeFromPointer(clientX);
      setIsDragging(true);
      setDragTime(nextTime);
    };

    useEffect(() => {
      if (!isDragging || !active) return;

      const handlePointerMove = (e: PointerEvent) => {
        const nextTime = calculateTimeFromPointer(e.clientX);
        setDragTime(nextTime);
      };

      const handlePointerUp = () => {
        seekTo(dragTime);
        setIsDragging(false);
      };

      window.addEventListener("pointermove", handlePointerMove);
      window.addEventListener("pointerup", handlePointerUp);

      return () => {
        window.removeEventListener("pointermove", handlePointerMove);
        window.removeEventListener("pointerup", handlePointerUp);
      };
    }, [isDragging, active, dragTime, max]);

    return (
      <div className="mt-3 w-full">
        <div
          ref={barRef}
          onPointerDown={(e) => startDrag(e.clientX)}
          className={`group relative h-2 w-full rounded-full ${
            active && max > 0 ? "cursor-pointer" : "cursor-default"
          } bg-neutral-800`}
        >
          <div
            className="absolute left-0 top-0 h-full rounded-full bg-white transition-[width] duration-75"
            style={{ width: `${percent}%` }}
          />
          {active && max > 0 ? (
            <div
              className="absolute top-1/2 h-4 w-4 -translate-y-1/2 rounded-full bg-white shadow-[0_2px_12px_rgba(0,0,0,0.35)] transition-transform duration-75 group-hover:scale-110"
              style={{ left: `calc(${percent}% - 8px)` }}
            />
          ) : null}
        </div>

        <div className="mt-1 flex justify-between text-xs text-neutral-500">
          <span>{active ? formatTime(shownTime) : "0:00"}</span>
          <span>{active && max ? formatTime(max) : "--:--"}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <audio
        ref={audioRef}
        preload="metadata"
        src={featuredTrack.src}
        onTimeUpdate={() => {
          if (!audioRef.current || isDragging) return;
          setCurrentTime(audioRef.current.currentTime || 0);
        }}
        onLoadedMetadata={() => {
          if (!audioRef.current) return;
          setDuration(audioRef.current.duration || 0);
        }}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => setIsPlaying(false)}
      />

      <div className="mx-auto flex max-w-6xl flex-col px-6 py-10 sm:px-8 lg:px-12">
        <header className="flex items-center justify-between border-b border-neutral-800 pb-6">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-neutral-500">
              Music Portfolio
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-5xl">
              joeski
            </h1>
          </div>

          <nav className="hidden gap-6 text-sm text-neutral-400 md:flex">
            <a href="#music" className="transition hover:text-white">
              Music
            </a>
            <a href="#contact" className="transition hover:text-white">
              Contact
            </a>
          </nav>
        </header>

        <section className="grid gap-12 py-20 lg:grid-cols-[1.35fr_0.95fr] lg:items-center">
          <div className="flex min-h-[420px] flex-col justify-center">
            <h2 className="max-w-3xl text-4xl font-semibold leading-[0.95] tracking-tight sm:text-6xl">
              Joeski&apos;s music portfolio with all his best producers and
              collabs
            </h2>

            <div className="mt-8 flex flex-wrap gap-4">
              <a
                href="#music"
                className="rounded-2xl border border-neutral-700 bg-white px-5 py-3 text-sm font-medium text-black transition-all duration-300 ease-out hover:-translate-y-0.5 hover:opacity-90"
              >
                Explore music
              </a>
              <a
                href="#contact"
                className="rounded-2xl border border-neutral-800 px-5 py-3 text-sm font-medium text-neutral-200 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-neutral-600 hover:bg-neutral-900/40"
              >
                Book / Contact
              </a>
            </div>
          </div>

          <div className="rounded-[2rem] border border-neutral-800/80 bg-neutral-900/50 p-6 shadow-[0_20px_80px_rgba(0,0,0,0.35)] backdrop-blur-xl">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-neutral-500">
                  Featured
                </p>
                <h3 className="mt-2 text-xl font-medium">Latest release</h3>
              </div>

              <span
                className={`rounded-full border px-3 py-1 text-xs uppercase tracking-[0.25em] ${
                  isPlaying && currentTrack.name === featuredTrack.name
                    ? "border-red-500/60 bg-red-500/10 text-red-400"
                    : "border-neutral-700 text-neutral-400"
                }`}
              >
                {isPlaying && currentTrack.name === featuredTrack.name
                  ? "playing"
                  : "live"}
              </span>
            </div>

            <div className="pt-5">
              <div className="relative flex aspect-square items-center justify-center rounded-[1.5rem] border border-neutral-800 bg-gradient-to-br from-neutral-800 to-neutral-950">
                <div
                  className={`relative flex h-48 w-48 items-center justify-center rounded-full border border-neutral-700 bg-neutral-950/70 shadow-2xl shadow-black/30 ${
                    isPlaying && currentTrack.name === featuredTrack.name
                      ? "animate-spin [animation-duration:8s]"
                      : ""
                  }`}
                >
                  <div className="relative h-40 w-40 rounded-full border border-neutral-800 bg-neutral-900">
                    <div className="absolute left-1/2 top-4 h-8 w-1 -translate-x-1/2 rounded-full bg-neutral-600" />
                    <div className="absolute left-1/2 top-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full border border-neutral-800 bg-neutral-950/80" />
                  </div>
                  <div className="absolute h-5 w-5 rounded-full border border-neutral-700 bg-neutral-950" />
                </div>

                <button
                  onClick={() => void playTrack(featuredTrack)}
                  className="absolute flex h-14 w-14 items-center justify-center rounded-full border border-neutral-700 bg-white text-black transition-all duration-300 ease-out hover:scale-105"
                  aria-label={
                    isPlaying && currentTrack.name === featuredTrack.name
                      ? "Pause featured track"
                      : "Play featured track"
                  }
                >
                  {isPlaying && currentTrack.name === featuredTrack.name ? (
                    <div className="flex gap-1">
                      <span className="h-4 w-1.5 rounded-sm bg-black" />
                      <span className="h-4 w-1.5 rounded-sm bg-black" />
                    </div>
                  ) : (
                    <div className="ml-1 h-0 w-0 border-y-[10px] border-l-[16px] border-y-transparent border-l-black" />
                  )}
                </button>
              </div>

              <div className="mt-5 flex items-start justify-between gap-4">
                <div className="w-full">
                  <h4 className="text-lg font-medium">LOVE 162 D MAJ @JOESKI7</h4>
                  <ProgressBar track={featuredTrack} />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="music" className="py-8">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-neutral-500">
                Selected works
              </p>
              <h3 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
                Music
              </h3>
            </div>
          </div>

          <div className="space-y-4">
            {musicSlots.map((track, index) => {
              const isComingSoon = track.comingSoon;
              const isActive = currentTrack.name === track.name;

              return (
                <div
                  key={`${track.name}-${index}`}
                  className="grid gap-5 rounded-[1.75rem] border border-neutral-800 bg-neutral-900/40 p-5 transition-all duration-300 ease-out hover:border-neutral-700 hover:bg-neutral-900/60 sm:grid-cols-[1.2fr_2fr_auto] sm:items-center"
                >
                  <div>
                    <p className="text-sm text-neutral-500">Beat · 2026</p>
                    <h4 className="mt-1 text-xl font-medium">{track.name}</h4>
                  </div>

                  <div>
                    <p className="text-sm leading-6 text-neutral-400">
                      {track.description}
                    </p>
                    <ProgressBar track={track} />
                  </div>

                  <div className="flex items-center gap-4 sm:justify-end">
                    <span className="text-sm text-neutral-500">
                      {isActive && duration
                        ? formatTime(duration)
                        : isComingSoon
                        ? "--:--"
                        : "MP3"}
                    </span>

                    <button
                      onClick={() => {
                        if (!isComingSoon) void playTrack(track);
                      }}
                      className="rounded-full border border-neutral-700 px-4 py-2 text-sm text-neutral-200 transition-all duration-300 ease-out hover:border-neutral-500 disabled:cursor-not-allowed disabled:opacity-50"
                      disabled={isComingSoon}
                    >
                      {isComingSoon
                        ? "Soon"
                        : isPlaying && isActive
                        ? "Pause"
                        : "Listen"}
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
                <p className="text-xs uppercase tracking-[0.35em] text-neutral-500">
                  Archive
                </p>
                <h3 className="mt-3 text-2xl font-semibold tracking-tight">
                  Releases
                </h3>
              </div>

              <div className="grid gap-3 text-sm text-neutral-400 sm:grid-cols-3">
                <div className="rounded-2xl border border-neutral-800 px-4 py-3">
                  Purchasing available
                </div>
                <div className="rounded-2xl border border-neutral-800 px-4 py-3">
                  Custom production
                </div>
                <div className="rounded-2xl border border-neutral-800 px-4 py-3">
                  Collabs open
                </div>
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {allTracks.slice(0, 4).map((release) => (
                <div
                  key={`${release.name}-bottom`}
                  className="group relative flex flex-col items-center justify-center rounded-[1.75rem] border border-neutral-800 p-6 transition-all duration-300 ease-out hover:border-neutral-700 hover:bg-neutral-900/60"
                >
                  <div className="relative flex h-40 w-40 items-center justify-center">
                    <div
                      className={`absolute h-full w-full rounded-full border border-neutral-700 bg-gradient-to-br from-neutral-800 to-neutral-950 ${
                        isPlaying && currentTrack.name === release.name
                          ? "animate-spin [animation-duration:8s]"
                          : ""
                      }`}
                    />
                    <div className="absolute h-28 w-28 rounded-full border border-neutral-800 bg-neutral-900" />
                    <div className="absolute h-4 w-4 rounded-full border border-neutral-700 bg-neutral-950" />

                    <button
                      onClick={() => void playTrack(release)}
                      className="absolute flex h-12 w-12 items-center justify-center rounded-full bg-white text-black transition-all duration-300 ease-out group-hover:scale-105"
                      aria-label={`Play ${release.name}`}
                    >
                      {isPlaying && currentTrack.name === release.name ? (
                        <div className="flex gap-1">
                          <span className="h-4 w-1.5 rounded-sm bg-black" />
                          <span className="h-4 w-1.5 rounded-sm bg-black" />
                        </div>
                      ) : (
                        <div className="ml-1 h-0 w-0 border-y-[8px] border-l-[12px] border-y-transparent border-l-black" />
                      )}
                    </button>
                  </div>

                  <h4 className="mt-5 text-center text-base font-medium">
                    {release.name}
                  </h4>
                  <ProgressBar track={release} />
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="contact" className="border-t border-neutral-800 py-10">
          <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-neutral-500">
                Contact
              </p>
              <h3 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
                For collaborations, purchasing, or producing
              </h3>
              <p className="mt-4 text-sm text-neutral-400">
                Credits to @Smileralt on discord — DM for any inquiries
              </p>
            </div>

            <div className="space-y-3 text-sm text-neutral-400">
              <p>
                <a
                  href="mailto:prodjoeski@gmail.com"
                  className="transition hover:text-white"
                >
                  Email — prodjoeski@gmail.com
                </a>
              </p>
              <p>
                <a
                  href="https://instagram.com/prod.joeski"
                  target="_blank"
                  rel="noreferrer"
                  className="transition hover:text-white"
                >
                  Instagram — @prod.joeski
                </a>
              </p>
              <p>
                <a
                  href="https://youtube.com/@prodjoeski"
                  target="_blank"
                  rel="noreferrer"
                  className="transition hover:text-white"
                >
                  YouTube — @prodjoeski
                </a>
              </p>
              <p>Discord — joeski7</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
