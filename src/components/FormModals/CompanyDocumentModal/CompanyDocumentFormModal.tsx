import { useEffect } from "react";
import { useActionCall, useGetCall, useQueryParams } from "@/hooks";
import { SERVICE } from "@/constants/services";

import Modal from "@/components/ui/Modal";
import Loader from "@/components/ui/Loader";
import CompanyDocumentForm from "./CompanyDocumentForm";

const CompanyDocumentFormModal = ({
  recoilApi = () => {},
}: {
  recoilApi?: () => void;
}) => {
  const { searchParams, updateSearchParam } = useQueryParams();
  const Edit = searchParams.get("Edit") || undefined;

  const {
    Post,
    Put,
    error: RequestError,
    loading: actionLoading,
  } = useActionCall(SERVICE.COMPANY_DOCUMENTS);

  const { data, loading, error } = useGetCall(SERVICE.COMPANY_DOCUMENTS, {
    avoidFetch: !Boolean(Edit),
    key: Edit,
  });

  const closeModal = () => {
    updateSearchParam({ deleteParams: ["Modal", "Edit"] });
  };

  useEffect(() => {
    if (error) closeModal();
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
      title={`${Edit ? "Edit" : "Add"} Company Document`}
      modalSize="lg"
      onClose={closeModal}
    >
      {loading ? (
        <Loader />
      ) : (
        <CompanyDocumentForm
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

export default CompanyDocumentFormModal;
