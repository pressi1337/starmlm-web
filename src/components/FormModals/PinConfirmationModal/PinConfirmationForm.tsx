import { useFormik } from "formik";
import Btn from "@/components/ui/Btn";

const PinConfirmationForm = ({
  data = {},
  onAction = (values: any) => {},
  onCloseModal = () => {},
  loading = false,
}: any) => {
  const { values, handleChange, handleSubmit } = useFormik({
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
            <h4 className="font-medium text-blue-900 mb-2">Important Notes:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Pin requests are reviewed by admin</li>
              <li>• Approval may take 1-3 business days</li>
              <li>• You'll be notified when your pin is ready</li>
              <li>• Activation requires additional information</li>
            </ul>
          </div>
      <div className="flex justify-end space-x-3 pt-4">
        {/* <Btn title="Cancel" onClick={onCloseModal} uiType="secondary" /> */}
        <Btn title={"Accept"} isLoading={loading} onClick={handleSubmit} />
      </div>
    </form>
  );
};

export default PinConfirmationForm;
