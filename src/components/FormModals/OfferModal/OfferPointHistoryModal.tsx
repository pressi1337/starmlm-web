import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Gift, Users } from "lucide-react";
import { useGetCall, useQueryParams } from "@/hooks";
import { SERVICE } from "@/constants/services";
import Modal from "@/components/ui/Modal";
import Loader from "@/components/ui/Loader";
import Lib from "@/utils/Lib";

const PAGE_SIZE = 10;

const Card = ({
  label,
  value,
  tone,
}: {
  label: string;
  value: any;
  tone: "indigo" | "emerald" | "amber";
}) => {
  const tones: Record<string, string> = {
    indigo: "bg-indigo-50 border-indigo-100 text-indigo-700",
    emerald: "bg-emerald-50 border-emerald-100 text-emerald-700",
    amber: "bg-amber-50 border-amber-100 text-amber-700",
  };
  return (
    <div className={`rounded-lg border px-3 py-2 ${tones[tone]}`}>
      <div className="text-[11px] uppercase tracking-wide opacity-80">
        {label}
      </div>
      <div className="text-lg font-bold">{value}</div>
    </div>
  );
};

const typeBadge = (optionType: number, label: string) => (
  <span
    className={`inline-flex items-center px-2 py-0.5 text-xs font-semibold rounded-full ${
      Number(optionType) === 1
        ? "bg-emerald-100 text-emerald-800"
        : "bg-amber-100 text-amber-800"
    }`}
  >
    {label}
  </span>
);

const OfferPointHistoryModal = () => {
  const { searchParams, updateSearchParam } = useQueryParams();
  const View = searchParams.get("View") || undefined;
  const [pageNo, setPageNo] = useState(1);

  // Driven entirely by the effect below: setQuery() does NOT carry the `key`
  // segment, so paginating through it would hit the list endpoint instead of
  // this user's history. fetchApi() takes the key explicitly every time.
  const { data, loading, error, fetchApi } = useGetCall(
    SERVICE.ADMIN_OFFER_POINTS,
    { avoidFetch: true }
  );

  const closeModal = () =>
    updateSearchParam({ deleteParams: ["Modal", "View"] });

  useEffect(() => {
    if (error) closeModal();
  }, [error]);

  useEffect(() => {
    if (View) {
      fetchApi({ key: View, query: { pageSize: PAGE_SIZE, pageNo } });
    }
  }, [View, pageNo]);

  const rows: any[] = data?.data ?? [];
  const totals = data?.totals ?? {};
  const user = data?.user ?? {};
  const totalRecords = data?.pageInfo?.total_records ?? 0;
  const totalPages = data?.pageInfo?.total_pages ?? 1;

  return (
    <Modal title="Offer Points History" modalSize="lg" onClose={closeModal}>
      {loading ? (
        <Loader />
      ) : (
        <div className="space-y-4">
          {/* Who */}
          <div>
            <div className="text-base font-semibold text-gray-900">
              {user?.username ?? "-"}
              {user?.customer_id ? (
                <span className="ml-2 text-xs font-mono text-gray-500">
                  {user.customer_id}
                </span>
              ) : null}
            </div>
            <div className="text-xs text-gray-500">
              {user?.name || ""} {user?.mobile ? `• ${user.mobile}` : ""}
            </div>
          </div>

          {/* Totals */}
          <div className="grid grid-cols-3 gap-2">
            <Card
              label="Own Upgrade"
              value={Lib.formatAmount(totals?.own_points ?? 0)}
              tone="emerald"
            />
            <Card
              label="Referral Upgrade"
              value={Lib.formatAmount(totals?.referral_points ?? 0)}
              tone="amber"
            />
            <Card
              label="Total Points"
              value={Lib.formatAmount(totals?.total_points ?? 0)}
              tone="indigo"
            />
          </div>

          {/* History table */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50">
                  <tr className="text-left text-xs uppercase tracking-wide text-gray-500">
                    <th className="px-3 py-2">Date</th>
                    <th className="px-3 py-2">Type</th>
                    <th className="px-3 py-2">Upgrade</th>
                    <th className="px-3 py-2">From</th>
                    <th className="px-3 py-2 text-right">Points</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {rows.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-3 py-8 text-center text-gray-500"
                      >
                        No points earned yet.
                      </td>
                    </tr>
                  ) : (
                    rows.map((r) => (
                      <tr key={r.id} className="hover:bg-gray-50">
                        <td className="px-3 py-2 whitespace-nowrap text-gray-700">
                          {r.earned_at}
                        </td>
                        <td className="px-3 py-2">
                          {typeBadge(r.option_type, r.option_label)}
                        </td>
                        <td className="px-3 py-2 text-gray-700">
                          {r.level_label}
                        </td>
                        <td className="px-3 py-2 text-gray-700">
                          {Number(r.option_type) === 1 ? (
                            <span className="text-gray-400">Self</span>
                          ) : (
                            <>
                              {r.from_user ?? "-"}
                              {r.from_name ? (
                                <span className="block text-xs text-gray-400">
                                  {r.from_name}
                                </span>
                              ) : null}
                            </>
                          )}
                        </td>
                        <td className="px-3 py-2 text-right font-semibold text-gray-900">
                          +{Lib.formatAmount(r.points)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {totalRecords > PAGE_SIZE && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">
                Page {pageNo} of {totalPages} • {totalRecords} records
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setPageNo((p) => Math.max(1, p - 1))}
                  disabled={pageNo <= 1}
                  className="inline-flex items-center px-3 py-1.5 text-sm rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" /> Prev
                </button>
                <button
                  onClick={() =>
                    setPageNo((p) => (p < totalPages ? p + 1 : p))
                  }
                  disabled={pageNo >= totalPages}
                  className="inline-flex items-center px-3 py-1.5 text-sm rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50"
                >
                  Next <ChevronRight className="w-4 h-4 ml-1" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
};

export default OfferPointHistoryModal;
