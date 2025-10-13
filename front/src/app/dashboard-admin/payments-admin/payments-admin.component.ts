import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Payment, PaymentService } from '../../services/payment/payment.service';
import { AbstractControl, AsyncValidatorFn, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { AuthService, User } from '../../services/auth/auth.service';
import { Assistant } from '../../services/rag/rag.service';
import { map, of, switchMap, timer } from 'rxjs';
import { AssistantService } from '../../services/assistant.service';
import { PopupComponent } from '../popup/popup.component';

export interface PaymentFilters {
  minAmount: number | null,
  maxAmount: number | null,
  startDate: string | null,
  endDate: string | null,
  selectedPlan: string | null,
  paymentStatus: string | null,
  username: string | null;
}

@Component({
  selector: 'app-payments-admin',
  standalone: true,
  imports: [NgFor, NgIf, CommonModule, ReactiveFormsModule, FormsModule, PopupComponent],
  templateUrl: './payments-admin.component.html',
  styleUrl: './payments-admin.component.css'
})
export class PaymentsAdminComponent implements OnInit {

  payments: Payment[] = [];
  selectedPayment: any;
  editForm!: FormGroup;
  showViewModal = false;
  showEditModal = false;
  showDeleteModal = false;
  selectedUser!: User | null;
  selectedAssistant!: any;
  page = 1;
  limit = 9;
  totalPages = 0;
  totalItems = 0;
  searchTerm = '';
  filterActive = false;
  filteredTotalItems = 0;
  showFilterDropdown = false;
  search = false;
  filters = {
    minAmount: null,
    maxAmount: null,
    startDate: null,
    endDate: null,
    selectedPlan: '',
    paymentStatus: '',
    username: ''
  };


  activeFilter: string | null = null;
  userForm!: FormGroup;

  ngOnInit(): void {
    this.loadPayments();
  }

  constructor(private paymentService: PaymentService, private fb: FormBuilder, private assistantService: AssistantService) {
    this.editForm = this.fb.group({
      amount: ['', Validators.required],
      currency: ['', Validators.required],
      paymentMethod: ['', Validators.required],
      paymentStatus: ['', [Validators.required]],
      ref: ['', Validators.required],
      subscriptionPlan: ['', Validators.required],
      billingCycleStart: ['', Validators.required],
      billingCycleEnd: ['', Validators.required],
      User: ['', Validators.required],
      assistantId: ['', Validators.required]
    });

    this.userForm = this.fb.group({
      username: [
        '',
        [Validators.required],
        [this.usernameExistsValidator()]
      ]
    });


  }

  usernameExistsValidator(): AsyncValidatorFn {
    return (control: AbstractControl) => {
      const value = control.value?.trim();
      console.log(value);
      if (!value) return of(null);

      // debounce for 500ms before calling the backend
      return timer(500).pipe(
        switchMap(() => this.assistantService.checkUserExists(value)),
        map(exists => (exists ? null : { userNotFound: true }))
      );
    };
  }

  loadPayments() {
    this.paymentService.getAllPayments(this.page, this.limit).subscribe({
      next: (data) => {
        this.payments = data.data;
        console.log(this.payments);

        this.totalPages = data.totalPages;
        this.totalItems = data.total;
      },
      error: (err) => console.error(err)
    });
  }
  searchPayment() {

  }

  @ViewChild('pageTop') pageTop!: ElementRef<HTMLDivElement>;
  goToPage(page: number) {
    console.log("pages");
    if (page < 1 || page > this.totalPages) return;
    this.page = page;
    if (!this.filterActive) {
      this.loadPayments();
    }
    else {
      this.getFilteredPayments();
    }

    this.pageTop.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }


  openEditModal(payment: Payment) {
    this.selectedPayment = payment;
    this.editForm.patchValue(payment); // fill the form
    this.showEditModal = true;
  }

  closeEditModal() {
    this.showEditModal = false;
    this.selectedPayment = null;
  }

  savePayment() {
    if (!this.selectedPayment) return;

    const { idPayment, amount, currency, paymentMethod, paymentStatus, subscriptionPlan, billingCycleStart, billingCycleEnd } = this.editForm.value;
    const updatedPayment = { idPayment, amount: Number(amount), currency, paymentMethod, paymentStatus, subscriptionPlan, billingCycleStart, billingCycleEnd };

    this.paymentService.updatePayment(this.selectedPayment.idPayment, updatedPayment).subscribe(() => {
      this.loadPayments(); // refresh list
      this.closeEditModal();
    });
  }


  openDeleteModal(payment: Payment) {
    this.selectedPayment = payment;
    this.showDeleteModal = true;
  }

  closeDeleteModal() {
    this.selectedPayment = null;
    this.showDeleteModal = false;
  }

  confirmDelete() {
    if (!this.selectedPayment) return;

    this.paymentService.deletePayment(this.selectedPayment.idPayment).subscribe(() => {
      this.loadPayments(); // refresh list
      this.closeDeleteModal();
    });
  }


  openPaymentPopup(payment: any) {
    this.selectedPayment = payment;
    this.showViewModal = true;
  }

  closePaymentPopup() {
    this.selectedPayment = null;
    this.showViewModal = false;
  }

  viewUser(user: User) {
    this.selectedUser = user;
  }

  closeUserModal() {
    this.selectedUser = null;
  }

  viewAssistant(assistant: Assistant) {
    this.selectedAssistant = assistant;
  }

  closeAssistantModal() {
    this.selectedAssistant = null;
  }


  // Get count of active filters
  getActiveFiltersCount(): number {
    let count = 0;
    if (this.filters.startDate || this.filters.endDate) count++;
    if (this.filters.selectedPlan) count++;
    if (this.filters.minAmount || this.filters.maxAmount) count++;
    if (this.filters.paymentStatus) count++;
    if (this.filters.username) count++;
    return count;
  }

  // Toggle filter dropdown visibility
  toggleFilterDropdown(): void {
    this.showFilterDropdown = !this.showFilterDropdown;
  }

  selectFilter(type: string) { this.activeFilter = type; }
  backToFilterMenu() {
    this.activeFilter = null;
    if (this.userForm.get('username')?.invalid) {
      this.userForm.reset({
        username: '',         // reset the username input
      });
    }
  }
  selectPlan(plan: string) { this.filters.selectedPlan = plan; }
  selectPaymentStatus(status: string) { this.filters.paymentStatus = status; }
  onUsernameInput(): void {

    const usernameControl = this.userForm.get('username');

    if (usernameControl) {
      usernameControl.statusChanges.subscribe(status => {
        if (status === "VALID") {
          this.filters.username = usernameControl.value;
        } else {
          this.filters.username = '';
        }
      });
    }

  }

  clearAllFilters() {
    console.log("filters==", this.filters);
    this.filters = {
      minAmount: null,
      maxAmount: null,
      startDate: null,
      endDate: null,
      selectedPlan: '',
      paymentStatus: '',
      username: ''
    };
    this.userForm.reset({
      username: '',         // reset the username input
    });
    this.showFilterDropdown = false;
    if (this.filterActive) {
      this.loadPayments();
      this.filterActive = false;
    }
  }

  applyAndClose() {
    this.getFilteredPayments();
    this.closeFilterDropdown();
  }

  closeFilterMenu() {
    this.closeFilterDropdown();
  }

  // Close filter dropdown
  closeFilterDropdown(): void {
    this.showFilterDropdown = false;
    this.activeFilter = null;
  }

  reloadPayments() {
    this.loadPayments();
    if (this.filterActive || this.getActiveFiltersCount()) {
      this.filterActive = false;
      this.filters = {
        minAmount: null,
        maxAmount: null,
        startDate: null,
        endDate: null,
        selectedPlan: '',
        paymentStatus: '',
        username: ''
      };
    }
  }

  private getFilteredPayments() {
    this.paymentService.getFilteredPayments(this.page, this.limit, this.filters).subscribe({
      next: (data) => {
        this.filterActive = true;
        this.payments = data.data;
        this.filteredTotalItems = data.total;
        this.totalPages = data.totalPages;
        this.totalItems = data.total;
      },
      error: (err) => console.error(err)
    });
  }

  searchPayments(){

  }

}
