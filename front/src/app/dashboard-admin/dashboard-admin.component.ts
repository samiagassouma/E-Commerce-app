import { Component } from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { AsideComponent } from './aside/aside.component';
import { filter } from 'rxjs';
import { CommonModule } from '@angular/common';
import { AuthService, User } from '../services/auth/auth.service';
import { UserService } from '../services/user/user.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-dashboard-admin',
  standalone: true,
  imports: [RouterModule, AsideComponent, CommonModule, FormsModule],
  templateUrl: './dashboard-admin.component.html',
  styleUrl: './dashboard-admin.component.css'
})
export class DashboardAdminComponent {
  private titles: { [key: string]: string } = {
    '/dashboard-admin/users': 'Users Management',
    '/dashboard-admin/assistants': 'Assistants Management',
    '/dashboard-admin/payments': 'Payments Management',
  };


  pageTitle: string = '';
  pageSubtitle: string = '';
  dropdownOpen = false;
  dropdownStatusOpen = false;
  showLogoutModal = false;
  showEditModal = false;
  currentUser!: User;
  editForm: Partial<User> = {};
  showSuccessToast= false;
  asideHasModal = false; 

  constructor(private router: Router, private authService: AuthService, private usersService: UserService) {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        const currentRoute = event.urlAfterRedirects;
        this.pageTitle = this.titles[currentRoute] || 'Executive Dashboard';
      });
  }

  ngOnInit(): void {
    console.log("onintit dashboard");
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;  // assign the value
      console.log('Current user:', this.currentUser);
      this.editForm = { ...this.currentUser };

    });
  }

  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }

  toggleStatusDropdown() {
    this.dropdownStatusOpen = !this.dropdownStatusOpen;
  }

  openEditModal(): void {
    this.showEditModal = true;
    this.dropdownStatusOpen = false;
  }
  closeEditModal(): void {
    this.showEditModal = false;
  }
  confirmLogout(): void {
    this.showLogoutModal = true;
    this.dropdownStatusOpen = false;
  }

  closeLogoutModal(): void {
    this.showLogoutModal = false;
  }


  logout(): void {
    console.log('User logged out');
    this.showLogoutModal = false;
    // TODO: call AuthService.logout()
  }

  save(): void {
    console.log('Profile updated:', this.editForm);
    this.currentUser = { ...this.currentUser, ...this.editForm } as User;


    const { idUser, role, ...updatedUser } = this.editForm;
    this.usersService.updateUser(this.currentUser.idUser, updatedUser as Partial<User>).subscribe(() => {
      this.showEditModal = false;
      this.showSuccessToast = true;
    });



    setTimeout(() => {
      this.showSuccessToast = false;
    }, 3000);
  }
}
