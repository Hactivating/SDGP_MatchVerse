import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

@Injectable()
export class PaymentService {
    private stripe: Stripe;


    constructor(private configService: ConfigService) {
        const stripeSecretKey = this.configService.get<string>('STRIPE_SECRET_KEY');

        if (!stripeSecretKey) {
            throw new Error('STRIPE_SECRET_KEY is not defined in env file')
        }

        this.stripe = new Stripe(stripeSecretKey, {

            apiVersion: '2023-10-16' as any,
        });

    }



    async createPayment(amount: number, currency = 'LKR') {
        try {

            const amountInSmallestUnit = Math.round(amount * 100);

            const paymentIntent = await this.stripe.paymentIntents.create({
                amount: amountInSmallestUnit,
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

