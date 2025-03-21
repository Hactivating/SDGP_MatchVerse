import { PaymentService } from './payment.service';
import { Controller, Body, Get, Post, BadRequestException } from '@nestjs/common';
import { createPaymentDto } from './dto/create-payment.dto';

@Controller('payment')
export class PaymentController {
    constructor(private paymentService: PaymentService) { }

    @Post('create-payment-intent')
    async createPayment(@Body() paymentDto: createPaymentDto) {
        // const clientSecret = await this.paymentService.createPayment(data.amount, 'usd');
        // return { clientSecret };

        if (!paymentDto.amount || typeof paymentDto.amount !== 'number') {
            throw new BadRequestException('valid amount is required');
        }

        if (!paymentDto.courtId || typeof paymentDto.courtId !== 'number') {
            throw new BadRequestException('valid courtId is required');

        }

        try {
            const totalAmount = paymentDto.amount;
            const clientSecret = await this.paymentService.createPayment(totalAmount, 'lkr');

            return {
                clientSecret,
                amount: totalAmount,

            };
        } catch (error) {
            throw new BadRequestException('Payment creation failed')
        }
    }







}
