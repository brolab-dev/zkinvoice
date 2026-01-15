"use client";

import { useAccount } from "wagmi";
import { useUserCreatedInvoices, useUserReceivedInvoices, useGetInvoice } from "@/hooks/useInvoice";
import { InvoiceStatus } from "@/types";
import { formatEther } from "viem";
import Link from "next/link";

const statusColors: Record<InvoiceStatus, string> = {
  [InvoiceStatus.Created]: "bg-gray-500",
  [InvoiceStatus.Sent]: "bg-blue-500",
  [InvoiceStatus.Paid]: "bg-green-500",
  [InvoiceStatus.Cancelled]: "bg-red-500",
  [InvoiceStatus.Overdue]: "bg-yellow-500",
};

const statusLabels: Record<InvoiceStatus, string> = {
  [InvoiceStatus.Created]: "Draft",
  [InvoiceStatus.Sent]: "Sent",
  [InvoiceStatus.Paid]: "Paid",
  [InvoiceStatus.Cancelled]: "Cancelled",
  [InvoiceStatus.Overdue]: "Overdue",
};

function InvoiceCard({ invoiceId }: { invoiceId: bigint }) {
  const { data: invoice } = useGetInvoice(invoiceId);

  if (!invoice) return null;

  const status = invoice.status as InvoiceStatus;

  return (
    <Link href={`/invoice/${invoiceId.toString()}`}>
      <div className="bg-gray-800 rounded-xl p-4 hover:bg-gray-750 transition-colors cursor-pointer border border-gray-700 hover:border-violet-500">
        <div className="flex justify-between items-start mb-3">
          <div>
            <p className="text-white font-medium">Invoice #{invoiceId.toString()}</p>
            <p className="text-gray-400 text-sm truncate max-w-xs">{invoice.description}</p>
          </div>
          <span className={`${statusColors[status]} text-white text-xs px-2 py-1 rounded-full`}>
            {statusLabels[status]}
          </span>
        </div>
        
        <div className="flex justify-between items-center text-sm">
          <div>
            <p className="text-gray-400">Amount</p>
            <p className="text-white font-semibold">{formatEther(invoice.amount)} MNT</p>
          </div>
          <div className="text-right">
            <p className="text-gray-400">Due Date</p>
            <p className="text-white">
              {new Date(Number(invoice.dueDate) * 1000).toLocaleDateString()}
            </p>
          </div>
        </div>
        
        {invoice.kycRequired && (
          <div className="mt-2 flex items-center text-xs text-violet-400">
            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            KYC Required
          </div>
        )}
      </div>
    </Link>
  );
}

export function InvoiceList({ type }: { type: "created" | "received" }) {
  const { address } = useAccount();
  const { data: createdInvoices } = useUserCreatedInvoices(address);
  const { data: receivedInvoices } = useUserReceivedInvoices(address);

  const invoices = type === "created" ? createdInvoices : receivedInvoices;

  if (!address) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">Please connect your wallet to view invoices.</p>
      </div>
    );
  }

  if (!invoices || invoices.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">
          No {type === "created" ? "created" : "received"} invoices yet.
        </p>
        {type === "created" && (
          <Link href="/invoice/create" className="text-violet-400 hover:text-violet-300 mt-2 inline-block">
            Create your first invoice →
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {invoices.map((id) => (
        <InvoiceCard key={id.toString()} invoiceId={id} />
      ))}
    </div>
  );
}

