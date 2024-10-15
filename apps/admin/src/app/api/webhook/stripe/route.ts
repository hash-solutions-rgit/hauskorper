import Stripe from "stripe";
import { NextRequest } from "next/server";
import { headers } from "next/headers";
import { z } from "zod";
import { checkoutSessionCompletedHandler } from "~admin/utils/api/webhook/stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  typescript: true,
});

export async function POST(request: NextRequest) {
  const body = await request.text();
  const endpointSecret = process.env.STRIPE_SECRET_WEBHOOK_KEY;

  if (!endpointSecret) {
    throw new Error("No endpoint secret for stripe set");
  }

  const sig = z.string().parse(headers().get("stripe-signature"));

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
  } catch (err) {
    return new Response(`Webhook Error: ${err}`, {
      status: 400,
    });
  }

  //    Handle the event
  switch (event.type) {
    case "payment_intent.succeeded":
      console.log(`event type ${event.type}`);
      const checkoutSessionCompleted = event.data.object;
      await checkoutSessionCompletedHandler(checkoutSessionCompleted);
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }
  return new Response("RESPONSE EXECUTE", {
    status: 200,
  });
}
