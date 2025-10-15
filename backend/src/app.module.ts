import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { SupabaseModule } from './supabase/supabase.module';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { RagService } from './rag/rag.service';
import { RagController } from './rag/rag.controller';
import { HttpModule } from '@nestjs/axios';
import { User } from './entities/user.entity';
import { assistants } from './entities/assistants.entity';
import { Payment } from './entities/payment.entity';
import { UsersModule } from './users/users.module';
import { AssistantsModule } from './assistants/assistants.module';
import { PaymentsModule } from './payments/payments.module';
import * as fs from 'fs';
import * as path from 'path';


const dbHost = readSecret('DB_HOST');
const dbPort = readSecret('DB_PORT');
const dbUser = readSecret('DB_USERNAME');
const dbPassword = readSecret('DB_PASSWORD');
const dbName = readSecret('DB_NAME');
const supabaseUrl = readSecret('CHATBOT_URL');
const supabaseKey = readSecret('CHATBOT_SERVICE_ROLE_KEY');
const dbSync = readSecret('DB_SYNC');
const dbSSLCert = readSecret('DB_SSL_CERT');


function readSecret(file: string): string | undefined {
  try {
    return fs.readFileSync(path.join('/etc/secrets', file), 'utf8').trim();
  } catch {
    return undefined;
  }
}

@Module({

  imports: [
    // Configuration des variables d'environnement
    ConfigModule.forRoot({
      isGlobal: true,
      // envFilePath: '.env',
    }),

    // Configuration TypeORM pour Supabase
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: dbHost,
      port: parseInt(dbPort || '6543'),
      username: dbUser,
      password: dbPassword,
      database: dbName,
      entities: [User, assistants, Payment],
      synchronize: dbSync === 'true',
      autoLoadEntities: true,
      ssl: {
        ca: dbSSLCert?.replace(/\\n/g, '\n'), // Important pour le format du certificat
        rejectUnauthorized: true
      },
      extra: {
        connectionLimit: 5,
        idleTimeoutMillis: 10000,
        connectionTimeoutMillis: 10000,
      }
    }),

    TypeOrmModule.forFeature([User, assistants]),
    // Modules personnalisés
    SupabaseModule,
    AuthModule,
    HttpModule,
    UsersModule,
    AssistantsModule,
    PaymentsModule,

  ],
  controllers: [AppController, RagController,],
  providers: [AppService, RagService,],
})
export class AppModule { }
