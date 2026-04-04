import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();
const KV_KEY = "tracks";

export type Track = {
  name: string;
  description: string;
  src: string;
  price?: string;
  buyLink?: string;
  featured?: boolean;
  comingSoon?: boolean;
};

async function readTracks(): Promise<Track[]> {
  const tracks = await redis.get<Track[]>(KV_KEY);
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
  await redis.set(KV_KEY, tracks.filter((t) => t.name !== name));
  return NextResponse.json({ success: true });
}

export async function PUT(req: NextRequest) {
  const { passkey, tracks } = await req.json();
  if (passkey !== process.env.ADMIN_PASSKEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  await redis.set(KV_KEY, tracks);
  return NextResponse.json({ success: true });
}

// Update a single track's metadata
export async function PATCH(req: NextRequest) {
  const { passkey, name, updates } = await req.json();
  if (passkey !== process.env.ADMIN_PASSKEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const tracks = await readTracks();

  // If setting featured, unset all others first
  let updated = tracks.map((t) => {
    if (updates.featured !== undefined) {
      return t.name === name ? { ...t, ...updates } : { ...t, featured: false };
    }
    return t.name === name ? { ...t, ...updates } : t;
  });

  await redis.set(KV_KEY, updated);
  return NextResponse.json({ success: true });
}
