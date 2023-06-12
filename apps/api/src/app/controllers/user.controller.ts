import { Controller, Get, Logger, UseGuards } from '@nestjs/common';
import { JwtGuard } from '../guards/jwt.guard';
import { User } from '../decorators/user.decorator';
import { Cron } from '@nestjs/schedule';

@Controller('users')
export class UserController {
  @UseGuards(JwtGuard)
  @Get('me')
  async getConfig(@User() userId: string) {
    return null;
  }

  @Cron('*/5 * * * * *')
  async cron() {
    Logger.log('test');
  }
}
