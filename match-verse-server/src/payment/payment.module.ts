import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { ConfigModule } from '@nestjs/config';

@Module({
  providers: [PaymentService],
  controllers: [PaymentController],
  imports: [ConfigModule],
  exports: [PaymentService]
})
export class PaymentModule { }
