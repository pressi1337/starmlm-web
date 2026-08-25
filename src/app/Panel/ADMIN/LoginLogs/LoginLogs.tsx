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
  AlertTriangle,
  MapPin,
  Wifi,
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
              {/* Brand + model, e.g. "Samsung SM-G991B". */}
              <div className="text-sm font-medium text-gray-900">
                {row.device_name || row.device_model || row.device || "Unknown"}
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
      title: "Accounts on Device",
      key: "accounts_on_device",
      render: (_, row) => {
        if (!row.device_id) {
          // Logged in before device tracking shipped, or storage was blocked.
          return <span className="text-xs text-gray-400">no device id</span>;
        }
        const count = Number(row.accounts_on_device ?? 1);
        const shared = count > 1;
        return (
          <button
            type="button"
            onClick={() =>
              setFilter((prv) => ({
                ...prv,
                search: row.device_id,
                pageNo: 1,
              }))
            }
            title="Click to see every login from this device"
            className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${
              shared
                ? "bg-red-100 text-red-800 hover:bg-red-200"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {shared && <AlertTriangle className="w-3 h-3 mr-1" />}
            {count} {count === 1 ? "account" : "accounts"}
          </button>
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
    {
      title: "Location",
      key: "location",
      render: (_, row) => {
        if (!row.location && !row.isp) {
          return <span className="text-xs text-gray-400">-</span>;
        }
        return (
          <div className="min-w-[150px]">
            {row.location ? (
              <div className="flex items-start text-sm text-gray-900">
                <MapPin className="w-3.5 h-3.5 mr-1 mt-0.5 text-gray-400 shrink-0" />
                <span>{row.location}</span>
              </div>
            ) : null}
            {/* The network behind the IP — a mobile carrier here is why many
                unrelated users can share one address. */}
            {row.isp ? (
              <div className="flex items-start text-xs text-gray-500 mt-0.5">
                <Wifi className="w-3 h-3 mr-1 mt-0.5 text-gray-400 shrink-0" />
                <span>{row.isp}</span>
              </div>
            ) : null}
          </div>
        );
      },
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
          Search by username, customer ID, IP, device or location.
        </p>
        <p className="mt-2 text-sm text-gray-500">
          <b>Accounts on Device</b> counts how many different accounts have
          signed in from that same phone — click it to see them all. An IP only
          identifies a network (a whole household or mobile carrier shares
          one), so the device count is the far stronger signal.
        </p>
        <p className="mt-1 text-sm text-gray-500">
          <b>Location</b> is estimated from the IP address. Country is reliable;
          the city is a good guess on home broadband but often wrong on mobile
          data, where the carrier's routing city is shown instead of the user's.
          The network name below it is the useful part — a mobile carrier there
          explains why unrelated people share one IP.
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
