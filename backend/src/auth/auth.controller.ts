import { Body, Controller, Post, Res, HttpException, HttpStatus, Get, Query, Param } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from 'src/DTO/user.dto';
import { Response } from 'express';
import { TypeRole } from 'src/entities/user.entity';


@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('signup')
  async signUp(@Body() dto: CreateUserDto) {
    try {
      const response = await this.authService.signUp(dto);

      return {
        message: response.message,
        user: {
          idUser: response.user.idUser,
          name: response.user.name,
          lastName: response.user.lastName,
          email: response.user.email,
          phone: response.user.phone,
          address: response.user.address,
          role: response.user.role,
        },
      };
    } catch (err) {
      throw new HttpException(err.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Post('signin')
  async signIn(
    @Body() { email, password }: { email: string; password: string },
    @Res({ passthrough: true }) res: Response
  ) {
    console.log("signin");
    try {
      const { message, user, session } = await this.authService.signIn(email, password);

      if (user.role === TypeRole.ADMIN) {
        console.log('Admin logged in');
      } else if (user.role === TypeRole.CUSTOMER) {
        console.log('Customer logged in');
      } else {
        throw new Error('Unknown role');
      }

      res.cookie('access_token', session.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // true only in prod
        sameSite: 'strict',
        maxAge: 1000 * 60 * 60 * 2, // 2 hours
      });

      return {
        message: 'Logged in successfully',
        user: {
          idUser: user.idUser,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        session,
      };
    } catch (err) {
      console.error('Signin Error:', err);
      throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
    }
  }

  @Post('signout')
  signOut(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('access_token');
    return {
      message: 'Logged out successfully',
    };
  }



  @Get('callback')
  handleCallback(@Query() query: { access_token: string }) {
    const accessToken = query.access_token;

    if (!accessToken) {
      throw new Error('Access token is missing');
    }
    console.log('Access Token:', accessToken);
    return {
      message: 'Access token received',
      access_token: accessToken,
    };
  }



  @Post('forgot-password')
  async forgotPassword(@Body('email') email: string) {
    try {
      const result = await this.authService.forgotPassword(email);
      return {
        message: result.message,
      };
    } catch (err) {
      console.error('Forgot password error:', err);
      throw new HttpException('Unable to send password reset email.', HttpStatus.BAD_REQUEST);
    }
  }

  @Get('user/:id')
  getData(@Param('id') id: string) {
    return this.authService.getUserById(id);
  }



}
