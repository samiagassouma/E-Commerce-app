import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class EmailService {

  private apiUrl = environment.baseUrl + '/send-email'; // backend URL

  constructor(private http: HttpClient) {}

  sendEmail(to: string, subject: string, data: any) {
    return this.http.post(this.apiUrl, { to, subject, data });
  }
}
