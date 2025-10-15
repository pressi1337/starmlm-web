import React, { useState, useEffect } from "react";
import {
  HeartHandshake,
  Clock,
  CheckCircle,
  XCircle,
  User,
  Smartphone,
  CircleX,
} from "lucide-react";
import { useActionCall, useGetCall, useQueryParams } from "@/hooks";
import { OPTIONS } from "@/constants/others";
import { SERVICE } from "@/constants/services";
import DataTable from "@/components/DataTable";
import Swal from "sweetalert2";
import FilterTab from "@/components/FilterTab";

export default function PROMOTIONVIDEOS() {
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
        text: "Pin Generated",
      },
      2: {
        color: "bg-blue-100 text-blue-800",
        icon: CheckCircle,
        text: "Pin Activated",
      },
      3: { color: "bg-red-100 text-red-800", icon: CircleX, text: "Rejected" },
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
  const Columns: any = [
    {
      title: "User",
      key: "id",
      sortable: true,
      render: (index: any, row: any) => {
        console.log("roedatata", row);
        return (
          <div className="flex items-center">
            <div className="w-10 h-10 bg-gradient-to-r from-green-600 to-yellow-600 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div className="ml-4">
              <div className="text-sm font-medium text-gray-900">
                {row?.user?.first_name}
              </div>
              <div className="text-sm text-gray-500 flex items-center">
                <Smartphone className="w-3 h-3 mr-1" />
                {row?.user?.mobile}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      title: "Level Upgrade",
      key: "level_upgrade",
      render: (index: any, row: any) => (
        <div>
          <div
            className={`text-sm font-medium text-gray-900 ${
              OPTIONS.PROMOTER_LEVEL[row.level].color
            }`}
            title={row.level}
          >
            {OPTIONS.PROMOTER_LEVEL[row.level].label}
          </div>
        </div>
      ),
    },
    {
      title: "Request Date",
      key: "request_date",
      render: (index: any, row: any) => (
        <div>
          <div className="text-sm font-medium text-gray-900">
            {row?.created_at_formatted}
          </div>
        </div>
      ),
    },
    {
      title: "Status",
      key: "status",
      render: (index: any, row: any) => (
        <div>
          <div className="text-sm font-medium text-gray-900">
            {getStatusBadge(row?.status)}
          </div>
        </div>
      ),
    },
    {
      title: "Action",
      key: "action",
      render: (index: any, row: any) => (
        <div className="flex items-center justify-start space-x-2">
          {row?.user?.promoter_status === 0 && row?.status === 0 && (
            <button
              className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-full text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              onClick={() => handleRaiseTerm(row.id)}
            >
              <HeartHandshake className="w-3 h-3 mr-1" />
              Raise Term
            </button>
          )}
          {row?.user?.promoter_status === 2 && row?.status === 0 && (
            <button
              className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-full text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              onClick={() => handleGeneratePin(row.id)}
            >
              Generate Pin
            </button>
          )}
          {![1, 3, 4].includes(row?.user?.promoter_status) &&
            row?.status === 0 && (
              <button
                className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-full text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                onClick={() => handleReject(row.id)}
              >
                <XCircle className="w-3 h-3 mr-1" />
                Reject
              </button>
            )}
        </div>
      ),
    },
  ];

  const { defaultFilter, updateSearchParam, searchParams } = useQueryParams();
  const Modal = searchParams.get("Modal") || undefined;
  const [filter, setFilter] = useState(defaultFilter);
  const { loading, setQuery, data } = useGetCall(SERVICE.ADMIN_PIN_REQUESTS, {
    avoidFetch: true,
  });

  const { loading: deleteLoading, Delete: DeleteTrainingVideo } = useActionCall(
    SERVICE.ADMIN_PIN_REQUESTS
  );

  const { loading: raiseTermLoading, Post: RaiseTerm } = useActionCall(
    SERVICE.RIASE_TERM
  );

  const { loading: generatePinLoading, Post: GeneratePin } = useActionCall(
    SERVICE.GENERATE_PIN
  );

  const { loading: rejectLoading, Post: Reject } = useActionCall(
    SERVICE.REJECT_REQUEST
  );

  const getStatsCounts = () => {
    if (!data?.data || !Array.isArray(data.data)) {
      return {
        pending: 0,
        approved: 0,
        activated: 0,
        rejected: 0,
      };
    }

    return data.data.reduce(
      (acc, item) => {
        switch (item.status) {
          case "pending":
            acc.pending++;
            break;
          case "approved":
            acc.approved++;
            break;
          case "activated":
            acc.activated++;
            break;
          case "rejected":
            acc.rejected++;
            break;
        }
        return acc;
      },
      { pending: 0, approved: 0, activated: 0, rejected: 0 }
    );
  };

  const stats = getStatsCounts();

  const PromotionVideoAPI = () => {
    setQuery(filter);
  };

  useEffect(() => {
    PromotionVideoAPI();
  }, [filter]);

  const ConfirmDeleteModal = async (value: string) => {
    const swalWithTailwind = Swal.mixin({
      customClass: {
        confirmButton:
          "bg-red-600 hover:bg-red-700 text-white font-medium px-4 py-2 rounded-md shadow-sm transition-all duration-200 ml-3",
        cancelButton:
          "bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium px-4 py-2 rounded-md shadow-sm transition-all duration-200",
        popup:
          "rounded-xl shadow-2xl border border-gray-200 bg-white p-6 dark:bg-gray-800 dark:border-gray-700",
        title: "text-lg font-semibold text-gray-800 dark:text-gray-100",
        htmlContainer: "text-gray-600 dark:text-gray-300",
      },
      buttonsStyling: false,
    });

    swalWithTailwind
      .fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, delete it!",
        cancelButtonText: "No, cancel!",
        reverseButtons: true,
        padding: "2em",
        backdrop: true,
      })
      .then(async (result) => {
        if (result.isConfirmed) {
          const resp = await DeleteTrainingVideo(value);
          if (resp) {
            PromotionVideoAPI();
            Swal.fire({
              icon: "success",
              title: "Deleted!",
              text: "Your record has been deleted successfully.",
              confirmButtonText: "OK",
              customClass: {
                confirmButton:
                  "bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-md transition-all duration-200",
              },
            });
          }
        }
      });
  };

  const handleRaiseTerm = async (userPromoterId: number) => {
    try {
      const response = await RaiseTerm({ id: userPromoterId });
      if (response) {
        PromotionVideoAPI();
        Swal.fire({
          icon: "success",
          title: "Success!",
          text: "Term raised successfully.",
          confirmButtonText: "OK",
          customClass: {
            confirmButton:
              "bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-md transition-all duration-200",
          },
        });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: "Failed to raise term. Please try again.",
        confirmButtonText: "OK",
        customClass: {
          confirmButton:
            "bg-red-600 hover:bg-red-700 text-white font-medium px-4 py-2 rounded-md transition-all duration-200",
        },
      });
    }
  };

  const handleGeneratePin = async (userPromoterId: number) => {
    try {
      const response = await GeneratePin({ id: userPromoterId });
      if (response) {
        PromotionVideoAPI();
        Swal.fire({
          icon: "success",
          title: "Success!",
          text: "Pin generated successfully.",
          confirmButtonText: "OK",
          customClass: {
            confirmButton:
              "bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-md transition-all duration-200",
          },
        });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: "Failed to generate pin. Please try again.",
        confirmButtonText: "OK",
        customClass: {
          confirmButton:
            "bg-red-600 hover:bg-red-700 text-white font-medium px-4 py-2 rounded-md transition-all duration-200",
        },
      });
    }
  };

  const handleReject = async (userPromoterId: number) => {
    try {
      const response = await Reject({ id: userPromoterId });
      if (response) {
        PromotionVideoAPI();
        Swal.fire({
          icon: "success",
          title: "Success!",
          text: "Request rejected successfully.",
          confirmButtonText: "OK",
          customClass: {
            confirmButton:
              "bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-md transition-all duration-200",
          },
        });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: "Failed to reject request. Please try again.",
        confirmButtonText: "OK",
        customClass: {
          confirmButton:
            "bg-red-600 hover:bg-red-700 text-white font-medium px-4 py-2 rounded-md transition-all duration-200",
        },
      });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Pin Requests</h1>
            <p className="mt-2 text-gray-600">
              Manage user level upgrade requests and pin generation
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Pending</p>
              <p className="text-2xl font-semibold text-gray-900">
                {stats.pending}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Approved</p>
              <p className="text-2xl font-semibold text-gray-900">
                {stats.approved}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Activated</p>
              <p className="text-2xl font-semibold text-gray-900">
                {stats.activated}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center">
              <XCircle className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Rejected</p>
              <p className="text-2xl font-semibold text-gray-900">
                {stats.rejected}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <FilterTab
        filter={filter}
        setFilter={setFilter}
        TABLE_FILTER={["SEARCH"]}
      />
      <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
        <DataTable
          columns={Columns}
          data={data?.data || []}
          loading={loading}
          filter={filter}
          setFilter={setFilter}
          totalRecords={data?.pageInfo?.total_records || 0}
          searchPlaceholder="Search training videos..."
          showSearch={true}
          showPagination={true}
        />
      </div>
    </div>
  );
}
