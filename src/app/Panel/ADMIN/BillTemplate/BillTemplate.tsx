// @ts-nocheck
import { useEffect, useMemo, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { ReceiptText, Save } from "lucide-react";
import toast from "react-hot-toast";
import { useActionCall, useGetCall } from "@/hooks";
import { SERVICE } from "@/constants/services";
import InputText from "@/components/ui/InputText";
import Btn from "@/components/ui/Btn";
import Loader from "@/components/ui/Loader";

const SCHEMA = Yup.object().shape({
  company_name: Yup.string().trim().required("Company name is required*"),
  email: Yup.string().email("Enter a valid email").nullable(),
});

const FIELDS: Array<[string, string, string?]> = [
  ["company_name", "Company Name *", "Star Up World"],
  ["address_line1", "Address Line 1", "46 Raghuveer Dham"],
  ["address_line2", "Address Line 2", "Near City Mall"],
  ["city", "City", "Chennai"],
  ["state", "State", "Tamil Nadu"],
  ["pincode", "Pincode", "600001"],
  ["gstin", "GSTIN", "33ABCDE1234F1Z5"],
  ["pan", "PAN", "ABCDE1234F"],
  ["email", "Email", "care@company.com"],
  ["phone", "Phone", "9000000000"],
  ["invoice_prefix", "Invoice Prefix", "startup"],
  ["place_of_supply", "Place of Supply", "Tamil Nadu"],
  ["country_of_supply", "Country of Supply", "India"],
];

/**
 * Seller details for the plan-product invoice — the "Billed by" block, plus
 * the invoice number prefix.
 *
 * Single record: saving updates the one template every invoice renders from.
 * The buyer side comes from the user's own record and is not editable here.
 */
export default function BillTemplate() {
  const [serverError, setServerError] = useState<any>({});

  const { data, loading, fetchApi } = useGetCall(SERVICE.BILL_TEMPLATE);
  const {
    Post: saveTemplate,
    loading: saving,
    error: RequestError,
  } = useActionCall(SERVICE.BILL_TEMPLATE_UPSERT);

  const record = data?.data;

  const { values, errors, handleChange, handleSubmit, setValues, setErrors } =
    useFormik({
      initialValues: FIELDS.reduce(
        (acc, [name]) => ({ ...acc, [name]: "" }),
        { country_of_supply: "India" }
      ),
      validationSchema: SCHEMA,
      validateOnChange: false,
      enableReinitialize: false,
      onSubmit: async (formValues) => {
        const resp = await saveTemplate(formValues, "Bill template saved");
        if (resp) fetchApi({});
      },
    });

  // Pre-fill once the existing template arrives.
  useEffect(() => {
    if (!record) return;
    setValues(
      FIELDS.reduce(
        (acc, [name]) => ({ ...acc, [name]: record[name] ?? "" }),
        {}
      )
    );
  }, [record]);

  useMemo(() => {
    if (RequestError && Object.keys(RequestError).length) {
      setErrors(RequestError);
      setServerError(RequestError);
    }
  }, [RequestError]);

  const shown = { ...serverError, ...errors };

  if (loading) return <Loader />;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <ReceiptText className="w-7 h-7 text-blue-600" />
          Bill Template
        </h1>
        <p className="mt-2 text-gray-600">
          These details appear as <b>Billed by</b> on the invoice a user
          downloads after their plan product is delivered. Tax is fixed at 18%
          (9% CGST + 9% SGST) and isn't editable. Invoice numbers run as{" "}
          <b>prefix/financial-year/sequence</b> &mdash; e.g.{" "}
          <b>startup/26-27/001</b> &mdash; and the sequence restarts each April.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-sm rounded-xl border border-gray-200 p-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {FIELDS.map(([name, label, placeholder]) => (
            <InputText
              key={name}
              name={name}
              label={label}
              placeholder={placeholder}
              onChange={handleChange}
              value={values}
              error={shown}
            />
          ))}
        </div>

        <div className="flex justify-end pt-6">
          <Btn title="Save Template" isLoading={saving} onClick={handleSubmit} />
        </div>
      </form>

      {!record ? (
        <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          No template saved yet. Invoices will show blank company details until
          this is filled in.
        </p>
      ) : null}
    </div>
  );
}
