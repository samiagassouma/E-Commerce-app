import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { HttpService } from '@nestjs/axios';
import { SupabaseService } from 'src/supabase/supabase.service';
import { InjectRepository } from '@nestjs/typeorm';
import { assistants } from 'src/entities/assistants.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(assistants)
    private readonly assistantRepo: Repository<assistants>,
    private readonly httpService: HttpService,
    private readonly supabaseService: SupabaseService) { }

  async findAll(page = 1, limit = 9, search?: string) {
    const supabase = this.supabaseService.getClient();

    // Calculate start and end indexes
    const start = (page - 1) * limit;
    const end = start + limit - 1;

    let query = supabase
      .from('User')
      .select('idUser, name, lastName, email, phone, address, role', { count: 'exact' })
      .order('idUser', { ascending: true })
      .range(start, end);

    if (search) {
      // Search in name, lastName, or email (case-insensitive)
      query = query.or(`name.ilike.%${search}%,lastName.ilike.%${search}%,email.ilike.%${search}%,address.ilike.%${search}%,phone.ilike.%${search}%`);
    }
    const { data, count, error } = await query;

    if (error) {
      throw new Error(error.message);
    }

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
      .from('User')
      .select('idUser, name, lastName, email, phone, address, role')
      .eq('idUser', id)
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  async update(id: string, user: any) {
    const supabase = this.supabaseService.getClient();
    const { data, error } = await supabase
      .from('User')
      .update(user)
      .eq('idUser', id)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }
    return data;

  }

  async remove(id: string) {
    const supabase = this.supabaseService.getClient();
    const { data, error } = await supabase
      .from('User')
      .delete()
      .eq('idUser', id)
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  async getTotalUsers() {
    const supabase = this.supabaseService.getClient();

    const { count, error } = await supabase
      .from('User') // Supabase Auth users table
      .select('*', { count: 'exact', head: true });

    if (error) {
      throw new Error(error.message);
    }

    return count ?? 0 ;
  }

  // async getAssistantsDistribution() {
  //   // Count assistants per user
  //   const supabase = this.supabaseService.getClient();
  //   const { data: assistants, error } = await supabase
  //     .from('assistants')
  //     .select('idUser');

  //   if (error) {
  //     throw new Error(error.message);
  //   }

  //   const distribution = { '1': 0, '2': 0, '3': 0, '4+': 0 };

  //   if (assistants) {
  //     const userCounts: Record<string, number> = {};

  //     assistants.forEach((a) => {
  //       userCounts[a.idUser] = (userCounts[a.idUser] || 0) + 1;
  //     });

  //     Object.values(userCounts).forEach((count) => {
  //       if (count >= 4) distribution['4+']++;
  //       else distribution[count]++;
  //     });
  //   }

  //   return distribution;
  // }

  async getUsersAssistantsDistribution() {
    const result = await this.assistantRepo.query(`
            WITH assistants_per_user AS (
              SELECT "idUser", COUNT(*) AS assistantsCount
              FROM assistants
              GROUP BY "idUser"
            ),
            buckets AS (
              SELECT 1 AS bucket
              UNION ALL SELECT 2
              UNION ALL SELECT 3
              UNION ALL SELECT 4
              UNION ALL SELECT 5
            ),
            distribution AS (
              SELECT 
                b.bucket AS "assistantsCount",
                COALESCE(COUNT(a."idUser"), 0) AS "usersCount"
              FROM buckets b
              LEFT JOIN assistants_per_user a
                ON a.assistantsCount = b.bucket OR (b.bucket = 5 AND a.assistantsCount >= 5)
              GROUP BY b.bucket
            ),
            stats AS (
              SELECT 
                MAX(assistantsCount) AS maxAssistantsPerUser,
                AVG(assistantsCount)::numeric(10,2) AS avgAssistantsPerUser
              FROM assistants_per_user
            )
            SELECT json_build_object(
              'distribution', (SELECT json_agg(distribution ORDER BY distribution."assistantsCount") FROM distribution),
              'stats', (SELECT row_to_json(stats) FROM stats)
            ) AS result;


  `);

    console.log(result[0].result);

    return result[0].result;
  }






}
