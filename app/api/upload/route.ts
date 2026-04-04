import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const TRACKS_FILE = path.join(process.cwd(), "data", "tracks.json");

function readTracks() {
  if (!fs.existsSync(TRACKS_FILE)) return [];
  return JSON.parse(fs.readFileSync(TRACKS_FILE, "utf-8"));
}

function writeTracks(tracks: unknown[]) {
  fs.writeFileSync(TRACKS_FILE, JSON.stringify(tracks, null, 2));
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

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const fileName = file.name;
  const publicDir = path.join(process.cwd(), "public");
  const filePath = path.join(publicDir, fileName);
  fs.writeFileSync(filePath, buffer);

  const src = `/${encodeURIComponent(fileName)}`;
  const newTrack = { name: trackName, description, src };

  const tracks = readTracks();
  // Remove any existing track with the same name
  const filtered = tracks.filter((t: { name: string }) => t.name !== trackName);
  writeTracks([newTrack, ...filtered]);

  return NextResponse.json({ success: true, track: newTrack });
}
