import { useMemo, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Truck, Hand } from "lucide-react";
import Modal from "@/components/ui/Modal";
import InputText from "@/components/ui/InputText";
import Btn from "@/components/ui/Btn";

export const DISPATCH_DIRECT = 1;
export const DISPATCH_COURIER = 2;

/**
 * Mirrors the server rules in BoxRequestController::markSent — each branch's
 * fields are required only for that branch, so choosing Courier can't be saved
 * without tracking details and choosing Direct can't be saved without a date.
 */
const SCHEMA = Yup.object().shape({
  dispatch_method: Yup.number().required("Choose Direct or Courier"),
  // Priced here because this is when the admin knows what actually shipped;
  // the invoice the user downloads after delivery is built from these.
  rate_per_qty: Yup.number()
    .typeError("Enter a number")
    .min(0, "Cannot be negative")
    .required("Rate per quantity is required*"),
  mrp: Yup.number()
    .typeError("Enter a number")
    .min(0, "Cannot be negative")
    .required("MRP is required*"),
  collected_date: Yup.string().when("dispatch_method", {
    is: DISPATCH_DIRECT,
    then: (s) => s.required("Collected date is required*"),
    otherwise: (s) => s.notRequired(),
  }),
  courier_name: Yup.string().when("dispatch_method", {
    is: DISPATCH_COURIER,
    then: (s) => s.trim().required("Courier name is required*"),
    otherwise: (s) => s.notRequired(),
  }),
  courier_number: Yup.string().when("dispatch_method", {
    is: DISPATCH_COURIER,
    then: (s) => s.trim().required("Courier number is required*"),
    otherwise: (s) => s.notRequired(),
  }),
});

const MethodCard = ({
  active,
  Icon,
  title,
  subtitle,
  onClick,
}: any) => (
  <button
    type="button"
    onClick={onClick}
    className={`flex-1 text-left rounded-xl border-2 p-3 transition-colors ${
      active
        ? "border-blue-600 bg-blue-50"
        : "border-gray-200 hover:border-gray-300"
    }`}
  >
    <span className="flex items-center gap-2">
      <Icon className={`w-4 h-4 ${active ? "text-blue-600" : "text-gray-400"}`} />
      <span
        className={`text-sm font-semibold ${
          active ? "text-blue-800" : "text-gray-700"
        }`}
      >
        {title}
      </span>
    </span>
    <span className="mt-1 block text-xs text-gray-500">{subtitle}</span>
  </button>
);

/**
 * Captures HOW a plan-product batch was dispatched, at the moment the admin
 * marks it Sent. The details are shown back to the user on their own screen,
 * so they can see when they collected it or chase the courier.
 */
