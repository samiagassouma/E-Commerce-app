import { Component, ViewChild } from '@angular/core';
import { AsideComponent } from './aside/aside.component';
import { AisComponent } from './ais/ais.component';
import { OverviewComponent } from './overview/overview.component';
import { SettingsComponent } from './settings/settings.component';
import { CommonModule, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PaymentsComponent } from './payments/payments.component';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [AsideComponent, AisComponent, OverviewComponent, SettingsComponent,PaymentsComponent, CommonModule, FormsModule, NgIf, RouterOutlet],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent { 
  
  selectedSection: string = 'overview';

  @ViewChild(AisComponent) aisComponent?: AisComponent;

  onSectionSelected(section: string) {
    this.selectedSection = section;

    // Si l'utilisateur clique sur AIs → on charge les assistants
    if (section === 'ais') {
      setTimeout(() => this.aisComponent?.loadAssistants(), 0);
    }
  }

}
