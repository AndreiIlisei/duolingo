import Stripe from "stripe";

export const stripe = new Stripe(
  process.env.STRIPE_API_KEY! || "sk_test_dummy_key",
  {
    apiVersion: "2025-04-30.basil",
  }
);
