import {
  IUser,
  IUserCourse,
  PurchaseState,
  UserRole,
} from '@purple/interfaces';
import { compare, genSalt, hash } from 'bcryptjs';

export class UserEntity implements IUser {
  _id?: string;
  displayName?: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  courses?: IUserCourse[];

  constructor(user: IUser) {
    this._id = user._id;
    this.displayName = user.displayName;
    this.email = user.email;
    this.role = user.role;
    this.passwordHash = user.passwordHash;
    this.courses = user.courses;
  }

  addCourse(id: string) {
    const exist = this.courses.find((c) => c._id === id);

    if (exist) {
      throw new Error('Course has been already added');
    }

    this.courses.push({
      _id: id,
      purchaseState: PurchaseState.Started,
    });
  }

  deleteCourse(id: string) {
    const exist = this.courses.find((c) => c._id === id);

    if (!exist) {
      throw new Error('Course not found');
    }

    this.courses = this.courses.filter((c) => c._id !== id);
  }

  setCourseState(id: string, state: PurchaseState) {
    this.courses = this.courses.map((c) => {
      if (c._id === id) {
        c.purchaseState = state;
      }

      return c;
    });
  }

  getUserInfo() {
    return {
      email: this.email,
      role: this.role,
      displayName: this.displayName,
    };
  }

  public async setPassword(password: string) {
    const salt = await genSalt(10);

    this.passwordHash = await hash(password, salt);

    return this;
  }

  public async validatePassword(password: string) {
    return await compare(password, this.passwordHash);
  }
}
