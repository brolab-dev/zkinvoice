export enum InvoiceStatus {
  Created = 0,
  Sent = 1,
  Paid = 2,
  Cancelled = 3,
  Overdue = 4,
}

export enum KYCLevel {
  None = 0,
  Basic = 1,
  Advanced = 2,
  Full = 3,
}

export interface Invoice {
  id: bigint;
  creator: `0x${string}`;
  payer: `0x${string}`;
  amount: bigint;
  description: string;
  ipfsHash: string;
  dueDate: bigint;
  createdAt: bigint;
  paidAt: bigint;
  status: InvoiceStatus;
  kycRequired: boolean;
}

export interface KYCStatus {
  isVerified: boolean;
  verificationTime: bigint;
  identityCommitment: `0x${string}`;
  encryptedDataIPFS: string;
  expirationTime: bigint;
  level: KYCLevel;
}

export interface InvoiceFormData {
  payerAddress: string;
  amount: string;
  description: string;
  dueDate: string;
  kycRequired: boolean;
  items: InvoiceItem[];
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: string;
}

export interface KYCFormData {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  countryCode: string;
  documentType: "passport" | "driverLicense" | "nationalId";
  documentNumber: string;
  documentFile?: File;
}

export interface ZKProof {
  proof: {
    pi_a: string[];
    pi_b: string[][];
    pi_c: string[];
  };
  publicSignals: string[];
}

