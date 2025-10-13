import { IsDate, IsNumber, IsOptional, IsPositive, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdatePaymentDto {
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  amount?: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsString()
  paymentMethod?: string;

  @IsOptional()
  @IsString()
  paymentStatus?: string;

  @IsOptional()
  @IsString()
  transactionId?: string;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  updatedAt?: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  paymentDate?: Date;

  @IsOptional()
  @IsString()
  subscriptionPlan?: string;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  billingCycleStart?: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  billingCycleEnd?: Date;

}