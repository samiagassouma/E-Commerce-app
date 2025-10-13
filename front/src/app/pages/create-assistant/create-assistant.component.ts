
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgIf } from '@angular/common';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { AssistantSuccessDialogComponent } from '../../pop-ups/pop-success/assistant-success-dialog/assistant-success-dialog.component';
import { AuthService } from '../../services/auth/auth.service';
import { RagService } from '../../services/rag/rag.service';
import { KeyAssistantService } from '../../services/key-assistant/key-assistant.service';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-create-assistant',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf, MatIconModule,
    MatButtonModule],
  templateUrl: './create-assistant.component.html',
  styleUrl: './create-assistant.component.css'
})
export class CreateAssistantComponent implements OnInit{

  assistantForm!: FormGroup;
  selectedDbType: string = '';
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private ragService: RagService,
    private dialog: MatDialog,
    private authService: AuthService,
    private keyAssistantService: KeyAssistantService,
    private dialogRef: MatDialogRef<CreateAssistantComponent>
  ) {}

  ngOnInit() {
    this.assistantForm = this.fb.group({
      companyName: ['', Validators.required],
      domaine: ['', Validators.required],
      description: ['', Validators.required],
      databaseType: ['', Validators.required],
      urlDb: ['', [Validators.required, Validators.pattern('https?://.+')]],
      supabaseKey: [''],
      username: [''],
      password: [''],
      databaseName: [''],
      firebaseCredsJson: [''],
      limitedTables: [''] 
    });
  }

  onDatabaseTypeChange() {
    this.selectedDbType = this.assistantForm.get('databaseType')?.value;

    // Reset les champs spécifiques au changement de DB
    this.assistantForm.patchValue({
      supabaseKey: '',
      username: '',
      password: '',
      databaseName: '',
      firebaseCredsJson: ''
    });
  }

  closeDialog(): void {
    this.dialogRef.close();
  }

  onSubmit() {
    if (this.assistantForm.invalid) {
      alert('Please fill all required fields correctly.');
      return;
    }

    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      alert('Vous devez être connecté pour créer un assistant.');
      return;
    }

    this.isLoading = true;

    // Préparation des données à envoyer, avec les bons noms de champs selon le backend
    const formValue = this.assistantForm.value;
       // Transformation du champ limitedTables : chaîne -> tableau de chaînes (trim & filtre vides)
     
       const limitedTablesArray = formValue.limitedTables
       ? formValue.limitedTables.split(',').map((t: string) => t.trim()).filter((t: string) => t.length > 0)
       : [];

    const payload = {
      companyname: formValue.companyName,
      domaine: formValue.domaine,
      description: formValue.description,
      databasetype: formValue.databaseType,
      urldb: formValue.urlDb,
      supabaseKey: formValue.supabaseKey || null,
      username: formValue.username || null,
      password: formValue.password || null,
      databaseName: formValue.databaseName || null,
      firebaseCredsJson: formValue.firebaseCredsJson || null,
      idUser: currentUser.idUser,
      limitedTables: limitedTablesArray, 
    };

    this.ragService.createAssistant(payload).subscribe({
      next: (res: any) => {
        this.keyAssistantService.setAssistantKey(res.assistantkey);
        this.dialog.open(AssistantSuccessDialogComponent, {
          data: { assistantKey: res.assistantkey },
          width: '500px'
        });
        this.assistantForm.reset();
        this.isLoading = false; 
      },
      error: (err) => {
        alert(' Error: ' + (err.error?.error || err.message));
        this.isLoading = false; 
      }
    });

}
}