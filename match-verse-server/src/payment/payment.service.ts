import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';

@Injectable()
export class PaymentService {
    private stripe: Stripe


    constructor() {
        this.stripe = new Stripe(process.env.sk_test_51R1dZ6CpJGOC8BnBSRWATHkFPCmdM9y3gUfMblLvmb5PTPpF45S63SYsh9AitR5JkpjDqRNoth5oUFWs9epe0Qdw00IVTsKH5h, {
            apiVersion: '2023-10-16',
        });
    }

    async createPayment(amount: number, currency = 'LKR') {
        try {
            const paymentIntent = await this.stripe.paymentIntents.create({
                amount: Math.round(amount * 100),
                currency,
                metadata: {
                    source: 'court booking'
                }
            });

            return paymentIntent.client_secret;
        } catch (error) {
            console.error('stripe payment error');
            throw new Error('payment failed')
        }
    }
}

