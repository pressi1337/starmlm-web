import React, { useRef, useState, useEffect } from "react";
import {
  Calendar,
  HelpCircle,
  Eye,
  ArrowDownRight,
  Building,
  Clock,
  CheckCircle,
  XCircle,
  CopyCheckIcon,
  CopyIcon,
  PhoneCall,
  User,
  Locate,
  LocateFixedIcon,
  LandPlot,
  User2Icon,
  UserCheck,
  LucideVolleyball,
  Flag,
  MessageCircle,
  Download,
  Upload,
} from "lucide-react";
import { useActionCall, useGetCall, useQueryParams } from "@/hooks";
import { SERVICE } from "@/constants/services";
import DataTable from "@/components/DataTable";
import UIHelpers from "@/utils/UIhelper";
import Swal from "sweetalert2";
import FilterTab from "@/components/FilterTab";
import { WIDTHDROW_STATUS } from "@/constants/others";
import CopyClipBoard from "@/components/CopyClip";
import Lib from "@/utils/Lib";
import { BASE_URL } from "@/constants/services";
const getStatusBadge = (status) => {
  const badges = {
    pending: {
      color: "bg-yellow-100 text-yellow-800",
      icon: Clock,
      text: "Pending",
    },
    processing: {
      color: "bg-blue-100 text-blue-800",
      icon: Clock,
      text: "Processing",
    },
    completed: {
      color: "bg-green-100 text-green-800",
      icon: CheckCircle,
      text: "Completed",
    },
    rejected: {
      color: "bg-red-100 text-red-800",
      icon: XCircle,
      text: "Rejected",
    },
  };
  const badge = badges[status] || badges.pending;
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
const formatAmount = (amount) => {
  const sign = amount >= 0 ? "+" : "";
  return `${sign}₹${Lib.formatAmount(Math.abs(amount))}`;
};

export default function WithDrawRequest() {
  const Columns: any = [
    {
      title: "Request Details",
      render: (index: any, row: any) => (
        <div className="flex items-center">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
            <ArrowDownRight className="w-5 h-5 text-green-600" />
          </div>
          <div className="ml-3">
            <div className="text-sm font-medium text-gray-900 flex gap-2">
              <User size={16} />
              {row?.user?.username}
            </div>
            <div className="text-sm font-medium text-gray-900 flex gap-2">
              <UserCheck size={16} />
              {row?.user?.first_name} {row?.user?.last_name}
            </div>
            <div className="text-sm font-medium text-gray-900 flex gap-2">
              <PhoneCall size={16} />
              <CopyClipBoard text={row?.user?.mobile} />
            </div>
            <div className="text-sm font-medium text-gray-900 flex gap-2">
              <LandPlot size={16} />
              {row?.user?.city}- {row?.user?.district}- {row?.user?.state}-
              {row?.user?.pin_code}
            </div>
            <div className="text-sm font-medium text-gray-900 flex gap-2">
              <Flag size={16} />
              {Lib.promoterLevelLabel(row?.user?.current_promoter_level)}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Method & Account",
      render: (index: any, row: any) => (
        <div className=" ">
          {row?.bank_detail?.id && (
            <>
              <div>
                <div className="text-sm font-medium text-gray-900 flex gap-1">
                  Bank:
                  <CopyClipBoard text={row?.bank_detail?.bank_name} />
                </div>

                <div className="text-sm text-gray-500 flex">
                  Acc No:
                  <CopyClipBoard text={row?.bank_detail?.acc_no} />
                </div>
                <div className="text-sm text-gray-500 flex">
                  IFSC:
                  <CopyClipBoard text={row?.bank_detail?.ifsc_code} />
                </div>
                <div className="text-sm text-gray-500 flex">
                  Branch:
                  <CopyClipBoard text={row?.bank_detail?.branch_name} />
                </div>
              </div>
            </>
          )}
        </div>
      ),
    },
    {
      title: "Date",
      key: "request_at",
      dataIndex: "request_at",
      sortable: true,
      render: (index: any, row: any) => (
        <div>
          <div className="flex items-center text-sm text-gray-900">
            <Calendar className="w-4 h-4 mr-2 text-gray-400" />
            {UIHelpers.DateFormat(row.request_at)}
          </div>
          {WIDTHDROW_STATUS[row.status] == "completed" && (
            <div className="text-xs text-gray-500">
              Completed: {UIHelpers.DateFormat(row.updated_at)}
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Status",
      key: "Status",
      render: (index: any, row: any) => (
        <>
          {getStatusBadge(WIDTHDROW_STATUS[row.status])}
          {row.status === 3 && (
            <p className="text-sm text-gray-500 mt-2 flex item-center gap-1">
              <MessageCircle size={16} />
              {row.rejected_details || row.reason}
            </p>
          )}
          {row.status === 1 && row.processing_details && (
            <p className="text-sm text-gray-500 mt-2">{row.processing_details}</p>
          )}
          {row.status === 2 && row.completed_details && (
            <p className="text-sm text-gray-500 mt-2">{row.completed_details}</p>
          )}
        </>
      ),
    },
    {
      title: "Amount",
      key: "amount",
      render: (index: any, row: any) => (
        <div
          className="flex items-center justify-start space-x-2"
          onClick={() => handleStatusUpdate(2)}
        >
          <b>{formatAmount(row.amount)}</b>
        </div>
      ),
    },
    {
      title: "Action",
      render: (index: any, row: any) => (
        <>{renderActionButton(row.id, row.status)}</>
      ),
    },
  ];

  const renderActionButton = (id, status = 0) => {
    if ([2, 3].includes(status)) {
      return <>{getStatusBadge(WIDTHDROW_STATUS[status])}</>;
    }
    return (
      <div className="flex flex-col gap-1">
        <button
          onClick={() => handleStatusUpdate(id, 2)}
          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
        >
          <CheckCircle className="w-4 h-4 mr-2" />
          Complete
        </button>
        {status == 0 && (
          <button
            onClick={() => handleStatusUpdate(id, 1)}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Clock className="w-4 h-4 mr-2" />
            Process
          </button>
        )}

        <button
          onClick={() => handleReject(id)}
          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        >
          <XCircle className="w-4 h-4 mr-2" />
          Reject
        </button>
      </div>
    );
  };

  const { defaultFilter, searchParams } = useQueryParams();
  const { loading: actionLoading, Post: updateWithDrawStatus } = useActionCall(
    SERVICE.WITHDRAW_UPDATE_STATUS
  );
  const [filter, setFilter] = useState(defaultFilter);
  const importRef = useRef<HTMLInputElement>(null);

  const { loading: exportLoading, fetchApi: exportWithdraw } = useGetCall(
    SERVICE.EXPORT_EXCEL,
    {
      avoidFetch: true,
    }
  );

  const { loading, setQuery, data } = useGetCall(SERVICE.WITHDRAW_REQUEST, {
    avoidFetch: true,
  });

  const getWithDrawAPI = () => {
    setQuery(filter);
  };

  useEffect(() => {
    getWithDrawAPI();
  }, [filter]);

  const handleImportFile = async (file: File | null) => {
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`${BASE_URL}${SERVICE.WITHDRAW_IMPORT_EXCEL}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${Lib.getCookies("session-token") ?? ""}`,
      },
      body: formData,
    });

    if (response.ok) {
      Swal.fire({ icon: "success", title: "Import completed" });
      getWithDrawAPI();
    } else {
      Swal.fire({ icon: "error", title: "Import failed" });
    }
  };

  const handleReject = async (id) => {
    Swal.fire({
      title: "Reject Withdrawal Request",
      input: "textarea",
      inputLabel: "Reason for Rejection",
      inputPlaceholder:
        "Please provide a clear reason for rejecting this request...",
      showCancelButton: true,
      confirmButtonText: "Submit Feedback",
      cancelButtonText: "Close",
      showLoaderOnConfirm: true,

      preConfirm: (feedback) => {
        if (!feedback || feedback.trim().length === 0) {
          Swal.showValidationMessage(
            "Please provide reason before submitting."
          );
          return false;
        }

        return feedback.trim();
      },

      // Customize the style of the dialog
      customClass: {
        popup: "my-custom-popup",
        confirmButton: "my-custom-confirm-button",
        cancelButton: "my-custom-cancel-button",
      },
    }).then(async (result) => {
      if (result.isConfirmed) {
        // The user clicked 'Submit Feedback' and preConfirm passed
        const userFeedback = result.value;

        // 1. Process the feedback (e.g., send it to a server)

        const reponse = await updateWithDrawStatus({
          id,
          status: 3,
          reason: userFeedback,
        });
        if (reponse) {
          Swal.fire({
            icon: "success",
            title: "Your request is updated",
            text: "",
            timer: 3000,
            showConfirmButton: false,
          });
          getWithDrawAPI();
        }
      }
    });
  };

  const handleStatusUpdate = async (id, status = 2) => {
    Swal.fire({
      title: status === 1 ? "Move To Processing" : "Mark As Completed",
      input: "textarea",
      inputLabel: status === 1 ? "Processing Details" : "Completion Details",
      inputPlaceholder: "Enter details for this status update",
      showCancelButton: true,
      confirmButtonText: "Save",
    }).then(async (result) => {
      if (result.isConfirmed) {
        const reponse = await updateWithDrawStatus({
          id,
          status,
          details: result.value || "",
        });
        if (reponse) {
          Swal.fire({
            icon: "success",
            title: "Successfully updated",
            text: "The request has been updated successfully.",
          });
          getWithDrawAPI();
        }
      }
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Withdrawal Requests
            </h1>
            <p className="mt-2 text-gray-600">
              Manage your withdrawal requests and track payment status
            </p>
          </div>
          <div className="flex items-center gap-3">
            <input
              ref={importRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              className="hidden"
              onChange={(e) => handleImportFile(e.target.files?.[0] || null)}
            />
            <button
              onClick={() => importRef.current?.click()}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
            >
              <Upload className="w-4 h-4 mr-2" />
              Import Status
            </button>
            <button
              onClick={() =>
                exportWithdraw({
                  query: { ...filter, exports: true },
                  exports: true,
                  downloadFilename: "withdraw_requests.xlsx",
                })
              }
              disabled={exportLoading}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200"
            >
              <Download className="w-4 h-4 mr-2" />
              {exportLoading ? "Exporting..." : "Export"}
            </button>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <FilterTab
        filter={filter}
        setFilter={setFilter}
        TABLE_FILTER={["SEARCH", "WITHDRAW_STATUS", "WALLET_TYPE", "FROM_DATE_PIN", "TO_DATE_PIN"]}
      />
      <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
        <DataTable
          columns={Columns}
          data={data?.data ?? []}
          pageSize={filter.pageSize}
          currentPage={filter.pageNo}
          totalRecords={data?.pageInfo?.total_records ?? 0}
          onPageChange={(page: any) =>
            setFilter((prv) => ({ ...prv, pageNo: page }))
          }
          sortBy={filter.sortBy}
          sortDir={filter.sortDir}
          setSort={(sortData: any) => {
            setFilter((prv) => ({
              ...prv,
              sortBy: sortData.key ?? "",
              sortDir: sortData.sort ?? "",
            }));
          }}
          enableSerial={true}
          isLoading={loading}
          setPageSize={(pageSize: number) => {
            setFilter((prv) => ({ ...prv, pageNo: 1, pageSize: pageSize }));
          }}
        />
      </div>
    </div>
  );
}
