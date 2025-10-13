import { PartialType } from '@nestjs/mapped-types';
import { CreateAssistantDto } from './create-assistant.dto';
import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class UpdateAssistantDto extends PartialType(CreateAssistantDto) {

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  companyname: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  domaine: string;

  @IsOptional()
  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  databasetype: string;

  @IsOptional()
  @IsString()
  urldb: string;

  @IsOptional()
  @IsString()
  assistantkey: string;

  @IsOptional()
  @IsString()
  databasename: string;

}
