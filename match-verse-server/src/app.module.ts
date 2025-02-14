import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { VenuesModule } from './venues/venues.module';
import { AuthModule } from './auth/auth.module';
import { CourtsModule } from './courts/courts.module';
import { BookingsModule } from './bookings/bookings.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [PrismaModule, VenuesModule, AuthModule, CourtsModule, BookingsModule, UsersModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
