//@ts-nocheck
import { useState, useEffect, useMemo } from "react";
import {
  Gift,
  Save,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Trophy,
  Pencil,
  Trash2,
  Medal,
  X,
} from "lucide-react";
import { useActionCall, useGetCall, useQueryParams } from "@/hooks";
import { SERVICE } from "@/constants/services";
import { MODAL_OPEN } from "@/constants/others";
import DataTable from "@/components/DataTable";
import FilterTab from "@/components/FilterTab";
import Loader from "@/components/ui/Loader";
import Lib from "@/utils/Lib";
import OfferPointHistoryModal from "@/components/FormModals/OfferModal/OfferPointHistoryModal";

// Points are per level REACHED (not per from→to step) — levels can be skipped,
// e.g. a Promoter 1 can go straight to Promoter 3 or 4. Keys match the
// offer_settings columns 1:1.
const LEVEL_FIELDS = [
  { key: "promotor_points", label: "Promoter" },
  { key: "promotor1_points", label: "Promoter 1" },
  { key: "promotor2_points", label: "Promoter 2" },
  { key: "promotor3_points", label: "Promoter 3" },
  { key: "promotor4_points", label: "Promoter 4" },
];

const OPTIONS = [
  { value: 1, label: "Own" },
  { value: 2, label: "Referral" },
];

const emptyPoints = () =>
  LEVEL_FIELDS.reduce((acc, f) => ({ ...acc, [f.key]: "" }), {});

