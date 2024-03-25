import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import * as express from 'express';

const expressApp = express();

export const handler = async () => {
  const adapter = new ExpressAdapter(expressApp);
  const app = await NestFactory.create(AppModule, adapter);

  await app.init();

  expressApp.listen(3000, () => {
    console.log('Nest application is listening on port 3000.');
  });
};
