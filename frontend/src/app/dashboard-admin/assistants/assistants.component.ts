import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { Assistant, updateAssistantDto } from '../../services/rag/rag.service';
import { AbstractControl, AsyncValidatorFn, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AssistantService } from '../../services/assistant.service';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { User } from '../../services/auth/auth.service';
import { map, of, switchMap, timer } from 'rxjs';
import { PopupComponent } from '../popup/popup.component';
export interface AssistantFilters {
  startDate: string;
  endDate: string;
  selectedDomain: string;
  status: string;
  username: string;
}

export interface Domain {
  value: string;
  label: string;
}
@Component({
  selector: 'app-assistants',
  standalone: true,
  imports: [NgIf, NgFor, CommonModule, ReactiveFormsModule, FormsModule, PopupComponent],
  templateUrl: './assistants.component.html',
  styleUrl: './assistants.component.css'
})
export class AssistantsComponent implements OnInit {
  assistants: Assistant[] = [];
  page = 1;
  limit = 9;
  totalPages = 0;
  totalItems = 0;
  selectedAssistant: any;
  editForm: FormGroup;
  showViewModal = false;
  showEditModal = false;
  showDeleteModal = false;
  today: string = new Date().toISOString().split('T')[0]; // "2025-09-11"
  selectedUser!: User | null;
  search = false;
  searchTerm = '';
  filterActive = false;
  filteredTotalItems = 0;
  showFilterDropdown = false;
  activeFilter: string | null = null;
  filterForm!: FormGroup;

  // Filter values
  filters: AssistantFilters = {
    startDate: '',
    endDate: '',
    selectedDomain: '',
    status: '',
    username: ''
  };

  // Domain options - replace with your actual domains
  domains: Domain[] = [
    { value: 'healthcare', label: 'Healthcare' },
    { value: 'finance', label: 'Finance' },
    { value: 'education', label: 'Education' },
    { value: 'technology', label: 'Technology' },
    { value: 'marketing', label: 'Marketing' },
    { value: 'support', label: 'Customer Support' }
  ];

  ngOnInit(): void {
    this.loadAssistants();
  }

