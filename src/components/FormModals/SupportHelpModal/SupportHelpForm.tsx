import * as Yup from "yup";
import { useFormik } from "formik";
import { useMemo } from "react";
import InputTextArea from "@/components/ui/InputTextArea";
import CheckboxInput from "@/components/ui/CheckboxInput";
import Btn from "@/components/ui/Btn";
import FileUpload from "@/components/FileUpload";

const VALIDATION_SCHEMA = Yup.object().shape({
  question: Yup.string().required("Question is required*"),
  // Answer and video are both optional, but at least one must be provided.
  answer: Yup.string().test(
    "answer-or-video",
    "Add an answer or a video*",
    function (value) {
      const { video } = this.parent;
      const hasAnswer = !!(value && value.trim() !== "");
      const hasVideo = !!(video && String(video).trim() !== "");
      return hasAnswer || hasVideo;
    }
  ),
});

type Props = {
  data?: any;
  onAction?: (values: any) => void;
  onCloseModal?: () => void;
  loading?: boolean;
  RequestError?: any;
};

const SupportHelpForm = ({
  data = {},
  onAction = () => {},
  onCloseModal = () => {},
  loading = false,
  RequestError = {},
}: Props) => {
  const isEdit = !!data?.id;

  const { values, handleChange, errors, handleSubmit, setErrors } = useFormik({
    initialValues: {
      question: data?.question ?? "",
      answer: data?.answer ?? "",
      video: data?.video ?? "",
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
      <InputTextArea
        name="question"
        label="Question *"
        placeholder="e.g. How do I activate my pin?"
        onChange={handleChange}
        error={errors}
        value={values}
        rows={2}
      />

      <InputTextArea
        name="answer"
        label="Answer (optional — answer or video required)"
        placeholder="Explain the answer in detail. Users will see this in the accordion on the Support & Help screen."
        onChange={handleChange}
        error={errors}
        value={values}
        rows={6}
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Video (optional)
        </label>
        <p className="text-xs text-gray-500 mb-2">
          Upload a help video
        </p>
        <FileUpload
          name="video"
          onChange={handleChange}
          error={errors}
          value={values}
        />
      </div>

      <CheckboxInput
        label="Is Active? (hidden from users when off)"
        name="is_active"
        value={values}
        onChange={handleChange}
        error={errors}
      />

      <div className="flex justify-end space-x-3 pt-4">
        <Btn title="Cancel" onClick={onCloseModal} uiType="secondary" />
        <Btn title={isEdit ? "Update" : "Create"} isLoading={loading} onClick={handleSubmit} />
      </div>
    </form>
  );
};

export default SupportHelpForm;
