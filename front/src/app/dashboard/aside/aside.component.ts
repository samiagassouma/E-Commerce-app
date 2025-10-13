import { CommonModule, NgIf } from '@angular/common';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { AuthService, User } from '../../services/auth/auth.service';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { PopupComponent } from '../../dashboard-admin/popup/popup.component';
import { UserService } from '../../services/user/user.service';

@Component({
  selector: 'app-aside',
  standalone: true,
  imports: [NgIf, CommonModule, PopupComponent, FormsModule, ReactiveFormsModule],
  templateUrl: './aside.component.html',
  styleUrl: './aside.component.css'
})
export class AsideComponent implements OnInit {


  @Output() sectionSelected = new EventEmitter<string>();
  currentUser!: User;
  showEditModal = false;
  editForm!: FormGroup;
  showSuccessToast = false;


  constructor(private authService: AuthService, private fb: FormBuilder, private usersService: UserService) {

  }
  ngOnInit(): void {
    this.authService.getCurrentUser$().subscribe(user => {
      this.currentUser = user;  // assign the value
      console.log('Current user:', this.currentUser);

    });
  }



  setSection(section: string) {
    this.sectionSelected.emit(section);
  }

  isCollapsed = false;

  toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
  }

  openEditModal() {
    this.editForm = this.fb.group({
      name: ['', Validators.required],
      lastName: [''],
      company_name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      address: [''],
      role: ['', Validators.required],
      tax_number: [''],
    });
    this.editForm.patchValue(this.currentUser); // fill the form
    this.showEditModal = true;
  }

  closeEditModal() {
    this.showEditModal = false;
  }

  saveUser() {

    const { email, role, ...updatedUser } = this.editForm.value;
    this.usersService.updateUser(this.currentUser.idUser, updatedUser).subscribe({
      next: (res: User) => {
        this.currentUser = res;
        this.closeEditModal();
        this.showSuccessToast = true;
      },
      error: (err) => {
        console.error('Update failed:', err);
      }

    });
    
    setTimeout(() => {
      this.showSuccessToast = false;
    }, 3000);

  }

}
