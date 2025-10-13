import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { HttpModule, HttpService } from '@nestjs/axios';
import { SupabaseModule } from 'src/supabase/supabase.module';
import { AuthModule } from 'src/auth/auth.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment } from 'src/entities/payment.entity';

@Module({
  imports: [HttpModule, SupabaseModule, AuthModule,
    MailerModule.forRoot({
      transport: {
        host: 'smtp.gmail.com', // or your SMTP host
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
          user: 'gassouma530@gmail.com',
          pass: 'rqpncymvvddbjkma',
        },
        tls: {
      rejectUnauthorized: false, // <--- ADD THIS
    },
        
      },
      
      defaults: {
        from: '"Shop" <your_email@gmail.com>',
      },
    }),
  TypeOrmModule.forFeature([Payment])],
  controllers: [PaymentsController],
  providers: [PaymentsService],
})
export class PaymentsModule {}
