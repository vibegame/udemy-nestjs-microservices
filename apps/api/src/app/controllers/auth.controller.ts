import { Body, Controller, Post, UnauthorizedException } from '@nestjs/common';
import { AccountLogin, AccountRegister } from '@purple/contracts';
import { RMQService } from 'nestjs-rmq';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly rmqService: RMQService) {}

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    try {
      return await this.rmqService.send<
        AccountRegister.Request,
        AccountRegister.Response
      >(AccountRegister.topic, dto);
    } catch (error) {
      if (error instanceof Error) {
        throw new UnauthorizedException();
      }
    }
  }

  @Post('login')
  async login(@Body() dto: LoginDto) {
    try {
      return await this.rmqService.send<
        AccountLogin.Request,
        AccountLogin.Response
      >(AccountLogin.topic, dto);
    } catch (error) {
      if (error instanceof Error) {
        throw new UnauthorizedException(error.message);
      }
    }
  }
}
