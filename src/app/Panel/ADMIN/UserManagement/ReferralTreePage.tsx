import React from "react";
import { useParams } from "react-router-dom";
import {
  ArrowLeft,
  User as UserIcon,
  Crown,
} from "lucide-react";
import { useGetCall, useQueryParams } from "@/hooks";
import { SERVICE } from "@/constants/services";
import { PROMOTER_LEVEL } from "@/constants/others";
import Loader from "@/components/ui/Loader";

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

const levelLabel = (level: number | null | undefined): string => {
  if (level === null || level === undefined) return "Trainee";
  return PROMOTER_LEVEL[level as number] ?? `Level ${level}`;
};

// Color per depth so each generation reads at a glance.
// 0 = root, 1 = direct referrals, 2 = grand-referrals, etc.
const depthCardClass = (depth: number): string => {
  switch (depth % 5) {
    case 0: return "bg-indigo-600 text-white border-indigo-700";
    case 1: return "bg-sky-500 text-white border-sky-600";
    case 2: return "bg-emerald-500 text-white border-emerald-600";
    case 3: return "bg-amber-500 text-white border-amber-600";
    default: return "bg-rose-500 text-white border-rose-600";
  }
};

const levelChipClass = (level: number | null | undefined): string => {
  switch (level) {
    case 0: return "bg-blue-100 text-blue-700";
    case 1: return "bg-green-100 text-green-700";
    case 2: return "bg-purple-100 text-purple-700";
    case 3: return "bg-yellow-100 text-yellow-700";
    case 4: return "bg-pink-100 text-pink-700";
    default: return "bg-gray-100 text-gray-600";
  }
};

// Single recursive node renderer. Uses a classic CSS org-chart pattern:
//   • each <li> sits in a flex row of siblings
//   • ::before/::after on the <li> draw the half-segments of the horizontal
//     connector bar; first/last child trim the outer half so the bar doesn't
//     extend past the row
//   • the child <ul>'s ::before draws the vertical drop from the parent
const TreeOrgNode: React.FC<{ node: TreeNode; depth?: number }> = ({
  node,
  depth = 0,
}) => {
  const displayName =
    node.username ||
    [node.first_name, node.last_name].filter(Boolean).join(" ") ||
    `#${node.id}`;
  const hasChildren = (node.children?.length ?? 0) > 0;

  return (
    <li className="org-li">
      <div
        className={`org-card border ${depthCardClass(depth)} rounded-lg shadow-sm px-3 py-2 inline-flex flex-col items-center gap-1 min-w-[140px] max-w-[220px]`}
      >
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
            <UserIcon className="w-4 h-4 text-white" />
          </div>
          <div className="text-left">
            <div className="text-sm font-semibold leading-tight truncate max-w-[140px]" title={displayName}>
              {displayName}
            </div>
            <div className="flex items-center gap-1 mt-0.5 flex-wrap">
              <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${levelChipClass(node.current_promoter_level)}`}>
                ({levelLabel(node.current_promoter_level)})
              </span>
              {Number(node.is_distributor) === 1 && (
                <span className="inline-flex items-center px-1.5 py-0.5 text-[10px] font-semibold rounded bg-gradient-to-r from-amber-300 to-orange-400 text-amber-900">
                  <Crown className="w-2.5 h-2.5 mr-0.5" /> Distributor
                </span>
              )}
              {Number(node.is_active) === 0 && (
                <span className="text-[10px] font-medium text-red-200">inactive</span>
              )}
            </div>
          </div>
        </div>
      </div>
      {hasChildren && (
        <ul className="org-children">
          {node.children.map((child) => (
            <TreeOrgNode key={child.id} node={child} depth={depth + 1} />
          ))}
        </ul>
      )}
    </li>
  );
};

const ReferralTreePage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const { navigate } = useQueryParams();

  const { data, loading } = useGetCall(SERVICE.REFERRAL_TREE, {
    avoidFetch: !userId,
    key: userId,
  });

  const root: TreeNode | null = data?.data ?? null;
  const rootName = root?.username ?? `#${userId ?? ""}`;
  const totalDescendants = React.useMemo(() => {
    const count = (n: TreeNode | null): number => {
      if (!n) return 0;
      let c = 0;
      for (const ch of n.children ?? []) c += 1 + count(ch);
      return c;
    };
    return count(root);
  }, [root]);

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Org-chart connector CSS — kept local since this is the only page
          that needs it. Uses a classic pseudo-element pattern: each child
          <li> draws half of the horizontal bar above it, plus a short
          vertical drop from the parent. */}
      <style>{`
        .tree-org { padding: 0; margin: 0; }
        .tree-org ul { list-style: none; padding: 0; margin: 0; }
        .tree-org .org-children {
          display: flex;
          justify-content: center;
          padding-top: 28px;
          position: relative;
        }
        .tree-org .org-children::before {
          content: "";
          position: absolute;
          top: 0;
          left: 50%;
          width: 0;
          height: 28px;
          border-left: 2px solid #cbd5e1; /* slate-300 */
        }
        .tree-org .org-li {
          flex: 1 1 auto;
          padding: 0 8px;
          position: relative;
          text-align: center;
          min-width: max-content;
        }
        .tree-org .org-li::before,
        .tree-org .org-li::after {
          content: "";
          position: absolute;
          top: -28px;
          width: 50%;
          height: 28px;
          border-top: 2px solid #cbd5e1;
        }
        .tree-org .org-li::before { left: 0; }
        .tree-org .org-li::after  { left: 50%; }
        .tree-org .org-li:only-child::before,
        .tree-org .org-li:only-child::after {
          display: none;
        }
        .tree-org .org-li:only-child { padding-top: 0; }
        .tree-org .org-li:first-child::before { border-top: 0; }
        .tree-org .org-li:last-child::after  { border-top: 0; }
        /* Vertical drop from parent card down to the horizontal bar */
        .tree-org .org-card { position: relative; }
        .tree-org .org-li > .org-card::after {
          content: "";
          position: absolute;
          left: 50%;
          bottom: -14px;
          width: 0;
          height: 0;
        }
      `}</style>

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate.goBack()}
            className="inline-flex items-center justify-center w-9 h-9 rounded-full border border-gray-200 text-gray-600 hover:bg-gray-100"
            title="Back"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Referral Tree {root ? <span className="text-gray-500 font-normal">— @{rootName}</span> : null}
            </h1>
            <p className="text-sm text-gray-500">
              Multi-level downline. Level shown in brackets next to each user.
            </p>
          </div>
        </div>
        {!loading && root && (
          <div className="text-right">
            <div className="text-xs text-gray-500">Total descendants</div>
            <div className="text-xl font-semibold text-gray-900">{totalDescendants}</div>
          </div>
        )}
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
        {loading ? (
          <div className="py-16">
            <Loader />
          </div>
        ) : !root ? (
          <div className="text-center py-16 text-gray-500">
            No referral data found for this user.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <div className="tree-org min-w-max p-8">
              <ul>
                <TreeOrgNode node={root} depth={0} />
              </ul>
              {(root.children?.length ?? 0) === 0 && (
                <div className="text-sm text-gray-500 text-center mt-6">
                  This user has no referrals yet.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReferralTreePage;
