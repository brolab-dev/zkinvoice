"use client";

import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseEther } from "viem";
import { INVOICE_MANAGER_ABI } from "@/lib/contracts";
import { CONTRACT_ADDRESSES, mantleTestnet } from "@/lib/wagmi";
import { Invoice } from "@/types";

const invoiceManagerAddress = CONTRACT_ADDRESSES.mantleTestnet.invoiceManager as `0x${string}`;

export function useCreateInvoice() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const createInvoice = async (
    payerAddress: `0x${string}`,
    amount: string,
    description: string,
    ipfsHash: string,
    dueDate: bigint,
    kycRequired: boolean
  ) => {
    writeContract({
      address: invoiceManagerAddress,
      abi: INVOICE_MANAGER_ABI,
      functionName: "createInvoice",
      args: [payerAddress, parseEther(amount), description, ipfsHash, dueDate, kycRequired],
    });
  };

  return { createInvoice, hash, isPending, isConfirming, isSuccess, error };
}

export function usePayInvoice() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const payInvoice = async (invoiceId: bigint, amount: bigint) => {
    writeContract({
      address: invoiceManagerAddress,
      abi: INVOICE_MANAGER_ABI,
      functionName: "payInvoice",
      args: [invoiceId],
      value: amount,
    });
  };

  return { payInvoice, hash, isPending, isConfirming, isSuccess, error };
}

export function useSendInvoice() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const sendInvoice = async (invoiceId: bigint) => {
    writeContract({
      address: invoiceManagerAddress,
      abi: INVOICE_MANAGER_ABI,
      functionName: "sendInvoice",
      args: [invoiceId],
    });
  };

  return { sendInvoice, hash, isPending, isConfirming, isSuccess, error };
}

export function useCancelInvoice() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const cancelInvoice = async (invoiceId: bigint) => {
    writeContract({
      address: invoiceManagerAddress,
      abi: INVOICE_MANAGER_ABI,
      functionName: "cancelInvoice",
      args: [invoiceId],
    });
  };

  return { cancelInvoice, hash, isPending, isConfirming, isSuccess, error };
}

export function useGetInvoice(invoiceId: bigint) {
  return useReadContract({
    address: invoiceManagerAddress,
    abi: INVOICE_MANAGER_ABI,
    functionName: "getInvoice",
    args: [invoiceId],
  });
}

export function useUserCreatedInvoices(userAddress: `0x${string}` | undefined) {
  return useReadContract({
    address: invoiceManagerAddress,
    abi: INVOICE_MANAGER_ABI,
    functionName: "getUserCreatedInvoices",
    args: userAddress ? [userAddress] : undefined,
    query: { enabled: !!userAddress },
  });
}

export function useUserReceivedInvoices(userAddress: `0x${string}` | undefined) {
  return useReadContract({
    address: invoiceManagerAddress,
    abi: INVOICE_MANAGER_ABI,
    functionName: "getUserReceivedInvoices",
    args: userAddress ? [userAddress] : undefined,
    query: { enabled: !!userAddress },
  });
}

