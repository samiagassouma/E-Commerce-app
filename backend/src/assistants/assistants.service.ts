import { Injectable } from '@nestjs/common';
import { CreateAssistantDto } from './dto/create-assistant.dto';
import { UpdateAssistantDto } from './dto/update-assistant.dto';
import { HttpService } from '@nestjs/axios';
import { SupabaseService } from 'src/supabase/supabase.service';
import { Repository } from 'typeorm';
import { assistants } from 'src/entities/assistants.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class AssistantsService {
  constructor(
    @InjectRepository(assistants)
    private readonly assistantRepo: Repository<assistants>,
    private readonly httpService: HttpService,
    private readonly supabaseService: SupabaseService) { }

  create(createAssistantDto: CreateAssistantDto) {
    return 'This action adds a new assistant';
  }


  async findAll(page = 1, limit = 9, search?: string) {
    const supabase = this.supabaseService.getClient();

    const start = (page - 1) * limit;
    const end = start + limit - 1;

    let query = supabase
      .from('assistants')
      .select(`*,
              user: idUser (idUser, name, lastName, email, phone, address, role),
              payment: payment (billingCycleStart, billingCycleEnd)
            `, { count: 'exact' })
      .eq('payment.paymentStatus', 'completed')
      .order('paymentDate', { foreignTable: 'payment', ascending: false })
      .limit(1, { foreignTable: 'payment' }); // only the last payment


    if (search) {
      // Search in name, lastName, or email (case-insensitive)
      query = query.or(`name.ilike.%${search}%,lastName.ilike.%${search}%,email.ilike.%${search}%,address.ilike.%${search}%,phone.ilike.%${search}%`);
    }

    query = query.range(start, end);

    const { data, count, error } = await query;

    if (error) {
      throw new Error(error.message);
    }

    console.log(data);

    return {
      data,
      page,
      limit,
      total: count,
      totalPages: Math.ceil((count ?? 0) / limit),
    };
  }

  async findOne(id: string) {
    const supabase = this.supabaseService.getClient();
    const { data, error } = await supabase
      .from('assistants')
      .select('*')
      .eq('idUser', id)
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  async update(id: string, assistant: UpdateAssistantDto) {
    console.log("updatedassistant:", assistant, "id==", id);
    const supabase = this.supabaseService.getClient();
    const { data, error } = await supabase
      .from('assistants')
      .update(assistant)
      .eq('id', id)
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  async remove(id: string) {
    const supabase = this.supabaseService.getClient();
    const { data, error } = await supabase
      .from('assistants')
      .delete()
      .eq('id', id)
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }



  async getFilteredAssistants(page = 1, limit = 9, filters: any) {
    const start = (page - 1) * limit;
    const end = start + limit - 1;
    console.log("filter==", filters);

    const supabase = this.supabaseService.getClient();

    let query = supabase
      .from('assistants')
      .select(`*,
              user: idUser (name, lastName, email, phone, address, role),
              payment!inner (billingCycleStart, billingCycleEnd, paymentDate, paymentStatus)
            `, { count: 'exact' })
      .eq('payment.paymentStatus', 'completed')
      .order('paymentDate', { foreignTable: 'payment', ascending: false })
      .limit(1, { foreignTable: 'payment' }); // only the last payment

    // ✅ Optional date filters
    if (filters.startDate) {
      query = query.gte('payment.billingCycleStart', filters.startDate);
    }
    if (filters.endDate) {
      query = query.lte('payment.billingCycleEnd', filters.endDate);
    }
    //Optional domain filter (through assistant relation)
    if (filters.selectedDomain) {
      query = query.eq('domaine', filters.selectedDomain);
    }

    //Status filter
    if (filters.status === 'active') {
      query = query.gte('payment.billingCycleEnd', new Date().toISOString());
    } else if (filters.status === 'inactive') {
      query = query.lt('payment.billingCycleEnd', new Date().toISOString());
    }

    // User filter (if provided)
    if (filters.username) {
      const parts = filters.username.trim().split(/\s+/);
      const firstName = parts[0];
      const lastName = parts[1] || '';

      const { data: user, error: userError } = await supabase
        .from('User')
        .select('idUser, name, lastName')
        .eq('name', firstName)
        .eq('lastName', lastName)
        .single();

      if (userError || !user) {
        return { message: 'No user found' };
      }
      query = query.eq('idUser', user.idUser);
    }
    query = query.range(start, end);


    const { data, count, error } = await query;
    if (error) throw error;

    // Extract assistants from payment results
    return {
      data,
      page,
      limit,
      total: count,
      totalPages: Math.ceil((count ?? 0) / limit),
    };



    // if (error) {
    //   throw new Error(error.message);
    // }

    // console.log(data);

    // return data;

    // // ✅ CASE 1: If date filters exist → query payments table
    // if (filters.startDate && filters.endDate) {
    //   let selectFields = [
    //     `assistantId ( *, user:idUser(name, lastName, email, phone, address, role), 
    //       payment: payment (billingCycleStart, billingCycleEnd) )`

    //   ];

    //   let query = supabase
    //     .from('payment')
    //     .select(selectFields.join(','))
    //     .gte('billingCycleStart', filters.startDate)
    //     .lte('billingCycleEnd', filters.endDate)
    //     .order('billingCycleEnd', { foreignTable: 'assistantId.payment', ascending: false }) // ✅ order payments DESC
    //     .limit(1, { foreignTable: 'assistantId.payment' }); // ✅ only last payment per assistant;


    // Optional domain filter (through assistant relation)
    // if (filters.selectedDomain) {
    //   query = query.eq('assistant.domaine', filters.selectedDomain);
    // }


    //   // ✅ User filter (if provided)
    //   if (filters.username) {
    //     const parts = filters.username.trim().split(/\s+/);
    //     const firstName = parts[0];
    //     const lastName = parts[1] || '';

    //     const { data: user, error: userError } = await supabase
    //       .from('User')
    //       .select('idUser, name, lastName')
    //       .eq('name', firstName)
    //       .eq('lastName', lastName)
    //       .single();

    //     if (userError || !user) {
    //       return { message: 'No user found' };
    //     }

    //     query = query.eq('assistant.idUser', user.idUser);
    //   }

    //   console.log("queryyDAte==", query);

    //   const { data, error } = await query;
    //   if (error) throw error;

    //   // Extract assistants from payment results
    //   return data;

    // } else {
    //   // ✅ CASE 2: Query assistants directly
    //   let selectFields = ['*, user:idUser(name,lastName, email, phone, address, role), payment: payment (billingCycleStart, billingCycleEnd)'];

    //   // if (filters.startDate || filters.endDate) {
    //   //   selectFields.push('payment:payment(billingCycleStart, billingCycleEnd)');
    //   // }

    //   let query = supabase.from('assistants').select(selectFields.join(','));

    //   // Domain filter
    //   if (filters.selectedDomain) {
    //     query = query.eq('domaine', filters.selectedDomain);
    //   }


    //   // User filter
    //   if (filters.username) {
    //     const parts = filters.username.trim().split(/\s+/);
    //     const firstName = parts[0];
    //     const lastName = parts[1] || '';

    //     const { data: user, error: userError } = await supabase
    //       .from('User')
    //       .select('idUser, name, lastName')
    //       .eq('name', firstName)
    //       .eq('lastName', lastName)
    //       .single();

    //     if (userError || !user) {
    //       return { message: 'No user found' };
    //     }

    //     query = query.eq('idUser', user.idUser);
    //   }

    //   const { data, error } = await query;
    //   if (error) throw error;

    //   console.log("queryyAssistant==", query);

    //   return data;
    // }

  }

  async getUserByUsername(username: string) {
    const supabase = this.supabaseService.getClient();
    const parts = username.trim().split(/\s+/);
    const firstName = parts[0];
    const lastName = parts[1] || '';
    const { data: user, error: userError } = await supabase
      .from('User')
      .select('idUser, name, lastName')
      .eq('name', firstName)
      .eq('lastName', lastName)
      .single();

    if (userError || !user) {
      return false;
    }
    return true;
  }

  async getAssistantStatistics(granularity: 'per_day' | 'per_month' | 'per_year') {
    // const supabase = this.supabaseService.getClient();

    const qb = this.assistantRepo.createQueryBuilder('assistants');

    if (granularity === 'per_day') {
      qb.select(`to_char(assistants.createdat, 'YYYY-MM-DD')`, 'label')
        .addSelect('COUNT(*)::int', 'total')
        .groupBy('label')
        .orderBy('label');
    } else if (granularity === 'per_month') {
      qb.select(`to_char(assistants.createdat, 'YYYY-MM')`, 'label')
        .addSelect('COUNT(*)::int', 'total')
        .groupBy('label')
        .orderBy('label');
    } else if (granularity === 'per_year') {
      qb.select(`extract(year from assistants.createdat)::text`, 'label')
        .addSelect('COUNT(*)::int', 'total')
        .groupBy('label')
        .orderBy('label');
    } else {
      throw new Error('Invalid granularity. Must be per_day, per_month, or per_year');
    }

    return qb.getRawMany(); // returns array of { label, total }

    // const { data, error } = await supabase.rpc('assistant_statistics', { granularity });


    // if (error) throw error;

    // return data; // [{ label: '2025-08-01', total: 5 }, ...]
  }

  async getTotalAssistants() {
    const supabase = this.supabaseService.getClient();
    const { count: totalAssistants, error: countError } = await supabase
      .from('assistants')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('Error fetching total assistants:', countError);
      throw countError;
    }
    return {
      totalAssistants: totalAssistants // total count
    };
  }



  async getAssistantsStatusCounts() {
    const qb = this.assistantRepo
      .createQueryBuilder('a')
      .select(
        `COUNT(*) FILTER (WHERE p."paymentStatus" = 'completed' AND p."billingCycleEnd" > NOW())`,
        'activeCount',
      )
      .addSelect(
        `COUNT(*) FILTER (WHERE NOT (p."paymentStatus" = 'completed' AND p."billingCycleEnd" > NOW()))`,
        'inactiveCount',
      )
      .innerJoin(
        qb =>
          qb
            .select('DISTINCT ON (a.id) a.id', 'id')
            .addSelect('p."billingCycleEnd"', 'billingCycleEnd')
            .addSelect('p."paymentStatus"', 'paymentStatus')
            .addSelect('p."paymentDate"', 'paymentDate')
            .from('assistants', 'a')
            .innerJoin('payment', 'p', 'p."assistantId" = a.id')
            .orderBy('a.id')
            .addOrderBy('p."paymentDate"', 'DESC'),
        'p',
        'p.id = a.id',
      );

    const result = await qb.getRawOne<{ activeCount: string; inactiveCount: string }>();

    return {
      activeCount: Number(result!.activeCount),
      inactiveCount: Number(result!.inactiveCount),
    };
  }







}
