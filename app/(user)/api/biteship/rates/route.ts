import { BITESHIP_API_KEY, BITESHIP_BASE_URL } from "@/app/(user)/_constants";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { origin_area_id, destination_area_id, couriers, items } = body;

    if (!origin_area_id || !destination_area_id || !items?.length) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid request payload",
        },
        {
          status: 400,
        },
      );
    }

    const response = await fetch(`${BITESHIP_BASE_URL}/rates/couriers`, {
      method: "POST",
      headers: {
        Authorization: BITESHIP_API_KEY,
        "Content-Type": "application/json",
      },
      cache: "no-store",
      body: JSON.stringify({
        origin_area_id,
        destination_area_id,
        couriers,
        items,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      return NextResponse.json(result, {
        status: response.status,
      });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("[BITESHIP_RATES]", error);

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
