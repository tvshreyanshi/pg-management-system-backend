import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import connectDB from './config/db.config';
import * as dotenv from 'dotenv';
import { HttpExceptionsFilter } from './common/filters/http-exceptions.filter';

async function bootstrap() {
  dotenv.config();

  // Connect to MongoDB
  await connectDB();

  const app = await NestFactory.create(AppModule);
  app.useGlobalFilters(new HttpExceptionsFilter());
  await app.listen(process.env.PORT || 5000);
  console.log(`🚀 Server running on http://localhost:${process.env.PORT}`);
}
bootstrap();
