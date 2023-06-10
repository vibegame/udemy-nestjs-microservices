import { Injectable } from '@nestjs/common';
import { RMQService } from 'nestjs-rmq';
import { UserEntity } from './entities/user.entity';

@Injectable()
export class UserEventEmitter {
  constructor(private readonly rmqService: RMQService) {}

  async handle(userEntity: UserEntity) {
    for (const event of userEntity.events) {
      await this.rmqService.notify(event.topic, event.data);
    }
  }
}
