import { PositionTreeNode } from "./positionTreeNode";

export interface DepartmentTreeNode {
    id : number;
    name : string;
    positions : PositionTreeNode[];
}