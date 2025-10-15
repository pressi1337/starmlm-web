//@ts-nocheck
import React, { useState, useEffect, useMemo } from "react";
// Assuming useData provides global state management (referralSettings)
import { useFormik } from "formik";
import * as yup from "yup";
import {
  Plus,
  Trash2,
  Save,
  DollarSign,
  Users,
  Settings,
  XCircle,
} from "lucide-react";
import { useGetCall } from "@/hooks";
import { SERVICE } from "@/constants/services";
import Loader from "@/components/ui/Loader";

// --- Mock Data and Context Logic (Updated to API Structure) ---
const mockApiSettings = [
  {
    id: 1,
    promotor_level: 0, // Promotor
    is_active: 1,
    ranges: [
      { start_range: 1, end_range: 10, amount: "50.00", msg: "Small reward" },
    ],
  },
  {
    id: 2,
    promotor_level: 1, // Promotor 1
    is_active: 1,
    ranges: [
      { start_range: 1, end_range: 5, amount: "100.00", msg: "Starter bonus" },
      { start_range: 6, end_range: 15, amount: "150.00", msg: "Mid bonus" },
    ],
  },
];

const useData = () => {
  const [referralSettings, setReferralSettings] = useState(mockApiSettings);
  return {
    referralSettings,
    setReferralSettings: (newSettings) => {
      console.log("Simulating API Save. New full settings:", newSettings);
      setReferralSettings(newSettings);
    },
  };
};
// End Mock Data

// --- YUP VALIDATION SCHEMA ---

const RangeSchema = yup.object().shape({
  start_range: yup
    .number()
    .integer("Must be an integer")
    .min(1, "Must be 1 or greater")
    .required("Required"),
  end_range: yup
    .number()
    .integer("Must be an integer")
    .min(yup.ref("start_range"), "End range must be >= Start range")
    .required("Required"),
  amount: yup.number().min(0, "Cannot be negative").required("Required"),
  msg: yup.string().max(50, "Max 50 characters").required("Required"),
});

const LevelSchema = yup.object().shape({
  ranges: yup
    .array()
    .of(RangeSchema)
    .required("Must have at least one range")
    .test(
      "is-contiguous",
      "Ranges must be contiguous and non-overlapping. Ensure the next range starts one unit after the previous one ends (e.g., 1-10, then 11-20).",
      (ranges) => {
        if (!ranges || ranges.length < 2) return true;

        for (let i = 0; i < ranges.length - 1; i++) {
          const current = ranges[i];
          const next = ranges[i + 1];

          // Check for overlapping (end must be less than next start)
          if (current.end_range >= next.start_range) {
            return false;
          }

          // Check for contiguity (next start must be current end + 1)
          if (next.start_range !== current.end_range + 1) {
            return false;
          }
        }
        return true;
      }
    ),
});

// --- Helper Function to Prepare Initial Form Values ---
const getInitialValues = (setting, levelId) => ({
  promotor_level: setting?.promotor_level ?? levelId,
  ranges:
    setting?.ranges?.length > 0
      ? setting.ranges.map((r) => ({
          ...r,
          amount: parseFloat(r.amount) || 0, // Ensure amount is a number
          msg: r.msg || "Default Reward Message",
        }))
      : [{ start_range: 1, end_range: 5, amount: 100, msg: "Initial Reward" }],
});

