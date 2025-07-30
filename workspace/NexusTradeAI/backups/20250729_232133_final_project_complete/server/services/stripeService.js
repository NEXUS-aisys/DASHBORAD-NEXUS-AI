const Stripe = require('stripe');
const config = require('../utils/config');
const SupabaseService = require('./supabaseService');

let stripe = null;

// Only initialize Stripe if secret key is provided and valid
if (config.STRIPE_SECRET_KEY && config.STRIPE_SECRET_KEY !== 'sk_test_placeholder') {
  stripe = new Stripe(config.STRIPE_SECRET_KEY);
}

class StripeService {
  static async createCheckoutSession(userId, email) {
    if (!stripe) {
      // Return mock checkout session when Stripe is not configured
      return {
        url: 'https://checkout.stripe.com/demo-session',
        id: 'cs_demo_session_id'
      };
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price: 'price_YourMonthlyPlanId', // Replace with your Stripe price ID
        quantity: 1,
      }],
      mode: 'subscription',
      success_url: 'http://localhost:5181/success', // Replace with actual URL
      cancel_url: 'http://localhost:5181/cancel', // Replace with actual URL
      client_reference_id: userId,
      customer_email: email,
    });
    return session;
  }

  static async handleWebhook(event) {
    if (!stripe) {
      console.log('Stripe not configured - webhook ignored');
      return;
    }

    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object;
        const userId = session.client_reference_id;
        const customerId = session.customer;
        await SupabaseService.updateSubscription(userId, customerId, 'active');
        break;
      case 'invoice.payment_succeeded':
        // Handle successful payment
        break;
      case 'invoice.payment_failed':
        // Handle failed payment
        break;
      default:
        console.log(`Unhandled event type ${event.type}`);
    }
  }
}

module.exports = StripeService; 