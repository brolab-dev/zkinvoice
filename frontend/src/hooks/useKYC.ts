"use client";

import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { ZK_KYC_REGISTRY_ABI } from "@/lib/contracts";
import { CONTRACT_ADDRESSES } from "@/lib/wagmi";
import { KYCStatus } from "@/types";

const zkKYCRegistryAddress = CONTRACT_ADDRESSES.mantleTestnet.zkKYCRegistry as `0x${string}`;

export function useSubmitKYC() {
  const { writeContractAsync, writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const submitKYC = async (identityCommitment: `0x${string}`, encryptedDataIPFS: string) => {
    console.log("Submitting KYC with commitment:", identityCommitment);
    console.log("Contract address:", zkKYCRegistryAddress);
    try {
      const txHash = await writeContractAsync({
        address: zkKYCRegistryAddress,
        abi: ZK_KYC_REGISTRY_ABI,
        functionName: "submitKYC",
        args: [identityCommitment, encryptedDataIPFS],
      });
      console.log("Transaction hash:", txHash);
      return txHash;
    } catch (err) {
      console.error("Submit KYC error:", err);
      throw err;
    }
  };

  return { submitKYC, hash, isPending, isConfirming, isSuccess, error };
}

export function useVerifyKYC() {
  const { writeContractAsync, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const verifyKYC = async (userAddress: `0x${string}`, level: number = 1, validityPeriod: bigint = BigInt(365 * 24 * 60 * 60)) => {
    console.log("Verifying KYC for:", userAddress);
    // Demo proof - in production this would be a real ZK proof
    const demoProof: [bigint, bigint, bigint, bigint, bigint, bigint, bigint, bigint] = [
      BigInt("12345678901234567890"),
      BigInt("12345678901234567890"),
      BigInt("12345678901234567890"),
      BigInt("12345678901234567890"),
      BigInt("12345678901234567890"),
      BigInt("12345678901234567890"),
      BigInt("12345678901234567890"),
      BigInt("12345678901234567890"),
    ];
    const publicInputs = [BigInt("1")]; // Demo public input

    try {
      const txHash = await writeContractAsync({
        address: zkKYCRegistryAddress,
        abi: ZK_KYC_REGISTRY_ABI,
        functionName: "verifyKYC",
        args: [userAddress, demoProof, publicInputs, level, validityPeriod],
        gas: BigInt(300000),
      });
      console.log("Verify TX hash:", txHash);
      return txHash;
    } catch (err) {
      console.error("Verify KYC error:", err);
      throw err;
    }
  };

  return { verifyKYC, hash, isPending, isConfirming, isSuccess, error };
}

export function useKYCValid(userAddress: `0x${string}` | undefined) {
  return useReadContract({
    address: zkKYCRegistryAddress,
    abi: ZK_KYC_REGISTRY_ABI,
    functionName: "isKYCValid",
    args: userAddress ? [userAddress] : undefined,
    query: { enabled: !!userAddress },
  });
}

export function useKYCLevel(userAddress: `0x${string}` | undefined) {
  return useReadContract({
    address: zkKYCRegistryAddress,
    abi: ZK_KYC_REGISTRY_ABI,
    functionName: "getKYCLevel",
    args: userAddress ? [userAddress] : undefined,
    query: { enabled: !!userAddress },
  });
}

export function useKYCStatus(userAddress: `0x${string}` | undefined) {
  return useReadContract({
    address: zkKYCRegistryAddress,
    abi: ZK_KYC_REGISTRY_ABI,
    functionName: "getKYCStatus",
    args: userAddress ? [userAddress] : undefined,
    query: { enabled: !!userAddress },
  });
}

