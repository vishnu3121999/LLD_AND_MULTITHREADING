import { NextResponse } from "next/server";
import Stripe from "stripe";
import { absoluteUrl } from "../../../../lib/utils";
import { requireApiUser } from "../../../../lib/supabase-server";

export async function POST(request) {
  const auth = await requireApiUser();
  if (auth.response) return auth.response;

  const body = await request.json().catch(() => ({}));
  const plan = body.plan || "premium";
  const secretKey = process.env.STRIPE_SECRET_KEY;
  const priceId = process.env.STRIPE_PRICE_ID;

  if (!secretKey || !priceId) {
    return NextResponse.json({
      mode: "demo",
      plan,
      url: "/pricing?demo=checkout"
    });
  }

  const stripe = new Stripe(secretKey);
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: absoluteUrl("/problems?checkout=success"),
    cancel_url: absoluteUrl("/pricing?checkout=cancelled"),
    client_reference_id: auth.user.id,
    customer_email: auth.user.email,
    metadata: { plan, userId: auth.user.id }
  });

  return NextResponse.json({ url: session.url });
}
