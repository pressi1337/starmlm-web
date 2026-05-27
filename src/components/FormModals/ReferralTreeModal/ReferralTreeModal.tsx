import React from "react";
import { User as UserIcon, Crown, ChevronDown, ChevronRight } from "lucide-react";
import { useGetCall, useQueryParams } from "@/hooks";
import { SERVICE } from "@/constants/services";
import Modal from "@/components/ui/Modal";
import Loader from "@/components/ui/Loader";
import { PROMOTER_LEVEL } from "@/constants/others";

type TreeNode = {
  id: number;
  username: string | null;
  first_name?: string | null;
  last_name?: string | null;
  current_promoter_level: number | null;
  is_distributor: number;
  is_active: number;
  children: TreeNode[];
};

// Single source of truth for level labels, including the trainee (null) case.
// PROMOTER_LEVEL only covers 0–4; we wrap it so the rendering is uniform.
const levelLabel = (level: number | null | undefined): string => {
  if (level === null || level === undefined) return "Trainee";
  const label = PROMOTER_LEVEL[level as number];
  return label ?? `Level ${level}`;
};

const levelChipColor = (level: number | null | undefined): string => {
  switch (level) {
    case 0: return "bg-blue-100 text-blue-700";
    case 1: return "bg-green-100 text-green-700";
    case 2: return "bg-purple-100 text-purple-700";
    case 3: return "bg-yellow-100 text-yellow-700";
    case 4: return "bg-pink-100 text-pink-700";
    default: return "bg-gray-100 text-gray-600";
  }
};

const TreeNodeView: React.FC<{ node: TreeNode; isRoot?: boolean }> = ({
  node,
  isRoot = false,
}) => {
  const [open, setOpen] = React.useState(true);
  const hasChildren = (node.children?.length ?? 0) > 0;
  const displayName =
    node.username ||
    [node.first_name, node.last_name].filter(Boolean).join(" ") ||
    `#${node.id}`;

  return (
    <div className={isRoot ? "" : "ml-5 mt-2"}>
      <div className="flex items-center gap-2 py-1.5 px-2 rounded-md hover:bg-gray-50">
        {hasChildren ? (
          <button
            onClick={() => setOpen((v) => !v)}
            className="text-gray-400 hover:text-gray-700"
            aria-label={open ? "Collapse" : "Expand"}
          >
            {open ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>
        ) : (
          <span className="w-4 h-4 inline-block" />
        )}
        <div className="w-7 h-7 bg-gradient-to-r from-green-600 to-yellow-600 rounded-full flex items-center justify-center flex-shrink-0">
          <UserIcon className="w-4 h-4 text-white" />
        </div>
        <span className="font-medium text-gray-900 text-sm">{displayName}</span>
        <span
          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${levelChipColor(
            node.current_promoter_level
          )}`}
        >
          ({levelLabel(node.current_promoter_level)})
        </span>
        {Number(node.is_distributor) === 1 && (
          <span className="inline-flex items-center px-1.5 py-0.5 text-[10px] font-semibold rounded-full bg-gradient-to-r from-amber-400 to-orange-500 text-white">
            <Crown className="w-2.5 h-2.5 mr-0.5" /> Distributor
          </span>
        )}
        {Number(node.is_active) === 0 && (
          <span className="text-[10px] font-medium text-red-500">
            inactive
          </span>
        )}
      </div>
      {hasChildren && open && (
        <div className="border-l-2 border-gray-200 pl-2 ml-3">
          {node.children.map((child) => (
            <TreeNodeView key={child.id} node={child} />
          ))}
        </div>
      )}
    </div>
  );
};

const ReferralTreeModal: React.FC = () => {
  const { searchParams, updateSearchParam } = useQueryParams();
  const treeUserId = searchParams.get("Tree") || undefined;

  const { data, loading } = useGetCall(SERVICE.REFERRAL_TREE, {
    avoidFetch: !treeUserId,
    key: treeUserId,
  });

  const closeModal = () => {
    updateSearchParam({ deleteParams: ["Modal", "Tree"] });
  };

  const root: TreeNode | null = data?.data ?? null;
  const rootName = root?.username ?? `#${treeUserId ?? ""}`;

  return (
    <Modal
      title={`Referral Tree — ${rootName}`}
      modalSize="lg"
      onClose={closeModal}
    >
      {loading ? (
        <Loader />
      ) : !root ? (
        <div className="text-center py-12 text-gray-500">
          No referral data found for this user.
        </div>
      ) : (
        <div className="max-h-[70vh] overflow-y-auto pr-2">
          <TreeNodeView node={root} isRoot />
          {(root.children?.length ?? 0) === 0 && (
            <div className="text-sm text-gray-500 ml-9 mt-2">
              No referrals yet.
            </div>
          )}
        </div>
      )}
    </Modal>
  );
};

export default ReferralTreeModal;
