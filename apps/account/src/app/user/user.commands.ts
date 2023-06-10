import { Body, Controller } from '@nestjs/common';
import {
  AccountBuyCourse,
  AccountChangeProfile,
  AccountCheckPayment,
} from '@purple/contracts';
import { RMQValidate, RMQRoute, RMQService } from 'nestjs-rmq';
import { UserRepository } from './repositories/user.repository';
import { UserEntity } from './entities/user.entity';
import { BuyCourseSaga } from './sagas/buy-course.saga';

@Controller()
export class UserCommands {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly rmqService: RMQService
  ) {}

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

  @RMQValidate()
  @RMQRoute(AccountBuyCourse.topic)
  async buyCourse(
    @Body() dto: AccountBuyCourse.Request
  ): Promise<AccountBuyCourse.Response> {
    const foundUser = await this.userRepository.findUserById(dto.userId);

    if (!foundUser) {
      throw new Error('User not found');
    }

    const userEntity = new UserEntity(foundUser);
    const saga = new BuyCourseSaga(userEntity, dto.courseId, this.rmqService);
    const { user, paymentLink } = await saga.getState().pay();

    await this.userRepository.updateUser(user);

    return { paymentLink };
  }

  @RMQValidate()
  @RMQRoute(AccountCheckPayment.topic)
  async checkPayment(
    @Body() dto: AccountCheckPayment.Request
  ): Promise<AccountCheckPayment.Response> {
    const foundUser = await this.userRepository.findUserById(dto.userId);

    if (!foundUser) {
      throw new Error('User not found');
    }

    const userEntity = new UserEntity(foundUser);
    const saga = new BuyCourseSaga(userEntity, dto.courseId, this.rmqService);
    const { user, status } = await saga.getState().checkPayment();

    await this.userRepository.updateUser(user);

    return { status };
  }
}
