import { useFormik } from "formik";
import * as Yup from "yup";
import { AlertCircle, Banknote } from "lucide-react";
import Btn from "@/components/ui/Btn";
import InputText from "@/components/ui/InputText";
import InputTextArea from "@/components/ui/InputTextArea";
import SelectInput from "@/components/ui/SelectInput";
import Lib from "@/utils/Lib";

/**
 * Record a plan payment collected outside the gateway.
 *
 * The amount defaults to the plan price for the level so an admin confirms
 * rather than types it, but it stays editable for a part payment settled by
 * agreement. Recording this does not issue the pin — the admin presses
 * Generate Pin afterwards, which this unblocks.
 */

const MODES = [
  { value: "CASH", label: "Cash" },
  { value: "UPI", label: "UPI" },
  { value: "BANK", label: "Bank transfer" },
  { value: "CHEQUE", label: "Cheque" },
];

const OfflinePaymentForm = ({
  request = {} as any,
  onAction = (values: any) => {},
  onCloseModal = () => {},
  loading = false,
  errors = {} as Record<string, string>,
}: any) => {
  const formik = useFormik({
    initialValues: {
      amount: request?.plan_amount ? String(request.plan_amount) : "",
      payment_mode: "CASH",
      reference: "",
      note: "",
    },
    validationSchema: Yup.object({
      amount: Yup.number()
        .typeError("Enter the amount collected")
        .required("Enter the amount collected")
        .min(1, "Amount must be at least 1"),
      payment_mode: Yup.string().required("Choose how it was paid"),
      reference: Yup.string().max(64, "Reference is too long"),
      note: Yup.string().max(255, "Note is too long"),
    }),
    onSubmit: (values) => onAction(values),
  });

  const { values, handleChange, handleSubmit, touched, errors: formErrors } = formik;
  const shown = (name: string) =>
    (touched as any)[name] ? (formErrors as any)[name] : errors[name];

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm">
        <div className="font-medium text-gray-900 mb-1">
          {request?.user?.first_name || request?.user?.username || "Promoter"}
          {request?.user?.mobile ? ` · ${request.user.mobile}` : ""}
        </div>
        <div className="text-gray-700">
          {request?.plan_product || "Plan product"} · Level {request?.level ?? "-"}
        </div>
        {request?.plan_amount ? (
          <div className="text-gray-700 mt-1">
            Plan price: <span className="font-semibold">₹{Lib.formatAmount(request.plan_amount)}</span>
          </div>
        ) : (
          <div className="flex items-start gap-1.5 mt-2 text-amber-700">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            No price is set for this level in Product Prices.
          </div>
        )}
      </div>

      <InputText
        label="Amount collected (₹)"
        name="amount"
        type="number"
        placeholder="0.00"
        value={values}
        onChange={handleChange}
        error={{ amount: shown("amount") }}
      />

      <SelectInput
        label="Paid by"
        name="payment_mode"
        options={MODES}
        placeholder="Choose..."
        value={values}
        onChange={handleChange}
        error={{ payment_mode: shown("payment_mode") }}
      />

      <InputText
        label="Reference (receipt no., UTR, cheque no.)"
        name="reference"
        placeholder="Optional"
        value={values}
        onChange={handleChange}
        error={{ reference: shown("reference") }}
      />

      <InputTextArea
        label="Note"
        name="note"
        placeholder="Where and when it was collected"
        value={values}
        onChange={handleChange}
        error={{ note: shown("note") }}
      />

      <div className="flex items-start gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-800">
        <Banknote className="w-4 h-4 mt-0.5 shrink-0" />
        This marks the request paid. Press <b className="mx-1">Generate Pin</b> afterwards to issue
        the pin.
      </div>

      <div className="flex justify-end space-x-3 pt-2">
        <button
          type="button"
          onClick={onCloseModal}
          className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          Cancel
        </button>
        <Btn title="Record payment" isLoading={loading} onClick={handleSubmit} />
      </div>
    </form>
  );
};

export default OfflinePaymentForm;
