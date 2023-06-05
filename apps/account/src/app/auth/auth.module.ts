import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { getJWTConfig } from '../configs/jwt.config';
import { UserModule } from '../user/user.module';

@Module({
  imports: [UserModule, JwtModule.registerAsync(getJWTConfig())],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
