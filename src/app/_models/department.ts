import { Position } from "./position";
import { DepartmentAccess } from "./department-access";
export interface Department{
    id?: number;
    name: string;
    departmentAccesses?: DepartmentAccess[];
    
}