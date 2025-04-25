export interface CV {
    publicId?: string;
    fileName: string;
    uploadedAt: Date;
    uploadedBy?: string;
    fileData?: string;
    score?: number;
}