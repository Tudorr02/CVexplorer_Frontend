import { Injectable, inject} from '@angular/core';
import { AdminService } from './admin.service';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class RoleService {

  adminService = inject(AdminService);

  getRoles(): Observable<string[]> {
    return this.adminService.getRoles();
  }
}
