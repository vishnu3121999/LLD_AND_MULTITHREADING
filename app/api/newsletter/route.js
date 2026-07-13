import { NextResponse } from "next/server";
import { Resend } from "resend";

export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const email = String(body.email || "").trim().toLowerCase();

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Valid email is required" }, { status: 400 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const audienceId = process.env.RESEND_AUDIENCE_ID;

  if (!apiKey || !audienceId) {
    return NextResponse.json({
      mode: "demo",
      email,
      message: "Subscribed in demo mode. Configure Resend API key and audience ID for production."
    });
  }

  const resend = new Resend(apiKey);
  await resend.contacts.create({
    audienceId,
    email
  });

  return NextResponse.json({ message: "Subscribed" });
}
