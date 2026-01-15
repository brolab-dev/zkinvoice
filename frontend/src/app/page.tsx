"use client";

import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import Link from "next/link";
import { useUserCreatedInvoices, useUserReceivedInvoices } from "@/hooks/useInvoice";
import { useKYCStatus } from "@/hooks/useKYC";
import { KYCLevel } from "@/types";

export default function Home() {
  const { address, isConnected } = useAccount();
  const { data: createdInvoices } = useUserCreatedInvoices(address);
  const { data: receivedInvoices } = useUserReceivedInvoices(address);
  const { data: kycStatus } = useKYCStatus(address);

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="w-20 h-20 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6">
          <span className="text-white font-bold text-3xl">ZK</span>
        </div>
        <h1 className="text-4xl font-bold text-white mb-4">Privacy-Preserving Invoicing</h1>
        <p className="text-gray-400 max-w-md mb-8">
          Create and manage invoices with zero-knowledge KYC verification.
          Your identity stays private while maintaining compliance.
        </p>
        <ConnectButton />

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl">
          <FeatureCard icon="📄" title="Invoice Management" description="Create, send, and track invoices with ease. Accept payments in MNT." />
          <FeatureCard icon="🔐" title="ZK-KYC Verification" description="Verify identity without revealing personal data using zero-knowledge proofs." />
          <FeatureCard icon="💸" title="Instant Payments" description="Receive payments directly to your wallet with minimal fees." />
        </div>
      </div>
    );
  }

  const kycLevel = kycStatus ? (kycStatus.level as KYCLevel) : KYCLevel.None;
  const isKYCVerified = kycStatus?.isVerified || false;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-gray-400 mt-1">Welcome back!</p>
        </div>
        <Link href="/invoice/create" className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white font-medium rounded-lg transition-colors">
          + Create Invoice
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="Created Invoices" value={createdInvoices?.length?.toString() || "0"} icon="📤" />
        <StatCard title="Received Invoices" value={receivedInvoices?.length?.toString() || "0"} icon="📥" />
        <StatCard title="KYC Status" value={isKYCVerified ? "Verified" : "Not Verified"} icon={isKYCVerified ? "✅" : "⚠️"} highlight={!isKYCVerified} />
        <StatCard title="KYC Level" value={["None", "Basic", "Advanced", "Full"][kycLevel]} icon="🛡️" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <QuickAction href="/invoice/create" label="Create New Invoice" icon="➕" />
            <QuickAction href="/invoices" label="View All Invoices" icon="📋" />
            <QuickAction href="/kyc" label="Manage KYC" icon="🔐" />
          </div>
        </div>
        <div className="bg-gray-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Network Info</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-gray-400">Network</span><span className="text-white">Mantle Sepolia Testnet</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Chain ID</span><span className="text-white">5003</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Connected Address</span><span className="text-white font-mono text-xs">{address?.slice(0, 6)}...{address?.slice(-4)}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="bg-gray-800/50 rounded-xl p-6 text-center">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-gray-400 text-sm">{description}</p>
    </div>
  );
}

function StatCard({ title, value, icon, highlight }: { title: string; value: string; icon: string; highlight?: boolean }) {
  return (
    <div className={`rounded-xl p-4 ${highlight ? "bg-yellow-500/10 border border-yellow-500/30" : "bg-gray-800"}`}>
      <div className="flex items-center justify-between">
        <span className="text-2xl">{icon}</span>
        <span className={`text-2xl font-bold ${highlight ? "text-yellow-400" : "text-white"}`}>{value}</span>
      </div>
      <p className="text-gray-400 text-sm mt-2">{title}</p>
    </div>
  );
}

function QuickAction({ href, label, icon }: { href: string; label: string; icon: string }) {
  return (
    <Link href={href} className="flex items-center space-x-3 p-3 rounded-lg bg-gray-700/50 hover:bg-gray-700 transition-colors">
      <span className="text-xl">{icon}</span>
      <span className="text-white">{label}</span>
    </Link>
  );
}
