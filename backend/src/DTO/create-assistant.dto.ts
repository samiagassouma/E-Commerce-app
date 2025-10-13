import { IsArray, IsInt, IsOptional, IsString, IsUrl} from 'class-validator';

export class CreateAssistantDto {
  @IsString()
  companyname: string;

  @IsString()
  domaine: string;

  @IsString()
  description: string;

  @IsString()
  databasetype: string;

  @IsUrl()
  urldb: string;

  @IsOptional()
  @IsString()
  supabaseKey?: string;
  
  @IsOptional()
  @IsString()
  username?: string;

  @IsOptional()
  @IsString()
  password?: string;

  @IsOptional()
  @IsString()
  databaseName?: string;

  @IsOptional()
  @IsString()
  firebaseCredsJson?: string;
  
  @IsOptional()
  @IsInt()
  idUser?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  limitedTables?: string[];

  @IsOptional()
  @IsString() 
  last_indexed_at?: string | null;
}