export default function Offers() {
  const { defaultFilter, updateSearchParam, searchParams } = useQueryParams();
  const Modal = searchParams.get("Modal") || undefined;
  const [activeTab, setActiveTab] = useState("details");

  // ── Offer master config ───────────────────────────────────────────────────
  const {
    data: configData,
    loading: configLoading,
    fetchApi: refetchConfig,
  } = useGetCall(SERVICE.OFFER_CONFIG);
  const { Post: saveConfig, loading: savingConfig } = useActionCall(
    SERVICE.OFFER_CONFIG
  );

  const [isActive, setIsActive] = useState(0);
  const [startAt, setStartAt] = useState("");
  const [topCount, setTopCount] = useState(10);

  useEffect(() => {
    const c = configData?.data;
    if (c) {
      setIsActive(Number(c.is_active) || 0);
      setStartAt(c.start_at ?? "");
      setTopCount(Number(c.top_list_count) || 10);
    }
  }, [configData]);

  const handleSaveConfig = async () => {
    const res = await saveConfig({
      is_active: isActive ? 1 : 0,
      start_at: startAt || null,
      top_list_count: Number(topCount) || 10,
    });
    if (res) refetchConfig({});
  };

  // ── Points per upgrade (one row per option) ───────────────────────────────
  const {
    data: settingsData,
    loading: settingsLoading,
    fetchApi: refetchSettings,
  } = useGetCall(SERVICE.OFFER_SETTINGS);
  const { Post: saveSettings, loading: savingSettings } = useActionCall(
    SERVICE.OFFER_SETTINGS_UPSERT
  );

  const [optionType, setOptionType] = useState(1);
  const [points, setPoints] = useState(emptyPoints());

  const savedSettings = settingsData?.data ?? [];

  // Load the selected option's stored values into the form.
  useEffect(() => {
    const row = savedSettings.find(
      (s) => Number(s.option_type) === Number(optionType)
    );
    if (row) {
      setPoints(
        LEVEL_FIELDS.reduce(
          (acc, f) => ({ ...acc, [f.key]: row[f.key] ?? 0 }),
          {}
        )
      );
    } else {
      setPoints(emptyPoints());
    }
  }, [optionType, settingsData]);

  const handleSavePoints = async () => {
    const payload = { option_type: Number(optionType) };
    LEVEL_FIELDS.forEach((f) => {
      payload[f.key] = points[f.key] === "" ? 0 : Number(points[f.key]);
    });
    const res = await saveSettings(payload);
    if (res) refetchSettings({});
  };

  // ── Tab 2: per-user points ────────────────────────────────────────────────
  const [filter, setFilter] = useState({ ...defaultFilter });
  const {
    data: pointsData,
    loading: pointsLoading,
    setQuery,
  } = useGetCall(SERVICE.ADMIN_OFFER_POINTS, { avoidFetch: true });

  useEffect(() => {
    if (activeTab === "points") setQuery(filter);
  }, [filter, activeTab]);

  // ── Tab 3: manual (display-only) leaderboard rows ─────────────────────────
  const {
    data: dummyData,
    loading: dummyLoading,
    setQuery: loadDummies,
  } = useGetCall(SERVICE.OFFER_DUMMY_ENTRIES, { avoidFetch: true });
  const { Post: saveDummy, loading: savingDummy } = useActionCall(
    SERVICE.OFFER_DUMMY_UPSERT
  );
  const { Delete: deleteDummy } = useActionCall(SERVICE.OFFER_DUMMY_ENTRIES);
  const {
    data: previewData,
    loading: previewLoading,
    fetchApi: loadPreview,
  } = useGetCall(SERVICE.ADMIN_OFFER_TOP_LIST, { avoidFetch: true });

  const [dummyFilter, setDummyFilter] = useState({ ...defaultFilter });
  const emptyDummy = { id: null, username: "", name: "", points: "" };
  const [dummyForm, setDummyForm] = useState(emptyDummy);

  const refreshManual = () => {
    loadDummies(dummyFilter);
    loadPreview({});
  };

  useEffect(() => {
    if (activeTab === "manual") refreshManual();
  }, [dummyFilter, activeTab]);

  const handleSaveDummy = async () => {
    if (!dummyForm.username?.trim()) return;
    const payload = {
      username: dummyForm.username,
      name: dummyForm.name,
      points: Number(dummyForm.points) || 0,
      is_active: 1,
    };
    if (dummyForm.id) payload.id = dummyForm.id;
    const res = await saveDummy(payload);
    if (res) {
      setDummyForm(emptyDummy);
      refreshManual();
    }
  };

  const handleDeleteDummy = async (id) => {
    const res = await deleteDummy(id);
    if (res) refreshManual();
  };

  // Top-3 get a highlighted badge, matching the user-facing leaderboard.
  const rankStyle = (rank) => {
    if (rank === 1) return "bg-amber-100 text-amber-800 ring-1 ring-amber-300";
    if (rank === 2) return "bg-gray-100 text-gray-700 ring-1 ring-gray-300";
    if (rank === 3) return "bg-orange-100 text-orange-800 ring-1 ring-orange-300";
    return "bg-blue-50 text-blue-700";
  };

  const Columns = useMemo(
    () => [
      {
        title: "Rank",
        key: "rank",
        render: (_, row) =>
          row.rank ? (
            <span
              className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${rankStyle(
                row.rank
              )}`}
            >
              {row.rank}
            </span>
          ) : (
            <span className="text-gray-400">-</span>
          ),
      },
      {
        title: "User",
        key: "username",
        render: (_, row) => (
          <div>
            <div className="text-sm font-medium text-gray-900">
              {row.username}
            </div>
            <div className="text-xs text-gray-500">
              {row.customer_id ? `${row.customer_id} • ` : ""}
              {row.mobile ?? ""}
            </div>
          </div>
        ),
      },
      {
        title: "Name",
        key: "name",
        render: (_, row) => (
          <span className="text-sm text-gray-700">{row.name || "-"}</span>
        ),
      },
      {
        title: "Own Upgrade",
        key: "own_points",
        sortable: true,
        render: (_, row) => (
          <span className="text-sm font-medium text-emerald-700">
            {Lib.formatAmount(row.own_points)}
          </span>
        ),
      },
      {
        title: "Referral Upgrade",
        key: "referral_points",
        sortable: true,
        render: (_, row) => (
          <span className="text-sm font-medium text-amber-700">
            {Lib.formatAmount(row.referral_points)}
          </span>
        ),
      },
      {
        title: "Total Points",
        key: "total_points",
        sortable: true,
        render: (_, row) => (
          <span className="text-sm font-bold text-gray-900">
            {Lib.formatAmount(row.total_points)}
          </span>
        ),
      },
      {
        title: "Action",
        key: "action",
        render: (_, row) => (
          <button
            onClick={() =>
              updateSearchParam({
                options: {
                  Modal: MODAL_OPEN.OFFER_POINT_MODAL,
                  View: row.user_id,
                },
              })
            }
            className="text-indigo-600 hover:text-indigo-900 p-1"
            title="View points history"
          >
            <Eye className="w-4 h-4" />
          </button>
        ),
      },
    ],
    []
  );

  const tabBtn = (active) =>
    `px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
      active
        ? "bg-blue-600 text-white shadow"
        : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
    }`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <Gift className="w-7 h-7 text-blue-600" />
          Offer
        </h1>
        <p className="mt-2 text-gray-600">
          Turn the offer on, set when it starts, and configure the points users
          earn for their own upgrades and their direct referrals' upgrades.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          className={tabBtn(activeTab === "details")}
          onClick={() => setActiveTab("details")}
        >
          Offer Details
        </button>
        <button
          className={tabBtn(activeTab === "points")}
          onClick={() => setActiveTab("points")}
        >
          User Points
        </button>
        <button
          className={tabBtn(activeTab === "manual")}
          onClick={() => setActiveTab("manual")}
        >
          Top List Entries
        </button>
      </div>

      {activeTab === "details" ? (
        <div className="space-y-6">
          {/* Master config */}
          <div className="bg-white shadow-sm rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-600" />
                Offer Status
              </h2>
              <button
                onClick={handleSaveConfig}
                disabled={savingConfig}
                className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50"
              >
                <Save className="w-4 h-4 mr-2" />
                {savingConfig ? "Saving..." : "Save"}
              </button>
            </div>

            {configLoading ? (
              <Loader />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsActive((v) => (v ? 0 : 1))}
                    className={`inline-flex items-center px-3 py-2 rounded-lg text-sm font-semibold w-full justify-center ${
                      isActive
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {isActive ? (
                      <CheckCircle className="w-4 h-4 mr-2" />
                    ) : (
                      <XCircle className="w-4 h-4 mr-2" />
                    )}
                    {isActive ? "Active" : "Inactive"}
                  </button>
                  <p className="text-xs text-gray-500 mt-1">
                    Users see the Offer menu only when active.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Offer Starts From
                  </label>
                  <input
                    type="datetime-local"
                    value={startAt ?? ""}
                    onChange={(e) => setStartAt(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Before this, users see a countdown. Points start from here.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Top List Count
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={topCount}
                    onChange={(e) => setTopCount(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    How many users show in the leaderboard (default 10).
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Points per upgrade */}
          <div className="bg-white shadow-sm rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-500" />
                Add Offer Details
              </h2>
              <button
                onClick={handleSavePoints}
                disabled={savingSettings}
                className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50"
              >
                <Save className="w-4 h-4 mr-2" />
                {savingSettings ? "Saving..." : "Save Points"}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Option *
                </label>
                <select
                  value={optionType}
                  onChange={(e) => setOptionType(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  {Number(optionType) === 1
                    ? "Points the user earns for their OWN upgrade."
                    : "Points the user earns when their DIRECT referral upgrades."}
                </p>
              </div>
            </div>

            <p className="text-sm text-gray-600 mb-3">
              Points awarded for the level the user <b>reaches</b>. Levels can be
              skipped — e.g. a Promoter 1 who jumps straight to Promoter 4 earns
              the <b>Promoter 4</b> points.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {LEVEL_FIELDS.map((f) => (
                <div key={f.key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {f.label}
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={points[f.key] ?? ""}
                    onChange={(e) =>
                      setPoints((p) => ({ ...p, [f.key]: e.target.value }))
                    }
                    placeholder="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Saved values */}
          <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-800">
                Saved Point Values
              </h3>
            </div>
            {settingsLoading ? (
              <div className="p-6">
                <Loader />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr className="text-left text-xs uppercase tracking-wide text-gray-500">
                      <th className="px-4 py-2">Option</th>
                      {LEVEL_FIELDS.map((f) => (
                        <th key={f.key} className="px-4 py-2">
                          {f.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {savedSettings.length === 0 ? (
                      <tr>
                        <td
                          colSpan={LEVEL_FIELDS.length + 1}
                          className="px-4 py-8 text-center text-gray-500"
                        >
                          No points configured yet.
                        </td>
                      </tr>
                    ) : (
                      savedSettings.map((s) => (
                        <tr key={s.id} className="hover:bg-gray-50">
                          <td className="px-4 py-2 font-medium text-gray-900">
                            {s.option_label}
                          </td>
                          {LEVEL_FIELDS.map((f) => (
                            <td key={f.key} className="px-4 py-2 text-gray-700">
                              {Lib.formatAmount(s[f.key] ?? 0)}
                            </td>
                          ))}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      ) : activeTab === "points" ? (
        <>
          <FilterTab
            filter={filter}
            setFilter={setFilter}
            TABLE_FILTER={["SEARCH"]}
          />
          <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
            <DataTable
              columns={Columns}
              data={pointsData?.data ?? []}
              pageSize={filter.pageSize}
              currentPage={filter.pageNo}
              totalRecords={pointsData?.pageInfo?.total_records ?? 0}
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
              enableSerial={false}
              isLoading={pointsLoading}
              setPageSize={(pageSize) => {
                setFilter((prv) => ({ ...prv, pageNo: 1, pageSize }));
              }}
            />
          </div>
        </>
      ) : (
        /* ── Tab 3: manual, display-only leaderboard rows ────────────────── */
        <div className="space-y-6">
          <div className="p-4 rounded-xl border border-amber-200 bg-amber-50 text-sm text-amber-900">
            <b>Display-only rows.</b> These are not real users — they earn
            nothing and never affect real points, the User Points tab, or any
            payout. They only appear in the Top Points list. Delete them when
            the launch period is over.
          </div>

          {/* Add / edit form */}
          <div className="bg-white shadow-sm rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {dummyForm.id ? "Edit Entry" : "Add Entry"}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Username *
                </label>
                <input
                  type="text"
                  value={dummyForm.username}
                  onChange={(e) =>
                    setDummyForm((f) => ({ ...f, username: e.target.value }))
                  }
                  placeholder="e.g. ramesh_k"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={dummyForm.name}
                  onChange={(e) =>
                    setDummyForm((f) => ({ ...f, name: e.target.value }))
                  }
                  placeholder="e.g. Ramesh Kumar"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Points *
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={dummyForm.points}
                  onChange={(e) =>
                    setDummyForm((f) => ({ ...f, points: e.target.value }))
                  }
                  placeholder="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="flex items-end gap-2">
                <button
                  onClick={handleSaveDummy}
                  disabled={savingDummy}
                  className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {savingDummy ? "Saving..." : dummyForm.id ? "Update" : "Add"}
                </button>
                {dummyForm.id && (
                  <button
                    onClick={() => setDummyForm(emptyDummy)}
                    className="inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200"
                  >
                    <X className="w-4 h-4 mr-1" /> Cancel
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Existing manual entries */}
          <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-800">
                Manual Entries
              </h3>
            </div>
            {dummyLoading ? (
              <div className="p-6">
                <Loader />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr className="text-left text-xs uppercase tracking-wide text-gray-500">
                      <th className="px-4 py-2">Username</th>
                      <th className="px-4 py-2">Name</th>
                      <th className="px-4 py-2 text-right">Points</th>
                      <th className="px-4 py-2">Added</th>
                      <th className="px-4 py-2">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {(dummyData?.data ?? []).length === 0 ? (
                      <tr>
                        <td
                          colSpan={5}
                          className="px-4 py-8 text-center text-gray-500"
                        >
                          No manual entries added.
                        </td>
                      </tr>
                    ) : (
                      (dummyData?.data ?? []).map((row) => (
                        <tr key={row.id} className="hover:bg-gray-50">
                          <td className="px-4 py-2 font-medium text-gray-900">
                            {row.username}
                          </td>
                          <td className="px-4 py-2 text-gray-700">
                            {row.name || "-"}
                          </td>
                          <td className="px-4 py-2 text-right font-semibold text-gray-900">
                            {Lib.formatAmount(row.points)}
                          </td>
                          <td className="px-4 py-2 text-gray-500 whitespace-nowrap">
                            {row.created_at}
                          </td>
                          <td className="px-4 py-2">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() =>
                                  setDummyForm({
                                    id: row.id,
                                    username: row.username ?? "",
                                    name: row.name ?? "",
                                    points: row.points ?? "",
                                  })
                                }
                                className="text-indigo-600 hover:text-indigo-900 p-1"
                                title="Edit"
                              >
                                <Pencil className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteDummy(row.id)}
                                className="text-red-600 hover:text-red-900 p-1"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Merged preview — exactly what users see, with real vs manual shown */}
          <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
              <Medal className="w-5 h-5 text-amber-500" />
              <h3 className="text-sm font-semibold text-gray-800">
                Top Points Preview (what users see)
              </h3>
            </div>
            {previewLoading ? (
              <div className="p-6">
                <Loader />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr className="text-left text-xs uppercase tracking-wide text-gray-500">
                      <th className="px-4 py-2">Rank</th>
                      <th className="px-4 py-2">Username</th>
                      <th className="px-4 py-2">Name</th>
                      <th className="px-4 py-2 text-right">Points</th>
                      <th className="px-4 py-2">Type</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {(previewData?.data ?? []).length === 0 ? (
                      <tr>
                        <td
                          colSpan={5}
                          className="px-4 py-8 text-center text-gray-500"
                        >
                          Nothing on the leaderboard yet.
                        </td>
                      </tr>
                    ) : (
                      (previewData?.data ?? []).map((row, i) => (
                        <tr
                          key={`${row.is_manual}-${row.user_id ?? row.username}-${i}`}
                          className={
                            row.is_manual ? "bg-amber-50/60" : "hover:bg-gray-50"
                          }
                        >
                          <td className="px-4 py-2">
                            <span
                              className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${rankStyle(
                                row.rank
                              )}`}
                            >
                              {row.rank}
                            </span>
                          </td>
                          <td className="px-4 py-2 font-medium text-gray-900">
                            {row.username}
                          </td>
                          <td className="px-4 py-2 text-gray-700">
                            {row.name || "-"}
                          </td>
                          <td className="px-4 py-2 text-right font-bold text-gray-900">
                            {Lib.formatAmount(row.points)}
                          </td>
                          <td className="px-4 py-2">
                            {row.is_manual ? (
                              <span className="inline-flex px-2 py-0.5 text-xs font-semibold rounded-full bg-amber-100 text-amber-800">
                                Manual
                              </span>
                            ) : (
                              <span className="inline-flex px-2 py-0.5 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                                Real
                              </span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {Modal === MODAL_OPEN.OFFER_POINT_MODAL && <OfferPointHistoryModal />}
    </div>
  );
}
