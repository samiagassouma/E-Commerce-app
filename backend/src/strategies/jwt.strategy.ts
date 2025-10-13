import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy, StrategyOptionsWithoutRequest } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

export interface SupabaseJwtPayload {
  sub: string;
  email: string;
  user_metadata: {
    name?: string;
    lastName?: string;
    role?: string;
    [key: string]: any;
  };
  [key: string]: any;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    const options: StrategyOptionsWithoutRequest = {
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req) => {
          if (req?.cookies?.access_token) {
            return req.cookies.access_token;
          }
          return null;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('CHATBOT_JWT_SECRET') || 'default-secret',
    };

    super(options);
  }

  async validate(payload: SupabaseJwtPayload): Promise<any> {
    const { sub, email, user_metadata } = payload;

    return {
      id: sub,
      email,
      ...user_metadata,
    };
  }
}
