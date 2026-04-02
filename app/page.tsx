"use client";

import { useMemo, useRef, useState } from "react";

type Track = {
  name: string;

joe.txt
11 KB
a1ex [ٴٴٴٴ],  — 14:41
"use client";

import { useMemo, useRef, useState } from "react";

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

function ProgressBar({
  currentTime,
  duration,
  active,
  onSeek,
}: {
  currentTime: number;
  duration: number;
  active: boolean;
  onSeek: (time: number) => void;
}) {
  return (d
    <div className="mt-3 w-full">
      <input
        type="range"
        min={0}
        max={duration || 0}
        step="0.01"
        value={active ? currentTime : 0}
        onInput={(e) => onSeek(Number(e.target.value))}
        disabled={!active || !duration}
        className="w-full"
      />
      <div className="mt-1 flex justify-between text-xs text-neutral-500">
        <span>{active ? formatTime(currentTime) : "0:00"}</span>
        <span>{active && duration ? formatTime(duration) : "--:--"}</span>
      </div>
    </div>
  );
}

export default function MusicPortfolioSite() {
  const tracks = useMemo<Track[]>(
    () => [
      {
        name: "emin 155 @prod.joeski",
        description: "Dark melodic beat. DM to buy.",
        src: getTrackSrc("emin 155 @prod.joeski.mp3"),
      },
      {
        name: "152eminor @prod.joeski",
        description: "DM to buy this one.",
        src: getTrackSrc("152eminor @prod.joeski.mp3"),
      },
      {
        name: "@prod.joeski @prod.fxckmedia 148 emin star",
        description: "Collab beat. DM if you want it.",
        src: getTrackSrc("@prod.joeski @prod.fxckmedia 148 emin star.mp3"),
      },
      {
        name: "156 cmaj @joeski7 (1)",
        description: "Available for purchase.",
        src: getTrackSrc("156 cmaj @joeski7 (1).mp3"),
      },
      {
        name: "162 @prod.joeski",
        description: "Available now.",
        src: getTrackSrc("162 @prod.joeski.mp3"),
      },
      {
        name: "amaj 170 @prod.joeski",
        description: "Fast, bright beat.",
        src: getTrackSrc("amaj 170 @prod.joeski.mp3"),
      },
      {
        name: "dminor 161 @prod.joeski",
        description: "Available for artists.",
        src: getTrackSrc("dminor 161 @prod.joeski.mp3"),
      },
      {
        name: "162 fminor @joeski7",
        description: "DM to buy.",
        src: getTrackSrc("162 fminor @joeski7.mp3"),
      },
      {
        name: "KARTEL 159 @JOESKI7",
... (223 lines left)

joe.txt
11 KB
﻿
a1ex
a1ex97
 
 
 
https://discord.gg/600shop
mg
"use client";

import { useMemo, useRef, useState } from "react";

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

function ProgressBar({
  currentTime,
  duration,
  active,
  onSeek,
}: {
  currentTime: number;
  duration: number;
  active: boolean;
  onSeek: (time: number) => void;
}) {
  return (d
    <div className="mt-3 w-full">
      <input
        type="range"
        min={0}
        max={duration || 0}
        step="0.01"
        value={active ? currentTime : 0}
        onInput={(e) => onSeek(Number(e.target.value))}
        disabled={!active || !duration}
        className="w-full"
      />
      <div className="mt-1 flex justify-between text-xs text-neutral-500">
        <span>{active ? formatTime(currentTime) : "0:00"}</span>
        <span>{active && duration ? formatTime(duration) : "--:--"}</span>
      </div>
    </div>
  );
}

export default function MusicPortfolioSite() {
  const tracks = useMemo<Track[]>(
    () => [
      {
        name: "emin 155 @prod.joeski",
        description: "Dark melodic beat. DM to buy.",
        src: getTrackSrc("emin 155 @prod.joeski.mp3"),
      },
      {
        name: "152eminor @prod.joeski",
        description: "DM to buy this one.",
        src: getTrackSrc("152eminor @prod.joeski.mp3"),
      },
      {
        name: "@prod.joeski @prod.fxckmedia 148 emin star",
        description: "Collab beat. DM if you want it.",
        src: getTrackSrc("@prod.joeski @prod.fxckmedia 148 emin star.mp3"),
      },
      {
        name: "156 cmaj @joeski7 (1)",
        description: "Available for purchase.",
        src: getTrackSrc("156 cmaj @joeski7 (1).mp3"),
      },
      {
        name: "162 @prod.joeski",
        description: "Available now.",
        src: getTrackSrc("162 @prod.joeski.mp3"),
      },
      {
        name: "amaj 170 @prod.joeski",
        description: "Fast, bright beat.",
        src: getTrackSrc("amaj 170 @prod.joeski.mp3"),
      },
      {
        name: "dminor 161 @prod.joeski",
        description: "Available for artists.",
        src: getTrackSrc("dminor 161 @prod.joeski.mp3"),
      },
      {
        name: "162 fminor @joeski7",
        description: "DM to buy.",
        src: getTrackSrc("162 fminor @joeski7.mp3"),
      },
      {
        name: "KARTEL 159 @JOESKI7",
        description: "Harder sound. Available.",
        src: getTrackSrc("KARTEL 159 @JOESKI7.mp3"),
      },
      {
        name: "LOVE 162 D MAJ @JOESKI7",
        description: "One of my favorites. Available now.",
        src: getTrackSrc("LOVE 162 D MAJ @JOESKI7.mp3"),
      },
      {
        name: "OUIJA BOARD 156 @PROD.JOESKI",
        description: "Dark beat. DM to buy.",
        src: getTrackSrc("OUIJA BOARD 156 @PROD.JOESKI.mp3"),
      },
    ],
    []
  );

  const featuredTrack =
    tracks.find((track) => track.name === "LOVE 162 D MAJ @JOESKI7") ?? tracks[0];

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [currentTrack, setCurrentTrack] = useState<Track>(featuredTrack);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  async function playTrack(track: Track) {
    const audio = audioRef.current;
    if (!audio || !track.src) return;

    if (currentTrack.name !== track.name) {
      audio.src = track.src;
      setCurrentTrack(track);
      setCurrentTime(0);
      setDuration(0);
      audio.load();
    }

    try {
      if (audio.paused || currentTrack.name !== track.name) {
        await audio.play();
      } else {
        audio.pause();
      }
    } catch (error) {
      console.error(error);
    }
  }

  function handleSeek(time: number) {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = time;
    setCurrentTime(time);
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <audio
        ref={audioRef}
        preload="metadata"
        src={featuredTrack.src}
        onTimeUpdate={() => {
          if (!audioRef.current) return;
          setCurrentTime(audioRef.current.currentTime);
        }}
        onLoadedMetadata={() => {
          if (!audioRef.current) return;
          setDuration(audioRef.current.duration || 0);
        }}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => setIsPlaying(false)}
      />

      <div className="mx-auto max-w-5xl px-6 py-10">
        <header className="mb-12 flex items-center justify-between border-b border-neutral-800 pb-5">
          <div>
            <p className="text-sm text-neutral-500">beats by</p>
            <h1 className="text-3xl font-semibold">joeski</h1>
          </div>

          <nav className="hidden gap-5 text-sm text-neutral-400 md:flex">
            <a href="#music" className="hover:text-white">
              music
            </a>
            <a href="#contact" className="hover:text-white">
              contact
            </a>
          </nav>
        </header>

        <section className="grid gap-10 py-8 md:grid-cols-2">
          <div>
            <h2 className="max-w-xl text-4xl font-semibold leading-tight">
              beats, collabs, and recent drops
            </h2>
            <p className="mt-4 max-w-lg text-sm leading-6 text-neutral-400">
              A few of my tracks are up here to preview. If you want to buy one
              or work together, hit me up.
            </p>

            <div className="mt-6 flex gap-3">
              <a
                href="#music"
                className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-black"
              >
                listen
              </a>
              <a
                href="#contact"
                className="rounded-lg border border-neutral-700 px-4 py-2 text-sm"
              >
                contact
              </a>
            </div>
          </div>

          <div className="rounded-2xl border border-neutral-800 p-5">
            <p className="text-sm text-neutral-500">featured track</p>
            <h3 className="mt-2 text-xl font-medium">{featuredTrack.name}</h3>

            <button
              onClick={() => void playTrack(featuredTrack)}
              className="mt-5 rounded-lg border border-neutral-700 px-4 py-2 text-sm"
            >
              {isPlaying && currentTrack.name === featuredTrack.name ? "Pause" : "Play"}
            </button>

            <ProgressBar
              track={undefined as never}
              currentTime={currentTrack.name === featuredTrack.name ? currentTime : 0}
              duration={currentTrack.name === featuredTrack.name ? duration : 0}
              active={currentTrack.name === featuredTrack.name}
              onSeek={handleSeek}
            />
          </div>
        </section>

        <section id="music" className="py-8">
          <h3 className="mb-6 text-2xl font-semibold">tracks</h3>

          <div className="space-y-3">
            {tracks.map((track) => {
              const active = currentTrack.name === track.name;

              return (
                <div
                  key={track.name}
                  className="rounded-xl border border-neutral-800 p-4"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="text-sm text-neutral-500">Beat · 2026</p>
                      <h4 className="text-lg font-medium">{track.name}</h4>
                      <p className="mt-1 text-sm text-neutral-400">
                        {track.description}
                      </p>
                    </div>

                    <button
                      onClick={() => void playTrack(track)}
                      className="rounded-lg border border-neutral-700 px-4 py-2 text-sm"
                    >
                      {isPlaying && active ? "Pause" : "Play"}
                    </button>
                  </div>

                  <ProgressBar
                    currentTime={active ? currentTime : 0}
                    duration={active ? duration : 0}
                    active={active}
                    onSeek={handleSeek}
                  />
                </div>
              );
            })}
          </div>
        </section>

        <section id="contact" className="border-t border-neutral-800 pt-8">
          <h3 className="text-2xl font-semibold">contact</h3>
          <p className="mt-3 max-w-lg text-sm text-neutral-400">
            Want to buy a beat, book production, or talk collabs? Reach out below.
          </p>

          <div className="mt-5 space-y-2 text-sm text-neutral-300">
            <p>
              <a
                href="mailto:prodjoeski@gmail.com"
                className="hover:text-white"
              >
                prodjoeski@gmail.com
              </a>
            </p>
            <p>
              <a
                href="https://instagram.com/prod.joeski"
                target="_blank"
                rel="noreferrer"
                className="hover:text-white"
              >
                Instagram — @prod.joeski
              </a>
            </p>
            <p>
              <a
                href="https://youtube.com/@prodjoeski"
                target="_blank"
                rel="noreferrer"
                className="hover:text-white"
              >
                YouTube — @prodjoeski
              </a>
            </p>
            <p>Discord — joeski7</p>
          </div>
        </section>
      </div>
    </div>
  );
}
