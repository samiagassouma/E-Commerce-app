import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user.entity";
import { Payment } from "./payment.entity";

 
  @Entity('assistants')
  export class assistants {
    @PrimaryGeneratedColumn('uuid', { name: 'id' })
    id: string;

    @Column({
      type: 'text',
      nullable: true,
      name: 'companyname',
    })
    companyname: string;
  
    @Column({
      type: 'text',
      nullable: true,
      name: 'domaine',
    })
    domaine: string;
  
    @Column({
      type: 'text',
      nullable: true,
      name: 'description',
    })
    description: string;
  
    @Column({
      type: 'text',
      nullable: true,
      name: 'databasetype',
    })
    databasetype: string;
  
    @Column({
      type: 'text',
      nullable: true,  
      name: 'urldb',
    })
    urldb: string;
  
    @Column({
      type: 'timestamp',
      nullable: true,
      name: 'createdat',
    })
    createdat: Date;


    @Column({
        type: 'text',
        unique: true,
        nullable: true,  
        name: 'assistantkey',
      })
      assistantkey: string;


      @Column({
        type: 'text',
        nullable: true,  
        name: 'databasename',
      })
      databasename: string;

      @Column({
        type: 'text',
        nullable: true,  
        name: 'username',
      })
      username: string;

      @Column({
        type: 'text',
        nullable: true,  
        name: 'password',
      })
      password: string;



      @Column({
        type: 'text',
        nullable: true,  
        name: 'firebasecredsjson',
      })
      firebasecredsjson: string;

      
      @Column({
        type: 'text',
        nullable: true,  
        name: 'supabasekey',
      })
      supabasekey: string;

      @Column("text", { array: true, nullable: true })
      limitedtables?: string[];

  @ManyToOne(() => User, user => user.assistants, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'idUser' })
  user: User;

    @OneToMany(() => Payment, payments => payments.assistant)
  payments?: Payment[];

  }



















