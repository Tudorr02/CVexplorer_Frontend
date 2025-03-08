import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { AdminService } from '../../_services/admin.service';
import { NotificationService } from '../../_services/notification.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { Table } from 'primeng/table';
import { CompanyManagement } from '../../_models/companyManagement';
@Component({
  selector: 'app-manage-companies',
  imports: [IconField,InputIcon,CommonModule, FormsModule, TableModule, ToastModule, ButtonModule, InputTextModule],
  templateUrl: './manage-companies.component.html',
  styleUrl: './manage-companies.component.css'
})
export class ManageCompaniesComponent implements OnInit {

  private adminService = inject(AdminService);
  private notificationService = inject(NotificationService);

  @ViewChild('dtCompanies') dt!: Table; // Reference to PrimeNG Table
  companies: CompanyManagement[] = [];
  clonedCompanies: { [name: string]: CompanyManagement} = {};
  deletingCompanies: { [name: string]: boolean } = {};
  globalFilter: string = '';

  ngOnInit() {
    this.fetchCompanies();
  }

  fetchCompanies() {
    this.adminService.getCompanies().subscribe({
      next: (companies) => this.companies = companies.map(company => ({
        name: company.name,
        employees: company.employees ?? 0
      })),
      error: () => this.notificationService.showError("Failed to fetch companies.")
    });
  }

  filterGlobal() {
    this.dt.filterGlobal(this.globalFilter, 'contains');
  }

  onRowEditInit(company: CompanyManagement, index: number) {
    this.clonedCompanies[index] = { ...company };
  }

  onRowEditSave(company: CompanyManagement, index: number) {
    const originalCompany = this.clonedCompanies[index];
    this.adminService.updateCompany(originalCompany.name, company).subscribe({
      next: (updatedCompany) => {
        this.notificationService.showSuccess(`Company ${updatedCompany.name} updated successfully!`);
        delete this.clonedCompanies[company.name];
      },
      error: (err) => {
        this.notificationService.showError("Failed to update company. "+ err.error.error);
        this.onRowEditCancel(company, index);
      }
    });
  }

  onRowEditCancel(company: CompanyManagement , index: number) {
    const originalCompany = this.clonedCompanies[index];
    if (originalCompany) {
      Object.assign(company, originalCompany);
      delete this.clonedCompanies[index];
    }
  }

  onRowDeleteInit(companyName: string) {
    this.deletingCompanies[companyName] = true;
  }

  onRowDeleteConfirm(companyName: string) {
    this.adminService.deleteCompany(companyName).subscribe({
      next: () => {
        this.notificationService.showSuccess(`Company ${companyName} deleted successfully!`);
        this.companies = this.companies.filter(c => c.name !== companyName);
        delete this.deletingCompanies[companyName];
      },
      error: () => {
        this.notificationService.showError("Failed to delete company.")
        delete this.deletingCompanies[companyName];
      }
    });
  }

  onRowDeleteCancel(companyName: string) {
    delete this.deletingCompanies[companyName];
  }
}
