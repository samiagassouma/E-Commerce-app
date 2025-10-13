import { Module } from '@nestjs/common';
import { AssistantsService } from './assistants.service';
import { AssistantsController } from './assistants.controller';
import { HttpModule } from '@nestjs/axios';
import { SupabaseService } from 'src/supabase/supabase.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { assistants } from 'src/entities/assistants.entity';

@Module({
  imports: [HttpModule,
    TypeOrmModule.forFeature([assistants])],
  controllers: [AssistantsController],
  providers: [AssistantsService, SupabaseService],
})
export class AssistantsModule {}
