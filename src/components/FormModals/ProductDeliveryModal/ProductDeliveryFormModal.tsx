import { useMemo } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import Modal from "@/components/ui/Modal";
import SelectInput from "@/components/ui/SelectInput";
import InputTextArea from "@/components/ui/InputTextArea";
import InputText from "@/components/ui/InputText";
import Btn from "@/components/ui/Btn";
import { OPTIONS } from "@/constants/others";
import { SERVICE } from "@/constants/services";
import { useActionCall, useQueryParams } from "@/hooks";

const VALIDATION_SCHEMA = Yup.object().shape({
  product_delivery_status: Yup.string().required("Required Product Delivery Status*"),
});

const ProductDeliveryFormModal = ({ recoilApi = () => {} }) => {
  const { searchParams, updateSearchParam } = useQueryParams();
  const editId = searchParams.get("Edit") || "";
  const rowData = JSON.parse(searchParams.get("userData") || "{}");
  const { Post, error, loading: actionLoading } = useActionCall(
    SERVICE.PIN_REQUEST_PRODUCT_DELIVERY_UPDATE
  );

  const closeModal = () => {
    updateSearchParam({ deleteParams: ["Modal", "Edit", "userData"] });
  };

  const requestError = useMemo(() => {
    if (!error || typeof error !== "object") return {};
    return error;
  }, [error]);

  const formik = useFormik({
    initialValues: {
      product_delivery_status: String(rowData?.product_delivery_status ?? "0"),
      product_delivery_notes: rowData?.product_delivery_notes ?? "",
      bill_path: rowData?.bill_path ?? "",
    },
    enableReinitialize: true,
    validationSchema: VALIDATION_SCHEMA,
    onSubmit: async (values) => {
      const response = await Post({ id: editId, ...values });
      if (response) {
        recoilApi();
        closeModal();
      }
    },
  });

  return (
    <Modal title="Update Product Delivery" onClose={closeModal}>
      <form className="space-y-4" onSubmit={formik.handleSubmit}>
        <SelectInput
          name="product_delivery_status"
          label="Product Delivery Status *"
          placeholder="Select product delivery status"
          options={OPTIONS.PRODUCT_DELIVERY_STATUS}
          onChange={formik.handleChange}
          error={requestError}
          value={formik.values}
        />
        <InputTextArea
          name="product_delivery_notes"
          label="Delivery Notes"
          placeholder="Add delivery notes"
          onChange={formik.handleChange}
          error={requestError}
          value={formik.values}
        />
        <InputText
          name="bill_path"
          label="Bill Path / URL"
          placeholder="Enter stored bill path or public bill URL"
          onChange={formik.handleChange}
          error={requestError}
          value={formik.values}
        />
        <div className="flex justify-end space-x-3 pt-4">
          <Btn title="Cancel" onClick={closeModal} uiType="secondary" />
          <Btn title="Save" isLoading={actionLoading} onClick={formik.handleSubmit} />
        </div>
      </form>
    </Modal>
  );
};

export default ProductDeliveryFormModal;
