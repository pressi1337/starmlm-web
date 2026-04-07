import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { Crown, CheckCircle, Clock, ArrowUp, CircleX, Download, Truck } from "lucide-react";
import { useActionCall, useGetCall, useQueryParams } from "@/hooks";
import { SERVICE } from "@/constants/services";
import { MODAL_OPEN } from "@/constants/others";
import PinFormModal from "@/components/FormModals/PinModal/PinFormModal";
import ActivatePinFormModal from "@/components/FormModals/ActivatePinModal/ActivatePinFormModal";
import PinConfirmationFormModal from "@/components/FormModals/PinConfirmationModal/PinConfirmationFormModal";
import DailyVideoWarning from "@/components/DailyVideoWarning";
import TrainingVideoWarning from "@/components/TrainingVideoWarning";
import Lib from "@/utils/Lib";

function PinRequestsPage() {
  const { user } = useAuth();
  const { defaultFilter, updateSearchParam, searchParams } = useQueryParams();
  const Modal = searchParams.get("Modal") || undefined;
  const [filter, setFilter] = useState(defaultFilter);
  const {
    data: pinRequests,
    loading: pinRequestsLoading,
    setQuery,
  } = useGetCall(SERVICE.GET_PIN_REQUESTS);
  const { Post: updateCustomerDelivery, loading: customerDeliveryLoading } = useActionCall(
    SERVICE.CUSTOMER_DELIVERY_CONFIRMATION
  );
  const pendingTermRequest = pinRequests?.data?.find(
    (item) => item.status === 0 && item.term_raised_at && !item.terms_accepted_at
  );
  const hasOpenRequest = pinRequests?.data?.some((item) =>
    [0, 1].includes(item.status)
  );
  const pinRequestConfirmationModal = Boolean(pendingTermRequest);
  const getLevelColor = (level: number) => {
    const colorClasses = Lib.promoterLevelColor(level);
    return colorClasses.split(" ")[0] || "text-gray-600";
  };
  const getLevelName = (level: number) => {
    return Lib.promoterLevelLabel(level);
  };

  const getDateToShow = (item) => {
    if (item.activated_at) {
      return item.activated_at;
    } else if (item.auto_deleted_at) {
      return item.auto_deleted_at;
    } else if (item.pin_generated_at) {
      return item.pin_generated_at;
    } else {
      return item.created_at;
    }
  };

  const getDateLabel = (item) => {
    if (item.activated_at) {
      return "Activated on ";
    } else if (item.auto_deleted_at) {
      return "Deleted on ";
    } else if (item.pin_generated_at) {
      return "PIN generated on ";
    } else {
      return "Requested on ";
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      0: {
        color: "bg-yellow-100 text-yellow-800",
        icon: Clock,
        text: "Pending Review",
      },
      1: {
        color: "bg-green-100 text-green-800",
        icon: CheckCircle,
        text: "Ready to Activate",
      },
      2: {
        color: "bg-blue-100 text-blue-800",
        icon: CheckCircle,
        text: "Activated",
      },
      3: { color: "bg-red-100 text-red-800", icon: CircleX, text: "Rejected" },
      4: {
        color: "bg-gray-200 text-gray-700",
        icon: CircleX,
        text: "Auto Deleted",
      },
    };
    const badge = badges[status] || badges[0];
    const Icon = badge.icon;

    return (
      <span
        className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-full ${badge.color}`}
      >
        <Icon className="w-4 h-4 mr-1" />
        {badge.text}
      </span>
    );
  };
  const getProductDeliveryBadge = (status) => {
    const badges = {
      0: "bg-gray-100 text-gray-800",
      1: "bg-blue-100 text-blue-800",
      2: "bg-green-100 text-green-800",
      3: "bg-red-100 text-red-800",
    };
    const label = {
      0: "Pending",
      1: "Processing",
      2: "Delivered",
      3: "Not Delivered",
    };
    return (
      <span className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-full ${badges[status ?? 0]}`}>
        {label[status ?? 0]}
      </span>
    );
  };
  const PinRequestAPI = useCallback(() => {
    setQuery(filter);
  }, [filter]);

  useEffect(() => {
    PinRequestAPI();
  }, [PinRequestAPI]);

  const ActivatePinAPI = useCallback(() => {
    setQuery(filter);
  }, [filter]);

  useEffect(() => {
    ActivatePinAPI();
  }, [ActivatePinAPI]);
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Pin Requests & Upgrades
        </h1>
        <p className="mt-2 text-gray-600">
          Request level upgrades and activate approved pins to unlock new
          features
        </p>
        <p className="mt-2 text-sm text-blue-600">
          Your currently activated promoter level stays active until the new pin is fully activated.
        </p>
      </div>

      {/* Current Level & Upgrade Options */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <Crown className="w-5 h-5 mr-2" />
            Current Level & Upgrade Options
          </h3>
        </div>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-green-600 rounded-full flex items-center justify-center">
                <Crown className="w-8 h-8 text-white" />
              </div>
              <div className="ml-4">
                <div className="text-gray-600">Current Level</div>
                <div className="text-2xl font-bold text-gray-900">
                  {getLevelName(
                    pinRequests?.data[0]?.user?.current_promoter_level
                  )}{" "}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Available Upgrades:</h4>
            {pinRequests?.data?.length > 0 ? (
              (() => {
                const latestData = pinRequests.data[0];
                if (!latestData) return null;
                return (
                  <div
                    key={latestData.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                  >
                    <div className="flex items-center">
                      <ArrowUp className="w-5 h-5 text-green-600 mr-3" />
                      <div>
                        <div
                          className={`font-medium ${getLevelColor(
                            latestData?.user?.current_promoter_level
                          )}`}
                        >
                          {getLevelName(
                            latestData?.user?.current_promoter_level === null ||
                              latestData?.user?.current_promoter_level === undefined
                              ? 0
                              : latestData?.user?.current_promoter_level + 1
                          )}
                        </div>
                        <div className="text-sm text-gray-500">
                          Unlock advanced features and higher earnings
                        </div>
                      </div>
                    </div>
                    {!hasOpenRequest && (
                      <button
                        onClick={() =>
                          updateSearchParam({
                            options: {
                              Modal: MODAL_OPEN.PIN_REQUEST_MODAL,
                            },
                          })
                        }
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Request Level Upgrade
                      </button>
                    )}
                  </div>
                );
              })()
            ) : (
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center">
                  <ArrowUp className="w-5 h-5 text-green-600 mr-3" />
                  <div>
                    <div className="font-medium text-gray-900">
                      Request Level Upgrade
                    </div>
                    <div className="text-sm text-gray-500">
                      Unlock advanced features and higher earnings
                    </div>
                  </div>
                </div>
                {!hasOpenRequest && (
                  <button
                    onClick={() =>
                      updateSearchParam({
                        options: {
                          Modal: MODAL_OPEN.PIN_REQUEST_MODAL,
                        },
                      })
                    }
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Request Level Upgrade
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Available Pins for Activation */}
      {pinRequests?.data?.some((pin) => pin.status === 1) && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-8">
          <h3 className="text-lg font-semibold text-green-900 mb-4 flex items-center">
            <CheckCircle className="w-5 h-5 mr-2" />
            Pins Ready for Activation
          </h3>
          <div className="space-y-4">
            {pinRequests?.data
              ?.filter((pin) => pin.status === 1)
              .map((pin) => (
                <div
                  key={pin.id}
                  className="bg-white rounded-lg p-4 border border-green-200"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900">
                        Upgrade to {getLevelName(pin.level)}
                      </div>
                      <div className="text-sm text-gray-600">
                        {getDateLabel(pin)}
                        {new Date(getDateToShow(pin)).toLocaleDateString()}
                      </div>
                    </div>
                    <button
                      onClick={() =>
                        updateSearchParam({
                          options: {
                            Modal: MODAL_OPEN.ACTIVATE_PIN_MODAL,
                            Edit: pin.id,
                          },
                        })
                      }
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Activate Pin
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Pin Request History */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Pin Request History
          </h3>
        </div>
        <div className="p-6">
          {pinRequests?.data?.length > 0 ? (
            <div className="space-y-4">
              {pinRequests?.data.map((request) => (
                <div
                  key={request.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                >
                  <div className="flex items-center flex-1">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mr-4">
                      <ArrowUp className="w-5 h-5 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <div
                        className={`font-medium ${getLevelColor(
                          request.level
                        )}`}
                      >
                        Upgrade to {getLevelName(request.level)}
                      </div>
                      <div className="text-sm text-gray-600">
                        {getDateLabel(request)}
                        {new Date(getDateToShow(request)).toLocaleDateString()}
                      </div>
                      {request.status === 2 && (
                        <div className="mt-3 space-y-2">
                          <div className="flex items-center gap-2">
                            <Truck className="w-4 h-4 text-gray-500" />
                            {getProductDeliveryBadge(request.product_delivery_status)}
                          </div>
                          {request.product_delivery_notes ? (
                            <div className="text-sm text-gray-600 whitespace-pre-wrap">
                              {request.product_delivery_notes}
                            </div>
                          ) : null}
                          {request.bill_path ? (
                            <a
                              href={Lib.CloudPath(request.bill_path)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800"
                            >
                              <Download className="w-4 h-4 mr-1" />
                              Download Bill
                            </a>
                          ) : null}
                          <div className="flex items-center gap-2 pt-1">
                            <button
                              disabled={customerDeliveryLoading}
                              onClick={async () => {
                                const response = await updateCustomerDelivery({
                                  id: request.id,
                                  customer_delivery_status: 1,
                                });
                                if (response) PinRequestAPI();
                              }}
                              className={`px-3 py-1.5 rounded-lg text-sm font-medium ${request.customer_delivery_status === 1 ? "bg-green-600 text-white" : "bg-green-100 text-green-800 hover:bg-green-200"}`}
                            >
                              Received
                            </button>
                            <button
                              disabled={customerDeliveryLoading}
                              onClick={async () => {
                                const response = await updateCustomerDelivery({
                                  id: request.id,
                                  customer_delivery_status: 2,
                                });
                                if (response) PinRequestAPI();
                              }}
                              className={`px-3 py-1.5 rounded-lg text-sm font-medium ${request.customer_delivery_status === 2 ? "bg-red-600 text-white" : "bg-red-100 text-red-800 hover:bg-red-200"}`}
                            >
                              Not Received
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    {getStatusBadge(request.status)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Crown className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No Pin Requests
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                You haven't made any pin requests yet.
              </p>
            </div>
          )}
        </div>
      </div>
      {Modal == MODAL_OPEN.PIN_REQUEST_MODAL && (
        <PinFormModal recoilApi={PinRequestAPI} />
      )}
      {Modal == MODAL_OPEN.ACTIVATE_PIN_MODAL && (
        <ActivatePinFormModal recoilApi={ActivatePinAPI} />
      )}
      {pinRequestConfirmationModal && (
        <PinConfirmationFormModal
          recoilApi={PinRequestAPI}
          pinRequestId={pendingTermRequest?.id}
        />
      )}
    </div>
  );
}

export default function PinRequests() {
  return (
    <DailyVideoWarning>
      <TrainingVideoWarning>
        <PinRequestsPage />
      </TrainingVideoWarning>
    </DailyVideoWarning>
  );
}
