import { ConfigModule, ConfigService } from '@nestjs/config';
import { IRMQServiceAsyncOptions } from 'nestjs-rmq';

export const getRMQConfig = (): IRMQServiceAsyncOptions => {
  return {
    useFactory(configService: ConfigService) {
      return {
        exchangeName: configService.get('AMQP_EXCHANGE') || '',
        connections: [
          {
            login: configService.get('AMQP_LOGIN') || '',
            password: configService.get('AMQP_PASSWORD') || '',
            host: configService.get('AMQP_HOSTNAME') || '',
          },
        ],
        prefetchCount: 32,
        serviceName: 'purple.account',
      };
    },
    imports: [ConfigModule],
    inject: [ConfigService],
  };
};
