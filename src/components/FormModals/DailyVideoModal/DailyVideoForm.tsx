import * as Yup from "yup";
import { useFormik } from "formik";
import { useMemo } from "react";
import InputText from "@/components/ui/InputText";
import InputTextArea from "@/components/ui/InputTextArea";
import YouTubeInputText from "@/components/ui/YouTubeInput";
import moment from "moment";
import Btn from "@/components/ui/Btn";
import CheckboxInput from "@/components/ui/CheckboxInput";
import FileUpload from "@/components/FileUpload";
import SelectInput from "@/components/ui/SelectInput";
import { OPTIONS } from "@/constants/others";

export const VALIDATION_SCHEMA = Yup.object().shape({
  title: Yup.string().required("Required Title*"),
  description: Yup.string().required("Required description*"),
  youtube_link: Yup.string()
    .nullable()
    .test(
      "youtube-or-video",
      "Either YouTube link or Video path is required*",
      function (value) {
        const { video_path } = this.parent;
        if (
          (value && value.trim() !== "") ||
          (video_path && video_path.trim() !== "")
        ) {
          return true;
        }
        return false;
      }
    ),

  video_path: Yup.string()
    .nullable()
    .test(
      "video-or-youtube",
      "Either Video path or YouTube link is required*",
      function (value) {
        const { youtube_link } = this.parent;
        if (
          (value && value.trim() !== "") ||
          (youtube_link && youtube_link.trim() !== "")
        ) {
          return true;
        }
        return false;
      }
    ),

  delivery_mode: Yup.string().required("Required Delivery Mode*"),
  showing_date: Yup.string().when("delivery_mode", {
    is: "1",
    then: (schema) => schema.required("Required Date"),
    otherwise: (schema) => schema.nullable(),
  }),
  priority: Yup.number().nullable().min(0, "Priority must be 0 or greater"),
});

const DailyVideoForm = ({
  data = {},
  onAction = (values: any) => {},
  onCloseModal = () => {},
  loading = false,
  RequestError = {},
}: any) => {
  const { values, handleChange, errors, handleSubmit, setErrors } = useFormik({
    initialValues: {
      title: data?.title ?? "",
      description: data?.description ?? "",
      youtube_link: data?.youtube_link ?? "",
      video_path: data?.video_path ?? "",
      showing_date: data?.showing_date
        ? moment(new Date(data?.showing_date)).format("YYYY-MM-DD")
        : "",
      delivery_mode: String(data?.delivery_mode ?? "1"),
      priority: data?.priority ?? 0,
      type: "1",
      is_active: data?.is_active ?? 1,
    },
    onSubmit: async (values: any) => {
      onAction(values);
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
    <div className="max-h-[70vh] overflow-y-auto">
      <form className="space-y-4" onSubmit={handleSubmit}>
        <InputText
          name="title"
          label="Title *"
          placeholder="Enter video title"
          onChange={handleChange}
          error={errors}
          value={values}
        />
        <InputTextArea
          name="description"
          label="Description *"
          placeholder="Enter Video Description"
          onChange={handleChange}
          error={errors}
          value={values}
        />
        <div>
          <div className="space-y-3">
            <FileUpload
              name="video_path"
              onChange={handleChange}
              error={errors}
              value={values}
            />
            <div className="text-center text-gray-500">OR</div>
            <YouTubeInputText
              name="youtube_link"
              onChange={handleChange}
              error={errors}
              value={values}
            />
          </div>
        </div>

        <InputText
          type="Date"
          name="showing_date"
          label={`Showing Date ${values.delivery_mode === "1" ? "*" : "(Optional)"}`}
          placeholder="Enter Show Date"
          onChange={handleChange}
          error={errors}
          value={values}
        />
        <SelectInput
          name="delivery_mode"
          label="Delivery Mode *"
          placeholder="Select delivery mode"
          options={OPTIONS.DAILY_VIDEO_DELIVERY_MODE}
          onChange={handleChange}
          error={errors}
          value={values}
        />
        <InputText
          type="number"
          name="priority"
          label="Priority"
          placeholder="Enter priority"
          onChange={handleChange}
          error={errors}
          value={values}
        />
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <div className="font-medium mb-1">Delivery mode guide</div>
          <div>`Scheduled Daily`: used when a date-specific daily video is available.</div>
          <div>`Common Fallback`: used when no scheduled daily video exists for that day.</div>
          <div>`New Joiner Default`: shown to members on their joining day before the regular daily flow.</div>
        </div>
        <CheckboxInput
          label="Is Active?"
          name="is_active"
          value={values}
          onChange={handleChange}
          error={errors}
        />
        <div className="flex justify-end space-x-3 pt-4">
          <Btn title="Cancel" onClick={onCloseModal} uiType="secondary" />
          <Btn title={"Submit"} isLoading={loading} onClick={handleSubmit} />
        </div>
      </form>
    </div>
  );
};

export default DailyVideoForm;
