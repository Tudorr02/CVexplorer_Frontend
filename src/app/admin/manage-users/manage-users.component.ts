import { Component, OnInit , inject, ViewChild, ChangeDetectorRef, ElementRef } from '@angular/core';
import { MessageService, SelectItem , ConfirmationService} from 'primeng/api';
import { UserManagement } from '../../_models/userManagement';
import { AdminService } from '../../_services/admin.service';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { CommonModule } from '@angular/common';
import { TagModule } from 'primeng/tag';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { MultiSelectModule } from 'primeng/multiselect';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { Table } from 'primeng/table';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { waitForAsync } from '@angular/core/testing';
import { finalize } from 'rxjs';
import { AccountService } from '../../_services/account.service';
@Component({ 
  selector: 'app-manage-users',
  imports: [ScrollPanelModule,InputIcon,IconField,MultiSelectModule,FormsModule,TableModule, ToastModule, CommonModule, TagModule, SelectModule, ButtonModule, InputTextModule],
  templateUrl: './manage-users.component.html',
  styleUrl: './manage-users.component.css',
  providers: [ConfirmationService]
})
export class ManageUsersComponent implements OnInit{

  @ViewChild('dtUsers') dt!: Table; // Reference to PrimeNG Table

  cdr = inject(ChangeDetectorRef);
  private ro?: ResizeObserver;   
  @ViewChild('wrapper', { static: false })
  wrapper!: ElementRef<HTMLElement>;
  scrollHeight = '0px'; 

  users: UserManagement[] = [];
  roles: { name: string ; disabled?: boolean }[] = [];
  companies: string[] = [];
 

  globalFilter: string = '';
  clonedUsers: { [username: string]: UserManagement } = {};
  deletingUsers: { [userId: number]: boolean } = {}; // ✅ Track rows in delete mode
  isModerator: boolean = false;

  
  private adminService = inject(AdminService);
  private messageService = inject(MessageService);
  private accountService = inject(AccountService);

  ngOnInit() {
    this.loadUsers();
    this.checkIfModerator();
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

  private checkIfModerator() {
    const userRole =  this.accountService.currentUser()?.role || '';
    this.isModerator = ( userRole === 'Moderator' );
  }

  private loadUsers() {
    this.adminService.getUsers()
    .subscribe(
      (data) => {
        this.users = data;
        if(this.companies.length === 0) this.loadCompanies();
        if(this.roles.length === 0) this.loadRoles();
      },
      (error) => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load users' });  
      }
    );
  }

  private loadRoles() {
    this.adminService.getRoles().subscribe({
      next: (roles) => this.roles= roles.map(role => ({
        name: role,
        disabled: this.isModerator && role === 'Admin' // ✅ Disable only "Admin" for moderators
    })),
      error: (err) => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load roles' })
    });
  }

  loadCompanies() {

    if (this.companies.length > 0) return; // Prevent multiple requests

    this.adminService.getCompanies().subscribe({
      next: (companies) => {
        this.companies = companies.map(company => company.name); // Format company names
    }, // Format company names
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to fetch companies' });
      }
    });
  }

  // ✅ Start editing a row (store backup)
  onRowEditInit(user: UserManagement) {
    this.clonedUsers[user.username] = { ...user };
  }

  // ✅ Save user after edit
  onRowEditSave(user: UserManagement) {
    if (user.id === undefined) {
      this.messageService.add({ 
        severity: 'error', 
        summary: 'Error', 
        detail: 'User ID is missing, update failed.' 
      });
      return;
    }
    
    this.adminService.updateUser(user.id , user).subscribe(
      () => {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'User updated successfully' });
        delete this.clonedUsers[user.username]; // Remove backup
        this.loadUsers(); // Refresh users
      },
      (error) => {
        if (error.status === 403) {  // ✅ Handle Forbidden error
          this.messageService.add({ 
            severity: 'warn', 
            summary: 'Forbidden', 
            detail: `You are not allowed to edit the user '${user.username}'` 
          });
        } else { // ✅ Handle other errors
          this.messageService.add({ 
            severity: 'error', 
            summary: 'Error', 
            detail: `Failed to edit user '${user.username}'` 
          });
        }
        this.onRowEditCancel(user); // Rollback 
      }
    );
  }

  // ✅ Cancel edit and restore backup
  onRowEditCancel(user: UserManagement) {
    const originalUser = this.clonedUsers[user.username];
    if (originalUser) {
      Object.assign(user, originalUser);
      delete this.clonedUsers[user.username];
    }
  }

  // ✅ Role badge color based on role
  getRoleSeverity(role: string) {
    switch (role) {
      case 'Admin':return 'danger';
      case 'Moderator':return 'warn';
      case 'HRLeader':return 'info';
      case 'HRUser':return 'success';
      default:return 'secondary';
    }
  }

  // ✅ Enable Delete Mode
  onRowDeleteInit(userId: number) {
    this.deletingUsers[userId] = true; 
  }

  // ✅ Cancel Delete
  onRowDeleteCancel(userId: number) {
    delete this.deletingUsers[userId];
  }

  // ✅ Confirm Deletion
  onRowDeleteConfirm(userId: number, username: string) {
    
    this.adminService.deleteUser(userId).subscribe(
      () => {
        this.users = this.users.filter(user => user.username !== username); // ✅ Remove user from UI
        this.messageService.add({ severity: 'success', summary: 'Success', detail: `User '${username}' deleted successfully` }); 
        this.loadUsers();
        delete this.deletingUsers[userId];
      },
      (error) => {
        if (error.status === 403) {  // ✅ Handle Forbidden error
          this.messageService.add({ 
            severity: 'warn', 
            summary: 'Forbidden', 
            detail: `You are not allowed to delete the user '${username}'` 
          });
        } else { // ✅ Handle other errors
          this.messageService.add({ 
            severity: 'error', 
            summary: 'Error', 
            detail: `Failed to delete user '${username}'` 
          });
        }
        delete this.deletingUsers[userId];
      });
  }


  
  filterGlobal() {
    this.dt.filterGlobal(this.globalFilter, 'contains');
  }

}
