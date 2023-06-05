import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtGuard } from '../guards/jwt.guard';
import { User } from '../decorators/user.decorator';

@Controller('users')
export class UserController {
  @UseGuards(JwtGuard)
  @Get('me')
  async getConfig(@User() userId: string) {
    return null;
  }
}
