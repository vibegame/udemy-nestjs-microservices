import { Injectable } from '@nestjs/common';
import {
  AccountBuyCourse,
  AccountChangeProfile,
  AccountCheckPayment,
} from '@purple/contracts';
import { RMQService } from 'nestjs-rmq';
import { UserRepository } from './repositories/user.repository';
import { UserEntity } from './entities/user.entity';
import { BuyCourseSaga } from './sagas/buy-course.saga';
import { UserEventEmitter } from './user.event-emitter';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly rmqService: RMQService,
    private readonly userEventEmitter: UserEventEmitter
  ) {}

  async changeProfile(
    dto: AccountChangeProfile.Request
  ): Promise<AccountChangeProfile.Response> {
    const user = await this.userRepository.findUserById(dto.id);

    if (!user) {
      throw new Error('Not found');
    }

    const userEntity = new UserEntity(user);

    userEntity.displayName = dto.displayName || userEntity.displayName;
    userEntity.email = dto.email || userEntity.email;

    await this.updateUser(userEntity);

    return { user: userEntity };
  }

  async buyCourse(
    dto: AccountBuyCourse.Request
  ): Promise<AccountBuyCourse.Response> {
    const foundUser = await this.userRepository.findUserById(dto.userId);

    if (!foundUser) {
      throw new Error('User not found');
    }

    const userEntity = new UserEntity(foundUser);
    const saga = new BuyCourseSaga(userEntity, dto.courseId, this.rmqService);
    const { user, paymentLink } = await saga.getState().pay();

    await this.updateUser(user);

    return { paymentLink };
  }

  async checkPayment(
    dto: AccountCheckPayment.Request
  ): Promise<AccountCheckPayment.Response> {
    const foundUser = await this.userRepository.findUserById(dto.userId);

    if (!foundUser) {
      throw new Error('User not found');
    }

    const userEntity = new UserEntity(foundUser);
    const saga = new BuyCourseSaga(userEntity, dto.courseId, this.rmqService);
    const { user, status } = await saga.getState().checkPayment();

    await this.updateUser(user);

    return { status };
  }

  private updateUser(userEntity: UserEntity) {
    return Promise.all([
      this.userEventEmitter.handle(userEntity),
      this.userRepository.updateUser(userEntity),
    ]);
  }
}
