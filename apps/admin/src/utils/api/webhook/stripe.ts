import { generateOrderId } from "common";
import { OrderStatus, prisma, TransactionStatus } from "@vapestation/database";
import Stripe from "stripe";
import { z } from "zod";
import axios from "axios";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  typescript: true,
});

export const checkoutSessionCompletedHandler = async (
  event: Stripe.PaymentIntent,
) => {
  const { id, shipping, status } = event;

  const sessions = await stripe.checkout.sessions.list({
    limit: 1,
    payment_intent: id,
  });

  const session = sessions.data[0];

  if (sessions.data.length <= 0 || !session) {
    throw new Error("No amount total found");
  }

  const { amount_total, metadata, customer_email } = session;

  const { cartId } = z.object({ cartId: z.string() }).parse(metadata);

  if (!amount_total) {
    throw new Error("No amount total found");
  }

  if (!cartId || !shipping?.address) {
    throw new Error("No cart id found");
  }

  const cart = await prisma.cart.findUniqueOrThrow({
    where: {
      id: cartId,
    },
  });

  if (!customer_email) {
    throw new Error("No Email found");
  }

  const address = {
    city: shipping?.address.city || "",
    country: shipping?.address.country ?? "",
    line1: shipping?.address.line1 ?? "",
    post_code: shipping?.address.postal_code ?? "",
    state: shipping?.address.state,
    line2: shipping?.address.line2,
  };

  const customer = await prisma.customer.update({
    where: {
      email: customer_email,
    },
    data: {
      cartId: null,
      address,
    },
  });

  const orderId = generateOrderId();

  const formProducts = cart.products.filter(
    (product) => !!product.formMetaData,
  );

  const order = await prisma.order.create({
    data: {
      totalAmount: amount_total / 100,
      paymentIntentId: id,
      status: orderStatus(status, !!formProducts.length),
      customerId: customer.id,
      address,
      orderId,
      cartId,
    },
  });

  const formMetaDataRequests = prisma.formMetaData.createMany({
    data: formProducts.map((product) => ({
      orderId: order.id,
      tagSlug: product?.formMetaData?.tagSlug!,
      value: product?.formMetaData?.value,
      productId: product.id,
    })),
  });

  const transactionRequest = prisma.transaction.create({
    data: {
      address,
      orderId: order.id,
      amount: amount_total / 100,
      customerId: cart.customerId,
      status: paymentStatus(status),
    },
  });

  const productsOrdersRequest = prisma.productOrder.createMany({
    data: cart?.products.map((product) => ({
      orderId: order.id,
      productId: product.id,
      quantity: product.quantity,
      price: product.price,
    })),
  });

  const productsUpdateRequest = cart?.products.map(async (product) => {
    const updatedProduct = await prisma.product.update({
      where: {
        id: product.id,
      },
      data: {
        inventory: {
          update: {
            quantity: {
              decrement: product.quantity,
            },
          },
        },
        sales: {
          increment: product.quantity,
        },
      },
      select: {
        id: true,
        inventory: true,
        inStock: true,
      },
    });

    if (updatedProduct.inventory.quantity <= 0) {
      await prisma.product.update({
        where: {
          id: product.id,
        },
        data: {
          inStock: false,
        },
      });
    }
  });

  const cartDeleteRequest = prisma.cart.delete({
    where: {
      id: cartId,
    },
  });

  const promises = [];

  if (formProducts.length > 0) {
    promises.push(formMetaDataRequests);
  }

  const [transaction, productsOrders] = await Promise.all([
    transactionRequest,
    productsOrdersRequest,
    productsUpdateRequest,
    cartDeleteRequest,
    ...promises,
  ]);

  if (status === "succeeded") {
    await Promise.all(
      cart.products.map(async (product) => {
        await prisma.product.update({
          where: {
            id: product.id,
          },
          data: {
            inventory: {
              update: {
                quantity: {
                  decrement: product.quantity,
                },
              },
            },
          },
        });
      }),
    );
  }

  const slackBody = {
    blocks: [
      {
        type: "header",
        text: {
          type: "plain_text",
          text: "New Order Received",
        },
      },
      {
        type: "section",
        fields: [
          {
            type: "mrkdwn",
            text: `*Order by:*\n<${customer_email}|Fred Enriquez>`,
          },
        ],
      },
      {
        type: "section",
        fields: [
          {
            type: "mrkdwn",
            text: `*Address:*`,
          },
          {
            type: "mrkdwn",
            text: `*City:*${address.city}`,
          },
          {
            type: "mrkdwn",
            text: `*Line 1:*${address.line1}`,
          },
          {
            type: "mrkdwn",
            text: `*Line 2:*${address.line2}`,
          },
          {
            type: "mrkdwn",
            text: `*State:*${address.state}`,
          },
          {
            type: "mrkdwn",
            text: `*Post Code:*${address.post_code}`,
          },
        ],
      },
      {
        type: "section",
        fields: [
          {
            type: "mrkdwn",
            text: `*Total Items:*\n${productsOrders.count}`,
          },
          {
            type: "mrkdwn",
            text: `*Total Amount:*\n£${amount_total / 100}`,
          },
        ],
      },
      {
        type: "rich_text",
        block_id: "block1",
        elements: [
          {
            type: "rich_text_section",
            elements: [
              {
                type: "text",
                text: "Items:",
              },
            ],
          },
          {
            type: "rich_text_list",
            elements: cart?.products.map((product) => ({
              type: "rich_text_section",
              elements: [
                {
                  type: "text",
                  text: `${product.quantity} x ${product.price} - ${product.id}`,
                },
              ],
            })),
            style: "bullet",
            indent: 0,
            border: 1,
          },
        ],
      },
    ],
  };

  const sendEmail = await axios.post(
    `${process.env.VAPESTATION_BACKEND_SERVER}/email/send-transactional-email`,
    {
      userEmail: customer_email,
      orderId: order.id,
    },
  );

  const sendSlack = await fetch(process.env.SLACK_ORDER_WEBHOOK!, {
    body: JSON.stringify(slackBody),
    method: "POST",
  });
};

function orderStatus(
  status: Stripe.PaymentIntent.Status,
  isFormMetaData: boolean,
): OrderStatus {
  switch (status) {
    case "requires_payment_method":
      return OrderStatus.PENDING;
    case "requires_confirmation":
      return OrderStatus.PENDING;
    case "requires_action":
      return OrderStatus.PENDING;
    case "processing":
      return OrderStatus.PENDING;
    case "succeeded":
      return isFormMetaData ? OrderStatus.PENDING : OrderStatus.PROCESSING;
    case "canceled":
      return OrderStatus.PENDING;
    default:
      return OrderStatus.PENDING;
  }
}

function paymentStatus(status: Stripe.PaymentIntent.Status): TransactionStatus {
  switch (status) {
    case "requires_payment_method":
      return TransactionStatus.PENDING;
    case "requires_confirmation":
      return TransactionStatus.PENDING;
    case "requires_action":
      return TransactionStatus.PENDING;
    case "processing":
      return TransactionStatus.PROCESSING;
    case "succeeded":
      return TransactionStatus.COMPLETED;
    case "canceled":
      return TransactionStatus.CANCELLED;
    default:
      return TransactionStatus.PENDING;
  }
}
