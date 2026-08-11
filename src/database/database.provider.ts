import * as mongoose from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { DATABASE_CONNECTION } from 'src/constants';

export const databaseProviders = [
  {
    provide: DATABASE_CONNECTION,
    useFactory: (configService: ConfigService): Promise<typeof mongoose> => {
      const mongoUri = configService.getOrThrow<string>('MONGODB_URI');
      return mongoose.connect(mongoUri);
    },
    inject: [ConfigService],
  },
];
