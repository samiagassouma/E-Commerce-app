import { Component, OnInit } from '@angular/core';
import { Payment, PaymentService } from '../../services/payment/payment.service';
import { CommonModule, NgClass } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService, User } from '../../services/auth/auth.service';

@Component({
  selector: 'app-payments',
  standalone: true,
  imports: [NgClass, CommonModule],
  templateUrl: './payments.component.html',
  styleUrl: './payments.component.css'
})
export class PaymentsComponent implements OnInit {
  payments: Payment[] = [];
  //userId = 2; // you can dynamically get this from auth/session
  currentUser: User | null = null;

  constructor(private paymentService: PaymentService, private router: Router, private authService: AuthService) { }

  ngOnInit(): void {
    this.authService.getCurrentUser$().subscribe(user => {
      this.currentUser = user;  // assign the value
      console.log('Current user:', this.currentUser);
      this.paymentService.getPaymentsByUserId(this.currentUser!.idUser).subscribe({
        next: (data) => (this.payments = data),
        error: (err) => console.error('Error fetching payments:', err),
      });
    });

  }

  viewInvoice(payment: any) {
    this.router.navigate(['/invoice'], { state: { payment } });
  }


}
