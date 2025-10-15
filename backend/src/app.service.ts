import { HttpService } from '@nestjs/axios';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { createClient } from '@supabase/supabase-js';
import { supabase } from './supabase/supabase.client';
import { SupabaseService } from './supabase/supabase.service';
import { User } from './entities/user.entity';
import { UpdatePaymentDto } from './DTO/update-payment.dto';


@Injectable()
export class AppService {

  constructor(private readonly httpService: HttpService, private readonly supabaseService: SupabaseService) { }




}



