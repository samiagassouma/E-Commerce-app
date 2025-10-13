import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from 'src/strategies/jwt.strategy';
import { SupabaseService } from 'src/supabase/supabase.service';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { JwtModule } from '@nestjs/jwt';



@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: process.env.CHATBOT_JWT_SECRET,
      signOptions: { expiresIn: '1h' },
    }),
    TypeOrmModule.forFeature([User]),
  ],
  providers: [AuthService, JwtStrategy, SupabaseService],
  controllers: [AuthController],
  exports: [AuthService]
})
export class AuthModule {}
