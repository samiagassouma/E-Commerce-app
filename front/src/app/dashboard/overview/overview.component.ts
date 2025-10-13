import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CreateAssistantComponent } from '../../pages/create-assistant/create-assistant.component';

@Component({
  selector: 'app-overview',
  standalone: true,
  imports: [],
  templateUrl: './overview.component.html',
  styleUrl: './overview.component.css'
})
export class OverviewComponent {

  constructor(private dialog: MatDialog) {}

  openCreateAssistantDialog() {
    const dialogRef = this.dialog.open(CreateAssistantComponent, {
      width: '650px',
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
      // Tu peux faire un refresh ou autres actions ici si besoin
    });
  }
}
