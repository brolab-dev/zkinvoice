import axios from "axios";

const PINATA_API_URL = "https://api.pinata.cloud";

interface PinataResponse {
  IpfsHash: string;
  PinSize: number;
  Timestamp: string;
}

export async function uploadToIPFS(
  data: object | File,
  apiKey: string,
  secretKey: string
): Promise<string> {
  const headers = {
    pinata_api_key: apiKey,
    pinata_secret_api_key: secretKey,
  };

  if (data instanceof File) {
    const formData = new FormData();
    formData.append("file", data);

    const response = await axios.post<PinataResponse>(
      `${PINATA_API_URL}/pinning/pinFileToIPFS`,
      formData,
      { headers: { ...headers, "Content-Type": "multipart/form-data" } }
    );

    return response.data.IpfsHash;
  } else {
    const response = await axios.post<PinataResponse>(
      `${PINATA_API_URL}/pinning/pinJSONToIPFS`,
      data,
      { headers }
    );

    return response.data.IpfsHash;
  }
}

export async function fetchFromIPFS(hash: string): Promise<unknown> {
  const response = await axios.get(`https://gateway.pinata.cloud/ipfs/${hash}`);
  return response.data;
}

export function getIPFSUrl(hash: string): string {
  return `https://gateway.pinata.cloud/ipfs/${hash}`;
}

// Encrypt data before uploading to IPFS
export async function encryptData(data: string, publicKey: string): Promise<string> {
  // In production, use a proper encryption library like tweetnacl or eth-crypto
  // This is a simplified placeholder
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  
  // For demo, we'll use a simple base64 encoding
  // In production, implement proper asymmetric encryption
  const encrypted = btoa(String.fromCharCode(...dataBuffer));
  return encrypted;
}

// Decrypt data fetched from IPFS
export async function decryptData(encryptedData: string, privateKey: string): Promise<string> {
  // In production, use the corresponding decryption method
  // This is a simplified placeholder
  const decrypted = atob(encryptedData);
  return decrypted;
}

// Upload encrypted invoice details to IPFS
export async function uploadInvoiceToIPFS(
  invoiceData: {
    items: Array<{ description: string; quantity: number; unitPrice: string }>;
    notes?: string;
    terms?: string;
    attachments?: string[];
  },
  apiKey: string,
  secretKey: string
): Promise<string> {
  const dataToUpload = {
    ...invoiceData,
    timestamp: Date.now(),
    version: "1.0",
  };

  return uploadToIPFS(dataToUpload, apiKey, secretKey);
}

// Upload encrypted KYC data to IPFS
export async function uploadKYCToIPFS(
  kycData: {
    encryptedPersonalInfo: string;
    documentHashes: string[];
  },
  apiKey: string,
  secretKey: string
): Promise<string> {
  const dataToUpload = {
    ...kycData,
    timestamp: Date.now(),
    version: "1.0",
  };

  return uploadToIPFS(dataToUpload, apiKey, secretKey);
}