export default function ReferralSettings() {
  const { referralSettings, setReferralSettings } = useData();

  const promotorLevels = useMemo(
    () => [
      {
        key: "promotor",
        levelId: 0,
        name: "Promotor",
        color: "bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-50",
      },
      {
        key: "promotor1",
        levelId: 1,
        name: "Promotor 1",
        color: "bg-green-100 text-green-800 border-green-200 hover:bg-green-50",
      },
      {
        key: "promotor2",
        levelId: 2,
        name: "Promotor 2",
        color:
          "bg-purple-100 text-purple-800 border-purple-200 hover:bg-purple-50",
      },
      {
        key: "promotor3",
        levelId: 3,
        name: "Promotor 3",
        color:
          "bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-50",
      },
      {
        key: "promotor4",
        levelId: 4,
        name: "Promotor 4",
        color: "bg-pink-100 text-pink-800 border-pink-200 hover:bg-pink-50",
      },
    ],
    []
  );

  const [settings, setSettings] = useState(referralSettings);
  const [activeTabKey, setActiveTabKey] = useState(0);

  const activeLevelInfo = promotorLevels.find((l) => l.key === activeTabKey);
  const activeLevelId = activeLevelInfo?.levelId;
  const currentSetting = settings.find(
    (s) => s.promotor_level === activeLevelId
  );
  const isLevelActive = !!currentSetting;

  useEffect(() => {
    setSettings(referralSettings);
  }, [referralSettings]);

  // --- Formik Setup for Active Tab ---

  const formik = useFormik({
    initialValues: getInitialValues(currentSetting, activeLevelId),
    validationSchema: LevelSchema,
    onSubmit: async (values) => {
      // Submission logic is handled in saveSettings
    },
    enableReinitialize: true,
  });

  // Check if formik values differ from the source of truth (currentSetting)
  const hasChanges = useMemo(() => {
    if (!currentSetting) {
      return (
        formik.values.ranges.length > 1 ||
        (formik.values.ranges[0].amount !== 100 &&
          formik.values.ranges[0].msg !== "Initial Reward")
      );
    }
    const apiRanges = currentSetting.ranges.map((r) => ({
      ...r,
      amount: parseFloat(r.amount),
    }));
    const formRanges = formik.values.ranges;

    return JSON.stringify(apiRanges) !== JSON.stringify(formRanges);
  }, [formik.values, currentSetting]);

  // --- Range Management Functions (using Formik) ---

  /**
   * Custom handler to update the next range's start_range when the current range's end_range changes.
   */
  const handleRangeValueChange = (index, fieldName, value) => {
    // 1. Update the field that was changed
    formik.setFieldValue(`ranges[${index}].${fieldName}`, value);

    // 2. Contiguity enforcement logic (if the field is end_range AND it's not the last range)
    if (fieldName === "end_range" && index < formik.values.ranges.length - 1) {
      const newStartValue = Number(value) + 1;

      // Update the start_range of the NEXT element in the array
      if (!isNaN(newStartValue) && newStartValue > 0) {
        formik.setFieldValue(`ranges[${index + 1}].start_range`, newStartValue);
      }
    }
  };

  const addRange = () => {
    const lastRange = formik.values.ranges[formik.values.ranges.length - 1];

    formik.setFieldValue("ranges", [
      ...formik.values.ranges,
      {
        // Calculate start_range based on the previous end_range + 1
        start_range: lastRange ? Number(lastRange.end_range) + 1 : 1,
        end_range: lastRange ? Number(lastRange.end_range) + 5 : 5,
        amount: 100,
        msg: "New Range Reward",
      },
    ]);
  };

  const removeRange = (rangeIndex) => {
    formik.setFieldValue(
      "ranges",
      formik.values.ranges.filter((_, index) => index !== rangeIndex)
    );
  };

  // --- Level Management Functions ---

  const addLevel = (levelKey) => {
    const levelId = promotorLevels.find((l) => l.key === levelKey)?.levelId;
    if (levelId !== undefined) {
      const newSetting = getInitialValues(null, levelId);
      setSettings(
        [...settings, { ...newSetting, is_active: 1 }].sort(
          (a, b) => a.promotor_level - b.promotor_level
        )
      );
      formik.resetForm({ values: newSetting });
    }
  };

  const removeLevel = () => {
    setSettings(settings.filter((s) => s.promotor_level !== activeLevelId));
    formik.resetForm({ values: getInitialValues(null, activeLevelId) });
  };

  // --- Save/Reset Functions (Refactored) ---

  const saveSettings = () => {
    formik.validateForm().then((errors) => {
      if (Object.keys(errors).length === 0) {
        // 1. Prepare API Payload (matches required POST structure)
        const apiPayload = {
          promotor_level: formik.values.promotor_level,
          is_active: 1,
          ranges: formik.values.ranges.map((r) => ({
            start_range: r.start_range,
            end_range: r.end_range,
            amount: r.amount,
            msg: r.msg,
          })),
        };

        console.log("Submitting API Payload (POST/PUT):", apiPayload);
        // Simulate successful API call response data
        const successfulApiData = {
          ...apiPayload,
          id: currentSetting?.id || Date.now(),
          is_active: 1,
          ranges: apiPayload.ranges.map((r) => ({
            ...r,
            amount: r.amount.toFixed(2),
          })),
        };

        // 2. Update the global settings state with the successful API response data
        setReferralSettings((prevSettings) => {
          const newSettings = [
            ...prevSettings.filter(
              (s) => s.promotor_level !== successfulApiData.promotor_level
            ),
          ];
          newSettings.push(successfulApiData);
          return newSettings.sort(
            (a, b) => a.promotor_level - b.promotor_level
          );
        });
      } else {
        formik.setTouched(
          Object.keys(formik.errors).reduce(
            (acc, key) => ({ ...acc, [key]: true }),
            {}
          )
        );
        console.error("Validation failed:", errors);
      }
    });
  };

  const resetSettings = () => {
    const resetLevel = referralSettings.find(
      (s) => s.promotor_level === activeLevelId
    );
    formik.resetForm({ values: getInitialValues(resetLevel, activeLevelId) });
  };

  // --- Render Helpers ---

  const totalActiveLevels = settings.length;
  const totalRanges = settings.reduce(
    (total, setting) => total + setting.ranges.length,
    0
  );
  const maxEarning = Math.max(
    0,
    ...settings.flatMap((s) => s.ranges.map((r) => parseFloat(r.amount) || 0))
  );

  // Component for the range editor section
  const RangeEditor = () => {
    const ranges = formik.values.ranges;
    const rangeArrayErrors = formik.errors.ranges;

    return (
      <div className="space-y-6">
        {/* Array-Level Error for Contiguity/Overlap */}
        {typeof rangeArrayErrors === "string" && (
          <div className="p-3 bg-red-100 text-red-700 border border-red-300 rounded-lg font-medium">
            Validation Error: {rangeArrayErrors}
          </div>
        )}

        {ranges.map((range, rangeIndex) => {
          const baseName = `ranges[${rangeIndex}]`;
          const errors = formik.errors.ranges?.[rangeIndex] || {};
          const touched = formik.touched.ranges?.[rangeIndex] || {};

          return (
            <div
              key={rangeIndex}
              className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg border border-gray-200 transition-shadow hover:shadow-md"
            >
              <div className="flex-1 grid grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Start Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    From (Referrals)
                  </label>
                  <input
                    type="number"
                    min="1"
                    name={`${baseName}.start_range`}
                    // Disabling this field to enforce contiguity, except for the first range
                    disabled={rangeIndex !== 0}
                    value={range.start_range}
                    onChange={(e) =>
                      handleRangeValueChange(
                        rangeIndex,
                        "start_range",
                        Number(e.target.value)
                      )
                    }
                    onBlur={formik.handleBlur}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed ${
                      errors.start_range && touched.start_range
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                    }`}
                  />
                  {errors.start_range && touched.start_range && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.start_range}
                    </p>
                  )}
                </div>

                {/* End Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    To (Referrals)
                  </label>
                  <input
                    type="number"
                    min={range.start_range}
                    name={`${baseName}.end_range`}
                    value={range.end_range}
                    // IMPORTANT: Use the custom handler here
                    onChange={(e) =>
                      handleRangeValueChange(
                        rangeIndex,
                        "end_range",
                        Number(e.target.value)
                      )
                    }
                    onBlur={formik.handleBlur}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 ${
                      errors.end_range && touched.end_range
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                    }`}
                  />
                  {errors.end_range && touched.end_range && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.end_range}
                    </p>
                  )}
                </div>

                {/* Cashback Amount */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cashback (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    name={`${baseName}.amount`}
                    value={range.amount}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 ${
                      errors.amount && touched.amount
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                    }`}
                  />
                  {errors.amount && touched.amount && (
                    <p className="text-xs text-red-500 mt-1">{errors.amount}</p>
                  )}
                </div>

                {/* Message */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Message (API: `msg`)
                  </label>
                  <input
                    type="text"
                    name={`${baseName}.msg`}
                    value={range.msg}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 ${
                      errors.msg && touched.msg
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                    }`}
                  />
                  {errors.msg && touched.msg && (
                    <p className="text-xs text-red-500 mt-1">{errors.msg}</p>
                  )}
                </div>
              </div>

              {formik.values.ranges.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeRange(rangeIndex)}
                  className="mt-7 text-red-600 hover:text-red-800 p-2 rounded-full hover:bg-red-100 transition-colors"
                  title="Remove Range"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          );
        })}

        <div className="flex justify-between items-center pt-4">
          <button
            type="button"
            onClick={addRange}
            className="inline-flex items-center px-4 py-2 border border-blue-300 rounded-lg text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add New Range
          </button>
          {isLevelActive && (
            <button
              type="button"
              onClick={removeLevel}
              className="inline-flex items-center px-4 py-2 border border-red-300 rounded-lg text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 transition-colors shadow-sm"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Deactivate Level
            </button>
          )}
        </div>

        {/* Range Preview */}
        <div className="mt-6 p-4 bg-indigo-50 border-l-4 border-indigo-400 rounded-lg shadow-inner">
          <h4 className="text-sm font-semibold text-indigo-900 mb-2">
            Earning Structure Preview
          </h4>
          <div className="text-sm text-indigo-800 space-y-1">
            {ranges.map((range, index) => (
              <div key={index} className="flex justify-between">
                <span>
                  {range.start_range} - {range.end_range} Referrals
                </span>
                <span className="font-medium">
                  ₹{range.amount} Cashback ({range.msg})
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const {
    loading,
    data: scratchData,
    setQuery,
    fetchApi: getPromoterLevel,
  } = useGetCall(SERVICE.GET_SCRATCH, {
    key: String(activeTabKey),
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 font-['Inter']">
      {/* Header and Save/Reset Actions */}
      <div className="mb-8 p-6 bg-white rounded-xl shadow-lg border border-gray-100">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900">
              Referral Cashback Settings
            </h1>
            <p className="mt-2 text-base text-gray-600">
              Configure earning ranges for each promoter level (API Level ID:{" "}
              {activeLevelId}).
            </p>
          </div>
          <div className="flex space-x-3 mt-4 md:mt-0">
            {hasChanges && (
              <button
                onClick={resetSettings}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
              >
                <XCircle className="w-4 h-4 mr-2" />
                Reset
              </button>
            )}
            <button
              onClick={saveSettings}
              disabled={!hasChanges || !formik.isValid}
              className="inline-flex items-center px-6 py-2 border border-transparent rounded-lg shadow-lg text-sm font-bold text-white bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-[1.02]"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </button>
          </div>
        </div>
      </div>

      {/* Overview Cards (Calculations based on overall settings state) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-md border-t-4 border-indigo-500 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
              <Users className="w-6 h-6 text-indigo-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Active Levels</p>
              <p className="text-2xl font-semibold text-gray-900">
                {totalActiveLevels}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-md border-t-4 border-blue-500 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Ranges</p>
              <p className="text-2xl font-semibold text-gray-900">
                {totalRanges}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-md border-t-4 border-green-500 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <Settings className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Max Cashback</p>
              <p className="text-2xl font-semibold text-gray-900">
                {maxEarning ? `₹${maxEarning.toFixed(2)}` : "N/A"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabbed Interface */}
      <div className="bg-white shadow-xl rounded-xl border border-gray-100">
        {/* Tab Navigation */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-wrap gap-2">
            {promotorLevels.map((level) => {
              const isActiveTab = activeTabKey === level.levelId;

              return (
                <button
                  key={level.levelId}
                  onClick={() => {
                    setActiveTabKey(level.levelId);
                    getPromoterLevel({
                      key: String(level.levelId),
                    });
                  }}
                  className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    !isActiveTab
                      ? "bg-green-100 text-green-900 "
                      : "bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200"
                  }`}
                >
                  {level.name}
                </button>
              );
            })}
          </div>
        </div>
        <div className="p-6 min-h-[300px]">
          {loading ? <Loader /> : <RangeEditor />}
        </div>

        {/* Tab Content */}
        {/* <form onSubmit={formik.handleSubmit}>
          <div className="p-6 min-h-[300px]">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              {activeLevelInfo?.name || "Settings"} Configuration
            </h2>
            <p className="text-gray-600 mb-6">
              Define the referral count ranges and the corresponding cashback
              amount for this promoter level.
              <span className="block text-xs font-semibold text-red-500 mt-1">
                *The "From" field is automatically calculated as the previous
                range's "To" + 1 (except for the first range).
              </span>
            </p>

            {isLevelActive ? (
              <p>Range</p>
            ) : (
              <div className="text-center py-12 border-4 border-dashed border-gray-200 rounded-xl bg-gray-50">
                <Users className="mx-auto h-12 w-12 text-indigo-400" />
                <h3 className="mt-4 text-lg font-semibold text-gray-900">
                  {activeLevelInfo?.name || "This Level"} is Currently Inactive
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  Click below to activate this promoter level and start
                  configuring its cashback structure.
                </p>
                <div className="mt-6">
                  <button
                    type="button"
                    onClick={() => addLevel(activeTabKey)}
                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-full shadow-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Activate {activeLevelInfo?.name}
                  </button>
                </div>
              </div>
            )}
          </div>
        </form> */}
      </div>
    </div>
  );
}
