import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import axios from 'axios';
import { CreateAssistantDto } from 'src/DTO/create-assistant.dto';
import { assistants } from 'src/entities/assistants.entity';
import { User } from 'src/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class RagService {
  private readonly ragServerUrl = 'http://localhost:8000';

  constructor(
    @InjectRepository(assistants)
    private readonly assistantRepo: Repository<assistants>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) { }

  async createAssistant(dto: CreateAssistantDto): Promise<any> {
    try {
      // Construire le payload avec les noms exacts attendus par le rag-server
      const ragPayload = {
        companyname: dto.companyname,
        domaine: dto.domaine,
        description: dto.description,
        databasetype: dto.databasetype,
        urldb: dto.urldb,
        supabaseKey: dto.supabaseKey,
        username: dto.username,
        password: dto.password,
        databaseName: dto.databaseName,
        firebaseCredsJson: dto.firebaseCredsJson,
        idUser: dto.idUser,
        limitedTables: dto.limitedTables || [],
        last_indexed_at: null,
      };

      // Appeler le rag-server
      const response = await axios.post(`${this.ragServerUrl}/create-assistant`, ragPayload);

      // Retourner la réponse complète (ex: { status: ..., assistantkey: ... })
      return response.data;
    } catch (error) {
      console.error('Erreur dans RagService createAssistant:', error);
      throw new HttpException(
        error.response?.data?.error || error.message || 'Erreur lors de la création de l’assistant RAG',
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async query(question: string, assistantkey: string): Promise<any> {
    // Extraire uniquement la clé UUID si assistantkey contient une URL complète
    const rawKey = assistantkey.includes('?')
      ? assistantkey.split('?').pop()!
      : assistantkey;

    try {
      const response = await axios.post(
        `${this.ragServerUrl}/rag/query`,
        { question, assistantkey: rawKey }
      );
      return response.data;
    } catch (error) {
      const message = error.response?.data?.error || error.message || 'Erreur lors de la requête au rag-server';
      const status = error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR;
      throw new HttpException(message, status);
    }
  }

  async getAssistantsByUser(userId: number): Promise<assistants[]> {


    const list = await this.assistantRepo
      .createQueryBuilder('assistant')
      .leftJoinAndSelect('assistant.user', 'user')
      .leftJoinAndSelect(
        'assistant.payments',
        'payment',
        `payment.idPayment = (
        SELECT p."idPayment"
        FROM payment p
        WHERE p."assistantId" = assistant.id
        ORDER BY p."createdAt" DESC
        LIMIT 1
      )`
      )
      .where('user.idUser = :userId', { userId })
      .orderBy('assistant.createdat', 'DESC')
      .getMany();

    //console.log(list);
    // return list.length ? list : [];

    const mapped = list.map(({ payments, ...assistantWithoutPayments }) => {
      const payment = payments?.[0] || null;

      if (!payment || !payment.billingCycleEnd) {
        return {
          ...assistantWithoutPayments,
          remainingPeriod: null,
        };
      }

      const { months, days } = this.diffMonthsAndDays(new Date(), new Date(payment.billingCycleEnd));

      return {
        ...assistantWithoutPayments,
        remainingPeriod: { months, days },
      };
    });

    return mapped.length ? mapped : [];


  }


  diffMonthsAndDays(startDate: Date, endDate: Date) {
    let start = new Date(startDate);
    let end = new Date(endDate);

    // Calculate total months difference
    let months = (end.getFullYear() - start.getFullYear()) * 12;
    months += end.getMonth() - start.getMonth();

    // Adjust days
    let days = end.getDate() - start.getDate();

    if (days < 0) {
      // If days negative, subtract one month and add days in previous month
      months -= 1;
      const prevMonth = new Date(end.getFullYear(), end.getMonth(), 0); // last day of previous month
      days += prevMonth.getDate();
    }

    return { months, days };
  }



}
