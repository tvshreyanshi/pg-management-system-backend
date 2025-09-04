import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Register, RegisterSchema } from './register.schema';
import { RegisterService } from './register.service';
import { RegisterController } from './register.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Register.name, schema: RegisterSchema },
    ]),
  ],
  providers: [RegisterService],
  controllers: [RegisterController],
  exports: [RegisterService],
})
export class RegisterModule {}
