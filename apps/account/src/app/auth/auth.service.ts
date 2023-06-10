import { Injectable } from '@nestjs/common';
import { UserRepository } from '../user/repositories/user.repository';
import { UserEntity } from '../user/entities/user.entity';
import { IJwtPayload, UserRole } from '@purple/interfaces';
import { JwtService } from '@nestjs/jwt';
import { AccountLogin, AccountRegister } from '@purple/contracts';

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService
  ) {}

  async register({
    email,
    password,
    displayName,
  }: AccountRegister.Request): Promise<AccountRegister.Response> {
    const existingUser = await this.userRepository.findUserByEmail(email);

    if (existingUser) {
      throw new Error('User already exists');
    }

    const newUserEntity = new UserEntity({
      displayName,
      email,
      role: UserRole.Student,
      passwordHash: '',
    });

    await newUserEntity.setPassword(password);

    const newUser = await this.userRepository.createUser(newUserEntity);

    return { email: newUser.email };
  }

  async login({
    email,
    password,
  }: AccountLogin.Request): Promise<AccountLogin.Response> {
    const existingUser = await this.userRepository.findUserByEmail(email);

    if (!existingUser) {
      throw new Error('Username or password are not valid');
    }

    const userEntity = new UserEntity(existingUser);
    const isValidPassword = await userEntity.validatePassword(password);

    if (!isValidPassword) {
      throw new Error('Username or password are not valid');
    }

    const jwtPayload: IJwtPayload = { id: userEntity._id };

    const accessToken = await this.jwtService.signAsync(jwtPayload);

    return { accessToken };
  }
}
