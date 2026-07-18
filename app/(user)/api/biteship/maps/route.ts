import { BITESHIP_API_KEY } from "@/app/(user)/_constants";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const countries = searchParams.get("countries") ?? "ID";
  const input = searchParams.get("input");
  const type = searchParams.get("type") ?? "single";

  if (!input) {
    return NextResponse.json({ message: "Input is required" }, { status: 400 });
  }

  try {
    const response = await fetch(
      `https://api.biteship.com/v1/maps/areas?countries=${countries}&input=${encodeURIComponent(input)}&type=${type}`,
      {
        headers: {
          Authorization: BITESHIP_API_KEY!,
        },
        cache: "no-store",
      },
    );

    const data = await response.json();

    return NextResponse.json(data, {
      status: response.status,
    });
  } catch {
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
