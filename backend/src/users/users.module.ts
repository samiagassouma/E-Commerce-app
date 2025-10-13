import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { SupabaseService } from 'src/supabase/supabase.service';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { assistants } from 'src/entities/assistants.entity';

@Module({
  imports: [HttpModule,
    TypeOrmModule.forFeature([assistants])
  ],
  controllers: [UsersController],
  providers: [UsersService, SupabaseService],
})
export class UsersModule { }
