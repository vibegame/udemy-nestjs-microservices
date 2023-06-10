import { RMQService } from 'nestjs-rmq';
import { UserEntity } from '../entities/user.entity';
import { PurchaseState } from '@purple/interfaces';
import { BuyCourseSagaState } from './buy-course.state';
import { BuyCourseSagaStateStarted } from './buy-course.steps';

export class BuyCourseSaga {
  private state: BuyCourseSagaState;

  constructor(
    public user: UserEntity,
    public courseId: string,
    public rmqService: RMQService
  ) {}

  getState() {
    return this.state;
  }

  setState(newState: PurchaseState, courseId: string) {
    switch (newState) {
      case PurchaseState.Started:
        this.state = new BuyCourseSagaStateStarted();
        break;
      case PurchaseState.Purchased:
        break;
      case PurchaseState.Cancelled:
        break;
      case PurchaseState.WaitingForPayment:
        break;
    }
    this.state.setContext(this);
    this.user.setCourseState(courseId, newState);
  }
}
