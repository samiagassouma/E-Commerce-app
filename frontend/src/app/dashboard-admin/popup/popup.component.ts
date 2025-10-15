import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-popup',
  standalone: true,
  imports: [],
  templateUrl: './popup.component.html',
  styleUrl: './popup.component.css'
})
export class PopupComponent {
  @Input() title: string = '';
  @Input() subtitle: string = '';
  @Input() iconPath: string = '';
  @Output() cancel = new EventEmitter<void>();
}
