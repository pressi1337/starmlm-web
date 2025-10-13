import * as Yup from "yup";
import { useFormik } from "formik";
import { useMemo } from "react";
import InputText from "@/components/ui/InputText";
import Btn from "@/components/ui/Btn";
import { OPTIONS } from "@/constants/others";
import SelectInput from "@/components/ui/SelectInput";
import InputTextArea from "@/components/ui/InputTextArea";

export const VALIDATION_SCHEMA = Yup.object().shape({
  pin: Yup.string().required("Required Pin*"),
});

const ActivatePinForm = ({
  data = {},
  onAction = (values: any) => {},
  onCloseModal = () => {},
  loading = false,
  RequestError = {},
}: any) => {
  const { values, handleChange, errors, handleSubmit, setErrors } = useFormik({
    initialValues: {
      id:data?.id ?? "",
      pin: data?.pin ?? "",
      gift_delivery_type: data?.gift_delivery_type ?? "",
      gift_delivery_address: data?.gift_delivery_address ?? "",
      wh_number: data?.wh_number ?? "",
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
    <form className="space-y-4" onSubmit={handleSubmit}>
      <InputText
        name="pin"
        label="Pin *"
        placeholder="Enter Pin"
        onChange={handleChange}
        error={errors}
        value={values}
        disabled
        readOnly
      />
       <SelectInput
          name="gift_delivery_type"
          label="Gift Delivery Type *"
          placeholder="Select Gift Delivery Type"
          options={OPTIONS.GIFT_DELIVERY_LEVEL}
          onChange={handleChange}
          error={errors}
          value={values}
        />
        <InputTextArea
          name="gift_delivery_address"
          label="Gift Delivery Address *"
          placeholder="Enter Gift Delivery Address"
          onChange={handleChange}
          error={errors}
          value={values}
        />
        <InputText
          name="wh_number"
          label="Mobile Number *"
          placeholder="Enter Mobile Number"
          onChange={handleChange}
          error={errors}
          value={values}
        />
      <div className="flex justify-end space-x-3 pt-4">
        <Btn title="Cancel" onClick={onCloseModal} uiType="secondary" />
        <Btn title={"Submit"} isLoading={loading} onClick={handleSubmit} />
      </div>
    </form>
  );
};

export default ActivatePinForm;
