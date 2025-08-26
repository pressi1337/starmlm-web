//@ts-nocheck
import React, { useState } from 'react';
import { useData } from '@/context/DataContext';
import { Plus, Trash2, Save, DollarSign, Users, Settings } from 'lucide-react';

export default function ReferralSettings() {
  const { referralSettings, setReferralSettings } = useData();
  const [settings, setSettings] = useState(referralSettings);
  const [hasChanges, setHasChanges] = useState(false);

  const promotorLevels = [
    { key: 'promotor', name: 'Promotor', color: 'bg-blue-100 text-blue-800' },
    { key: 'promotor1', name: 'Promotor 1', color: 'bg-green-100 text-green-800' },
    { key: 'promotor2', name: 'Promotor 2', color: 'bg-purple-100 text-purple-800' },
    { key: 'promotor3', name: 'Promotor 3', color: 'bg-yellow-100 text-yellow-800' },
    { key: 'promotor4', name: 'Promotor 4', color: 'bg-pink-100 text-pink-800' }
  ];

  const addRange = (levelKey) => {
    const newSettings = settings.map(setting => {
      if (setting.level === levelKey) {
        const lastRange = setting.ranges[setting.ranges.length - 1];
        const newRange = {
          from: lastRange ? lastRange.to + 1 : 1,
          to: lastRange ? lastRange.to + 5 : 5,
          amount: 100
        };
        return {
          ...setting,
          ranges: [...setting.ranges, newRange]
        };
      }
      return setting;
    });
    setSettings(newSettings);
    setHasChanges(true);
  };

  const removeRange = (levelKey, rangeIndex) => {
    const newSettings = settings.map(setting => {
      if (setting.level === levelKey) {
        return {
          ...setting,
          ranges: setting.ranges.filter((_, index) => index !== rangeIndex)
        };
      }
      return setting;
    });
    setSettings(newSettings);
    setHasChanges(true);
  };

  const updateRange = (levelKey, rangeIndex, field, value) => {
    const newSettings = settings.map(setting => {
      if (setting.level === levelKey) {
        const newRanges = setting.ranges.map((range, index) => {
          if (index === rangeIndex) {
            return { ...range, [field]: parseInt(value) || 0 };
          }
          return range;
        });
        return { ...setting, ranges: newRanges };
      }
      return setting;
    });
    setSettings(newSettings);
    setHasChanges(true);
  };

  const addLevel = (levelKey) => {
    const existingSetting = settings.find(s => s.level === levelKey);
    if (!existingSetting) {
      const newSetting = {
        level: levelKey,
        ranges: [{ from: 1, to: 5, amount: 100 }]
      };
      setSettings([...settings, newSetting]);
      setHasChanges(true);
    }
  };

  const removeLevel = (levelKey) => {
    setSettings(settings.filter(s => s.level !== levelKey));
    setHasChanges(true);
  };

  const saveSettings = () => {
    setReferralSettings(settings);
    setHasChanges(false);
  };

  const resetSettings = () => {
    setSettings(referralSettings);
    setHasChanges(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Referral Cashback Settings</h1>
            <p className="mt-2 text-gray-600">Configure referral earning ranges for each promoter level</p>
          </div>
          <div className="flex space-x-3">
            {hasChanges && (
              <button
                onClick={resetSettings}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Reset
              </button>
            )}
            <button
              onClick={saveSettings}
              disabled={!hasChanges}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </button>
          </div>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Active Levels</p>
              <p className="text-2xl font-semibold text-gray-900">{settings.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Ranges</p>
              <p className="text-2xl font-semibold text-gray-900">
                {settings.reduce((total, setting) => total + setting.ranges.length, 0)}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
              <Settings className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Max Earning</p>
              <p className="text-2xl font-semibold text-gray-900">
                ₹{Math.max(...settings.flatMap(s => s.ranges.map(r => r.amount)))}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Add Level Section */}
      <div className="bg-white shadow-sm rounded-xl border border-gray-200 mb-6">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Add Promoter Level</h3>
        </div>
        <div className="p-6">
          <div className="flex flex-wrap gap-3">
            {promotorLevels.map(level => {
              const hasSettings = settings.some(s => s.level === level.key);
              return (
                <button
                  key={level.key}
                  onClick={() => addLevel(level.key)}
                  disabled={hasSettings}
                  className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    hasSettings
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200'
                  }`}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {level.name}
                  {hasSettings && ' (Added)'}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Settings for Each Level */}
      <div className="space-y-6">
        {settings.map((setting) => {
          const levelInfo = promotorLevels.find(l => l.key === setting.level);
          return (
            <div key={setting.level} className="bg-white shadow-sm rounded-xl border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${levelInfo?.color || 'bg-gray-100 text-gray-800'}`}>
                      {levelInfo?.name || setting.level}
                    </span>
                    <span className="text-sm text-gray-500">
                      {setting.ranges.length} range{setting.ranges.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => addRange(setting.level)}
                      className="inline-flex items-center px-3 py-1 border border-blue-300 rounded text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100"
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Add Range
                    </button>
                    <button
                      onClick={() => removeLevel(setting.level)}
                      className="inline-flex items-center px-3 py-1 border border-red-300 rounded text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100"
                    >
                      <Trash2 className="w-3 h-3 mr-1" />
                      Remove Level
                    </button>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {setting.ranges.map((range, rangeIndex) => (
                    <div key={rangeIndex} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            From (Referrals)
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={range.from}
                            onChange={(e) => updateRange(setting.level, rangeIndex, 'from', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            To (Referrals)
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={range.to}
                            onChange={(e) => updateRange(setting.level, rangeIndex, 'to', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Scratch Amount (₹)
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={range.amount}
                            onChange={(e) => updateRange(setting.level, rangeIndex, 'amount', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                      </div>
                      {setting.ranges.length > 1 && (
                        <button
                          onClick={() => removeRange(setting.level, rangeIndex)}
                          className="text-red-600 hover:text-red-800 p-2"
                          title="Remove Range"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                
                {/* Range Preview */}
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <h4 className="text-sm font-medium text-blue-900 mb-2">Earning Structure Preview</h4>
                  <div className="text-sm text-blue-800">
                    {setting.ranges.map((range, index) => (
                      <div key={index}>
                        {range.from} - {range.to} referrals: ₹{range.amount} scratch amount
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {settings.length === 0 && (
        <div className="text-center py-12">
          <Users className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No referral settings</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by adding a promoter level above.
          </p>
        </div>
      )}
    </div>
  );
}