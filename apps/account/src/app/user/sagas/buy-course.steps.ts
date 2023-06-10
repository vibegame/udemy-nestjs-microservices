import { CourseGetCourse, PaymentGenerateLink } from '@purple/contracts';
import { UserEntity } from '../entities/user.entity';
import { BuyCourseSagaState } from './buy-course.state';
import { PurchaseState } from '@purple/interfaces';

export class BuyCourseSagaStateStarted extends BuyCourseSagaState {
  public async pay(): Promise<{
    paymentLink: string | null;
    user: UserEntity;
  }> {
    const { course } = await this.saga.rmqService.send<
      CourseGetCourse.Request,
      CourseGetCourse.Response
    >(CourseGetCourse.topic, {
      id: this.saga.courseId,
    });

    if (!course) {
      throw new Error('Course not found');
    }

    if (course.price === 0) {
      this.saga.setState(PurchaseState.Purchased, this.saga.courseId);

      return { paymentLink: null, user: this.saga.user };
    }

    const { link } = await this.saga.rmqService.send<
      PaymentGenerateLink.Request,
      PaymentGenerateLink.Response
    >(PaymentGenerateLink.topic, {
      userId: this.saga.user._id,
      courseId: course._id,
      sum: course.price,
    });

    this.saga.setState(PurchaseState.WaitingForPayment, course._id);

    return { paymentLink: link, user: this.saga.user };
  }
  public checkPayment(): Promise<{ user: UserEntity }> {
    throw new Error('Платеж не начался');
  }
  public async cancel(): Promise<{ user: UserEntity }> {
    this.saga.setState(PurchaseState.Cancelled, this.saga.courseId);

    return { user: this.saga.user };
  }
}
