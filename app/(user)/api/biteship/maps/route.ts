import { BITESHIP_API_KEY, BITESHIP_BASE_URL } from "@/app/(user)/_constants";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    const input = searchParams.get("input");

    if (!input) {
      return NextResponse.json(
        {
          success: false,
          message: "Input is required",
        },
        {
          status: 400,
        },
      );
    }

    const url = new URL(`${BITESHIP_BASE_URL}/maps/areas`);

    url.searchParams.set("countries", "ID");
    url.searchParams.set("type", "single");
    url.searchParams.set("input", input);

    const response = await fetch(url.toString(), {
      headers: {
        Authorization: BITESHIP_API_KEY,
      },
      cache: "no-store",
    });

    const result = await response.json();

    if (!response.ok) {
      return NextResponse.json(result, {
        status: response.status,
      });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("[BITESHIP_MAPS]", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error",
      },
      {
        status: 500,
      },
    );
  }
}
