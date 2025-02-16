import { sleep } from "@/app/lib/utils";
import { config } from "@/app/config";
import { NextResponse } from "next/server";

const { owner, repo, auth } = config.github;
const headers = {
  Authorization: `Bearer ${auth}`,
  "X-GitHub-Api-Version": "2022-11-28",
  "User-Agent": owner,
  Accept: "application/json",
};

interface IPack {
  name: string;
  url: string;
  logo: string;
  os: "win" | "mac";
  orderId: string;
}

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { name, url, logo, os }: IPack = await req.json();
    if (!name || !url || !logo || !["mac", "win"].includes(os)) {
      return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
    }

    const workflowName = os === "mac" ? "webdesk-pack-mac.yaml" : "webdesk-pack-win.yaml";
    const body = {
      ref: "main",
      inputs: { name, url, logo, ghToken: auth },
    };
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/actions/workflows/${workflowName}/dispatches`,
      {
        method: "POST",
        headers,
        body: JSON.stringify(body),
      }
    );
    if (!response.ok) {
      throw new Error(response.statusText);
    }
    await sleep(3000);
    const { workflow_runs } = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/actions/workflows/${workflowName}/runs`,
      { headers }
    ).then((res) => res.json());
    const [workflow_run] = workflow_runs;
    return NextResponse.json({ id: String(workflow_run.id) }, { status: 200 });
  } catch (error) {
    console.error("Error in POST /pack:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }
    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/actions/runs/${id}`, { headers });
    if (response.status === 404) {
      return NextResponse.json({ error: "Not Found" }, { status: 404 });
    }
    const { status, conclusion } = await response.json();
    if (status === "completed") {
      if (conclusion === "success") {
        const { artifacts } = await fetch(
          `https://api.github.com/repos/pigjs/webdesk-pack/actions/runs/${id}/artifacts`,
          {
            headers,
          }
        ).then((res) => res.json());
        const [artifact] = artifacts;
        if (artifact) {
          return NextResponse.json({ status: "success", id: artifact.id,url: `https://github.com/${owner}/${repo}/actions/runs/${id}` }, { status: 200 });
        }
      }
      return NextResponse.json({ status: "failure" }, { status: 200 });
    }
    return NextResponse.json({ status: "queued" }, { status: 200 });
  } catch (error) {
    console.error("Error in GET /pack:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
