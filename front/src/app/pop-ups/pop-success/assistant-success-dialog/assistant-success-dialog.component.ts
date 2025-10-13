import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-assistant-success-dialog',
  standalone: true,
  imports: [  CommonModule,
    MatDialogModule,
    MatButtonModule],
  templateUrl: './assistant-success-dialog.component.html',
  styleUrl: './assistant-success-dialog.component.css'
})
export class AssistantSuccessDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<AssistantSuccessDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { assistantKey: string }
  ) {}

  copyKey() {
    navigator.clipboard.writeText(this.data.assistantKey);
  }

  closeDialog() {
    this.dialogRef.close();
  }

}
