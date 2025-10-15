import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../environments/environment.development';
import { Assistant, updateAssistantDto } from './rag/rag.service';
import { AssistantFilters } from '../dashboard-admin/assistants/assistants.component';

export interface AssistantCreatePayload {
  companyname: string;
  domaine: string;
  description: string;
  databasetype: string;
  urldb: string;
  assistantkey?: string | null;
  assistantname?: string | null;
  password?: string | null;
  databaseName?: string | null;
  firebaseCredsJson?: string | null;
}


@Injectable({
  providedIn: 'root'
})
export class AssistantService {

  private apiUrl = environment.baseUrl + "/rag"; // adapte l’URL selon ton backend


  constructor(private http: HttpClient) { }

  createAssistant(data: any) {
    return this.http.post(`${this.apiUrl}/create-assistant`, data);
  }

  // Get all assistants
  getAllAssistants(page: number = 1, limit: number = 9, search: string = ''): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());
    if (search) {
      params = params.set('search', search);
    }
    return this.http.get<any>(this.apiUrl, { params });
  }

  // Get one assistant by id
  getAssistantById(id: number): Observable<Assistant> {
    return this.http.get<Assistant>(`${this.apiUrl}/${id}`);
  }


  // Update assistant
  updateAssistant(id: number, assistant: updateAssistantDto): Observable<Assistant> {
    return this.http.patch<Assistant>(`${this.apiUrl}/${id}`, assistant);
  }

  // Delete assistant
  deleteAssistant(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getFilteredAssistants(page: number = 1, limit: number = 9, filters: AssistantFilters): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());
    return this.http.post<any>(`${this.apiUrl}/filter`, filters, { params });
  }

  checkUserExists(username: string) {
    return this.http.get<{ exists: boolean }>(`${this.apiUrl}/user/exists?username=${username}`).pipe(
      map(res => res.exists)
    );
  }

  getAssistantStats(
    granularity: 'per_day' | 'per_month',
    month?: number,
    year?: number,
  ): Observable<{ data: any }> {
    let params = new HttpParams().set('granularity', granularity);
    if (month) params = params.set('month', month.toString());
    if (year) params = params.set('year', year.toString());

    return this.http.get<{ data: any }>(this.apiUrl + '/stats', { params });
  }
  getTotalAssistants(): Observable<{ totalAssistants: number }> {
    return this.http.get<{ totalAssistants: number }>(`${this.apiUrl}/total-assistants`);
  }

  getAssistantsStatus(): Observable<{ activeCount: number; inactiveCount: number }> {
    return this.http.get<{ activeCount: number; inactiveCount: number }>(`${this.apiUrl}/activity-stats`);
  }
}

