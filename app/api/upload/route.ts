import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();
const KV_KEY = "tracks";

type Track = { name: string; description: string; src: string };

async function readTracks(): Promise<Track[]> {
  const tracks = await redis.get<Track[]>(KV_KEY);
  return tracks ?? [];
}

export async function POST(req: NextRequest) {
  const passkey = req.headers.get("x-passkey");
  if (passkey !== process.env.ADMIN_PASSKEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File;
  const trackName = formData.get("name") as string;
  const description = (formData.get("description") as string) || "Contact me to buy.";

  if (!file || !trackName) {
    return NextResponse.json({ error: "Missing file or name" }, { status: 400 });
  }

  if (!file.name.toLowerCase().endsWith(".mp3")) {
    return NextResponse.json({ error: "Only MP3 files are allowed" }, { status: 400 });
  }

  // Upload MP3 to Vercel Blob - stored permanently
  const blob = await put(file.name, file, {
    access: "public",
    contentType: "audio/mpeg",
  });

  const newTrack: Track = { name: trackName, description, src: blob.url };

  // Save track list to Upstash Redis - stored permanently
  const tracks = await readTracks();
  const filtered = tracks.filter((t) => t.name !== trackName);
  await redis.set(KV_KEY, [newTrack, ...filtered]);

  return NextResponse.json({ success: true, track: newTrack });
}
