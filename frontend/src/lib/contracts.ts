// ABI for InvoiceManager contract
export const INVOICE_MANAGER_ABI = [
  {
    inputs: [],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [
      { internalType: "address", name: "_payer", type: "address" },
      { internalType: "uint256", name: "_amount", type: "uint256" },
      { internalType: "string", name: "_description", type: "string" },
      { internalType: "string", name: "_ipfsHash", type: "string" },
      { internalType: "uint256", name: "_dueDate", type: "uint256" },
      { internalType: "bool", name: "_kycRequired", type: "bool" },
    ],
    name: "createInvoice",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "_invoiceId", type: "uint256" }],
    name: "sendInvoice",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "_invoiceId", type: "uint256" }],
    name: "payInvoice",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "_invoiceId", type: "uint256" }],
    name: "cancelInvoice",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "_invoiceId", type: "uint256" }],
    name: "getInvoice",
    outputs: [
      {
        components: [
          { internalType: "uint256", name: "id", type: "uint256" },
          { internalType: "address", name: "creator", type: "address" },
          { internalType: "address", name: "payer", type: "address" },
          { internalType: "uint256", name: "amount", type: "uint256" },
          { internalType: "string", name: "description", type: "string" },
          { internalType: "string", name: "ipfsHash", type: "string" },
          { internalType: "uint256", name: "dueDate", type: "uint256" },
          { internalType: "uint256", name: "createdAt", type: "uint256" },
          { internalType: "uint256", name: "paidAt", type: "uint256" },
          { internalType: "uint8", name: "status", type: "uint8" },
          { internalType: "bool", name: "kycRequired", type: "bool" },
        ],
        internalType: "struct InvoiceManager.Invoice",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "_user", type: "address" }],
    name: "getUserCreatedInvoices",
    outputs: [{ internalType: "uint256[]", name: "", type: "uint256[]" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "_user", type: "address" }],
    name: "getUserReceivedInvoices",
    outputs: [{ internalType: "uint256[]", name: "", type: "uint256[]" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "invoiceCounter",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
] as const;

// ABI for ZKKYCRegistry contract
export const ZK_KYC_REGISTRY_ABI = [
  {
    inputs: [],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [
      { internalType: "bytes32", name: "_identityCommitment", type: "bytes32" },
      { internalType: "string", name: "_encryptedDataIPFS", type: "string" },
    ],
    name: "submitKYC",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "_user", type: "address" },
      { internalType: "uint256[8]", name: "_proof", type: "uint256[8]" },
      { internalType: "uint256[]", name: "_publicInputs", type: "uint256[]" },
      { internalType: "uint8", name: "_level", type: "uint8" },
      { internalType: "uint256", name: "_validityPeriod", type: "uint256" },
    ],
    name: "verifyKYC",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "_user", type: "address" }],
    name: "isKYCValid",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "_user", type: "address" }],
    name: "getKYCLevel",
    outputs: [{ internalType: "uint8", name: "", type: "uint8" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "_user", type: "address" }],
    name: "getKYCStatus",
    outputs: [
      {
        components: [
          { internalType: "bool", name: "isVerified", type: "bool" },
          { internalType: "uint256", name: "verificationTime", type: "uint256" },
          { internalType: "bytes32", name: "identityCommitment", type: "bytes32" },
          { internalType: "string", name: "encryptedDataIPFS", type: "string" },
          { internalType: "uint256", name: "expirationTime", type: "uint256" },
          { internalType: "uint8", name: "level", type: "uint8" },
        ],
        internalType: "struct ZKKYCRegistry.KYCStatus",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const;

// Deployed Contract Addresses (Mantle Sepolia Testnet)
export const CONTRACT_ADDRESSES = {
  INVOICE_MANAGER: process.env.NEXT_PUBLIC_INVOICE_MANAGER_ADDRESS || "0x06e56a9A77a226733e6122a5254d87F7485BD7C1",
  ZK_KYC_REGISTRY: process.env.NEXT_PUBLIC_ZK_KYC_REGISTRY_ADDRESS || "0x66945d47d4f2b582E6dEc601d4f7E3ebd50d7230",
  KYC_VERIFIER: process.env.NEXT_PUBLIC_KYC_VERIFIER_ADDRESS || "0x4ee40b8851e87294712Ff498d2eccb481004BA09",
} as const;
