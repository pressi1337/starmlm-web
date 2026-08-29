import * as Yup from "yup";
import { useFormik } from "formik";
import { useMemo, useState } from "react";
import InputText from "@/components/ui/InputText";
import InputTextArea from "@/components/ui/InputTextArea";
import Btn from "@/components/ui/Btn";
import MultiFileUpload from "@/components/MultiFileUpload";

const VALIDATION_SCHEMA = Yup.object().shape({
  title: Yup.string().required("Title is required*"),
  files: Yup.array().min(1, "Please upload at least one document*"),
});

type Props = {
  data?: any;
  onAction?: (values: any) => void;
  onCloseModal?: () => void;
  loading?: boolean;
  RequestError?: any;
  isSuperAdmin?: boolean;
};

/** API rows carry extra fields; the form only submits what the server needs. */
const toFormFiles = (rows: any) =>
  Array.isArray(rows)
    ? rows
        .filter((row: any) => row?.file_path)
        .map((row: any) => ({
          file_path: row.file_path,
          original_name: row.original_name ?? "",
        }))
    : [];

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
      // A set can hold many files. Older single-file records come back with a
      // one-entry `files` array from the API, so there's one code path here.
      files: toFormFiles(data?.files),
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
        placeholder="e.g. GST Bills 2026"
        onChange={handleChange}
        error={errors}
        value={values}
      />

      <MultiFileUpload
        name="files"
        onChange={handleChange}
        error={errors}
        value={values}
        setLoading={setUploading}
        accept="image/*,application/pdf,.pdf,.xls,.xlsx,.xlsm,.csv"
        maxMb={100}
        title="Documents (Image / PDF / Excel) *"
        helpText="Pick one or many. Up to 100 MB each — add more any time before saving."
      />

      <InputTextArea
        name="remark"
        label="Remark"
        placeholder="Optional note about this document set"
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
