import { Component, EventEmitter, Input, NgModule, OnInit, Output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService, User } from '../../services/auth/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule, NgModel } from '@angular/forms';
import { UserService } from '../../services/user/user.service';
import { PopupComponent } from '../popup/popup.component';

@Component({
  selector: 'app-aside',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule, FormsModule, PopupComponent],
  templateUrl: './aside.component.html',
  styleUrl: './aside.component.css'
})
export class AsideComponent implements OnInit {


  currentTime: Date = new Date();
  currentUser: User | null = null;

  showDropdown = false;
  showLogoutModal = false;
  showEditModal = false;
  showSuccessToast = false;

  isDropdownOpen = false;
  editForm: Partial<User> = {};


  @Output() modalStateChange = new EventEmitter<boolean>();




  constructor(private authService: AuthService, private usersService: UserService) { }
  ngOnInit(): void {
    console.log("oninit sidebar");
    this.authService.getCurrentUser$().subscribe(user => {
      this.currentUser = user;  // assign the value
      console.log('Current user:', this.currentUser);
      this.editForm = { ...this.currentUser };

    });
  }

  showLogoutConfirm(): void {
    this.isDropdownOpen = false;
    this.showLogoutModal = true;
  }

  get sidebarHasModal(): boolean {
    return this.showEditModal;
  }

  toggleDropdown(): void {
    this.showDropdown = !this.showDropdown;
  }

  confirmLogout(): void {
    this.showLogoutModal = true;
    this.showDropdown = false;
    this.modalStateChange.emit(true); 
  }

  closeLogoutModal(): void {
    this.showLogoutModal = false;
    this.modalStateChange.emit(false); 
  }

  logout(): void {
    console.log('User logged out');
    this.showLogoutModal = false;
    // TODO: call AuthService.logout()
  }

  openEditModal(): void {
    this.showEditModal = true;
    this.showDropdown = false;
     this.modalStateChange.emit(true); 
  }

  closeEditModal(): void {
    this.showEditModal = false;
     this.modalStateChange.emit(false); 
  }

  save(): void {
    console.log('Profile updated:', this.editForm);
    this.currentUser = { ...this.currentUser, ...this.editForm } as User;


    const { idUser,role, ...updatedUser } = this.editForm;
    this.usersService.updateUser(this.currentUser.idUser, updatedUser as Partial<User>).subscribe(() => {
      this.showEditModal = false;
      this.showSuccessToast = true;
    });



    setTimeout(() => {
      this.showSuccessToast = false;
    }, 3000);
  }

    isCollapsed = false;

  toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
  }



}
