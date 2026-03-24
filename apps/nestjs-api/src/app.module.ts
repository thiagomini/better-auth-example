import { Module } from '@nestjs/common';
import { AuthModule } from '@thallesp/nestjs-better-auth';
import { auth } from '#lib/auth.ts';
import { AppController } from './app.controller.ts';

@Module({
  imports: [
    AuthModule.forRoot({
      auth,
    }),
  ],
  controllers: [AppController],
})
export class AppModule {}
