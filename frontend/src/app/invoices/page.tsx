"use client";

import { useState } from "react";
import { InvoiceList } from "@/components/InvoiceList";

export default function InvoicesPage() {
  const [activeTab, setActiveTab] = useState<"created" | "received">("created");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">My Invoices</h1>
        <p className="text-gray-400 mt-1">View and manage all your invoices</p>
      </div>

      <div className="flex space-x-2 border-b border-gray-700">
        <button
          onClick={() => setActiveTab("created")}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === "created"
              ? "text-violet-400 border-b-2 border-violet-400"
              : "text-gray-400 hover:text-white"
          }`}
        >
          Created
        </button>
        <button
          onClick={() => setActiveTab("received")}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === "received"
              ? "text-violet-400 border-b-2 border-violet-400"
              : "text-gray-400 hover:text-white"
          }`}
        >
          Received
        </button>
      </div>

      <InvoiceList type={activeTab} />
    </div>
  );
}

