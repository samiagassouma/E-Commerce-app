import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';

import { User, TypeRole } from '../entities/user.entity';
import { supabase, supabaseAdmin } from '../supabase/supabase.client';
import { CreateUserDto } from 'src/DTO/user.dto';

@Injectable()
export class AuthService {

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) { }

  private async rollbackSignup(userId: number | null, authUserId: string | null) {
    if (userId) {
      await supabase.from('User').delete().eq('idUser', userId);
    }
    if (authUserId) {
      await supabaseAdmin.auth.admin.deleteUser(authUserId);
    }
  }

  async signUp(dto: CreateUserDto) {
    const { email, password, name, lastName, phone, address, role } = dto;

    try {
      // Vérifier qu'un ADMIN n'existe pas déjà si le rôle est ADMIN
      if (role === TypeRole.ADMIN) {
        const { data: existingAdmin, error: adminError } = await supabase
          .from('User')
          .select('idUser')
          .eq('role', TypeRole.ADMIN)
          .maybeSingle();

        if (adminError) throw adminError;
        if (existingAdmin) throw new BadRequestException('An ADMIN already exists.');
      }

      // Vérifier que l'email n'est pas déjà utilisé
      const { data: existingUser, error: userError } = await supabase
        .from('User')
        .select('idUser')
        .eq('email', email)
        .maybeSingle();

      if (userError) throw userError;
      if (existingUser) throw new BadRequestException('Email is already registered.');

      // Hasher le mot de passe
      const hashedPassword = await bcrypt.hash(password, 10);

      // Créer l'utilisateur dans Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('User creation failed in authentication system');

      const authUserId = authData.user.id;

      // Insérer les données dans la table User
      const { data: userData, error: insertError } = await supabase
        .from('User')
        .insert([
          {
            email,
            role,
            password: hashedPassword,
            name,
            lastName,
            phone,
            address,
          },
        ])
        .select('idUser, email, role, name, lastName, phone, address')
        .single();

      if (insertError) {
        await this.rollbackSignup(null, authUserId);
        throw insertError;
      }

      return {
        message: 'Signup successful',
        user: userData,
        session: authData.session,
      };
    } catch (error) {
      console.error('Signup failed:', error);
      throw error;
    }
  }

  async signIn(email: string, password: string) {
    try {
      // Récupérer l'utilisateur par email
      const { data: userData, error: userError } = await supabase
        .from('User')
        .select('idUser, email, password, role, name, lastName, phone, address')
        .eq('email', email)
        .maybeSingle();

      if (userError) throw userError;
      if (!userData) throw new UnauthorizedException('Invalid credentials');

      // Vérifier le mot de passe
      const isPasswordValid = await bcrypt.compare(password, userData.password);
      if (!isPasswordValid) throw new UnauthorizedException('Invalid credentials');

      // Récupérer session Supabase via login
      const { data: sessionData, error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      console.log('Supabase signInWithPassword response:', sessionData, loginError);
      if (loginError) throw loginError;

      return {
        message: 'Signin successful',
        user: userData,
        session: sessionData.session,
      };
    } catch (error) {
      console.error('Signin failed:', error);
      throw error;
    }
  }

  // Ajoute ici les méthodes forgotPassword, resetPassword, etc. si tu veux
  async forgotPassword(email: string) {
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'http://localhost:4200/reset-password', // Adjust this to your Angular reset-password route
      });

      if (error) throw error;

      return { message: 'Password reset email sent successfully', data };
    } catch (error) {
      console.error('Forgot password error:', error);
      throw new BadRequestException('Could not send password reset email.');
    }
  }

  async getUserById(id: string) {
    const { data, error } = await supabase
      .from('User')
      .select('idUser, name, lastName, email, phone, address, role, company_name, tax_number') // exclude password here
      .eq('idUser', id)
      .single();

    if (error) {
      console.error(error);
      return null;
    }
    return data;
  }





}
