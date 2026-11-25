// Payment service stub - integrate your preferred payment gateway here

export async function createCheckoutSession() {
  throw new Error('Payment gateway not configured.');
}

export async function createPaymentIntent() {
  throw new Error('Payment gateway not configured.');
}

export async function fetchCheckoutData(sessionId: string) {
  throw new Error('Payment gateway not configured.');
}
