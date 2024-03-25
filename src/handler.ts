// handler.ts
import { Request, Response } from 'express';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

let cachedApp = null;

async function bootstrapApp() {
  if (!cachedApp) {
    const app = await NestFactory.create(AppModule);
    await app.init();
    cachedApp = app;
  }
  return cachedApp;
}

export async function nestFunction(req: Request, res: Response) {
  const app = await bootstrapApp();
  // Aqui você pode manipular a solicitação HTTP
  await app.getHttpAdapter().getInstance().handle(req, res);
}
