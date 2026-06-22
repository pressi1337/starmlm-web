//@ts-nocheck
import React, { useState, useEffect, useMemo } from "react";
import { Save, XCircle, CheckCircle, Gift } from "lucide-react";
import { useActionCall, useGetCall } from "@/hooks";
import { SERVICE } from "@/constants/services";
import Loader from "@/components/ui/Loader";

export default function ReferralSettings() {
  const promotorLevels = useMemo(
    () => [
      { levelId: 0, name: "Promotor" },
      { levelId: 1, name: "Promotor 1" },
      { levelId: 2, name: "Promotor 2" },
      { levelId: 3, name: "Promotor 3" },
      { levelId: 4, name: "Promotor 4" },
    ],
    []
  );

  // Referral depth levels (1 = direct referrer ... 7 = admin commission).
  const referralLevels = useMemo(
    () => [1, 2, 3, 4, 5, 6, 7].map((n) => ({ level: n, name: `Level ${n}` })),
    []
  );

  const [activeTabKey, setActiveTabKey] = useState(0); // promoter level
  const [referralLevel, setReferralLevel] = useState(1); // referral depth
  const [amount, setAmount] = useState("");
  const [msg, setMsg] = useState("");
  const [saveStatus, setSaveStatus] = useState(null); // 'success' | 'error' | null
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    loading,
    data: scratchData,
    error: apiError,
    fetchApi: getConfig,
  } = useGetCall(SERVICE.GET_SCRATCH, {
    key: `${activeTabKey}_${referralLevel}`,
  });

  const { Put: updateReward } = useActionCall(SERVICE.GET_SCRATCH);

  // Load the single amount + message for the selected (promoter, referral) combo.
  useEffect(() => {
    if (scratchData?.success) {
      const d = scratchData.data;
      setAmount(d?.amount != null ? String(d.amount) : "");
      setMsg(d?.msg ?? "");
      setSaveStatus(null);
    }
  }, [scratchData]);

  const refetch = (promoter, ref) => getConfig({ key: `${promoter}_${ref}` });

  const handlePromoterChange = (levelId) => {
    setActiveTabKey(levelId);
    refetch(levelId, referralLevel);
    setSaveStatus(null);
  };

  const handleReferralChange = (rl) => {
    setReferralLevel(rl);
    refetch(activeTabKey, rl);
    setSaveStatus(null);
  };

  const saveSettings = async () => {
    setSaveStatus(null);
    if (amount === "" || isNaN(Number(amount)) || Number(amount) < 0) {
      setSaveStatus("error");
      return;
    }
    setIsSubmitting(true);
    try {
      const payload = {
        promotor_level: activeTabKey,
        level: referralLevel,
        amount: Number(amount),
        msg: msg,
        is_active: 1,
      };
      const response = await updateReward(
        `${activeTabKey}_${referralLevel}`,
        payload
      );
      if (response) {
        setSaveStatus("success");
        setTimeout(() => refetch(activeTabKey, referralLevel), 400);
      } else {
        setSaveStatus("error");
      }
    } catch (error) {
      console.error("Error saving cashback settings:", error);
      setSaveStatus("error");
    }
    setIsSubmitting(false);
  };

  const activePromoterName = promotorLevels.find(
    (p) => p.levelId === activeTabKey
  )?.name;

  const tabClass = (active) =>
    `inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
      active
        ? "bg-blue-500 text-white shadow-md"
        : "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200"
    }`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-['Inter']">
      {/* Header */}
      <div className="mb-8 p-6 bg-white rounded-xl shadow-lg border border-gray-100">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900">
              Promotion Cashback Settings
            </h1>
            <p className="mt-2 text-base text-gray-600">
              Set one cashback amount and message per referral level (1–7) and
              promoter level. Level 7 is the admin commission.
            </p>
          </div>
          <button
            onClick={saveSettings}
            disabled={isSubmitting}
            className="inline-flex items-center px-6 py-2 border border-transparent rounded-lg shadow-lg text-sm font-bold text-white bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 mt-4 md:mt-0"
          >
            <Save className="w-4 h-4 mr-2" />
            {isSubmitting ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>

      <div className="bg-white shadow-xl rounded-xl border border-gray-100">
        {/* Referral Level Tabs (depth 1-7) */}
        <div className="p-4 border-b border-gray-200 bg-gray-50/60">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            Referral Level
          </p>
          <div className="flex flex-wrap gap-2">
            {referralLevels.map((rl) => (
              <button
                key={rl.level}
                onClick={() => handleReferralChange(rl.level)}
                disabled={isSubmitting}
                className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                  referralLevel === rl.level
                    ? "bg-indigo-600 text-white shadow-md"
                    : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                }`}
              >
                {rl.name}
              </button>
            ))}
          </div>
        </div>

        {/* Promoter Level Tabs */}
        <div className="p-4 border-b border-gray-200">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            Promoter Level
          </p>
          <div className="flex flex-wrap gap-2">
            {promotorLevels.map((level) => (
              <button
                key={level.levelId}
                onClick={() => handlePromoterChange(level.levelId)}
                disabled={isSubmitting}
                className={tabClass(activeTabKey === level.levelId)}
              >
                {level.name}
              </button>
            ))}
          </div>
        </div>

        {/* Content: single cashback amount + message */}
        <div className="p-6 min-h-[220px]">
          {loading ? (
            <div className="flex items-center justify-center h-48">
              <Loader />
            </div>
          ) : apiError ? (
            <div className="p-4 bg-red-50 border-l-4 border-red-400 rounded-lg">
              <div className="flex">
                <XCircle className="h-5 w-5 text-red-400" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    Error Loading Data
                  </h3>
                  <p className="mt-1 text-sm text-red-700">
                    Failed to fetch cashback config. Please try again.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {saveStatus === "success" && (
                <div className="p-4 bg-green-50 border-l-4 border-green-400 rounded-lg flex">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                  <p className="ml-3 text-sm font-medium text-green-800">
                    Cashback saved successfully.
                  </p>
                </div>
              )}
              {saveStatus === "error" && (
                <div className="p-4 bg-red-50 border-l-4 border-red-400 rounded-lg flex">
                  <XCircle className="h-5 w-5 text-red-400" />
                  <p className="ml-3 text-sm font-medium text-red-800">
                    Enter a valid cashback amount (0 or more) before saving.
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cashback (₹) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="e.g. 5"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Message
                  </label>
                  <input
                    type="text"
                    maxLength={50}
                    value={msg}
                    onChange={(e) => setMsg(e.target.value)}
                    placeholder="e.g. New Reward"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="p-4 bg-indigo-50 border-l-4 border-indigo-400 rounded-lg flex items-start">
                <Gift className="w-5 h-5 text-indigo-500 mr-2 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-indigo-800">
                  {referralLevel === 7 ? (
                    <>
                      <b>Level 7 = admin commission.</b> When a{" "}
                      <b>{activePromoterName}</b> activates, the admin
                      (additional-scratch-referral) users each receive a ₹
                      {amount || 0} scratch card.
                    </>
                  ) : (
                    <>
                      When a <b>{activePromoterName}</b> activates, their{" "}
                      <b>Level {referralLevel}</b> referrer receives a ₹
                      {amount || 0} scratch card (if that referrer is at promoter
                      level ≥ the activating user's level).
                    </>
                  )}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
