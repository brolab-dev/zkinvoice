"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { useSubmitKYC, useVerifyKYC, useKYCStatus } from "@/hooks/useKYC";
import { KYCFormData, KYCLevel } from "@/types";
import { generateIdentityCommitment } from "@/lib/zkProof";
import { COUNTRY_CODES } from "@/lib/zkProof";

const kycLevelLabels: Record<KYCLevel, string> = {
  [KYCLevel.None]: "Not Verified",
  [KYCLevel.Basic]: "Basic",
  [KYCLevel.Advanced]: "Advanced",
  [KYCLevel.Full]: "Full",
};

export function KYCForm() {
  const { address } = useAccount();
  const { submitKYC, isPending, isConfirming, isSuccess, error } = useSubmitKYC();
  const { verifyKYC, isPending: isVerifyPending, isConfirming: isVerifyConfirming, isSuccess: isVerifySuccess, error: verifyError } = useVerifyKYC();
  const { data: kycStatus, refetch: refetchKYCStatus } = useKYCStatus(address);

  const [formData, setFormData] = useState<KYCFormData>({
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    countryCode: "US",
    documentType: "passport",
    documentNumber: "",
  });
  const [isGenerating, setIsGenerating] = useState(false);

  // Check if KYC has been submitted (identityCommitment is not zero)
  const identityCommitment = kycStatus?.identityCommitment;
  const hasSubmittedKYC = identityCommitment &&
    identityCommitment !== "0x0000000000000000000000000000000000000000000000000000000000000000" &&
    BigInt(identityCommitment) !== BigInt(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);

    try {
      // Generate identity commitment using ZK-friendly hash
      const commitment = await generateIdentityCommitment(formData);
      const commitmentHex = `0x${commitment.toString(16).padStart(64, "0")}` as `0x${string}`;

      // TODO: Encrypt and upload KYC data to IPFS
      const ipfsHash = "QmPlaceholderKYCHash";

      await submitKYC(commitmentHex, ipfsHash);
    } catch (err) {
      console.error("Error generating commitment:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  if (!address) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">Please connect your wallet to submit KYC.</p>
      </div>
    );
  }

  const currentLevel = kycStatus ? (kycStatus.level as KYCLevel) : KYCLevel.None;
  const isVerified = kycStatus?.isVerified || false;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Current Status */}
      <div className="bg-gray-800 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">KYC Status</h2>
        <div className="flex items-center space-x-4">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
            isVerified ? "bg-green-500/20 text-green-400" : "bg-gray-600/20 text-gray-400"
          }`}>
            {isVerified ? (
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            )}
          </div>
          <div>
            <p className={`font-medium ${isVerified ? "text-green-400" : "text-gray-300"}`}>
              {isVerified ? "Verified" : "Not Verified"}
            </p>
            <p className="text-sm text-gray-400">
              Level: {kycLevelLabels[currentLevel]}
            </p>
          </div>
        </div>
      </div>

      {/* KYC Form */}
      <form onSubmit={handleSubmit} className="bg-gray-800 rounded-xl p-6 space-y-4">
        <h2 className="text-lg font-semibold text-white">Submit KYC Information</h2>
        <p className="text-sm text-gray-400">
          Your personal information will be encrypted and stored securely. Only zero-knowledge proofs
          will be used to verify your identity without revealing sensitive data.
        </p>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">First Name</label>
            <input
              type="text" value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white" required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Last Name</label>
            <input
              type="text" value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white" required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Date of Birth</label>
            <input
              type="date" value={formData.dateOfBirth} onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white" required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Country</label>
            <select
              value={formData.countryCode} onChange={(e) => setFormData({ ...formData, countryCode: e.target.value })}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
            >
              {Object.keys(COUNTRY_CODES).map((code) => (
                <option key={code} value={code}>{code}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Document Type</label>
            <select
              value={formData.documentType} onChange={(e) => setFormData({ ...formData, documentType: e.target.value as KYCFormData["documentType"] })}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
            >
              <option value="passport">Passport</option>
              <option value="driverLicense">Driver&apos;s License</option>
              <option value="nationalId">National ID</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Document Number</label>
            <input
              type="text" value={formData.documentNumber} onChange={(e) => setFormData({ ...formData, documentNumber: e.target.value })}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white" required
            />
          </div>
        </div>

        <button
          type="submit" disabled={isPending || isConfirming || isGenerating}
          className="w-full py-3 px-4 bg-violet-600 hover:bg-violet-700 disabled:bg-gray-600 text-white font-medium rounded-lg transition-colors"
        >
          {isGenerating ? "Generating Commitment..." : isPending ? "Confirming..." : isConfirming ? "Submitting..." : "Submit KYC"}
        </button>

        {isSuccess && <p className="text-green-400 text-center">KYC submitted successfully! Now click &quot;Verify KYC&quot; below.</p>}
        {error && <p className="text-red-400 text-center">Error: {error.message}</p>}
      </form>

      {/* Verify KYC Button - Show when not verified */}
      {!isVerified && (
        <div className="bg-gray-800 rounded-xl p-6 space-y-4">
          <h2 className="text-lg font-semibold text-white">Verify Your KYC</h2>
          <p className="text-sm text-gray-400">
            {hasSubmittedKYC
              ? "Your KYC data has been submitted. As the contract owner, you can verify your own KYC for testing purposes."
              : "Submit your KYC data first, then verify it using the button below (owner only)."}
          </p>
          <div className="text-xs text-gray-500 mb-2">
            Debug: hasSubmittedKYC={String(hasSubmittedKYC)}, commitment={identityCommitment ? String(identityCommitment).slice(0, 20) + "..." : "none"}
          </div>
          <button
            onClick={async () => {
              if (address) {
                await verifyKYC(address as `0x${string}`, 1);
                setTimeout(() => refetchKYCStatus(), 3000);
              }
            }}
            disabled={isVerifyPending || isVerifyConfirming}
            className="w-full py-3 px-4 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white font-medium rounded-lg transition-colors"
          >
            {isVerifyPending ? "Confirming..." : isVerifyConfirming ? "Verifying..." : "Verify KYC (Owner Only)"}
          </button>
          {isVerifySuccess && <p className="text-green-400 text-center">KYC verified successfully!</p>}
          {verifyError && <p className="text-red-400 text-center">Error: {verifyError.message}</p>}
        </div>
      )}
    </div>
  );
}

