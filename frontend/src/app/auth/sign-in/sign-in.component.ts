import { CommonModule } from '@angular/common';
import { Component, EventEmitter, HostListener, Input, OnInit, Output  } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';


@Component({
  selector: 'app-sign-in',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.css'] 
})


export class SignInComponent implements OnInit {
  @Input() isModalOpen: boolean = true;
  @Output() closeModalEvent = new EventEmitter<void>();

  signInForm!: FormGroup;
 errorMessage: string = '';

 constructor(
   private fb: FormBuilder,
   private authService: AuthService,
   private router: Router
 ) { }



 ngOnInit(): void {
  
   this.signInForm = this.fb.group({
     email: ['', [Validators.required, Validators.email]],
     password: ['', [Validators.required, Validators.minLength(6)]],
   });
 }   



  closeModal(event: MouseEvent): void {
    if (event.target === event.currentTarget || event.target instanceof HTMLButtonElement) {
      this.closeModalEvent.emit();
      document.body.style.overflow = 'auto';
    }
  }


 onSubmit(): void {
   if (this.signInForm.invalid) return;

   const credentials = this.signInForm.value;

   this.authService.login(credentials).subscribe({
    
     next: (res) => {
       this.authService.storeSession({
        access_token: res.session.access_token,
        refresh_token: res.session.refresh_token,
        user_id: res.user.idUser.toString()
      });

       // Redirect based on role
       switch (res.user.role) {
         case 'ADMIN':
           this.router.navigate(['dashboard']);
           break;
           case 'CUSTOMER':
             this.router.navigate(['dashboard']);
             break;
         default:
           this.router.navigate(['dashboard']);
       }
     },
     error: (err) => {
       console.error('Login failed:', err);
       this.errorMessage = err.error?.message || 'Invalid credentials';
     }
   });
 }

 @HostListener('document:keydown.escape', ['$event'])
 onEscapePressed(event: KeyboardEvent) {
  this.closeModalEvent.emit();
 }
 }
