import { Body, Controller } from '@nestjs/common';
import { AccountChangeProfile } from '@purple/contracts';
import { RMQValidate, RMQRoute } from 'nestjs-rmq';
import { UserRepository } from './repositories/user.repository';
import { UserEntity } from './entities/user.entity';

@Controller()
export class UserCommands {
  constructor(private readonly userRepository: UserRepository) {}

  @RMQValidate()
  @RMQRoute(AccountChangeProfile.topic)
  async changeProfile(
    @Body() dto: AccountChangeProfile.Request
  ): Promise<AccountChangeProfile.Response> {
    const user = await this.userRepository.findUserById(dto.id);

    if (!user) {
      throw new Error('Not found');
    }

    const userEntity = new UserEntity(user);

    userEntity.displayName = dto.displayName || userEntity.displayName;
    userEntity.email = dto.email || userEntity.email;

    await this.userRepository.updateUser(userEntity);

    return { user: userEntity };
  }
}
