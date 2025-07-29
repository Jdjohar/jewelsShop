const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const StripeResponse = require('../models/StripeResponse');
const Checkout = require('../models/CheckOut');
const User = require('../models/User'); 

router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'];

    let event;
    try {
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
        console.log('✅ Event verified:', event);
    } catch (err) {
        console.error('❌ Webhook signature verification failed:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Find user by Stripe customer ID (try metadata.customerId or data.object.customer)
    let user = null;
    try {
        // Usually Stripe customer ID is in event.data.object.customer
        const stripeCustomerId = event.data.object.customer || event.data.object.metadata?.customerId;
        if (stripeCustomerId) {
            user = await User.findOne({ stripeCustomerId: stripeCustomerId });
        }
    } catch (err) {
        console.error('Error finding user by Stripe customerId:', err);
    }

    // Save the webhook event to the database with correct userId (ObjectId) if found
    const stripeResponse = new StripeResponse({
        type: 'webhook_event',
        eventType: event.type,
        data: event.data.object,
        orderId: event.data.object.metadata?.orderId,
        userId: user ? user._id : null,  // use ObjectId or null if user not found
        userEmail: event.data.object.metadata?.email || event.data.object.receipt_email,
    });

    await stripeResponse.save();
    console.log("stripeResponse.orderId",stripeResponse.orderId);
    

    // Handle the event
    switch (event.type) {
        case 'payment_intent.succeeded':
            const paymentIntent = event.data.object;
            console.log('💰 PaymentIntent was successful:', paymentIntent);
            if (paymentIntent.metadata.orderId) {
                await Checkout.findByIdAndUpdate(paymentIntent.metadata.orderId, {
                    paymentStatus: 'paid',
                    orderStatus: 'Processing',
                });
            }
            break;
        case 'payment_intent.payment_failed':
            const failedPaymentIntent = event.data.object;
            console.log('❌ PaymentIntent failed:', failedPaymentIntent);
            if (failedPaymentIntent.metadata.orderId) {
                await Checkout.findByIdAndUpdate(failedPaymentIntent.metadata.orderId, {
                    paymentStatus: 'failed',
                });
            }
            break;
        case 'checkout.session.completed':
            const session = event.data.object;
            console.log('Checkout Session completed:', session);
            if (session.metadata.orderId) {
                await Checkout.findByIdAndUpdate(session.metadata.orderId, {
                    paymentStatus: 'paid',
                    orderStatus: 'Processing',
                });
            }
            break;
        default:
            console.log(`Unhandled event type: ${event.type}`);
    }

    res.status(200).json({ received: true });
});

module.exports = router;