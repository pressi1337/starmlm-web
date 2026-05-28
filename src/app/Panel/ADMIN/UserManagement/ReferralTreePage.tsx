import React from "react";
import { useParams } from "react-router-dom";
import {
  ArrowLeft,
  User as UserIcon,
  Crown,
  Plus,
  Minus,
  ZoomIn,
  ZoomOut,
  RotateCcw,
} from "lucide-react";
import { useGetCall, useQueryParams } from "@/hooks";
import { SERVICE } from "@/constants/services";
import { PROMOTER_LEVEL } from "@/constants/others";
import Loader from "@/components/ui/Loader";

type TreeNode = {
  id: number;
  username: string | null;
  customer_id?: string | null;
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

// Per-depth card color so each generation reads at a glance. Cycles after 5
// so very deep trees still render — colors mirror the reference org-chart.
const depthCardClass = (depth: number): string => {
  switch (depth % 5) {
    case 0: return "bg-indigo-700 border-indigo-800";
    case 1: return "bg-sky-500 border-sky-600";
    case 2: return "bg-emerald-500 border-emerald-600";
    case 3: return "bg-amber-500 border-amber-600";
    default: return "bg-rose-500 border-rose-600";
  }
};

const levelChipClass = (level: number | null | undefined): string => {
  switch (level) {
    case 0: return "bg-blue-100 text-blue-800";
    case 1: return "bg-green-100 text-green-800";
    case 2: return "bg-purple-100 text-purple-800";
    case 3: return "bg-yellow-100 text-yellow-800";
    case 4: return "bg-pink-100 text-pink-800";
    default: return "bg-gray-200 text-gray-700";
  }
};

// Recursive node. Local expanded state; root (depth 0) opens by default so the
// first level of referrals is visible without interaction, deeper levels stay
// collapsed until the user hits the [+] toggle.
const TreeOrgNode: React.FC<{ node: TreeNode; depth?: number }> = ({
  node,
  depth = 0,
}) => {
  const [expanded, setExpanded] = React.useState<boolean>(depth === 0);
  const displayName =
    node.username ||
    [node.first_name, node.last_name].filter(Boolean).join(" ") ||
    `#${node.id}`;
  const childCount = node.children?.length ?? 0;
  const hasChildren = childCount > 0;

  return (
    <li className="org-li">
      <div className={`org-card ${depthCardClass(depth)} text-white border-2 rounded-xl shadow-md`}>
        <div className="flex items-center gap-3 px-4 pt-3 pb-2">
          <div className="w-10 h-10 rounded-full bg-white/25 flex items-center justify-center flex-shrink-0">
            <UserIcon className="w-5 h-5 text-white" />
          </div>
          <div className="text-left min-w-0">
            <div
              className="text-sm font-bold leading-tight truncate"
              title={displayName}
            >
              {displayName}
            </div>
            {node.customer_id && (
              <div className="text-[10px] text-white/85 leading-tight">
                Customer ID:{" "}
                <span className="font-mono font-semibold">{node.customer_id}</span>
              </div>
            )}
            <div className="flex items-center gap-1 mt-1 flex-wrap">
              <span
                className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${levelChipClass(
                  node.current_promoter_level
                )}`}
              >
                ({levelLabel(node.current_promoter_level)})
              </span>
              {Number(node.is_distributor) === 1 && (
                <span className="inline-flex items-center px-1.5 py-0.5 text-[10px] font-semibold rounded bg-gradient-to-r from-amber-300 to-orange-400 text-amber-900">
                  <Crown className="w-2.5 h-2.5 mr-0.5" /> Distributor
                </span>
              )}
              {Number(node.is_active) === 0 && (
                <span className="text-[10px] font-medium text-red-100 bg-red-900/40 px-1.5 py-0.5 rounded">
                  inactive
                </span>
              )}
            </div>
          </div>
        </div>
        {hasChildren && (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="w-full bg-white/15 hover:bg-white/25 text-white text-[11px] font-semibold py-1.5 px-3 flex items-center justify-center gap-1 border-t border-white/20 rounded-b-[10px] transition-colors"
            title={expanded ? "Collapse this branch" : `Expand ${childCount} direct referral${childCount === 1 ? "" : "s"}`}
          >
            {expanded ? (
              <>
                <Minus className="w-3 h-3" /> Hide {childCount}
              </>
            ) : (
              <>
                <Plus className="w-3 h-3" /> Show {childCount}
              </>
            )}
          </button>
        )}
      </div>
      {hasChildren && expanded && (
        <ul className="org-children">
          {node.children.map((child) => (
            <TreeOrgNode key={child.id} node={child} depth={depth + 1} />
          ))}
        </ul>
      )}
    </li>
  );
};

const MIN_ZOOM = 40;
const MAX_ZOOM = 200;
const ZOOM_STEP = 10;

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

  const [zoomPct, setZoomPct] = React.useState<number>(100);
  const zoomIn = () =>
    setZoomPct((z) => Math.min(MAX_ZOOM, z + ZOOM_STEP));
  const zoomOut = () =>
    setZoomPct((z) => Math.max(MIN_ZOOM, z - ZOOM_STEP));
  const resetZoom = () => setZoomPct(100);

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Org-chart connector CSS — pseudo-elements draw half-bars per child
          and a vertical drop from each parent's child <ul>. Kept local since
          this is the only page that needs it. */}
      <style>{`
        .tree-org { padding: 0; margin: 0; }
        .tree-org ul { list-style: none; padding: 0; margin: 0; }
        .tree-org .org-children {
          display: flex;
          justify-content: center;
          padding-top: 32px;
          position: relative;
        }
        .tree-org .org-children::before {
          content: "";
          position: absolute;
          top: 0;
          left: 50%;
          width: 0;
          height: 32px;
          border-left: 2px solid #94a3b8; /* slate-400 */
        }
        .tree-org .org-li {
          flex: 1 1 auto;
          padding: 0 12px;
          position: relative;
          text-align: center;
          min-width: max-content;
        }
        .tree-org .org-li::before,
        .tree-org .org-li::after {
          content: "";
          position: absolute;
          top: -32px;
          width: 50%;
          height: 32px;
          border-top: 2px solid #94a3b8;
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
        .tree-org .org-card { display: inline-block; text-align: left; min-width: 200px; }
      `}</style>

      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate.push("/portal/admin/users")}
            className="inline-flex items-center justify-center w-9 h-9 rounded-full border border-gray-200 text-gray-600 hover:bg-gray-100"
            title="Back to User Management"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Referral Tree{" "}
              {root ? (
                <span className="text-gray-500 font-normal">— @{rootName}</span>
              ) : null}
            </h1>
            <p className="text-sm text-gray-500">
              First level expanded by default — use{" "}
              <span className="inline-flex items-center px-1 rounded bg-gray-200 text-gray-700">
                <Plus className="w-3 h-3" />
              </span>{" "}
              on any node to reveal its branch.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Zoom controls */}
          <div className="inline-flex items-center bg-white border border-gray-200 rounded-lg shadow-sm">
            <button
              type="button"
              onClick={zoomOut}
              disabled={zoomPct <= MIN_ZOOM}
              className="p-2 text-gray-700 hover:bg-gray-100 disabled:opacity-40 rounded-l-lg"
              title="Zoom out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="px-3 text-sm font-medium text-gray-700 select-none w-14 text-center">
              {zoomPct}%
            </span>
            <button
              type="button"
              onClick={zoomIn}
              disabled={zoomPct >= MAX_ZOOM}
              className="p-2 text-gray-700 hover:bg-gray-100 disabled:opacity-40"
              title="Zoom in"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={resetZoom}
              disabled={zoomPct === 100}
              className="p-2 text-gray-700 hover:bg-gray-100 disabled:opacity-40 rounded-r-lg border-l border-gray-200"
              title="Reset zoom"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {!loading && root && (
            <div className="text-right">
              <div className="text-xs text-gray-500">Total descendants</div>
              <div className="text-xl font-semibold text-gray-900">
                {totalDescendants}
              </div>
            </div>
          )}
        </div>
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
          <div className="overflow-auto max-h-[75vh]">
            {/* CSS `zoom` (vs transform: scale) so the scroll container's
                inner size adapts naturally to the scaled tree — no awkward
                empty gutters at small zoom levels. */}
            <div
              className="tree-org min-w-max p-8"
              style={{ zoom: `${zoomPct}%` }}
            >
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
