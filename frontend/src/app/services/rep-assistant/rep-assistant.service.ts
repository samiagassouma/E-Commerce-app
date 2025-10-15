import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';

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
export class RepAssistantService {
  private apiUrl = environment.baseUrl+"rag/query/";  // Ton backend NestJS RAG endpoint

  constructor(private http: HttpClient) {}

  sendQuery(question: string, assistantKey: string): Observable<RagQueryResponse> {
    const payload: RagQueryRequest = {
      question: question,
      assistantkey: assistantKey,
    };

    return this.http.post<RagQueryResponse>(this.apiUrl, payload);
  }
}