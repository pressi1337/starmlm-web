import { useEffect } from "react";
import { useActionCall, useGetCall, useQueryParams } from "@/hooks";
import { SERVICE } from "@/constants/services";

import Modal from "@/components/ui/Modal";
import Loader from "@/components/ui/Loader";
import SupportHelpForm from "./SupportHelpForm";

const SupportHelpFormModal = ({ recoilApi = () => {} }: { recoilApi?: () => void }) => {
  const { searchParams, updateSearchParam } = useQueryParams();
  const Edit = searchParams.get("Edit") || undefined;

  const {
    Post,
    Put,
    error: RequestError,
    loading: actionLoading,
  } = useActionCall(SERVICE.SUPPORT_HELPS);

  const { data, loading, error } = useGetCall(SERVICE.SUPPORT_HELPS, {
    avoidFetch: !Boolean(Edit),
    key: Edit,
  });

  const closeModal = () => {
    updateSearchParam({ deleteParams: ["Modal", "Edit"] });
  };

  useEffect(() => {
    if (error) {
      closeModal();
    }
  }, [error]);

  const onAction = async (payload: any) => {
    const response = Edit ? await Put(Edit, payload) : await Post(payload);
    if (response) {
      recoilApi();
      closeModal();
    }
  };

  return (
    <Modal
      title={`${Edit ? "Edit" : "Add"} Support & Help`}
      modalSize="lg"
      onClose={closeModal}
    >
      {loading ? (
        <Loader />
      ) : (
        <SupportHelpForm
          data={data?.data ?? {}}
          onAction={onAction}
          RequestError={RequestError}
          onCloseModal={closeModal}
          loading={actionLoading}
        />
      )}
    </Modal>
  );
};

export default SupportHelpFormModal;
