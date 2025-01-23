import { config } from "@/app/config";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "ID cannot be empty" }, { status: 400 });
    }
    const { owner, auth } = config.github;
    const headers = {
      Authorization: `Bearer ${auth}`,
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": owner,
      Accept: "application/json",
    };
    const response = await fetch(`https://api.github.com/repos/pigjs/webdesk-pack/actions/artifacts/${id}/zip`, {
      headers,
    });
    if (!response.ok) {
      console.error("GitHub API error:", response.statusText);
      return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
    return new NextResponse(response.body, {
      headers: {
        "Content-Disposition": "attachment; filename=release.zip",
        "Content-Type": "application/zip",
      },
    });
  } catch (error) {
    console.error("Error in /download:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
