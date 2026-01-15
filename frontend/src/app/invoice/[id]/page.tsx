"use client";

import { useParams } from "next/navigation";
import { useAccount } from "wagmi";
import { useGetInvoice, usePayInvoice, useSendInvoice, useCancelInvoice } from "@/hooks/useInvoice";
import { useKYCValid } from "@/hooks/useKYC";
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

export default function InvoiceDetailPage() {
  const params = useParams();
  const invoiceId = BigInt(params.id as string);
  const { address } = useAccount();
  
  const { data: invoice, isLoading } = useGetInvoice(invoiceId);
  const { data: isPayerKYCValid } = useKYCValid(invoice?.payer);
  const { payInvoice, isPending: isPayPending } = usePayInvoice();
  const { sendInvoice, isPending: isSendPending } = useSendInvoice();
  const { cancelInvoice, isPending: isCancelPending } = useCancelInvoice();

  if (isLoading) {
    return <div className="text-center py-12 text-gray-400">Loading invoice...</div>;
  }

  if (!invoice) {
    return <div className="text-center py-12 text-gray-400">Invoice not found</div>;
  }

  const isCreator = address?.toLowerCase() === invoice.creator.toLowerCase();
  const isPayer = address?.toLowerCase() === invoice.payer.toLowerCase();
  const status = invoice.status as InvoiceStatus;
  const canPay = (status === InvoiceStatus.Sent || status === InvoiceStatus.Created) && isPayer;
  const canSend = status === InvoiceStatus.Created && isCreator;
  const canCancel = status !== InvoiceStatus.Paid && isCreator;

  const handlePay = async () => {
    if (invoice.kycRequired && !isPayerKYCValid) {
      alert("KYC verification required before payment");
      return;
    }
    await payInvoice(invoiceId, invoice.amount);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/invoices" className="text-gray-400 hover:text-white flex items-center">
          ← Back to Invoices
        </Link>
        <span className={`${statusColors[status]} text-white text-sm px-3 py-1 rounded-full`}>
          {statusLabels[status]}
        </span>
      </div>

      <div className="bg-gray-800 rounded-xl p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Invoice #{invoiceId.toString()}</h1>
            <p className="text-gray-400 mt-1">{invoice.description}</p>
          </div>
          <div className="text-right">
            <p className="text-gray-400 text-sm">Amount</p>
            <p className="text-3xl font-bold text-white">{formatEther(invoice.amount)} MNT</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 py-6 border-t border-b border-gray-700">
          <div>
            <p className="text-gray-400 text-sm">From</p>
            <p className="text-white font-mono text-sm">{invoice.creator}</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">To</p>
            <p className="text-white font-mono text-sm">{invoice.payer}</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">Created</p>
            <p className="text-white">{new Date(Number(invoice.createdAt) * 1000).toLocaleDateString()}</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">Due Date</p>
            <p className="text-white">{new Date(Number(invoice.dueDate) * 1000).toLocaleDateString()}</p>
          </div>
        </div>

        {invoice.kycRequired && (
          <div className="mt-4 p-4 bg-violet-900/30 rounded-lg border border-violet-500/30">
            <div className="flex items-center space-x-2">
              <span className="text-violet-400">🔐</span>
              <span className="text-violet-300 font-medium">KYC Required</span>
            </div>
            {isPayer && !isPayerKYCValid && (
              <p className="text-sm text-violet-400 mt-2">
                You need to complete KYC verification before paying this invoice.{" "}
                <Link href="/kyc" className="underline">Complete KYC →</Link>
              </p>
            )}
          </div>
        )}

        {status === InvoiceStatus.Paid && (
          <div className="mt-4 p-4 bg-green-900/30 rounded-lg border border-green-500/30">
            <div className="flex items-center space-x-2">
              <span className="text-green-400">✓</span>
              <span className="text-green-300 font-medium">Paid</span>
            </div>
            <p className="text-sm text-green-400 mt-1">
              Paid on {new Date(Number(invoice.paidAt) * 1000).toLocaleString()}
            </p>
          </div>
        )}
      </div>

      <div className="flex space-x-4">
        {canSend && (
          <button onClick={() => sendInvoice(invoiceId)} disabled={isSendPending}
            className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-medium rounded-lg">
            {isSendPending ? "Sending..." : "Send Invoice"}
          </button>
        )}
        {canPay && (
          <button onClick={handlePay} disabled={isPayPending || (invoice.kycRequired && !isPayerKYCValid)}
            className="flex-1 py-3 bg-violet-600 hover:bg-violet-700 disabled:bg-gray-600 text-white font-medium rounded-lg">
            {isPayPending ? "Processing..." : `Pay ${formatEther(invoice.amount)} MNT`}
          </button>
        )}
        {canCancel && (
          <button onClick={() => cancelInvoice(invoiceId)} disabled={isCancelPending}
            className="px-6 py-3 bg-red-600/20 hover:bg-red-600/30 text-red-400 font-medium rounded-lg border border-red-500/30">
            {isCancelPending ? "Cancelling..." : "Cancel"}
          </button>
        )}
      </div>
    </div>
  );
}

