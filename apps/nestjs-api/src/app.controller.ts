import { Controller, Get } from '@nestjs/common';
import {
  AllowAnonymous,
  OptionalAuth,
  Session,
  type UserSession,
} from '@thallesp/nestjs-better-auth';

@Controller()
export class AppController {
  @Get()
  @AllowAnonymous()
  getHello(): string {
    return 'Hello World!';
  }

  @Get('api/me')
  @OptionalAuth()
  getMe(@Session() session: UserSession) {
    return session;
  }
}
