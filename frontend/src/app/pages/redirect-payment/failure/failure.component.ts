import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-failure',
  standalone: true,
  imports: [],
  templateUrl: './failure.component.html',
  styleUrl: '../sucess/sucess.component.css'
})
export class FailureComponent {
  constructor(private router: Router) {}

goBack(){
this.router.navigate(['/dashboard']);
}
}
