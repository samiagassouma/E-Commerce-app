import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { Payment } from '../payment/payment.service';
import { User } from '../auth/auth.service';


export interface AssistantCreatePayload {
  companyname: string;
  domaine: string;
  description: string;
  databasetype: string;
  urldb: string;
  supabasekey?: string | null;
  username?: string | null;
  password?: string | null;
  databaseName?: string | null;
  firebaseCredsJson?: string | null;
  idUser?: number;
  limitedTables?: string[];
}


export interface Assistant {
  id: number;
  assistantkey: string;
  companyname: string;
  domaine: string;
  description: string;
  databasetype: string;
  databasename: string;
  urldb: string;
  firebaseCredsJson?: string;
  createdat: string;
  last_indexed_at?: string | null;
  payment: Payment[];
  user: User
}

export interface updateAssistantDto {
  companyname: string;
  domaine: string;
  description: string;
  databasetype: string;
  urldb: string;
  assistantkey: string;
  databasename: string;
};



interface RagQueryRequest {
  question: string;
  assistantkey: string;
}

interface RagQueryResponse {
  Answer: string;
}




@Injectable({
  providedIn: 'root'
})
export class RagService {
  private apiUrl = environment.baseUrl+"/rag"; // URL de ton backend NestJS

  
  constructor(private http: HttpClient) {}

  
  createAssistant(data: AssistantCreatePayload) {
    return this.http.post<{status: string, assistantkey: string}>(`${this.apiUrl}/create-assistant`, data);
  }

 
  sendQuery(question: string, assistantkey: string): Observable<RagQueryResponse> {
    return this.http.post<RagQueryResponse>(`${this.apiUrl}/query`, {
      question,
      assistantkey
    });
  }

  getAssistantsByUser(userId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/user/${userId}/assistants`);
  }
    
}