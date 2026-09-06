import * as Yup from "yup";
import { useFormik } from "formik";
import { useMemo } from "react";
import InputText from "@/components/ui/InputText";
import PasswordInput from "@/components/ui/PasswordInput";
import Btn from "@/components/ui/Btn";
import CheckboxInput from "@/components/ui/CheckboxInput";

const buildSchema = (isEdit: boolean) =>
  Yup.object().shape({
    first_name: Yup.string().required("First Name is required*"),
    last_name: Yup.string().required("Last Name is required*"),
    username: Yup.string().required("Username is required*"),
    password: isEdit
      ? Yup.string().min(6, "Password must be at least 6 characters")
      : Yup.string()
          .required("Password is required*")
          .min(6, "Password must be at least 6 characters"),
    password_confirmation: Yup.string()
      .when("password", {
        is: (val: string) => !!val,
        then: (schema) =>
          schema
            .required("Confirm the password*")
            .oneOf([Yup.ref("password"), null], "Passwords must match"),
        otherwise: (schema) => schema.notRequired(),
      }),
    // Permission grid: at least one of the four must be ticked. Field-level
    // error attached to permissions for inline display.
    permissions: Yup.mixed().test(
      "at-least-one",
      "Grant at least one permission (Daily Videos, Promotion Videos, Promotion Log, Promotion Settings, Pin Requests, Plan Product, Support & Help, Suggestions, or Personal Documents).",
      function () {
        const { can_daily_videos, can_promotion_videos, can_pin_requests, can_suggestions, can_personal_documents, can_promotion_logs, can_plan_product, can_support_help, can_promotion_settings } = this.parent;
        return (
          Boolean(can_daily_videos) ||
          Boolean(can_promotion_videos) ||
          Boolean(can_pin_requests) ||
          Boolean(can_suggestions) ||
          Boolean(can_personal_documents) ||
          Boolean(can_promotion_logs) ||
          Boolean(can_plan_product) ||
          Boolean(can_support_help) ||
          Boolean(can_promotion_settings)
        );
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

const SubAdminForm = ({
  data = {},
  onAction = () => {},
  onCloseModal = () => {},
  loading = false,
  RequestError = {},
}: Props) => {
  const isEdit = !!data?.id;

  const { values, handleChange, errors, handleSubmit, setErrors } = useFormik({
    initialValues: {
      first_name: data?.first_name ?? "",
      last_name: data?.last_name ?? "",
      username: data?.username ?? "",
      password: "",
      password_confirmation: "",
      is_active: typeof data?.is_active === "number" ? data.is_active : 1,
      can_daily_videos: Number(data?.can_daily_videos ?? 0) === 1 ? 1 : 0,
      can_promotion_videos: Number(data?.can_promotion_videos ?? 0) === 1 ? 1 : 0,
      can_pin_requests: Number(data?.can_pin_requests ?? 0) === 1 ? 1 : 0,
      can_suggestions: Number(data?.can_suggestions ?? 0) === 1 ? 1 : 0,
      can_personal_documents:
        Number(data?.can_personal_documents ?? 0) === 1 ? 1 : 0,
      can_promotion_logs: Number(data?.can_promotion_logs ?? 0) === 1 ? 1 : 0,
      can_plan_product: Number(data?.can_plan_product ?? 0) === 1 ? 1 : 0,
      can_support_help: Number(data?.can_support_help ?? 0) === 1 ? 1 : 0,
      can_promotion_settings:
        Number(data?.can_promotion_settings ?? 0) === 1 ? 1 : 0,
    },
    onSubmit: (formValues: any) => {
      // Drop empty password fields on edit so we don't send blank strings.
      const payload: any = { ...formValues };
      if (isEdit && !payload.password) {
        delete payload.password;
        delete payload.password_confirmation;
      }
      payload.is_active = payload.is_active ? 1 : 0;
      payload.can_daily_videos = payload.can_daily_videos ? 1 : 0;
      payload.can_promotion_videos = payload.can_promotion_videos ? 1 : 0;
      payload.can_pin_requests = payload.can_pin_requests ? 1 : 0;
      payload.can_suggestions = payload.can_suggestions ? 1 : 0;
      payload.can_personal_documents = payload.can_personal_documents ? 1 : 0;
      payload.can_promotion_logs = payload.can_promotion_logs ? 1 : 0;
      payload.can_plan_product = payload.can_plan_product ? 1 : 0;
      payload.can_support_help = payload.can_support_help ? 1 : 0;
      payload.can_promotion_settings = payload.can_promotion_settings ? 1 : 0;
      onAction(payload);
    },
    validateOnChange: false,
    validateOnBlur: true,
    validationSchema: buildSchema(isEdit),
  });

  useMemo(() => {
    if (RequestError && Object.keys(RequestError).length) {
      setErrors(RequestError);
    }
  }, [RequestError]);

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputText
          name="first_name"
          label="First Name *"
          placeholder="Enter First Name"
          onChange={handleChange}
          error={errors}
          value={values}
        />
        <InputText
          name="last_name"
          label="Last Name *"
          placeholder="Enter Last Name"
          onChange={handleChange}
          error={errors}
          value={values}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputText
          name="username"
          label="Username *"
          placeholder="Enter Username"
          onChange={handleChange}
          error={errors}
          value={values}
          readOnly={isEdit}
        />
        <CheckboxInput
          label="Is Active?"
          name="is_active"
          value={values}
          onChange={handleChange}
          error={errors}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <PasswordInput
          name="password"
          label={isEdit ? "New Password (leave blank to keep current)" : "Password *"}
          placeholder="Enter Password"
          value={values}
          onChange={handleChange}
          error={errors}
        />
        <PasswordInput
          name="password_confirmation"
          label={isEdit ? "Confirm New Password" : "Confirm Password *"}
          placeholder="Confirm Password"
          value={values}
          onChange={handleChange}
          error={errors}
        />
      </div>

      {/* Permission grid — at least one must be selected */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Permissions <span className="text-gray-400">(grant at least one)</span>
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 rounded-lg border border-gray-200 p-4">
          <CheckboxInput
            label="Daily Videos"
            name="can_daily_videos"
            value={values}
            onChange={handleChange}
            error={errors}
          />
          <CheckboxInput
            label="Promotion Videos"
            name="can_promotion_videos"
            value={values}
            onChange={handleChange}
            error={errors}
          />
          <CheckboxInput
            label="Pin Requests"
            name="can_pin_requests"
            value={values}
            onChange={handleChange}
            error={errors}
          />
          <CheckboxInput
            label="Suggestions"
            name="can_suggestions"
            value={values}
            onChange={handleChange}
            error={errors}
          />
          <CheckboxInput
            label="Personal Documents"
            name="can_personal_documents"
            value={values}
            onChange={handleChange}
            error={errors}
          />
          <CheckboxInput
            label="Promotion Log"
            name="can_promotion_logs"
            value={values}
            onChange={handleChange}
            error={errors}
          />
          <CheckboxInput
            label="Plan Product"
            name="can_plan_product"
            value={values}
            onChange={handleChange}
            error={errors}
          />
          <CheckboxInput
            label="Support & Help"
            name="can_support_help"
            value={values}
            onChange={handleChange}
            error={errors}
          />
          <CheckboxInput
            label="Promotion Settings"
            name="can_promotion_settings"
            value={values}
            onChange={handleChange}
            error={errors}
          />
        </div>
        {(errors as any).permissions && (
          <p className="text-sm text-red-800 pt-2" role="alert">
            {(errors as any).permissions}
          </p>
        )}
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <Btn title="Cancel" onClick={onCloseModal} uiType="secondary" />
        <Btn title={isEdit ? "Update" : "Create"} isLoading={loading} onClick={handleSubmit} />
      </div>
    </form>
  );
};

export default SubAdminForm;