  constructor(private assistantService: AssistantService, private fb: FormBuilder) {

    this.editForm = this.fb.group({
      companyname: ['', Validators.required],
      domaine: ['', Validators.required],
      databasename: ['', Validators.required],
      databasetype: ['', [Validators.required]],
      urldb: ['', Validators.required],
      assistantkey: ['', Validators.required],
      description: ''
    });

    this.filterForm = this.fb.group({
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



  loadAssistants() {
    this.assistantService.getAllAssistants(this.page, this.limit).subscribe({
      next: (res) => {
        this.assistants = res.data;
        console.log(this.assistants);
        this.totalPages = res.totalPages;
        this.totalItems = res.total;
      },
      error: (err) => console.error(err)
    });
  }

  @ViewChild('pageTop') pageTop!: ElementRef<HTMLDivElement>;
  goToPage(page: number) {
    console.log("pages", page);
    if (page < 1 || page > this.totalPages) return;
    this.page = page;
    if (!this.filterActive) {
      this.loadAssistants();
    }
    else {
      this.getFilteredAssistants();
    }

    this.pageTop.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }


  searchAssistants() {
    this.assistantService.getAllAssistants(this.page, this.limit, this.searchTerm).subscribe((res) => {
      this.assistants = res.data;
      this.totalPages = res.totalPages;
      this.totalItems = res.total;
      this.search = true;
    });
  }

  viewAssistant(assistant: Assistant) {
    this.selectedAssistant = assistant;
    this.showViewModal = true;
  }

  openEditModal(assistant: Assistant) {
    this.selectedAssistant = assistant;
    this.editForm.patchValue(assistant); // fill the form
    this.showEditModal = true;
  }

  closeEditModal() {
    this.showEditModal = false;
    this.selectedAssistant = null;
  }
  openDeleteModal(assistant: Assistant) {
    this.selectedAssistant = assistant;
    this.showDeleteModal = true;
  }

  closeDeleteModal() {
    this.showDeleteModal = false;
    this.selectedAssistant = null;
  }

  confirmDelete() {
    if (!this.selectedAssistant) return;

    this.assistantService.deleteAssistant(this.selectedAssistant.id).subscribe(() => {
      this.loadAssistants(); // refresh list
      this.closeDeleteModal();
    });
  }


  isActive(endDate: Date): boolean {
    if (!endDate) return false;
    const end = new Date(endDate).toISOString().split('T')[0];
    return end >= this.today;
  }

  openAssistantPopup(assistant: any) {
    this.selectedAssistant = assistant;
    this.showViewModal = true;
  }

  closeAssistantPopup() {
    this.selectedAssistant = null;
    this.showViewModal = false;
  }

  viewUser(user: User) {
    this.selectedUser = user;
  }

  closeUserModal() {
    this.selectedUser = null;
  }

  saveAssistant() {
    if (!this.selectedAssistant) return;

    const {
      companyname,
      domaine,
      description,
      databasetype,
      urldb,
      assistantkey,
      databasename
    } = this.editForm.value;

    const updatedAssistant: updateAssistantDto = {
      companyname,
      domaine,
      description,
      databasetype,
      urldb,
      assistantkey,
      databasename
    };

    this.assistantService.updateAssistant(this.selectedAssistant.id, updatedAssistant).subscribe(() => {
      this.loadAssistants(); // refresh list
      this.closeEditModal();
    });
  }


  // @ViewChild('filterContainer', { static: false }) filterContainer!: ElementRef;
  // // Listen for clicks outside the filter dropdown
  // @HostListener('document:click', ['$event'])
  // onDocumentClick(event: Event): void {
  //   if (this.showFilterDropdown && this.filterContainer &&
  //     !this.filterContainer.nativeElement.contains(event.target as Node)) {
  //     this.closeFilterDropdown();
  //   }
  // }

  // @ViewChild('filterContainer', { static: false }) filterContainer!: ElementRef;
  // // Listen for clicks outside the filter dropdown
  // @HostListener('document:click', ['$event'])
  // onDocumentClick(event: Event): void {
  //   if (this.showFilterDropdown && this.filterContainer && 
  //       !this.filterContainer.nativeElement.contains(event.target as Node)) {
  //     this.closeFilterDropdown();
  //   }
  // }

  // Toggle filter dropdown visibility
  // toggleFilterDropdown(): void {
  //   this.showFilterDropdown = !this.showFilterDropdown;
  //   if (!this.showFilterDropdown) {
  //     this.activeFilter = null;
  //   }
  // }

  // Toggle filter dropdown visibility
  toggleFilterDropdown(): void {
    this.showFilterDropdown = !this.showFilterDropdown;
  }

  onUsernameInput(): void {

    const usernameControl = this.filterForm.get('username');

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




  // Select specific filter to show its form
  selectFilter(filterType: string): void {
    this.activeFilter = filterType;
  }

  // Go back to filter menu
  backToFilterMenu(): void {
    this.activeFilter = null;
    console.log(this.filters);
    if (this.filterForm.get('username')?.invalid) {
      this.filterForm.reset({
        username: '',         // reset the username input
      });
    }
  }


  // Select domain filter
  selectDomain(domainValue: string): void {
    this.filters.selectedDomain = domainValue;
    console.log(this.filters);
  }

  // Select status filter
  selectStatus(status: string): void {
    this.filters.status = status;
  }
  // Get count of active filters
  getActiveFiltersCount(): number {
    let count = 0;
    if (this.filters.startDate || this.filters.endDate) count++;
    if (this.filters.selectedDomain) count++;
    if (this.filters.status) count++;
    if (this.filters.username) count++;
    return count;
  }

  // Clear all filters
  clearAllFilters(): void {
    this.filters = {
      startDate: '',
      endDate: '',
      selectedDomain: '',
      status: '',
      username: ''
    };

    this.filterForm.reset({
      username: '',         // reset the username input
    });
    this.showFilterDropdown = false;
    if (this.filterActive) {
      this.loadAssistants();
      this.filterActive = false;
    }

  }

  // Close filter dropdown
  closeFilterDropdown(): void {
    this.showFilterDropdown = false;
    this.activeFilter = null;
  }

  // Apply current filter and close dropdown
  applyAndClose(): void {
    this.getFilteredAssistants();
    this.closeFilterDropdown();
  }

  closeFilterMenu() {
    this.closeFilterDropdown();
  }

  reloadAssistants() {
    this.loadAssistants();
    if (this.filterActive || this.getActiveFiltersCount()) {
      this.filterActive = false;
      this.filters = {
        startDate: '',
        endDate: '',
        selectedDomain: '',
        status: '',
        username: ''
      };
    }
  }

  // Example filtering method - adapt to your data structure
  private getFilteredAssistants() {
    this.assistantService.getFilteredAssistants(this.page, this.limit, this.filters).subscribe({
      next: (data) => {
        this.filterActive = true;
        this.assistants = data.data;
        console.log("asssssis==", this.assistants);
        this.filteredTotalItems = data.total;
        console.log("tf==", this.filteredTotalItems);
        this.totalPages = data.totalPages;
        this.totalItems = data.total;
      },
      error: (err) => console.error(err)
    });

    // // Filter by subscription period
    // if (this.filters.startDate) {
    //   filtered = filtered.filter(assistant =>
    //     new Date(assistant.payment[0].billingCycleStart) >= new Date(this.filters.startDate)
    //   );
    // }

    // if (this.filters.endDate) {
    //   filtered = filtered.filter(assistant =>
    //     new Date(assistant.payment[0].billingCycleEnd) <= new Date(this.filters.endDate)
    //   );
    // }

    // // Filter by domain
    // if (this.filters.selectedDomain) {
    //   filtered = filtered.filter(assistant =>
    //     assistant.domaine === this.filters.selectedDomain
    //   );
    // }

    // // Filter by status
    // // if (this.filters.status) {
    // //   const isActive = this.filters.status === 'active';
    // //   filtered = filtered.filter(assistant =>
    // //     assistant.isActive === isActive
    // //   );
    // // }

    // // Filter by username
    // if (this.filters.username) {
    //   filtered = filtered.filter(assistant =>
    //     assistant.user.name.toLowerCase().includes(this.filters.username.toLowerCase())
    //   );
    // }

    // // Apply search term if exists
    // // if (this.searchTerm) {
    // //   filtered = filtered.filter(assistant => 
    // //     assistant.name?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
    // //     assistant.description?.toLowerCase().includes(this.searchTerm.toLowerCase())
    // //   );
    // // }


  }



}
