import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule, NgIf } from '@angular/common';
import { environment } from '../../../environments/environment.development';
import { RagService } from '../../services/rag/rag.service';
import { Subscription } from 'rxjs';
import { KeyAssistantService } from '../../services/key-assistant/key-assistant.service';

@Component({
  selector: 'app-interface-assistant',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf, CommonModule,
    FormsModule],
  templateUrl: './interface-assistant.component.html',
  styleUrl: './interface-assistant.component.css'
})
export class InterfaceAssistantComponent implements OnInit, OnDestroy  {
  userInput: string = '';
  messages: { text: string, sender: 'user' | 'bot' }[] = [];
  isTyping = false;
;

  // Remplace ceci par ta clé assistant retournée par /create-assistant
  assistantKey = environment.frontendUrl+"chat/"+environment.assistantKey;
  //assistantKey: string | null = null;
  private subscription!: Subscription;

  @ViewChild('chatMessages') private chatMessagesContainer!: ElementRef;

  constructor(private ragService: RagService, private keyAssistantService: KeyAssistantService ) {}

 
  ngOnInit() {
    // this.subscription = this.keyAssistantService.assistantKey$.subscribe(key => {
    //   console.log('Assistant key reçue dans InterfaceAssistantComponent:', key);
    //   this.assistantKey = key;
    // });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  sendMessage() {
    const question = this.userInput.trim();
    if (!question) return;

    if (!this.assistantKey) {
      alert('Assistant non sélectionné');
      return;
    }

    this.messages.push({ text: question, sender: 'user' });
    this.userInput = '';
    this.isTyping = true;

    this.ragService.sendQuery(question, this.assistantKey).subscribe({
      next: (response) => {
        this.isTyping = false;
        this.messages.push({
          text: response.Answer || 'Aucune réponse reçue',
          sender: 'bot'
        });
        setTimeout(() => this.scrollToBottom(), 100);
      },
      error: (error) => {
        this.isTyping = false;
        this.messages.push({
          text: 'Désolé, une erreur est survenue lors du traitement de votre question.',
          sender: 'bot'
        });
        setTimeout(() => this.scrollToBottom(), 100);
      }
    });
  }

  private scrollToBottom() {
    if (this.chatMessagesContainer) {
      const el = this.chatMessagesContainer.nativeElement;
      el.scrollTop = el.scrollHeight;
    }
  }

}
