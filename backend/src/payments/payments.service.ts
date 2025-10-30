import { MailerService } from '@nestjs-modules/mailer';
import { HttpService } from '@nestjs/axios';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { firstValueFrom } from 'rxjs';
import { UpdatePaymentDto } from 'src/DTO/update-payment.dto';
import { Payment } from 'src/entities/payment.entity';
import { supabase } from 'src/supabase/supabase.client';
import { SupabaseService } from 'src/supabase/supabase.service';
import { Repository } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';

function readSecret(file: string): string | undefined {
  try {
    return fs.readFileSync(path.join('/etc/secrets', file), 'utf8').trim();
  } catch {
    return undefined;
  }
}

const konnectApiKey = readSecret('KONNECT_API_KEY');
const receiverId = readSecret('RECEIVER_WALLET_ID');

@Injectable()
export class PaymentsService {


    constructor(
        @InjectRepository(Payment)
        private readonly paymentRepo: Repository<Payment>,
        private readonly httpService: HttpService, private readonly supabaseService: SupabaseService, private mailerService: MailerService) { }


    async checkout(amount: number, assistantId: string, plan: string, user: any) {

        const url = 'https://api.sandbox.konnect.network/api/v2/payments/init-payment';

        const headers = {
            'x-api-key': konnectApiKey,
            'Content-Type': 'application/json',
        };
        const data = {
            "receiverWalletId": receiverId,
            "token": "TND",
            "amount": amount,
            "type": "immediate",
            "description": "payment description",
            "acceptedPaymentMethods": [
                "wallet",
                "bank_card",
                "e-DINAR"
            ],
            "lifespan": 10,
            "checkoutForm": true,
            "addPaymentFeesToAmount": false,
            "firstName": user.name,
            "lastName": user.lastName,
            "phoneNumber": user.phone,
            "email": user.email,
            "orderId": assistantId,
            "successUrl": process.env.NODE_ENV === 'production' ? 'https://shopstore.freeddns.org' : 'http://localhost:4200' + "/redirectPaymentSuccess",
            "failUrl": process.env.NODE_ENV === 'production' ? 'https://shopstore.freeddns.org' : 'http://localhost:4200' + "/redirectPaymentFailure",
            "webhook": `https://8c86a56575c7.ngrok-free.app/webhook?plan=${encodeURIComponent(plan)}&userId=${encodeURIComponent(user.idUser)}`, //"http://localhost:4200/redirectPayment",
            "silentWebhook": true,
            "theme": "dark"
        }


        const response = await firstValueFrom(
            this.httpService.post(url, data, { headers }),
        );
        return response.data;
    }


