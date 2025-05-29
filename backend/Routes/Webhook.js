const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY2); // Replace with your Stripe Secret Key

// const endpointSecret = 'whsec_74ad17a41718e5668da72735dc5f3e490fcc21a6d24c17ec762cc78137579a92'; // Replace with your Webhook Secret
const endpointSecret = process.env.END_POINT_SECRET; // Replace with your Webhook Secret



// Webhook route that needs the raw body to verify the signature
router.post('/webhook', express.raw({ type: 'application/json' }), (req, res) => {
  const sig = req.headers['stripe-signature'];

  console.log("Start dfgdghdgdfg", req.body);
  console.log("Start endpointSecret", endpointSecret);

  // Check the type of req.body
  if (Buffer.isBuffer(req.body)) {
    console.log('req.body is a Buffer');
    console.log('Raw Body String:', req.body.toString('utf-8')); // Convert Buffer to string for logging
  } else if (typeof req.body === 'string') {
    console.log('req.body is a string');
  } else if (typeof req.body === 'object') {
    console.log('req.body is a parsed JavaScript object');
  } else {
    console.log('req.body is of some other type');
  }

  let event;
  try {
    // Verify the event by reconstructing it with the raw body and the signature
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    console.log('✅ Event verified:', event);
  } catch (err) {
    console.error('❌ Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event based on the type
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      console.log('💰 PaymentIntent was successful:', paymentIntent);
      // Handle the payment success (e.g., update order in the database)
      break;
    case 'payment_intent.payment_failed':
      const failedPaymentIntent = event.data.object;
      console.log('❌ PaymentIntent failed:', failedPaymentIntent);
      // Handle the payment failure
      break;
    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  // Return a 200 response to acknowledge receipt of the event
  res.status(200).json({ received: true });
});

module.exports = router;
