import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  // We don't throw here to avoid crashing build if not configured yet.
  // API routes using Stripe should still guard against missing key.
  console.warn("STRIPE_SECRET_KEY is not set");
}

export const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : (null as unknown as Stripe);