    async createPayment(paymentData: any, plan: string, userId: number) {
        // paymentData = {
        //     "payment": {
        //         "transactions": [
        //             {
        //                 "type": "ePayment",
        //                 "method": "bank_card",
        //                 "status": "success",
        //                 "token": "TND",
        //                 "amount": 294,
        //                 "totalFee": 5,
        //                 "amountAfterFee": 290,
        //                 "feeRate": 1.6,
        //                 "ext_payment_ref": "b2fd96e2-b63e-41b1-bd23-97cdd0062135",
        //                 "from": "smt",
        //                 "details": "Request processed successfully",
        //                 "extSenderInfo": {
        //                     "pan": "544021**1110",
        //                     "expiration": "202612",
        //                     "regionType": "national",
        //                     "email": ""
        //                 },
        //                 "id": "68a9fb9e22c44ea00bbbdb02"
        //             }
        //         ],
        //         "failedTransactions": 0,
        //         "successfulTransactions": 1,
        //         "acceptedPaymentMethods": [
        //             "wallet",
        //             "bank_card",
        //             "e-DINAR",
        //             "konnect"
        //         ],
        //         "amount": 290,
        //         "token": "TND",
        //         "orderId": "1e705cde-1c8d-47fb-9e51-34d528ce8c93",
        //         "type": "immediate",
        //         "status": "completed",
        //         "convertedAmount": 290,
        //         "exchangeRate": 1,
        //         "paymentDetails": {
        //             "phoneNumber": "+21627164293",
        //             "email": "gassouma.samia@gmail.com",
        //             "name": "samia sam"
        //         },
        //         "webhook": "https://51507e132c48.ngrok-free.app/webhook?plan=1%20month&payment_ref=68a9fb9922c44ea00bbbda98",
        //         "successUrl": "http://localhost:4200/redirectPaymentSuccess?payment_ref=68a9fb9922c44ea00bbbda98",
        //         "failUrl": "http://localhost:4200/redirectPaymentFailure?payment_ref=68a9fb9922c44ea00bbbda98",
        //         "createdAt": "2025-08-23T17:34:17.211Z",
        //         "updatedAt": "2025-08-23T17:35:25.840Z",
        //         "id": "68a9fb9922c44ea00bbbda98"
        //     }
        // }

        // plan = "1 mois";
        // userId = 2;
        //const assistantId = "ad35c998-9ea4-4eca-8c52-c9058e3982a8";//"8f7baab4-675b-40bc-b675-128ce8af0e00";
        const today = new Date();
        // Extract first character and convert to number



        const { data: lastPayment, error: fetchError } = await supabase
            .from('payment')
            .select('*')
            .eq('assistantId', paymentData.payment.orderId)
            .order('paymentDate', { ascending: false })
            .limit(1);
        if (fetchError) {
            console.error("Supabase fetch error:", fetchError);
            throw new Error(fetchError.message);
        }
        console.log("Last payment:", lastPayment[0]);

        const start = new Date(lastPayment[0].billingCycleStart);
        const end = new Date(lastPayment[0].billingCycleEnd);

        // difference in ms
        const diffMs = end.getTime() - start.getTime();

        // difference in days
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        console.log("Difference in days:", diffDays);

        // Calculate billingCycleEnd by adding daysToAdd days to billingCycleStart
        let daysToAdd = 0;

        if (plan) {
            const months = parseInt(plan.charAt(0), 10);
            daysToAdd = months * 30;
        }

        const billingCycleEnd = new Date(today);
        billingCycleEnd.setDate(billingCycleEnd.getDate() + daysToAdd + diffDays);

        const { data: insertedPayment, error: insertError } = await supabase
            .from('payment')
            .insert([
                {
                    amount: paymentData.payment.amount,
                    assistantId: paymentData.payment.orderId,
                    paymentDate: today,
                    userIdUser: userId,
                    paymentStatus: paymentData.payment.status,
                    transactionId: paymentData.payment.id,
                    paymentMethod: paymentData.payment.transactions[0].method,
                    subscriptionPlan: plan,
                    currency: paymentData.payment.token,
                    billingCycleStart: today.toISOString().slice(0, 10),
                    billingCycleEnd: billingCycleEnd.toISOString().slice(0, 10),
                    card_number: paymentData.payment.transactions[0].extSenderInfo.pan
                },
            ])
            .select();
        if (insertError) {
            console.error("Supabase insert error:", insertError);
            throw new Error(insertError.message);
        }

        console.log("added payment:", insertedPayment[0]);
        return { status: "ok" };
    }


    async getPayment(paymentRef: string, plan: string, userId: number) {
        const url = 'https://api.sandbox.konnect.network/api/v2/payments/' + paymentRef;
        try {
            const response = await firstValueFrom(this.httpService.get(url));

            if (response.status === 200 && response.data
            ) {
                // ✅ Handle valid response
                console.log('Received payment:', response.data);
                return this.createPayment(response.data, plan, userId); // or save the payment in your DB
            } else {
                throw new Error('Invalid response from webhook');
            }
        } catch (error) {
            console.error('Error calling webhook:', error.message);
            throw new InternalServerErrorException(
                'Failed to retrieve payment information from webhook',
            );
        }
    }

