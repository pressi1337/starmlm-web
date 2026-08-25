//@ts-nocheck
import { useState, useEffect } from "react";
import {
  History,
  Smartphone,
  Tablet,
  Monitor,
  Clock,
  ShieldCheck,
  UserCog,
  User as UserIcon,
} from "lucide-react";
import { useGetCall, useQueryParams } from "@/hooks";
import { SERVICE } from "@/constants/services";
import DataTable from "@/components/DataTable";
import FilterTab from "@/components/FilterTab";

const ROLE_SUPER_ADMIN = 0;
const ROLE_SUB_ADMIN = 1;

const deviceIcon = (device) => {
  if (device === "Mobile") return Smartphone;
  if (device === "Tablet") return Tablet;
  if (device === "Desktop") return Monitor;
  return Monitor;
};

const roleBadge = (role, label) => {
  const map = {
    [ROLE_SUPER_ADMIN]: { cls: "bg-purple-100 text-purple-800", Icon: ShieldCheck },
    [ROLE_SUB_ADMIN]: { cls: "bg-amber-100 text-amber-800", Icon: UserCog },
  };
  const { cls, Icon } = map[role] ?? {
    cls: "bg-blue-50 text-blue-700",
    Icon: UserIcon,
  };
  return (
    <span
      className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${cls}`}
    >
      <Icon className="w-3 h-3 mr-1" />
      {label}
    </span>
  );
};

export default function LoginLogs() {
  const { defaultFilter } = useQueryParams();
  const [filter, setFilter] = useState({ ...defaultFilter });

  const { loading, setQuery, data } = useGetCall(SERVICE.LOGIN_LOGS, {
    avoidFetch: true,
  });

  const refresh = () => setQuery(filter);

  useEffect(() => {
    refresh();
  }, [filter]);

  const Columns = [
    {
      title: "User",
      key: "username",
      sortable: true,
      render: (_, row) => (
        <div>
          <div className="text-sm font-medium text-gray-900">
            {row.username}
          </div>
          {row.customer_id ? (
            <div className="text-xs font-mono text-gray-500">
              {row.customer_id}
            </div>
          ) : null}
        </div>
      ),
    },
    {
      title: "Type",
      key: "role",
      render: (_, row) => roleBadge(row.role, row.role_label),
    },
    {
      title: "Login Time",
      key: "logged_in_at",
      sortable: true,
      render: (_, row) => (
        <div className="flex items-center text-sm text-gray-900 whitespace-nowrap">
          <Clock className="w-4 h-4 mr-2 text-gray-400" />
          {row.logged_in_at}
        </div>
      ),
    },
    {
      title: "Device",
      key: "device",
      render: (_, row) => {
        const Icon = deviceIcon(row.device);
        return (
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-gray-100 text-gray-600 flex items-center justify-center">
              <Icon className="w-4 h-4" />
            </span>
            <div>
              <div className="text-sm text-gray-900">
                {row.device ?? "Unknown"}
              </div>
              <div className="text-xs text-gray-500">
                {[row.os, row.browser].filter(Boolean).join(" · ")}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      title: "IP Address",
      key: "ip_address",
      render: (_, row) => (
        <span className="text-sm font-mono text-gray-600">
          {row.ip_address ?? "-"}
        </span>
      ),
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <History className="w-7 h-7 text-blue-600" />
          Login History
        </h1>
        <p className="mt-2 text-gray-600">
          Every successful login — who signed in, when, and from which device.
          Search by username, customer ID or IP.
        </p>
      </div>

      <FilterTab
        filter={filter}
        setFilter={setFilter}
        TABLE_FILTER={["SEARCH", "FROM_DATE", "TO_DATE"]}
      />

      <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
        <DataTable
          columns={Columns}
          data={data?.data ?? []}
          pageSize={filter.pageSize}
          currentPage={filter.pageNo}
          totalRecords={data?.pageInfo?.total_records ?? 0}
          onPageChange={(page) =>
            setFilter((prv) => ({ ...prv, pageNo: page }))
          }
          sortBy={filter.sortBy}
          sortDir={filter.sortDir}
          setSort={(sortData) => {
            setFilter((prv) => ({
              ...prv,
              sortBy: sortData.key ?? "",
              sortDir: sortData.sort ?? "",
            }));
          }}
          enableSerial={true}
          isLoading={loading}
          setPageSize={(pageSize) => {
            setFilter((prv) => ({ ...prv, pageNo: 1, pageSize }));
          }}
        />
      </div>
    </div>
  );
}
