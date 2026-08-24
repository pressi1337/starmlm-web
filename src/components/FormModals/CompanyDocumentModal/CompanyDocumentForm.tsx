import * as Yup from "yup";
import { useFormik } from "formik";
import { useMemo, useState } from "react";
import InputText from "@/components/ui/InputText";
import CheckboxInput from "@/components/ui/CheckboxInput";
import Btn from "@/components/ui/Btn";
import FileUpload from "@/components/FileUpload";

const VALIDATION_SCHEMA = Yup.object().shape({
  title: Yup.string().required("Title is required*"),
  file_path: Yup.string().required("Please upload an image or PDF*"),
});

type Props = {
  data?: any;
  onAction?: (values: any) => void;
  onCloseModal?: () => void;
  loading?: boolean;
  RequestError?: any;
};

const CompanyDocumentForm = ({
  data = {},
  onAction = () => {},
  onCloseModal = () => {},
  loading = false,
  RequestError = {},
}: Props) => {
  const isEdit = !!data?.id;
  // Blocks submit while a file is still uploading.
  const [uploading, setUploading] = useState(false);

  const { values, handleChange, errors, handleSubmit, setErrors } = useFormik({
    initialValues: {
      title: data?.title ?? "",
      file_path: data?.file_path ?? "",
      is_active: typeof data?.is_active === "number" ? data.is_active : 1,
    },
    onSubmit: (formValues: any) => {
      const payload: any = { ...formValues };
      payload.is_active = payload.is_active ? 1 : 0;
      onAction(payload);
    },
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
        placeholder="e.g. Company Registration Certificate"
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
        accept="image/*,application/pdf,.pdf"
        maxMb={100}
        title="Document (Image or PDF) *"
        kindLabel="document"
        helpText="Any image format or a PDF, up to 100 MB."
      />

      <CheckboxInput
        label="Show to users? (hidden when off)"
        name="is_active"
        value={values}
        onChange={handleChange}
        error={errors}
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

export default CompanyDocumentForm;
