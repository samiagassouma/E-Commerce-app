import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { UserService } from '../../services/user/user.service';
import { AuthService, User } from '../../services/auth/auth.service';
import { NgClass, NgFor, NgIf } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { PopupComponent } from '../popup/popup.component';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [NgFor, NgIf, ReactiveFormsModule, NgClass, FormsModule, PopupComponent],
  templateUrl: './users.component.html',
  styleUrl: './users.component.css'
})
export class UsersComponent implements OnInit {

  users: User[] = [];
  page = 1;
  limit = 9;
  totalPages = 0;
  totalItems = 0;
  selectedUser: User | null = null;
  editForm: FormGroup;
  showViewModal = false;
  showEditModal = false;
  showDeleteModal = false;
  searchTerm = '';
  search = false;
  adminUser!: User;



  constructor(private usersService: UserService, private fb: FormBuilder, private authService: AuthService) {

    this.editForm = this.fb.group({
      name: ['', Validators.required],
      lastName: [''],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      address: [''],
      role: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.loadUsers();
  }



  viewUser(user: User) {
    this.selectedUser = user;
    this.showViewModal = true;
  }

  closeModal() {
    this.selectedUser = null;
    this.showViewModal = false;
  }

  loadUsers() {
    if (this.search) {
      this.searchTerm = '';
    }
    this.authService.getCurrentUser$().subscribe({
      next: (currentUser) => {
        this.adminUser = currentUser;
        this.usersService.getAllUsers(this.page, this.limit).subscribe({
          next: (data) => {
            this.users = data.data.filter((user: any) => user.idUser !== currentUser!.idUser);
            this.totalItems = data.total;
            this.totalPages = data.totalPages;
          },
          error: (err) => console.error(err)
        });
      },
      error: (err) => console.error(err)
    });
  }


  @ViewChild('pageTop') pageTop!: ElementRef<HTMLDivElement>;
  goToPage(page: number) {
    console.log("pages");
    if (page < 1 || page > this.totalPages) return;
    this.page = page;
    if (!this.search) {
      this.loadUsers();
    }
    else {
      this.searchUsers();
    }
    this.pageTop.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  searchUsers() {
    this.usersService.getAllUsers(this.page, this.limit, this.searchTerm).subscribe((res) => {
      this.users = res.data.filter((user: any) => user.idUser !== this.adminUser.idUser);;
      this.totalPages = res.totalPages;
      this.totalItems = res.total;
      this.search = true;
    },
      (err) => console.error(err));
  }


  deleteUser(id: number) {
    this.usersService.deleteUser(id).subscribe({
      next: () => this.loadUsers(),
      error: (err) => console.error(err)
    });
  }

  openEditModal(user: User) {
    this.selectedUser = user;
    this.editForm.patchValue(user); // fill the form
    this.showEditModal = true;
  }

  closeEditModal() {
    this.showEditModal = false;
    this.selectedUser = null;
  }

  saveUser() {
    if (!this.selectedUser) return;

    const { email, role, ...updatedUser } = this.editForm.value;
    this.usersService.updateUser(this.selectedUser.idUser, updatedUser).subscribe(() => {
      this.loadUsers(); // refresh list
      this.closeEditModal();
    });
  }

  openDeleteModal(user: User) {
    this.selectedUser = user;
    this.showDeleteModal = true;
  }

  closeDeleteModal() {
    this.showDeleteModal = false;
    this.selectedUser = null;
  }

  confirmDelete() {
    if (!this.selectedUser) return;

    this.usersService.deleteUser(this.selectedUser.idUser).subscribe(() => {
      this.loadUsers(); // refresh list
      this.closeDeleteModal();
    });
  }
}
