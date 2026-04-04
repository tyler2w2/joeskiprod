import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();

// Increment play or view count for a track
export async function POST(req: NextRequest) {
  const { name, type } = await req.json(); // type: "play" | "view"
  if (!name || !type) return NextResponse.json({ error: "Missing params" }, { status: 400 });

  const key = `stats:${type}:${name}`;
  const count = await redis.incr(key);
  return NextResponse.json({ count });
}

// Get all stats (admin only)
export async function GET(req: NextRequest) {
  const passkey = req.nextUrl.searchParams.get("passkey");
  if (passkey !== process.env.ADMIN_PASSKEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get track list to know which stats to fetch
  const tracks = await redis.get<{ name: string }[]>("tracks") ?? [];
  
  const stats: Record<string, { plays: number; views: number }> = {};
  for (const track of tracks) {
    const [plays, views] = await Promise.all([
      redis.get<number>(`stats:play:${track.name}`),
      redis.get<number>(`stats:view:${track.name}`),
    ]);
    stats[track.name] = { plays: plays ?? 0, views: views ?? 0 };
  }

  return NextResponse.json(stats);
}
