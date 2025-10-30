import { Component, OnInit } from '@angular/core';
import { PaymentService } from '../../services/payment/payment.service';
import { RedirectPaymentComponent } from '../redirect-payment/redirect-payment.component';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { AsideComponent } from '../../dashboard/aside/aside.component';

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [RedirectPaymentComponent, CommonModule, AsideComponent],
  templateUrl: './payment.component.html',
  styleUrl: './payment.component.css'
})
export class PaymentComponent implements OnInit {

  assistantId!: string;  // declare at class level

  cards = [
    {
      cost: 120000,
      plan: '1 mois',
      description: 'Idéal pour tester l’assistant IA et un usage personnel',
      icon: 'bot',
      iconColor: 'text-green-500 group-hover:text-green-600',
      features: ['50 requêtes IA / jour', 'Réponses rapides', 'Support standard']
    },
    {
      cost: 240000,
      plan: '3 mois',
      description: 'Parfait pour les étudiants et petites équipes',
      icon: 'brain',
      iconColor: 'text-indigo-500 group-hover:text-indigo-600',
      features: ['200 requêtes IA / jour', 'Analyse de documents', 'Support prioritaire']
    },
    {
      cost: 400000,
      plan: '6 mois',
      description: 'Conçu pour les entreprises et une utilisation intensive',
      icon: 'sparkles',
      iconColor: 'text-yellow-500 group-hover:text-yellow-600',
      features: ['Requêtes illimitées', 'Intégration API', 'Support 24/7 premium']
    }
  ];


  constructor(private _paymentService: PaymentService, private route: ActivatedRoute) { }
  ngOnInit(): void {
    this.assistantId = this.route.snapshot.paramMap.get('assistantId')!;
    console.log(this.assistantId);
  }

  payment(amount: number, plan: string) {
    console.log("payment");
    const userId = localStorage.getItem('user_id')!;
    this._paymentService.checkout({ amount, assistantId: this.assistantId, plan, userId })
      .subscribe({
        next: value => {
          console.log('Observable emitted the next value: ' + value);
          console.log(value);
          window.location.href = value.payUrl; //'http://localhost:4200/redirectPayment';
        },
        error: err => console.error('Observable emitted an error: ' + err),
        complete: () => console.log('Observable emitted the complete notification')
      })
  }

  selectedSection: string = '';

onSectionSelected(section: string) {
  this.selectedSection = section;
}

}