    async getPaymentsByUserId(userId: string) {
        const supabase = this.supabaseService.getClient();
        const { data, error } = await supabase
            .from('payment')
            .select(`*,
                    User:userIdUser (
                        name,
                        lastName,
                        email,
                        address,
                        tax_number,
                        company_name
                    )
                    `)
            .eq('userIdUser', userId);

        console.log(data);

        if (error) {
            throw new Error(`Supabase error: ${error.message}`);
        }

        return data;
    }

    async getPayments(page = 1, limit = 9, search?: string) {
        const supabase = this.supabaseService.getClient();
        const start = (page - 1) * limit;
        const end = start + limit - 1;

        const { data, error, count } = await supabase
            .from('payment')
            .select(`*,
                    User:userIdUser (
                        idUser,
                        name,
                        lastName,
                        email,
                        phone,
                        address,
                        role
                    ),
                        assistant: assistantId(*)
                    `, { count: 'exact' }) // <-- include count
            .range(start, end);

        if (error) {
            throw new Error(`Supabase error: ${error.message}`);
        }

        return {
            data,
            page,
            limit,
            total: count ?? 0,
            totalPages: Math.ceil((count ?? 0) / limit),
        };
    }





    async update(id: string, payment: UpdatePaymentDto) {
        payment.updatedAt = new Date();
        console.log(payment);
        const supabase = this.supabaseService.getClient();
        const { data, error } = await supabase
            .from('payment')
            .update(payment)
            .eq('idPayment', id)
            .single();

        if (error) {
            throw new Error(error.message);
        }

        return data;
    }

    async remove(id: string) {
        const supabase = this.supabaseService.getClient();
        const { data, error } = await supabase
            .from('payment')
            .delete()
            .eq('idPayment', id)
            .single();

        if (error) {
            throw new Error(error.message);
        }

        return data;
    }


    async getPaymentByRef(payment_ref: string) {
        const supabase = this.supabaseService.getClient();
        const { data, error } = await supabase
            .from('payment')
            .select(`*, User:userIdUser (
                name,
                lastName,
                email,
                address
            )`)
            .eq('transactionId', payment_ref)
            .single();

        console.log(data);

        if (error) {
            throw new Error(`Supabase error: ${error.message}`);
        }

        return data;
    }

