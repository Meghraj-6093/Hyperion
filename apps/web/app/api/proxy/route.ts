import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { url, method = "GET", headers = {}, body } = await req.json();

    if (!url) {
      return NextResponse.json({ error: "Missing url" }, { status: 400 });
    }

    const fetchOptions: RequestInit = {
      method,
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
    };

    if (body) {
      fetchOptions.body = JSON.stringify(body);
    }

    const res = await fetch(url, fetchOptions);

    // Some endpoints might return non-JSON, but standard LLM APIs return JSON.
    const data = await res.json().catch(() => ({}));

    return NextResponse.json(data, { status: res.status });
  } catch (error: any) {
    console.error("Proxy error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch from proxy" },
      { status: 500 }
    );
  }
}
