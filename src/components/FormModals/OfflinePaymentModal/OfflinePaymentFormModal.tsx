import { useCallback, useEffect } from "react";
import { useActionCall, useQueryParams } from "@/hooks";
import { SERVICE } from "@/constants/services";
import Modal from "@/components/ui/Modal";
import OfflinePaymentForm from "./OfflinePaymentForm";

/**
 * "Record payment" on a pin request — the override for promoters who paid in
 * cash or by direct transfer. Generate Pin stays closed until a request is
 * paid, and this is the only way an off-gateway payment gets recorded.
 */
const OfflinePaymentFormModal = ({ recoilApi = () => {}, request }: any) => {
  const { updateSearchParam } = useQueryParams();
  const { Post, loading, error } = useActionCall(SERVICE.PLAN_PAYMENT_OFFLINE);

  const closeModal = useCallback(() => {
    updateSearchParam({ deleteParams: ["Modal", "pinRequestId", "userData"] });
  }, [updateSearchParam]);

  // A 400 (already paid, no longer pending) is reported by the hook's toast;
  // there is nothing to correct in the form, so close.
  useEffect(() => {
    if (error && typeof error === "string") {
      closeModal();
    }
  }, [error, closeModal]);

  const onAction = async (values: any) => {
    const response = await Post(
      {
        user_promoter_id: request?.id,
        amount: Number(values.amount),
        payment_mode: values.payment_mode,
        reference: values.reference || undefined,
        note: values.note || undefined,
      },
      "Offline payment recorded"
    );

    if (response) {
      recoilApi();
      closeModal();
    }
  };

  return (
    <Modal title="Record offline payment" onClose={closeModal}>
      <OfflinePaymentForm
        request={request}
        onAction={onAction}
        onCloseModal={closeModal}
        loading={loading}
        errors={error && typeof error === "object" ? error : {}}
      />
    </Modal>
  );
};

export default OfflinePaymentFormModal;
