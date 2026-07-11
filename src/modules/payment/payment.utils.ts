import Stripe from "stripe";
import { BookingStatus, PaymentStatus } from "../../../generated/prisma/enums.js";
import { prisma } from "../../lib/prisma.js";

export const handleCheckoutCompleted = async (session: Stripe.Checkout.Session) => {
  const bookingId = session.metadata?.bookingId;

  if (!bookingId) {
    console.log("Webhook: missing bookingId in checkout session metadata");
    return;
  }

  const payment = await prisma.payment.findUnique({ where: { bookingId } });

  if (!payment) {
    console.log(`Webhook: no payment record found for booking ${bookingId}`);
    return;
  }

  await prisma.$transaction([
    prisma.payment.update({
      where: { bookingId },
      data: {
        status: PaymentStatus.COMPLETED,
        transactionId: (session.payment_intent as string) ?? null,
        paidAt: new Date(),
      },
    }),
    prisma.booking.update({
      where: { id: bookingId },
      data: { status: BookingStatus.PAID },
    }),
  ]);
};

export const handleCheckoutExpired = async (session: Stripe.Checkout.Session) => {
  const bookingId = session.metadata?.bookingId;

  if (!bookingId) {
    return;
  }

  await prisma.payment.updateMany({
    where: { bookingId, status: PaymentStatus.PENDING },
    data: { status: PaymentStatus.FAILED },
  });
};
