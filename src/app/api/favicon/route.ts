import { NextResponse } from "next/server";
import * as cheerio from "cheerio";
import sharp from "sharp";

export async function POST(req: Request) {
  try {
    const { url } = await req.json();
    const html = await fetch(url).then((response) => response.text());
    const $ = cheerio.load(html);
    const faviconLink = $('link[rel="icon"], link[rel="shortcut icon"]').first();
    let faviconUrl = faviconLink.attr("href");
    if (faviconUrl && !faviconUrl.startsWith("http")) {
      const baseUrl = new URL(url);
      faviconUrl = new URL(faviconUrl, baseUrl).href;
    }
    const response = await fetch(faviconUrl as string).then((response) => response.arrayBuffer());
    const resizedImageBuffer = await sharp(response).resize(512, 512).jpeg().toBuffer();
    const base64 = `data:image/jpeg;base64,${resizedImageBuffer.toString("base64")}`;
    return NextResponse.json({ data: base64 }, { status: 200 });
  } catch (error) {
    console.error("Error in /favicon:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
