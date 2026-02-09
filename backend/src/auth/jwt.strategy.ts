import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: 'ma_clé_secrète_sécurisée_1234567890', // Doit correspondre à auth.module.ts
    });
  }

  async validate(payload: any) {
    return {
      userId: payload.sub,
      username: payload.username,
      isAdmin: payload.isAdmin,
    };
  }
}
