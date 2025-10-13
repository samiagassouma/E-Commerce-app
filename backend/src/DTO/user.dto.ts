import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { TypeRole } from "src/entities/user.entity";

export class CreateUserDto {
  
    @IsNotEmpty()
    @IsString()
    name: string;
  
    @IsNotEmpty()
    @IsString()
    lastName: string;
  
    @IsNotEmpty()
    @IsEmail()
    email: string;
  
    @IsNotEmpty()
    @IsString()
    password: string;
  
    @IsNotEmpty()
    @IsString()
    phone: string;
  
    @IsNotEmpty()
    @IsString()
    address: string;
  
    @IsNotEmpty()
    @IsEnum(TypeRole)
    role: TypeRole;
  }
  