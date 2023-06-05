import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModuleAsyncOptions } from '@nestjs/mongoose';

export const getMongoString = (configService: ConfigService) =>
  'mongodb://' +
  configService.get('MONGO_LOGIN') +
  ':' +
  configService.get('MONGO_PASSWORD') +
  '@' +
  configService.get('MONGO_HOST') +
  ':' +
  configService.get('MONGO_PORT') +
  '/' +
  configService.get('MONGO_DATABASE') +
  '?authSource=' +
  configService.get('MONGO_AUTHDATABASE');

export const getMongooseConfig = (): MongooseModuleAsyncOptions => {
  return {
    useFactory(configService: ConfigService) {
      return {
        uri: getMongoString(configService),
      };
    },
    imports: [ConfigModule],
    inject: [ConfigService],
  };
};
