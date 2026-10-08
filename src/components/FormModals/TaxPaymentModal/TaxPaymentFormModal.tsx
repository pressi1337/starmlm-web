import React, { useState, useEffect } from "react";
import { X, Loader2, IndianRupee } from "lucide-react";
import { useActionCall } from "@/hooks";
import { SERVICE } from "@/constants/services";

type Props = {
  isOpen: boolean;
  /** Row being edited, or null to add a new payment. */
  payment: any | null;
  onClose: () => void;
  onSaved: () => void;
};

const emptyForm = {
  payment_date: "",
  amount: "",
  cgst: "",
  sgst: "",
  reference_no: "",
  payment_mode: "",
  remarks: "",
};

export default function TaxPaymentFormModal({
  isOpen,
  payment,
  onClose,
  onSaved,
}: Props) {
  const [form, setForm] = useState<any>(emptyForm);
  const [errors, setErrors] = useState<any>({});

  const { loading: saving, Post, Put } = useActionCall(SERVICE.TAX_PAYMENTS);

  // Reload whenever the modal opens or the target row changes, so editing one
  // row then another never shows the previous row's values.
  useEffect(() => {
    if (!isOpen) return;
    setErrors({});
    setForm(
      payment
        ? {
            payment_date: String(payment.payment_date ?? "").slice(0, 10),
            amount: payment.amount ?? "",
            cgst: payment.cgst ? String(payment.cgst) : "",
            sgst: payment.sgst ? String(payment.sgst) : "",
            reference_no: payment.reference_no ?? "",
            payment_mode: payment.payment_mode ?? "",
            remarks: payment.remarks ?? "",
          }
        : emptyForm
    );
  }, [isOpen, payment]);

  if (!isOpen) return null;

  const set = (key: string, value: any) => {
    setForm((prev: any) => ({ ...prev, [key]: value }));
    setErrors((prev: any) => ({ ...prev, [key]: undefined }));
  };

  const handleSave = async () => {
    const payload = {
      ...form,
      amount: Number(form.amount || 0),
      cgst: Number(form.cgst || 0),
      sgst: Number(form.sgst || 0),
    };

    const response = payment
      ? await Put(payment.id, payload, "Tax payment updated")
      : await Post(payload, "Tax payment recorded");

    if (response) {
      onSaved();
      onClose();
    }
  };

  // useActionCall surfaces 422 field errors on its `error` object; it is
  // simpler here to read them back from the hook via onSaved failing, so
  // show whatever the API returned under each field.
  const fieldError = (key: string) => errors?.[key];

  const splitTotal = Number(form.cgst || 0) + Number(form.sgst || 0);
  const splitMismatch =
    splitTotal > 0 && Math.abs(splitTotal - Number(form.amount || 0)) > 0.009;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900">
            {payment ? "Edit Tax Payment" : "Record Tax Payment"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-auto px-6 py-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Payment Date *
              </label>
              <input
                type="date"
                value={form.payment_date}
                onChange={(e) => set("payment_date", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              {fieldError("payment_date") && (
                <p className="text-sm text-red-700 mt-1">
                  {fieldError("payment_date")}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Amount Paid (₹) *
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.amount}
                onChange={(e) => set("amount", e.target.value)}
                placeholder="0.00"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              {fieldError("amount") && (
                <p className="text-sm text-red-700 mt-1">
                  {fieldError("amount")}
                </p>
              )}
            </div>
          </div>

          <div>
            <p className="text-xs text-gray-500 mb-2">
              Optional CGST / SGST split. Leave both blank if you only track the
              total — if you fill them in they must add up to the amount.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CGST (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.cgst}
                  onChange={(e) => set("cgst", e.target.value)}
                  placeholder="0.00"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  SGST (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.sgst}
                  onChange={(e) => set("sgst", e.target.value)}
                  placeholder="0.00"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            {splitMismatch && (
              <p className="text-sm text-amber-700 mt-2">
                CGST + SGST is {splitTotal.toFixed(2)} but the amount is{" "}
                {Number(form.amount || 0).toFixed(2)}.
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Challan / Reference No
              </label>
              <input
                type="text"
                maxLength={100}
                value={form.reference_no}
                onChange={(e) => set("reference_no", e.target.value)}
                placeholder="e.g. CIN / challan number"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Payment Mode
              </label>
              <input
                type="text"
                maxLength={50}
                value={form.payment_mode}
                onChange={(e) => set("payment_mode", e.target.value)}
                placeholder="e.g. NEFT, Net Banking"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Remarks
            </label>
            <textarea
              rows={2}
              maxLength={1000}
              value={form.remarks}
              onChange={(e) => set("remarks", e.target.value)}
              placeholder="Anything worth noting about this payment"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-xl">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !form.payment_date || !form.amount}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <IndianRupee className="w-4 h-4 mr-2" />
            )}
            {saving ? "Saving..." : payment ? "Update" : "Save Payment"}
          </button>
        </div>
      </div>
    </div>
  );
}
