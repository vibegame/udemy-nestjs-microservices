import { Body, Controller } from '@nestjs/common';
import { AccountUserCourses, AccountUserInfo } from '@purple/contracts';
import { RMQValidate, RMQRoute } from 'nestjs-rmq';
import { UserRepository } from './repositories/user.repository';
import { UserEntity } from './entities/user.entity';

@Controller()
export class UserQueries {
  constructor(private readonly userRepository: UserRepository) {}

  @RMQValidate()
  @RMQRoute(AccountUserInfo.topic)
  async userInfo(
    @Body() dto: AccountUserInfo.Request
  ): Promise<AccountUserInfo.Response> {
    const user = await this.userRepository.findUserById(dto.id);
    const userEntity = new UserEntity(user);

    return { user: userEntity.getUserInfo() };
  }

  @RMQValidate()
  @RMQRoute(AccountUserCourses.topic)
  async userCourses(
    @Body() dto: AccountUserCourses.Request
  ): Promise<AccountUserCourses.Response> {
    const user = await this.userRepository.findUserById(dto.id);

    return { courses: user.courses };
  }
}
