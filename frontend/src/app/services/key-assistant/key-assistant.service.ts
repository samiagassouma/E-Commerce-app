import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class KeyAssistantService {
  private readonly storageKey = 'assistant_key';

  private assistantKeySubject = new BehaviorSubject<string | null>(null);
  assistantKey$ = this.assistantKeySubject.asObservable();

  constructor() {
    if (typeof window !== 'undefined' && window.localStorage) {
      const savedKey = localStorage.getItem(this.storageKey);
      this.assistantKeySubject.next(savedKey);
    }
  }
 
  setAssistantKey(key: string) {
    console.log('setAssistantKey appelé avec:', key);
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(this.storageKey, key);
    }
    this.assistantKeySubject.next(key);
  }

  getCurrentKey(): string | null {
    return this.assistantKeySubject.value;
  }

  clearKey() {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem(this.storageKey);
    }
    this.assistantKeySubject.next(null);
  }

}
