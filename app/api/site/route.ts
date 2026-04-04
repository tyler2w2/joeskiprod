import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();
const SITE_KEY = "site_settings";

export type SiteSettings = {
  tagline: string;
  bio: string;
  email: string;
  instagram: string;
  youtube: string;
  discord: string;
};

const defaults: SiteSettings = {
  tagline: "Joeski's music portfolio with all his best producers and collabs",
  bio: "Credits to @Smileralt on discord — DM for any inquiries",
  email: "prodjoeski@gmail.com",
  instagram: "prod.joeski",
  youtube: "@prodjoeski",
  discord: "joeski7",
};

export async function GET() {
  const settings = await redis.get<SiteSettings>(SITE_KEY);
  return NextResponse.json(settings ?? defaults);
}

export async function PUT(req: NextRequest) {
  const { passkey, settings } = await req.json();
  if (passkey !== process.env.ADMIN_PASSKEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  await redis.set(SITE_KEY, settings);
  return NextResponse.json({ success: true });
}
