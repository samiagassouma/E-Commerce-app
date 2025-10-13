import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SignInComponent } from '../../auth/sign-in/sign-in.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterModule, CommonModule, SignInComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  isLoginModalOpen = false;

  openLoginModal() {
    this.isLoginModalOpen = true;
    document.body.style.overflow = 'hidden';
  }
  
  closeLoginModal() {
    this.isLoginModalOpen = false;
    document.body.style.overflow = 'auto';
  }

}
