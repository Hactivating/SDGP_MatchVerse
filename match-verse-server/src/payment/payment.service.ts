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

    async createPayment(amount: Number) {
        const payment = await this.stripe.payment.create({
            amount: amount * 100,
            payment_method_types: ['card'],
        });

        return payment.client_secret;
    }
}


