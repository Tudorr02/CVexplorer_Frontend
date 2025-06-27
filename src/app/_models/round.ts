export interface Round{
    publicId: string;
    name: string;
    createdAt: Date;
    candidatesNumber: number; 
    stage: string;
    positionName?: string;
    displayLabel?: string;
}