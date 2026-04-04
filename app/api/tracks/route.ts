import { NextRequest, NextResponse } from "next/server";
import { kv } from "@vercel/kv";

const KV_KEY = "tracks";

type Track = { name: string; description: string; src: string };

async function readTracks(): Promise<Track[]> {
  const tracks = await kv.get<Track[]>(KV_KEY);
  return tracks ?? [];
}

export async function GET() {
  const tracks = await readTracks();
  return NextResponse.json(tracks);
}

export async function DELETE(req: NextRequest) {
  const { passkey, name } = await req.json();
  if (passkey !== process.env.ADMIN_PASSKEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const tracks = await readTracks();
  await kv.set(KV_KEY, tracks.filter((t) => t.name !== name));
  return NextResponse.json({ success: true });
}

export async function PUT(req: NextRequest) {
  const { passkey, tracks } = await req.json();
  if (passkey !== process.env.ADMIN_PASSKEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  await kv.set(KV_KEY, tracks);
  return NextResponse.json({ success: true });
}
