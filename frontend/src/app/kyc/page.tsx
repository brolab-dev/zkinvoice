import { KYCForm } from "@/components/KYCForm";

export default function KYCPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">KYC Verification</h1>
        <p className="text-gray-400 mt-1">
          Verify your identity using zero-knowledge proofs. Your personal data remains private.
        </p>
      </div>

      <div className="bg-gradient-to-r from-violet-900/30 to-purple-900/30 rounded-xl p-6 border border-violet-500/30">
        <div className="flex items-start space-x-4">
          <div className="text-3xl">🔐</div>
          <div>
            <h3 className="text-white font-semibold mb-2">Privacy-First Verification</h3>
            <p className="text-gray-400 text-sm">
              Our ZK-KYC system allows you to prove your identity and compliance status without 
              revealing sensitive personal information. Your data is encrypted and stored on IPFS, 
              while only cryptographic proofs are used for verification.
            </p>
          </div>
        </div>
      </div>

      <KYCForm />
    </div>
  );
}

