import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild, inject } from '@angular/core';
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
import { finalize } from 'rxjs';
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

  cdr = inject(ChangeDetectorRef);
  private ro?: ResizeObserver;   
  @ViewChild('wrapper', { static: false })
  wrapper!: ElementRef<HTMLElement>;
  scrollHeight = '0px'; 


  companies: CompanyManagement[] = [];
  clonedCompanies: { [companyId: number]: CompanyManagement} = {};
  deletingCompanies: { [companyId: number]: boolean } = {};
  globalFilter: string = '';
  addingCompany = false;
  newCompanyName = '';

  ngOnInit() {
    this.loadCompanies();
  }

  ngAfterViewInit(): void {
    this.updateHeight();

    // dacă vrei să reacţionezi când utilizatorul redimensionează fereastra
    this.ro = new ResizeObserver(() => this.updateHeight());
    this.ro.observe(this.wrapper.nativeElement);
  }

  private updateHeight(): void {
    if (!this.wrapper) return;
    const h = this.wrapper.nativeElement.offsetHeight;  // pixeli incluşi padding
    this.scrollHeight = `${Math.max(h - 49 - 16, 300)}px`;   
    console.log('Scroll height updated:', h);
    this.cdr.detectChanges();                           // forţează aplicaţia
  }

  ngOnDestroy(): void {
    this.ro?.disconnect();   // curăţă observaţia de resize
  }

  addCompanyInit() {
    this.addingCompany = true;
  }

  confirmAddCompany() {
    if (this.newCompanyName.trim()) {
      const newCompany: CompanyManagement = { name: this.newCompanyName , id: 0, employees: 0 };
      
      this.adminService.createCompany(newCompany).subscribe({
        next: (createdCompany) => {
          this.loadCompanies();
          this.notificationService.showSuccess(`Company ${createdCompany.name} added successfully!`);
          this.newCompanyName = '';
          this.addingCompany = false;
        },
        error: (err) => {
          this.notificationService.showError("Failed to add company. " + err.error.error);
        }
      });
    }
  }

  cancelAddCompany() {
    this.newCompanyName = '';
    this.addingCompany = false;
  }


  loadCompanies() {
    this.adminService.getCompanies()
    .subscribe({
      next: (companies) => this.companies = companies.map(company => ({
        id: company.id,
        name: company.name,
        employees: company.employees ?? 0
      })),
      error: () => this.notificationService.showError("Failed to load companies.")
    });
    
  }

  filterGlobal() {
    this.dt.filterGlobal(this.globalFilter, 'contains');
  }

  onRowEditInit(company: CompanyManagement) {
    this.clonedCompanies[company.id] = { ...company };
  }

  onRowEditSave(company: CompanyManagement) {
    this.adminService.updateCompany(company.id, company).subscribe({
      next: (updatedCompany) => {
        this.notificationService.showSuccess(`Company ${updatedCompany.name} updated successfully!`);
        delete this.clonedCompanies[company.id];
        this.loadCompanies();
      },
      error: (err) => {
        this.notificationService.showError("Failed to update company. "+ err.error.error);
        this.onRowEditCancel(company);
      }
    });
  }

  onRowEditCancel(company: CompanyManagement ) {
    const originalCompany = this.clonedCompanies[company.id];
    if (originalCompany) {
      Object.assign(company, originalCompany);
      delete this.clonedCompanies[company.id];
    }
  }

  onRowDeleteInit(companyId: number) {
    this.deletingCompanies[companyId] = true;
  }

  onRowDeleteConfirm(companyId: number, companyName: string) {
    this.adminService.deleteCompany(companyId).subscribe({
      next: () => {
        this.notificationService.showSuccess(`Company ${companyName} deleted successfully!`);
        this.loadCompanies();
        delete this.deletingCompanies[companyId];
      },
      error: () => {
        this.notificationService.showError("Failed to delete company.")
        delete this.deletingCompanies[companyId];
      }
    });
  }

  onRowDeleteCancel(companyId: number) {
    delete this.deletingCompanies[companyId];
  }
}
