"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { useCreateInvoice } from "@/hooks/useInvoice";
import { InvoiceFormData, InvoiceItem } from "@/types";
import { isAddress } from "viem";

export function InvoiceForm() {
  const { address } = useAccount();
  const { createInvoice, isPending, isConfirming, isSuccess, error } = useCreateInvoice();
  
  const [formData, setFormData] = useState<InvoiceFormData>({
    payerAddress: "",
    amount: "",
    description: "",
    dueDate: "",
    kycRequired: false,
    items: [{ description: "", quantity: 1, unitPrice: "" }],
  });

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { description: "", quantity: 1, unitPrice: "" }],
    });
  };

  const removeItem = (index: number) => {
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index),
    });
  };

  const updateItem = (index: number, field: keyof InvoiceItem, value: string | number) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setFormData({ ...formData, items: newItems });
  };

  const calculateTotal = () => {
    return formData.items.reduce((sum, item) => {
      return sum + item.quantity * parseFloat(item.unitPrice || "0");
    }, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAddress(formData.payerAddress)) {
      alert("Invalid payer address");
      return;
    }

    const dueTimestamp = BigInt(new Date(formData.dueDate).getTime() / 1000);
    const totalAmount = calculateTotal().toString();

    // TODO: Upload invoice details to IPFS and get hash
    const ipfsHash = "QmPlaceholderHash";

    await createInvoice(
      formData.payerAddress as `0x${string}`,
      totalAmount,
      formData.description,
      ipfsHash,
      dueTimestamp,
      formData.kycRequired
    );
  };

  if (!address) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">Please connect your wallet to create an invoice.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
      <div className="bg-gray-800 rounded-xl p-6 space-y-4">
        <h2 className="text-lg font-semibold text-white">Invoice Details</h2>
        
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Payer Address</label>
          <input
            type="text"
            value={formData.payerAddress}
            onChange={(e) => setFormData({ ...formData, payerAddress: e.target.value })}
            placeholder="0x..."
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-violet-500 focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-violet-500 focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Due Date</label>
          <input
            type="date"
            value={formData.dueDate}
            onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-violet-500 focus:border-transparent"
            required
          />
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="kycRequired"
            checked={formData.kycRequired}
            onChange={(e) => setFormData({ ...formData, kycRequired: e.target.checked })}
            className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-violet-600 focus:ring-violet-500"
          />
          <label htmlFor="kycRequired" className="text-sm text-gray-300">
            Require KYC verification from payer
          </label>
        </div>
      </div>

      <div className="bg-gray-800 rounded-xl p-6 space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold text-white">Line Items</h2>
          <button type="button" onClick={addItem} className="text-violet-400 hover:text-violet-300 text-sm font-medium">
            + Add Item
          </button>
        </div>

        {formData.items.map((item, index) => (
          <div key={index} className="grid grid-cols-12 gap-3 items-end">
            <div className="col-span-5">
              <label className="block text-xs text-gray-400 mb-1">Description</label>
              <input
                type="text" value={item.description} onChange={(e) => updateItem(index, "description", e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-xs text-gray-400 mb-1">Qty</label>
              <input
                type="number" value={item.quantity} onChange={(e) => updateItem(index, "quantity", parseInt(e.target.value))}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm"
              />
            </div>
            <div className="col-span-3">
              <label className="block text-xs text-gray-400 mb-1">Unit Price (MNT)</label>
              <input
                type="text" value={item.unitPrice} onChange={(e) => updateItem(index, "unitPrice", e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm"
              />
            </div>
            <div className="col-span-2">
              {formData.items.length > 1 && (
                <button type="button" onClick={() => removeItem(index)} className="text-red-400 hover:text-red-300 text-sm">
                  Remove
                </button>
              )}
            </div>
          </div>
        ))}

        <div className="border-t border-gray-700 pt-4 flex justify-end">
          <div className="text-right">
            <span className="text-gray-400 text-sm">Total: </span>
            <span className="text-white font-bold text-lg">{calculateTotal().toFixed(4)} MNT</span>
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={isPending || isConfirming}
        className="w-full py-3 px-4 bg-violet-600 hover:bg-violet-700 disabled:bg-gray-600 text-white font-medium rounded-lg transition-colors"
      >
        {isPending ? "Confirming..." : isConfirming ? "Creating..." : "Create Invoice"}
      </button>

      {isSuccess && <p className="text-green-400 text-center">Invoice created successfully!</p>}
      {error && <p className="text-red-400 text-center">Error: {error.message}</p>}
    </form>
  );
}

