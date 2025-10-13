import { Controller, Get, Post, Body, Query, Param, NotFoundException, Patch, Delete } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { AuthService } from 'src/auth/auth.service';
import { UpdatePaymentDto } from 'src/DTO/update-payment.dto';
import { SupabaseService } from 'src/supabase/supabase.service';


@Controller('')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService, private authService: AuthService) { }


  @Get('payment/stats')
  async getStats() {

    const repartition = await this.paymentsService.getRepartitionByPlan();
    const revenuePerMonth = await this.paymentsService.getRevenueByMonth();
    const revenueCurrentYear = await this.paymentsService.getRevenueByYear();

    return {
      repartition,
      revenuePerMonth,
      revenueCurrentYear
    };

  }


  @Post('checkout')
  async checkout(@Body() data: { amount: number; assistantId: string; plan: string; userId: string }) {
    const user = await this.authService.getUserById(data.userId);  // <-- properly declare const
    if (!user) {
      throw new NotFoundException(`User with ID ${data.userId} not found`);
    }
    return this.paymentsService.checkout(data.amount, data.assistantId, data.plan, user);
  }


  @Get('webhook')
  async getPaymentDetails(@Query('payment_ref') paymentRef: string, @Query('plan') plan: string, @Query('userId') userId: number) {
    return await this.paymentsService.getPayment(paymentRef, plan, userId);// Store payment data
  }

  @Get('payment/:userId')
  async getPaymentsByUser(@Param('userId') userId: string) {
    return this.paymentsService.getPaymentsByUserId(userId);
  }

  @Get('payment/ref/:payment_ref')
  async getPaymentsByRef(@Param('payment_ref') payment_ref: string) {
    return this.paymentsService.getPaymentByRef(payment_ref);
  }

  @Get('payment')
  async getPayments(@Query('page') page: string,
    @Query('limit') limit: string,
    @Query('search') search: string) {
    const pageNumber = parseInt(page, 10) || 1;
    const limitNumber = parseInt(limit, 10) || 10;
    return this.paymentsService.getPayments(pageNumber, limitNumber,);
  }

  @Patch('payment/:id')
  update(@Param('id') id: string, @Body() payment: UpdatePaymentDto) {
    return this.paymentsService.update(id, payment);
  }

  @Post('create-payment')
  createPayment() {
    this.paymentsService.createPayment({}, "1 mois", 2);
  }


  @Delete('payment/:id')
  remove(@Param('id') id: string) {
    return this.paymentsService.remove(id);
  }

  @Post('/send-email')
  async sendEmail(@Body() body: { to: string; subject: string; data: any }) {
    return this.paymentsService.sendReceipt(body.to, body.subject, body.data);
  }

  @Post('payment/filter')
  async getFilteredAssistants(@Body() filters: any, @Query('page') page: string,
    @Query('limit') limit: string,) {
    const pageNumber = parseInt(page, 10) || 1;
    const limitNumber = parseInt(limit, 10) || 10;
    console.log("payment controller");
    return this.paymentsService.getFilteredPayments(pageNumber, limitNumber, filters);
  }

}
