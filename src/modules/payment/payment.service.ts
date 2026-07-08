import httpStatus from "http-status";
import { BookingStatus } from "../../../generated/prisma/enums";
import config from "../../config";
import { AppError } from "../../errors/AppError";
import { prisma } from "../../lib/prisma";
import { stripe } from "../../lib/stripe";
import { handleCheckoutCompleted, handleCheckoutExpired } from "./payment.utils";

const createCheckoutSession = async (userId: string, bookingId: string) => {
  const booking = await prisma.booking.findUniqueOrThrow({
    where: { id: bookingId },
    include: { service: true, payment: true },
  });

  if (booking.customerId !== userId) {
    throw new AppError(httpStatus.FORBIDDEN, "This booking does not belong to you");
  }

  if (booking.status !== BookingStatus.ACCEPTED) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Payment can only be made for bookings accepted by the technician",
    );
  }

  if (booking.payment && booking.payment.status === "COMPLETED") {
    throw new AppError(httpStatus.BAD_REQUEST, "This booking has already been paid");
  }

  const session = await stripe.checkout.sessions.create({
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: { name: booking.service.title },
          unit_amount: Math.round(booking.price * 100),
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    payment_method_types: ["card"],
    success_url: `${config.app_url}/bookings/${booking.id}?payment=success`,
    cancel_url: `${config.app_url}/bookings/${booking.id}?payment=cancelled`,
    metadata: { bookingId: booking.id, userId },
  });

  await prisma.payment.upsert({
    where: { bookingId: booking.id },
    create: {
      bookingId: booking.id,
      userId,
      amount: booking.price,
      stripeCheckoutSessionId: session.id,
    },
    update: {
      stripeCheckoutSessionId: session.id,
      status: "PENDING",
    },
  });

  return { paymentUrl: session.url };
};

const handleWebhook = async (payload: Buffer, signature: string) => {
  const event = stripe.webhooks.constructEvent(
    payload,
    signature,
    config.stripe_webhook_secret,
  );

  switch (event.type) {
    case "checkout.session.completed":
      await handleCheckoutCompleted(event.data.object);
      break;
    case "checkout.session.expired":
      await handleCheckoutExpired(event.data.object);
      break;
    default:
      console.log(`Unhandled Stripe event type: ${event.type}`);
  }
};

const getMyPayments = async (userId: string) => {
  return prisma.payment.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: { booking: { include: { service: true } } },
  });
};

const getPaymentById = async (id: string, userId: string, role: string) => {
  const payment = await prisma.payment.findUniqueOrThrow({
    where: { id },
    include: { booking: { include: { service: true } } },
  });

  if (role !== "ADMIN" && payment.userId !== userId) {
    throw new AppError(httpStatus.FORBIDDEN, "You do not have access to this payment");
  }

  return payment;
};

export const paymentService = {
  createCheckoutSession,
  handleWebhook,
  getMyPayments,
  getPaymentById,
};
