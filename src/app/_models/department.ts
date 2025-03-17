import { Position } from "./position";

export interface Department{
    id?: number;
    name: string;
    positions?: Position[];
}