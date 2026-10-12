import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const data = await request.json();
    console.log("[GROOVE HUB LEAD LOG]", new Date().toISOString(), data);

    // This route is ready for you to connect a database, email webhook, or CRM later.
    return NextResponse.json({
      success: true,
      message: "Lead recorded successfully",
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: "Invalid payload" },
      { status: 400 }
    );
  }
}