    async sendReceipt(to: string, subject: string, data: any) {
        const template = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Payment Receipt - Transaction Successful</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background-color: #f8fafc;
            line-height: 1.6;
        }
        
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
            margin-top: 20px;
            margin-bottom: 20px;
        }
        
        .header {
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            padding: 40px 30px;
            text-align: center;
            color: white;
        }
        
        .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 700;
        }
        
        .header p {
            margin: 10px 0 0 0;
            font-size: 16px;
            opacity: 0.9;
        }
        
        .success-icon {
            background: rgba(255, 255, 255, 0.2);
            border-radius: 50%;
            width: 80px;
            height: 80px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 20px;
            font-size: 40px;
        }
        
        .content {
            padding: 40px 30px;
        }
        
        .greeting {
            font-size: 18px;
            color: #1f2937;
            margin-bottom: 20px;
        }
        
        .transaction-details {
            background: #f9fafb;
            border: 1px solid #e5e7eb;
            border-radius: 12px;
            padding: 25px;
            margin: 30px 0;
        }
        
        .transaction-details h3 {
            color: #374151;
            font-size: 18px;
            margin: 0 0 20px 0;
            font-weight: 600;
        }
        
        .details-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px 0;
            border-bottom: 1px solid #e5e7eb;
        }
        
        .details-row:last-child {
            border-bottom: none;
            font-weight: 600;
            font-size: 16px;
        }
        
        .details-label {
            color: #6b7280;
            font-size: 14px;
        }
        
        .details-value {
            color: #1f2937;
            font-weight: 500;
        }
        
        .amount {
            color: #059669;
            font-size: 20px;
            font-weight: 700;
        }
        
        .next-steps {
            background: #eff6ff;
            border: 1px solid #dbeafe;
            border-radius: 12px;
            padding: 25px;
            margin: 30px 0;
        }
        
        .next-steps h3 {
            color: #1e40af;
            font-size: 16px;
            margin: 0 0 15px 0;
        }
        
        .next-steps ul {
            margin: 0;
            padding-left: 20px;
            color: #374151;
        }
        
        .next-steps li {
            margin-bottom: 8px;
        }
        
        .support-section {
            text-align: center;
            padding: 30px 0;
            border-top: 1px solid #e5e7eb;
            margin-top: 30px;
        }
        
        .support-section h3 {
            color: #374151;
            font-size: 18px;
            margin-bottom: 15px;
        }
        
        .support-section p {
            color: #6b7280;
            margin-bottom: 20px;
        }
        
        .contact-button {
            display: inline-block;
            background: linear-gradient(135deg, #3b82f6, #2563eb);
            color: white;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            transition: transform 0.2s ease;
        }
        
        .contact-button:hover {
            transform: translateY(-2px);
        }
        
        .footer {
            background: #1f2937;
            color: #9ca3af;
            padding: 30px;
            text-align: center;
            font-size: 14px;
        }
        
        .footer p {
            margin: 0 0 10px 0;
        }
        
        .company-name {
            color: #ffffff;
            font-weight: 600;
            font-size: 16px;
            margin-bottom: 15px;
        }
        
        @media (max-width: 600px) {
            .email-container {
                margin: 10px;
                border-radius: 8px;
            }
            .header {
                padding: 30px 20px;
            }
            .header h1 {
                font-size: 24px;
            }
            .content {
                padding: 30px 20px;
            }
            .transaction-details, .next-steps {
                padding: 20px;
            }
            .details-row {
                flex-direction: column;
                align-items: flex-start;
                gap: 5px;
            }
            .footer {
                padding: 20px;
            }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <div class="success-icon">✓</div>
            <h1>Payment Successful!</h1>
            <p>Your transaction has been completed successfully</p>
        </div>
        
        <div class="content">
            <div class="greeting">
                Hello ${data.user.name}  ${data.user.lastName},
            </div>
            
            <p>Thank you for your payment! We've successfully processed your transaction. Here are the details of your purchase:</p>
            
            <div class="transaction-details">
                <h3>Transaction Details</h3>
                <div class="details-row">
                    <span class="details-label">Transaction ID: </span>
                    <span class="details-value">#${data.idPayment}</span>
                </div>
                <div class="details-row">
                    <span class="details-label">Date & Time: </span>
                    <span class="details-value">${new Date(data.createdAt).toLocaleDateString()} - ${new Date(data.createdAt).toLocaleTimeString()}</span>
                </div>
                <div class="details-row">
                    <span class="details-label">Payment Method: </span>
                    <span class="details-value">${data.paymentMethod} •••• ${data.card_number}</span>
                </div>
                <div class="details-row">
                    <span class="details-label">Card Number: </span>
                    <span class="details-value">${data.paymentMethod} </span>
                </div>
                <div class="details-row">
                    <span class="details-label">Total Amount: </span>
                    <span class="details-value amount">${data.amount} TND</span>
                </div>
            </div>
            
            <div class="next-steps">
                <h3>What's Next?</h3>
                <ul>
                    <li>Keep this email as your receipt for your records</li>
                    <li>You'll receive a confirmation email shortly with additional details</li>
                    <li>If you have any questions, our support team is here to help</li>
                </ul>
            </div>
            
            <p>We appreciate your business and look forward to serving you again!</p>
            
            <div class="support-section">
                <h3>Need Help?</h3>
                <p>Our customer support team is available 24/7 to assist you with any questions or concerns.</p>
                <a href="mailto:support@yourcompany.com" class="contact-button">Contact Support</a>
            </div>
        </div>
        
        <div class="footer">
            <div class="company-name">Your Company Name</div>
            <p>This is an automated message. Please do not reply to this email.</p>
            <p>© 2024 Your Company Name. All rights reserved.</p>
            <p>123 Business Street, City, State 12345</p>
        </div>
    </div>
</body>
</html>
    `;

        return this.mailerService.sendMail({
            to,
            subject,
            html: template,
        });
    }

    async getFilteredPayments(pageNumber = 1, limitNumber = 9, filters: any) {
        const start = (pageNumber - 1) * limitNumber;
        const end = start + limitNumber - 1;
        console.log("filter==", filters);
        const supabase = this.supabaseService.getClient();
        let query = supabase
            .from('payment')
            .select(`
      *,
      User:userIdUser (
        name,
        lastName,
        email,
        phone,
        address,
        role
      ),
      assistant: assistantId(*)
    `, { count: 'exact' });
        // Date filters
        if (filters.startDate) {
            query = query.gte('paymentDate', filters.startDate);
        }
        if (filters.endDate) {
            query = query.lte('paymentDate', filters.endDate);
        }

        //Amount filter

        if (filters.minAmount) {
            query = query.gte('amount', filters.minAmount);
        }
        if (filters.maxAmount) {
            query = query.lte('amount', filters.maxAmount);
        }
        // Plan filter
        if (filters.selectedPlan) {
            query = query.eq('subscriptionPlan', filters.selectedPlan);
        }

        // Status filter
        if (filters.paymentStatus) {
            query = query.eq('paymentStatus', filters.paymentStatus); // completed, failed, pending
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
            query = query.eq('userIdUser', user.idUser);
        }

        query = query.range(start, end);

        const { data, count, error } = await query;
        if (error) throw error;
        console.log("data===", data);
        return {
            data,
            page: pageNumber,
            limit: limitNumber,
            total: count,
            totalPages: Math.ceil((count ?? 0) / limitNumber),
        };
    }


    async getRepartitionByPlan() {
        const qb = this.paymentRepo
            .createQueryBuilder('p')
            .select('p.subscriptionPlan', 'subscriptionPlan')
            .addSelect('COUNT(*)', 'total_payments')
            .addSelect('SUM(p.amount)', 'total_revenue')
            .where('p.paymentStatus = :status', { status: 'completed' })
            .orderBy('p.subscriptionPlan', 'ASC')
            .groupBy('p.subscriptionPlan');

        const result = await qb.getRawMany<{
            subscriptionPlan: string;
            total_payments: string;  // returned as string by SQL
            total_revenue: string;
        }>();

        console.log(result);

        // Convert numeric strings into numbers
        return result.map(r => ({
            subscriptionPlan: r.subscriptionPlan,
            total_payments: Number(r.total_payments),
            total_revenue: Number(r.total_revenue),
        }));
    }



    async getRevenueByMonth() {
        const qb = this.paymentRepo
            .createQueryBuilder('p')
            .select(`to_char(p."createdAt", 'YYYY-MM')`, 'month')
            .addSelect('SUM(p.amount)', 'total_revenue')
            .where('p."paymentStatus" = :status', { status: 'completed' })
            .groupBy('month')
            .orderBy('month', 'ASC');

        const result = await qb.getRawMany<{
            month: string;           // returned as string by PostgreSQL
            total_revenue: string;   // returned as string by PostgreSQL
        }>();

        // Convert SQL strings into JS values
        return result.map(r => ({
            month: r.month,          // cast SQL date_trunc to JS Date
            total_revenue: Number(r.total_revenue),
        }));
    }

    async getRevenueByYear() {

        const currentYear = new Date().getFullYear();

        const result = await this.paymentRepo
            .createQueryBuilder('payment')
            .select('SUM(payment.amount)', 'totalRevenue')
            .where('EXTRACT(YEAR FROM payment."paymentDate") = :year', {
                year: currentYear,
            })
            .andWhere('payment."paymentStatus" = :status', { status: 'completed' })
            .getRawOne();

            const totalRevenue = Number(result?.totalRevenue || 0);
            const avgPerMonth = totalRevenue / 12;

        return {
            year: currentYear,
            totalRevenue: Number(result?.totalRevenue || 0),
            avgPerMonth: avgPerMonth

        };

    }
}