export default function MarkSentModal({
  row,
  productName = "",
  isResend = false,
  loading = false,
  onSubmit = (_values: any) => {},
  onClose = () => {},
  RequestError = {},
}: any) {
  const [serverError, setServerError] = useState<any>({});

  const { values, errors, handleChange, handleSubmit, setFieldValue, setErrors } =
    useFormik({
      initialValues: {
        dispatch_method: DISPATCH_DIRECT,
        collected_date: "",
        courier_name: "",
        courier_number: "",
        rate_per_qty: "",
        mrp: "",
      },
      validationSchema: SCHEMA,
      validateOnChange: false,
      validateOnBlur: false,
      onSubmit: (formValues: any) => {
        // Send only the fields for the chosen method — the server ignores the
        // rest, but this keeps the payload honest about what was entered.
        const isDirect = Number(formValues.dispatch_method) === DISPATCH_DIRECT;
        onSubmit({
          id: row?.id,
          dispatch_method: Number(formValues.dispatch_method),
          // Pricing applies to both methods.
          rate_per_qty: Number(formValues.rate_per_qty),
          mrp: Number(formValues.mrp),
          ...(isDirect
            ? { collected_date: formValues.collected_date }
            : {
                courier_name: formValues.courier_name,
                courier_number: formValues.courier_number,
              }),
        });
      },
    });

  // Surface 422 field errors from the server alongside the local ones.
  useMemo(() => {
    if (RequestError && Object.keys(RequestError).length) {
      setErrors(RequestError);
      setServerError(RequestError);
    }
  }, [RequestError]);

  const isDirect = Number(values.dispatch_method) === DISPATCH_DIRECT;
  const shown = { ...serverError, ...errors };

  // Mirrors InvoiceBuilder on the server: qty x rate is taxable, then 9% CGST
  // + 9% SGST on top. Preview only — the invoice itself is computed server-side.
  const taxable = Number(row?.quantity ?? 0) * Number(values.rate_per_qty || 0);
  const gstHalf = taxable * 0.09;
  const invoiceTotal = taxable + gstHalf * 2;

  const pick = (method: number) => {
    setFieldValue("dispatch_method", method);
    // Clear the other branch so a half-filled switch can't be submitted.
    if (method === DISPATCH_DIRECT) {
      setFieldValue("courier_name", "");
      setFieldValue("courier_number", "");
    } else {
      setFieldValue("collected_date", "");
    }
    setErrors({});
    setServerError({});
  };

  return (
    <Modal
      title={isResend ? "Send again" : "Mark as sent"}
      modalSize="md"
      onClose={onClose}
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        <p className="text-sm text-gray-600">
          {isResend ? "Re-dispatching" : "Dispatching"}{" "}
          <b>
            {row?.quantity} {productName}
          </b>{" "}
          to <b>{row?.user?.username ?? "this user"}</b>. Record how it was sent
          — the user will see this on their screen.
        </p>

        {isResend ? (
          <p className="rounded-lg bg-red-50 border border-red-100 px-3 py-2 text-xs text-red-700">
            The user reported this batch as not received
            {row?.not_received_at_formatted
              ? ` on ${row.not_received_at_formatted}`
              : ""}
            . Sending again moves it back to Sent.
          </p>
        ) : null}

        <div className="grid grid-cols-2 gap-3">
          <InputText
            type="number"
            name="rate_per_qty"
            label="Rate per qty (₹) *"
            placeholder="e.g. 1000"
            onChange={handleChange}
            value={values}
            error={shown}
          />
          <InputText
            type="number"
            name="mrp"
            label="MRP (₹) *"
            placeholder="e.g. 1200"
            onChange={handleChange}
            value={values}
            error={shown}
          />
        </div>

        {/* Live preview so the admin sees the invoice total before saving. */}
        {Number(values.rate_per_qty) > 0 ? (
          <div className="rounded-lg bg-gray-50 border border-gray-200 px-3 py-2 text-xs text-gray-700">
            {row?.quantity} x ₹{Number(values.rate_per_qty).toFixed(2)} = ₹
            {taxable.toFixed(2)} taxable &middot; GST 18% (CGST ₹
            {gstHalf.toFixed(2)} + SGST ₹{gstHalf.toFixed(2)}) &middot;{" "}
            <b>Invoice total ₹{invoiceTotal.toFixed(2)}</b>
          </div>
        ) : null}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            How was it sent? *
          </label>
          <div className="flex gap-3">
            <MethodCard
              active={isDirect}
              Icon={Hand}
              title="Direct"
              subtitle="Handed over / collected in person"
              onClick={() => pick(DISPATCH_DIRECT)}
            />
            <MethodCard
              active={!isDirect}
              Icon={Truck}
              title="Courier"
              subtitle="Sent through a courier service"
              onClick={() => pick(DISPATCH_COURIER)}
            />
          </div>
        </div>

        {isDirect ? (
          <InputText
            type="date"
            name="collected_date"
            label="Collected date *"
            onChange={handleChange}
            value={values}
            error={shown}
          />
        ) : (
          <>
            <InputText
              name="courier_name"
              label="Courier name *"
              placeholder="e.g. DTDC, Blue Dart, India Post"
              onChange={handleChange}
              value={values}
              error={shown}
            />
            <InputText
              name="courier_number"
              label="Courier / tracking number *"
              placeholder="e.g. DT1234567890"
              onChange={handleChange}
              value={values}
              error={shown}
            />
          </>
        )}

        <div className="flex justify-end space-x-3 pt-2">
          <Btn title="Cancel" onClick={onClose} uiType="secondary" />
          <Btn
            title={isResend ? "Send again" : "Mark as sent"}
            isLoading={loading}
            onClick={handleSubmit}
          />
        </div>
      </form>
    </Modal>
  );
}
