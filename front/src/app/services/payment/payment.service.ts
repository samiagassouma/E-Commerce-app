import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { User } from '../auth/auth.service';
import { Assistant } from '../rag/rag.service';
import { PaymentFilters } from '../../dashboard-admin/payments-admin/payments-admin.component';


export interface Payment {
  idPayment: number;
  amount: number;
  currency: string;
  paymentStatus: string;
  paymentDate?: Date;
  billingCycleStart: Date;
  billingCycleEnd: Date;
  paymentMethod: String;
  subscriptionPlan: String;
  User?: User;
  assistantId?: string;
  assistant?: Assistant;
  card_number?: string;
  createdAt?: Date
}


@Injectable({
  providedIn: 'root'
})

export class PaymentService {

  private apiUrl = environment.baseUrl + "/payment";
  constructor(private _http: HttpClient) { }

  public checkout(data: { amount: number, assistantId: string, plan: string, userId: string }): Observable<any> {
    return this._http.post<any>(environment.baseUrl + '/checkout', data);
  }

  getPaymentsByUserId(userId: number): Observable<Payment[]> {
    return this._http.get<Payment[]>(`${this.apiUrl}/${userId}`);
  }

  getPaymentById(paymentId: number): Observable<Payment> {
    return this._http.get<Payment>(`${this.apiUrl}/${paymentId}`);
  }

  getPaymentByRef(paymentRef: string): Observable<Payment> {
    return this._http.get<Payment>(`${this.apiUrl}/ref/${paymentRef}`);
  }

  getAllPayments(page: number = 1, limit: number = 9, search: string = ''): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());
    if (search) {
      params = params.set('search', search);
    }
    return this._http.get<any>(this.apiUrl, { params });
  }

  updatePayment(id: number, payment: Payment): Observable<Payment> {
    return this._http.patch<Payment>(`${this.apiUrl}/${id}`, payment);
  }

  deletePayment(id: number): Observable<void> {
    return this._http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getFilteredPayments(page: number = 1, limit: number = 9, filters: PaymentFilters): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());
    return this._http.post<any>(`${this.apiUrl}/filter`, filters, { params });
  }

  getPaymentsStats (): Observable<any>{
    return this._http.get<any[]>(this.apiUrl + '/stats')
  }

}