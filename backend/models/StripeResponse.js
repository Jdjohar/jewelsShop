const mongoose = require('mongoose');
const { Schema } = mongoose;

const stripeResponseSchema = new Schema({
    type: {
        type: String,
        required: true, // e.g., 'payment_intent', 'checkout_session', 'webhook_event'
    },
    eventType: {
        type: String, // e.g., 'payment_intent.succeeded', 'checkout.session.completed'
    },
    data: {
        type: Schema.Types.Mixed, // Store the full Stripe response object
        required: true,
    },
    orderId: {
        type: Schema.Types.ObjectId,
        ref: 'Checkout', // Link to Checkout model if applicable
    },
    userId: {
       type: String,
    },
    userEmail: {
        type: String,
    },
     stripeCustomerId: {
    type: String, // Store Stripe's customer ID here, not as ObjectId
  },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('StripeResponse', stripeResponseSchema);