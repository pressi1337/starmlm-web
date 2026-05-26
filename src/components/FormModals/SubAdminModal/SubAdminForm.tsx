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
    },
    onSubmit: (formValues: any) => {
      // Drop empty password fields on edit so we don't send blank strings.
      const payload: any = { ...formValues };
      if (isEdit && !payload.password) {
        delete payload.password;
        delete payload.password_confirmation;
      }
      payload.is_active = payload.is_active ? 1 : 0;
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

      <div className="flex justify-end space-x-3 pt-4">
        <Btn title="Cancel" onClick={onCloseModal} uiType="secondary" />
        <Btn title={isEdit ? "Update" : "Create"} isLoading={loading} onClick={handleSubmit} />
      </div>
    </form>
  );
};

export default SubAdminForm;
