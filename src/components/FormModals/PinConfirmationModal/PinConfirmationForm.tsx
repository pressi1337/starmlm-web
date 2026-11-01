import { useFormik } from "formik";
import { useMemo, useState } from "react";
import Btn from "@/components/ui/Btn";
import { useGetCall } from "@/hooks";
import { SERVICE } from "@/constants/services";
import { splitTermsByLanguage } from "@/utils/terms";

/**
 * The terms a promoter accepts before paying.
 *
 * The text is NOT held here — it is read from the admin-editable Terms &
 * Conditions record, so there is a single place to edit it.
 * `splitTermsByLanguage` cuts that one field into its Tamil and English halves
 * for the toggle. Accept stays disabled until the terms have loaded: nobody
 * should be able to agree to a document the app failed to show them.
 */
const PinConfirmationForm = ({
  data = {},
  onAction = (values: any) => {},
  onCloseModal = () => {},
  loading = false,
}: any) => {
  const [isTamil, setIsTamil] = useState(true);

  const { data: termsData, loading: termsLoading, fetchApi } = useGetCall(
    SERVICE.TERMS_AND_CONDITIONS
  );

  const terms = useMemo(
    () => splitTermsByLanguage(termsData?.data?.content),
    [termsData]
  );

  const body = isTamil ? terms.tamil : terms.english;
  const hasTerms = Boolean(body);

  const { handleSubmit } = useFormik({
    initialValues: {
      current_level: data?.level ?? "",
    },
    onSubmit: async (values: any) => {
      onAction(values);
    },
  });

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex justify-between items-center mb-2">
          <h4 className="font-medium text-blue-900">Terms &amp; Conditions</h4>
          {terms.hasBoth && (
            <button
              type="button"
              onClick={() => setIsTamil(!isTamil)}
              className="text-sm px-3 py-1 bg-red-100 hover:bg-red-200 border border-red-500 text-red-800 rounded transition-colors"
            >
              {isTamil ? "English" : "தமிழ்"}
            </button>
          )}
        </div>

        <div className="max-h-72 overflow-y-auto">
          {termsLoading && !hasTerms ? (
            <p className="text-sm text-blue-800 py-4">Loading terms…</p>
          ) : !hasTerms ? (
            <div className="py-3">
              <p className="text-sm text-blue-800">
                Could not load the Terms &amp; Conditions. Please check your connection and try
                again.
              </p>
              <button
                type="button"
                onClick={() => fetchApi()}
                className="mt-2 text-sm px-3 py-1 bg-white border border-blue-300 text-blue-800 rounded"
              >
                Retry
              </button>
            </div>
          ) : (
            <div
              className="text-sm text-blue-900 leading-relaxed [&_p]:mb-2 [&_strong]:font-semibold [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5"
              dangerouslySetInnerHTML={{ __html: terms.header + body }}
            />
          )}
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <Btn
          title={"Accept"}
          isLoading={loading}
          isDisable={!hasTerms}
          onClick={handleSubmit}
        />
      </div>
    </form>
  );
};

export default PinConfirmationForm;
