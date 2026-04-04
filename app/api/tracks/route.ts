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

export async function GET() {
  return NextResponse.json(readTracks());
}

export async function DELETE(req: NextRequest) {
  const { passkey, name } = await req.json();
  if (passkey !== process.env.ADMIN_PASSKEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const tracks = readTracks();
  const updated = tracks.filter((t: { name: string }) => t.name !== name);
  writeTracks(updated);
  return NextResponse.json({ success: true });
}

export async function PUT(req: NextRequest) {
  const { passkey, tracks } = await req.json();
  if (passkey !== process.env.ADMIN_PASSKEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  writeTracks(tracks);
  return NextResponse.json({ success: true });
}
