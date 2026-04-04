import { NextRequest, NextResponse } from "next/server";
import { kv } from "@vercel/kv";

const KV_KEY = "tracks";

// Run this ONCE at /api/seed?passkey=YOUR_PASSKEY to load your existing tracks into KV
export async function GET(req: NextRequest) {
  const passkey = req.nextUrl.searchParams.get("passkey");
  if (passkey !== process.env.ADMIN_PASSKEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const existing = await kv.get(KV_KEY);
  if (existing) {
    return NextResponse.json({ message: "Already seeded", tracks: existing });
  }

  const tracks = [
    { name: "OUIJA BOARD 156 @PROD.JOESKI", description: "Contact me to buy.", src: "/OUIJA%20BOARD%20156%20%40PROD.JOESKI.mp3" },
    { name: "LOVE 162 D MAJ @JOESKI7", description: "Contact me to buy.", src: "/LOVE%20162%20D%20MAJ%20%40JOESKI7.mp3" },
    { name: "KARTEL 159 @JOESKI7", description: "Contact me to buy.", src: "/KARTEL%20159%20%40JOESKI7.mp3" },
    { name: "162 fminor @joeski7", description: "Contact me to buy.", src: "/162%20fminor%20%40joeski7.mp3" },
    { name: "dminor 161 @prod.joeski", description: "Contact me to buy.", src: "/dminor%20161%20%40prod.joeski.mp3" },
    { name: "amaj 170 @prod.joeski", description: "Contact me to buy.", src: "/amaj%20170%20%40prod.joeski.mp3" },
    { name: "162 @prod.joeski", description: "Contact me to buy.", src: "/162%20%40prod.joeski.mp3" },
    { name: "RAVER BMIN 161 @PROD.JOESKI", description: "Contact me to buy.", src: "/RAVER%20BMIN%20161%20%40PROD.JOESKI.mp3" },
    { name: "@prod.joeski @prod.fxckmedia 148 emin star", description: "Contact me to buy.", src: "/%40prod.joeski%20%40prod.fxckmedia%20148%20emin%20star.mp3" },
    { name: "152eminor @prod.joeski", description: "Contact me to buy.", src: "/152eminor%20%40prod.joeski.mp3" },
    { name: "emin 155 @prod.joeski", description: "Contact me to buy.", src: "/emin%20155%20%40prod.joeski.mp3" },
  ];

  await kv.set(KV_KEY, tracks);
  return NextResponse.json({ message: "Seeded successfully", tracks });
}
