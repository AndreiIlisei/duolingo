/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { headers } from "next/headers";
import Stripe from "stripe";
import { userSubscription } from "@/database/schema";
import db from "@/database/drizzle";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  const body = await req.text();
  const signature = (await headers()).get("Stripe-Signature") as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    return new NextResponse("Webhook Error: " + err.message, { status: 400 });
  }

  // Handle the event
  const session = event.data.object as Stripe.Checkout.Session;

  if (event.type === "checkout.session.completed") {
    const subscription = (await stripe.subscriptions.retrieve(
      session.subscription as string
    )) as Stripe.Subscription;

    if (!session?.metadata?.userId) {
      return new NextResponse("User ID is required", { status: 400 });
    }

    await db.insert(userSubscription).values({
      userId: session.metadata.userId,
      stripeSubscriptionId: subscription.id,
      stripeCustomerId: subscription.customer as string,
      stripePriceId: subscription.items.data[0].price.id,
      stripeCurrentPeriodEnd: new Date(
        subscription.items.data[0].current_period_end * 1000
      ),
    });
  }

  if (event.type === "invoice.payment_succeeded") {
    const session = event.data.object as any;
    const subscription = await stripe.subscriptions.retrieve(
      session.subscription as string
    );

    await db
      .update(userSubscription)
      .set({
        stripePriceId: subscription.items.data[0].price.id,
        stripeCurrentPeriodEnd: new Date(
          subscription.items.data[0].current_period_end * 1000
        ),
      })
      .where(eq(userSubscription.stripeSubscriptionId, subscription.id));
  }

  return new NextResponse(null, { status: 200 });
}
