import * as Yup from "yup";
import { useFormik } from "formik";
import { useMemo, useState } from "react";
import InputText from "@/components/ui/InputText";
import InputTextArea from "@/components/ui/InputTextArea";
import Btn from "@/components/ui/Btn";
import FileUpload from "@/components/FileUpload";

const VALIDATION_SCHEMA = Yup.object().shape({
  title: Yup.string().required("Title is required*"),
  file_path: Yup.string().required("Please upload a document*"),
});

type Props = {
  data?: any;
  onAction?: (values: any) => void;
  onCloseModal?: () => void;
  loading?: boolean;
  RequestError?: any;
  isSuperAdmin?: boolean;
};

const PersonalDocumentForm = ({
  data = {},
  onAction = () => {},
  onCloseModal = () => {},
  loading = false,
  RequestError = {},
  isSuperAdmin = false,
}: Props) => {
  const isEdit = !!data?.id;
  const [uploading, setUploading] = useState(false);

  const { values, handleChange, errors, handleSubmit, setErrors } = useFormik({
    initialValues: {
      title: data?.title ?? "",
      file_path: data?.file_path ?? "",
      remark: data?.remark ?? "",
    },
    onSubmit: (formValues: any) => onAction({ ...formValues }),
    validateOnChange: false,
    validateOnBlur: true,
    validationSchema: VALIDATION_SCHEMA,
  });

  useMemo(() => {
    if (RequestError && Object.keys(RequestError).length) {
      setErrors(RequestError);
    }
  }, [RequestError]);

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <InputText
        name="title"
        label="Title *"
        placeholder="e.g. GST Certificate 2026"
        onChange={handleChange}
        error={errors}
        value={values}
      />

      <FileUpload
        name="file_path"
        onChange={handleChange}
        error={errors}
        value={values}
        setLoading={setUploading}
        accept="image/*,application/pdf,.pdf,.xls,.xlsx,.xlsm,.csv"
        maxMb={100}
        title="Document (Image / PDF / Excel) *"
        kindLabel="document"
        helpText="Image, PDF or Excel file, up to 100 MB."
      />

      <InputTextArea
        name="remark"
        label="Remark"
        placeholder="Optional note about this document"
        onChange={handleChange}
        error={errors}
        value={values}
        rows={3}
      />

      <div className="flex justify-end space-x-3 pt-4">
        <Btn title="Cancel" onClick={onCloseModal} uiType="secondary" />
        <Btn
          title={isEdit ? "Update" : "Create"}
          isLoading={loading || uploading}
          onClick={handleSubmit}
        />
      </div>
    </form>
  );
};

export default PersonalDocumentForm;
