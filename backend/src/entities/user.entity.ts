import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import {
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Payment } from './payment.entity';
import { assistants } from './assistants.entity';

export enum TypeRole {
  ADMIN = 'ADMIN',
  CUSTOMER = 'CUSTOMER',
}


@Entity('User')
export class User {
  @PrimaryGeneratedColumn('increment', {
    type: 'int',
    name: 'idUser',
  })
  idUser: number;

  @Column({
    type: 'text',
    unique: true,
    nullable: true,
    name: 'name',
  })
  name: string;

  @Column({
    type: 'text',
    nullable: true,
    name: 'lastName',
  })
  lastName: string;

  @Column({
    type: 'text',
    unique: true,
    nullable: true,
    name: 'email',
  })
  email: string;

  @Column({
    type: 'text',
    unique: true,
    nullable: true,
    name: 'phone',
  })
  phone: string;

  @Column({
    type: 'text',
    nullable: true,
    name: 'address',
  })
  address: string;

  // @Column({
  //   type: 'text',
  //   unique: true,
  //   nullable: true,
  //   name: 'password',
  // })
  // password: string;

  @Column({
    type: 'enum',
    enum: TypeRole,
    nullable: true,
    name: 'role',
  })
  role: TypeRole;

  @Column({
    name: 'tax_number', // DB column name
    type: 'varchar',
    length: 30,
    nullable: true,
    unique: true,
  })
  tax_number: string;

  // ✅ Company Name
  @Column({
    name: 'company_name', // DB column name
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  company_name: string;
  

  @OneToMany(() => Payment, (payment) => payment.user)
  payments: Payment[];


  @OneToMany(() => assistants, assistant => assistant.user)
  assistants: assistants[];


}
