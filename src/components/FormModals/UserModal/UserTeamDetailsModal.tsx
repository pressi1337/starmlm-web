import { useGetCall, useQueryParams } from "@/hooks";
import Modal from "@/components/ui/Modal";
import Loader from "@/components/ui/Loader";
import { SERVICE } from "@/constants/services";
import Lib from "@/utils/Lib";
import { GitBranch, Layers3, Phone, Users } from "lucide-react";

function TreeNode({ node }: any) {
  return (
    <div className="ml-4 border-l border-gray-200 pl-4 py-2">
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          <div>
            <div className="text-sm font-semibold text-gray-900">
              {node.username}
            </div>
            <div className="text-xs text-gray-500">
              {node.first_name} {node.last_name} • {node.mobile}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${Lib.promoterLevelColor(node.current_promoter_level)}`}>
              {node.promoter_label}
            </span>
            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${node.is_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
              {node.is_active ? "Active" : "Inactive"}
            </span>
            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-700">
              Depth {node.depth}
            </span>
            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-700">
              Direct {node.direct_children_count}
            </span>
          </div>
        </div>
      </div>
      {node.children?.length ? (
        <div className="mt-3 space-y-2">
          {node.children.map((child: any) => (
            <TreeNode key={child.id} node={child} />
          ))}
        </div>
      ) : null}
    </div>
  );
}

export default function UserTeamDetailsModal() {
  const { searchParams, updateSearchParam } = useQueryParams();
  const editId = searchParams.get("Edit") || "";

  const { data, loading } = useGetCall(`${SERVICE.REFERRAL_TEAM_DETAILS}/${editId}/team-details`, {
    avoidFetch: !editId,
  });

  const closeModal = () => {
    updateSearchParam({ deleteParams: ["Modal", "Edit", "Duplicate"] });
  };

  const details = data?.data;

  return (
    <Modal title="Customer Team Tree Details" modalSize="xl" onClose={closeModal}>
      {loading ? (
        <Loader />
      ) : details ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
              <div className="text-xs uppercase tracking-wide text-gray-500">Customer</div>
              <div className="mt-2 text-lg font-semibold text-gray-900">{details.user?.username}</div>
              <div className="text-sm text-gray-600">{details.user?.first_name} {details.user?.last_name}</div>
              <div className="mt-2 flex items-center gap-2 text-sm text-gray-600">
                <Phone className="w-4 h-4" />
                {details.user?.mobile}
              </div>
            </div>
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
              <div className="text-xs uppercase tracking-wide text-gray-500">My Promotor</div>
              <div className="mt-2 text-lg font-semibold text-gray-900">
                {details.my_promotor?.username || "No parent"}
              </div>
              <div className="text-sm text-gray-600">
                {details.my_promotor?.mobile || "No direct parent found"}
              </div>
            </div>
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
              <div className="text-xs uppercase tracking-wide text-gray-500">Direct / Team</div>
              <div className="mt-2 text-lg font-semibold text-gray-900">
                {details.direct_referrals?.length || 0} / {details.total_team_count || 0}
              </div>
              <div className="text-sm text-gray-600">Direct only and total team count</div>
            </div>
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
              <div className="text-xs uppercase tracking-wide text-gray-500">Ceiling Limit</div>
              <div className="mt-2 text-lg font-semibold text-gray-900">
                {details.ceiling_limit || 0}
              </div>
              <div className="text-sm text-gray-600">Configured visible team depth</div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-1 rounded-xl border border-gray-200 p-4">
              <div className="flex items-center gap-2 text-gray-900 font-semibold">
                <Users className="w-4 h-4" />
                Team Depth Counts
              </div>
              <div className="mt-4 space-y-3">
                {details.team_counts_by_depth?.length ? details.team_counts_by_depth.map((item: any) => (
                  <div key={item.depth} className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
                    <span className="text-sm text-gray-600">Depth {item.depth}</span>
                    <span className="font-semibold text-gray-900">{item.count}</span>
                  </div>
                )) : (
                  <div className="text-sm text-gray-500">No team members found.</div>
                )}
              </div>
            </div>

            <div className="xl:col-span-2 rounded-xl border border-gray-200 p-4">
              <div className="flex items-center gap-2 text-gray-900 font-semibold">
                <GitBranch className="w-4 h-4" />
                Complete Team Tree
              </div>
              <div className="mt-4 max-h-[70vh] overflow-auto pr-2">
                {details.team_tree?.length ? (
                  <div className="space-y-3">
                    {details.team_tree.map((node: any) => (
                      <TreeNode key={node.id} node={node} />
                    ))}
                  </div>
                ) : (
                  <div className="rounded-lg bg-gray-50 p-6 text-sm text-gray-500">
                    No team tree available for this customer.
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-2 text-gray-900 font-semibold">
              <Layers3 className="w-4 h-4" />
              Wallet Summary
            </div>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded-lg bg-blue-50 p-4 border border-blue-100">
                <div className="text-xs uppercase tracking-wide text-blue-600">Cash Wallet</div>
                <div className="mt-2 text-xl font-semibold text-blue-900">₹{Lib.formatAmount(details.user?.quiz_total_earning || 0)}</div>
              </div>
              <div className="rounded-lg bg-orange-50 p-4 border border-orange-100">
                <div className="text-xs uppercase tracking-wide text-orange-600">Scratch Wallet</div>
                <div className="mt-2 text-xl font-semibold text-orange-900">₹{Lib.formatAmount(details.user?.scratch_total_earning || 0)}</div>
              </div>
              <div className="rounded-lg bg-purple-50 p-4 border border-purple-100">
                <div className="text-xs uppercase tracking-wide text-purple-600">Grow Wallet</div>
                <div className="mt-2 text-xl font-semibold text-purple-900">₹{Lib.formatAmount(details.user?.saving_total_earning || 0)}</div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-sm text-gray-500">Team details not available.</div>
      )}
    </Modal>
  );
}
