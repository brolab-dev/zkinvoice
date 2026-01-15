import { InvoiceForm } from "@/components/InvoiceForm";

export default function CreateInvoicePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Create Invoice</h1>
        <p className="text-gray-400 mt-1">Fill in the details to create a new invoice</p>
      </div>
      <InvoiceForm />
    </div>
  );
}

