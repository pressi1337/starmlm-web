// @ts-nocheck
import React, { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Save,
  XCircle,
  Pencil,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Workflow,
} from "lucide-react";
import { useActionCall, useGetCall } from "@/hooks";
import { SERVICE } from "@/constants/services";
import Loader from "@/components/ui/Loader";
import Lib from "@/utils/Lib";

const defaultForm = {
  promoter_level: 0,
  referral_depth: 1,
  amount: "0.00",
  trigger_type: 1,
  wallet_type: 1,
  is_active: true,
};

const walletOptions = [
  { value: 1, label: "Main Wallet" },
  { value: 2, label: "Scratch Wallet" },
  { value: 3, label: "Grow Wallet" },
];

const triggerOptions = [
  { value: 1, label: "Promoter Activation" },
];

export default function LevelIncomeSettings() {
  const [form, setForm] = useState(defaultForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [search, setSearch] = useState("");

  const {
    loading,
    data: levelIncomeData,
    setQuery,
  } = useGetCall(SERVICE.LEVEL_INCOME_RULES, {
    query: {
      pageSize: 500,
      sortBy: "promoter_level",
      sortDir: "ASC",
    },
  });

  const {
    loading: actionLoading,
    Post,
    Put,
    Delete,
    error,
  } = useActionCall(SERVICE.LEVEL_INCOME_RULES);
  const { Patch } = useActionCall(SERVICE.LEVEL_INCOME_RULES_STATUS_UPDATE);

  const refreshRules = () => {
    setQuery({
      pageSize: 500,
      sortBy: "promoter_level",
      sortDir: "ASC",
      search,
    });
  };

  useEffect(() => {
    refreshRules();
  }, [search]);

  const rules = useMemo(() => levelIncomeData?.data || [], [levelIncomeData]);

  const resetForm = () => {
    setForm(defaultForm);
    setEditingId(null);
  };

  const handleChange = (key: string, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleEdit = (rule: any) => {
    setEditingId(rule.id);
    setForm({
      promoter_level: rule.promoter_level,
      referral_depth: rule.referral_depth,
      amount: String(rule.amount),
      trigger_type: rule.trigger_type,
      wallet_type: rule.wallet_type,
      is_active: Boolean(rule.is_active),
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async () => {
    const payload = {
      promoter_level: Number(form.promoter_level),
      referral_depth: Number(form.referral_depth),
      amount: Number(form.amount),
      trigger_type: Number(form.trigger_type),
      wallet_type: Number(form.wallet_type),
      is_active: Boolean(form.is_active),
    };

    const response = editingId
      ? await Put(String(editingId), payload, "Level income rule updated successfully")
      : await Post(payload, "Level income rule created successfully");

    if (response?.success) {
      resetForm();
      refreshRules();
    }
  };

  const handleStatusToggle = async (rule: any) => {
    const response = await Patch(
      {
        id: rule.id,
        is_active: !rule.is_active,
      },
      "Level income rule status updated"
    );

    if (response?.success) {
      refreshRules();
    }
  };

  const handleDelete = async (rule: any) => {
    if (!window.confirm(`Delete rule for ${Lib.promoterLevelLabel(rule.promoter_level)} at depth ${rule.referral_depth}?`)) {
      return;
    }

    const response = await Delete(String(rule.id), "Level income rule deleted successfully");
    if (response?.success) {
      refreshRules();
      if (editingId === rule.id) {
        resetForm();
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 p-6 bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Level Income Matrix</h1>
            <p className="mt-2 text-gray-600">
              Configure unlimited promoter-level and referral-depth payout rules.
            </p>
          </div>
          <div className="inline-flex items-center px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-medium">
            <Workflow className="w-4 h-4 mr-2" />
            Production-safe additive release
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingId ? "Edit Rule" : "Create Rule"}
              </h2>
              {editingId ? (
                <button
                  onClick={resetForm}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Cancel edit
                </button>
              ) : null}
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Promoter Level
                </label>
                <input
                  type="number"
                  min="0"
                  value={form.promoter_level}
                  onChange={(e) => handleChange("promoter_level", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Referral Depth
                </label>
                <input
                  type="number"
                  min="1"
                  value={form.referral_depth}
                  onChange={(e) => handleChange("referral_depth", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.amount}
                  onChange={(e) => handleChange("amount", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Trigger Type
                </label>
                <select
                  value={form.trigger_type}
                  onChange={(e) => handleChange("trigger_type", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                >
                  {triggerOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Wallet Type
                </label>
                <select
                  value={form.wallet_type}
                  onChange={(e) => handleChange("wallet_type", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                >
                  {walletOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <label className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 border border-gray-200">
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(e) => handleChange("is_active", e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">Rule is active</span>
              </label>

              {error && typeof error === "object" ? (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
                  {Object.values(error).map((message: any, index) => (
                    <div key={index}>{message}</div>
                  ))}
                </div>
              ) : null}

              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleSubmit}
                  disabled={actionLoading}
                  className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50"
                >
                  {editingId ? <Save className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                  {editingId ? "Update Rule" : "Create Rule"}
                </button>
                <button
                  onClick={resetForm}
                  className="inline-flex items-center justify-center px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Reset
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="xl:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Configured Rules</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Unlimited rows supported by promoter level and referral depth.
                </p>
              </div>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search promoter level, depth, or amount"
                className="w-full md:w-80 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {loading ? (
              <div className="p-8 flex justify-center">
                <Loader />
              </div>
            ) : rules.length ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Promoter</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Depth</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Wallet</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trigger</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {rules.map((rule: any) => (
                      <tr key={rule.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {Lib.promoterLevelLabel(rule.promoter_level)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {rule.referral_depth}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          ₹{Lib.formatAmount(rule.amount)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {walletOptions.find((item) => item.value == rule.wallet_type)?.label || "Main Wallet"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {triggerOptions.find((item) => item.value == rule.trigger_type)?.label || "Promoter Activation"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              rule.is_active
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {rule.is_active ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="inline-flex items-center gap-2">
                            <button
                              onClick={() => handleStatusToggle(rule)}
                              className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-700"
                              title={rule.is_active ? "Deactivate rule" : "Activate rule"}
                            >
                              {rule.is_active ? (
                                <ToggleRight className="w-4 h-4 text-green-600" />
                              ) : (
                                <ToggleLeft className="w-4 h-4 text-gray-500" />
                              )}
                            </button>
                            <button
                              onClick={() => handleEdit(rule)}
                              className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 text-blue-600"
                              title="Edit rule"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(rule)}
                              className="p-2 rounded-lg border border-gray-200 hover:bg-red-50 text-red-600"
                              title="Delete rule"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-10 text-center">
                <Workflow className="mx-auto h-12 w-12 text-gray-300" />
                <h3 className="mt-4 text-lg font-medium text-gray-900">No level income rules yet</h3>
                <p className="mt-2 text-sm text-gray-500">
                  Create the first matrix row to start configuring unlimited promoter-level payouts.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
