import { useActionCall, useGetCall, useQueryParams } from "@/hooks";
import { SERVICE } from "@/constants/services";
import { useEffect } from "react";
import Lib from "@/utils/Lib";

import Modal from "@/components/ui/Modal";
import Loader from "@/components/ui/Loader";
import PinForm from "./PinForm";

const PinFormModal = ({ recoilApi = () => {} }) => {
  const { searchParams, updateSearchParam } = useQueryParams();
  const Edit = searchParams.get("Edit") || undefined;
  const {
    Post,
    Put,
    error: RequestError,
  } = useActionCall(SERVICE.USER_PROMOTERS);
  const { data:PinRequests, loading, error } = useGetCall(SERVICE.GET_PIN_REQUESTS, {
    avoidFetch: !Edit,
    key: Edit,
  });


  const closeModal = () => {
    updateSearchParam({ deleteParams: ["Modal", "Edit", "Duplicate"] });
  };

  useEffect(() => {
    if (error) {
      closeModal();
    }
  }, [error]);

  const onAction = async (formPayload: any) => {
    let response = undefined;

    let formatPayload = Lib.payloadFormat(formPayload, "");
    if (Edit) {
      response = await Put(Edit, formatPayload);
    } else {
      response = await Post(formatPayload);
    }

    if (response) {
      //Close the Modal
      recoilApi();
      closeModal();
    }
  };

  return (
    <Modal
      title={`${Edit ? "Edit" : "Request Pin Upgrade"}`}
      onClose={closeModal}
    >
      {loading ? (
        <Loader />
      ) : (
        <PinForm
          data={PinRequests ?? {}}
          onAction={onAction}
          RequestError={RequestError}
          onCloseModal={closeModal}
        />
      )}
    </Modal>
  );
};

export default PinFormModal;
