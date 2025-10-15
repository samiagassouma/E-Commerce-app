import { Component, OnInit } from '@angular/core';
import { Assistant, RagService } from '../../services/rag/rag.service';
import { AuthService } from '../../services/auth/auth.service';
import { NgClass, NgFor, NgIf } from '@angular/common';
import { environment } from '../../../environments/environment.development';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-ais',
  standalone: true,
  imports: [ NgFor, RouterLink, NgClass],
  templateUrl: './ais.component.html',
  styleUrl: './ais.component.css'
})
export class AisComponent { 
  frontendUrl = environment.frontendUrl;
  assistants: any[] = [];
  

  constructor(
    private ragService: RagService,
    private authService: AuthService
  ) {this.loadAssistants();}

  loadAssistants() {
    const currentUser = this.authService.getCurrentUser()!;
    if (!currentUser) return;
      
    this.ragService.getAssistantsByUser(currentUser.idUser).subscribe({
      next: (data) => {
        console.log('Assistants chargés:', data);
        this.assistants = data;
      },
      error: (err) => {
        console.error('Erreur chargement assistants:', err);
        this.assistants = [];
      }
    });
  }



}
