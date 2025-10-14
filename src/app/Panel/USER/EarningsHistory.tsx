import React, { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  Wallet,
  TrendingUp,
  Calendar,
  Download,
  DollarSign,
  Gift,
  Award,
  ArrowUpRight,
  ArrowDownRight,
  Icon,
} from "lucide-react";
import { SERVICE } from "@/constants/services";
import { useGetCall, useQueryParams } from "@/hooks";
import DataTable from "@/components/DataTable";
import UIHelpers from "@/utils/UIhelper";



export default function EarningsHistory() {
  const Columns: any = [
    {
      title: "Title & Description",
      key: "earning_type",
      render: (index: any, row: any) => {
        let message = "";

        switch (row.earning_type) {
          case 1:
            message = "Session 1 - Set 1 Video Earning";
            break;
          case 2:
            message = "Session 1 - Set 2 Video Earning";
            break;
          case 3:
            message = "Session 2 - Set 1 Video Earning";
            break;
          case 4:
            message = "Session 2 - Set 2 Video Earning";
            break;
          case 5:
            message = "Scratch Card Earning";
            break;
          case 6:
            message = "Savings Earning";
            break;
          default:
            message = "Unknown Earning Type";
        }
        return <div className="text-sm text-gray-900">
          {message}</div>;
      },
    },

    {
      title: "Date",
      key: "earning_date",
      dataIndex: "earning_date",
      sortable: true,
      render: (index: any, row: any) => (
        <div className="flex items-center text-sm text-gray-900">
          <Calendar className="w-4 h-4 mr-2 text-gray-400" />
          {UIHelpers.DateFormat(row.earning_date)}
        </div>
      ),
    },
    {
      title: "Wallet",
      key: "earning_type",
      render: (index: any, row: any) => (
        <span
          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full capitalize ${getWalletColor(
            row.earning_type
          )} bg-opacity-10`}
        >
          {row.earning_type == 6 ? "Grow" : row.earning_type == 5 ? "Scratch" : "Cash"}
        </span>
      ),
    },
    {
      title: "Amount",
      key: "amount",
      render: (index: any, row: any) => (
        <div className="flex items-center justify-start space-x-2">
          {formatAmount(row.amount, row.wallet)}
        </div>
      ),
    },
  ];
  const { user } = useAuth();
  const { defaultFilter, updateSearchParam, searchParams } = useQueryParams();
  const [filter, setFilter] = useState(defaultFilter);
  const [currentPage, setCurrentPage] = useState(1);
  const [filterType, setFilterType] = useState("all");
  const [filterWallet, setFilterWallet] = useState("all");
  const [dateRange, setDateRange] = useState("all");
  const [sortOrder, setSortOrder] = useState("desc");
  const {
    data: earningsHistory,
    loading: earningsHistoryLoading,
    setQuery,
  } = useGetCall(SERVICE.EARNINGS_HISTORY);

  const EarningsHistoryAPI = useCallback(() => {
    setQuery(filter);
  }, [filter]);

  useEffect(() => {
    EarningsHistoryAPI();
  }, [EarningsHistoryAPI]);

  const getTypeIcon = (type) => {
    const icons = {
      quiz: Award,
      promotion_quiz: Award,
      referral: TrendingUp,
      level_bonus: Gift,
      withdrawal: ArrowDownRight,
      transfer: ArrowUpRight,
    };
    return icons[type] || DollarSign;
  };

  const getTypeColor = (type) => {
    const colors = {
      1: "text-blue-600 bg-blue-100",
      2: "text-purple-600 bg-purple-100",
      3: "text-green-600 bg-green-100",
      4: "text-yellow-600 bg-yellow-100",
      5: "text-red-600 bg-red-100",
      6: "text-indigo-600 bg-indigo-100",
    };
    return colors[type] || "text-gray-600 bg-gray-100";
  };

  const getWalletColor = (wallet) => {
    if (wallet < 5) {
      return "text-green-600 bg-green-100";
    }else if(wallet === 5){
      return "text-purple-600 bg-purple-100";
    }else if(wallet === 6){
      return "text-orange-600 bg-orange-100";
    }
    return "text-gray-600 bg-gray-100";
  };

  const formatAmount = (amount, wallet) => {
    const sign = amount >= 0 ? "+" : "";
    return `${sign}₹${Math.abs(amount)}`;
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Earnings History
            </h1>
            <p className="mt-2 text-gray-600">
              Track all your earnings, bonuses, and transactions
            </p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
              <Wallet className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">
                Total Earnings
              </p>
              <p className="text-2xl font-bold text-gray-900">₹0</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Cash Wallet</p>
              <p className="text-2xl font-bold text-gray-900">₹0</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Grow Wallet</p>
              <p className="text-2xl font-bold text-gray-900">₹0</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center">
              <Gift className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">
                Scratch Wallet
              </p>
              <p className="text-2xl font-bold text-gray-900">₹0</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white shadow-sm rounded-xl border border-gray-200 mb-6">
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type
              </label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Types</option>
                <option value="quiz">Quiz Earnings</option>
                <option value="promotion_quiz">Promotion Quiz</option>
                <option value="referral">Referral Bonus</option>
                <option value="level_bonus">Level Bonus</option>
                <option value="withdrawal">Withdrawals</option>
                <option value="transfer">Transfers</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Wallet
              </label>
              <select
                value={filterWallet}
                onChange={(e) => setFilterWallet(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Wallets</option>
                <option value="cash">Cash Wallet</option>
                <option value="grow">Grow Wallet</option>
                <option value="scratch">Scratch Wallet</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date Range
              </label>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Time</option>
                <option value="7">Last 7 Days</option>
                <option value="30">Last 30 Days</option>
                <option value="90">Last 90 Days</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sort Order
              </label>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="desc">Newest First</option>
                <option value="asc">Oldest First</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={() => {
                  setFilterType("all");
                  setFilterWallet("all");
                  setDateRange("all");
                  setSortOrder("desc");
                  setCurrentPage(1);
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
        <DataTable
          columns={Columns}
          data={earningsHistory?.data ?? []}
          pageSize={filter.pageSize}
          currentPage={filter.pageNo}
          totalRecords={earningsHistory?.pageInfo?.total_records ?? 0}
          onPageChange={(page: any) =>
            setFilter((prv) => ({ ...prv, pageNo: page }))
          }
          sortBy={filter.sortBy}
          sortDir={filter.sortDir}
          setSort={(sortData: any) => {
            setFilter((prv) => ({
              ...prv,
              sortBy: sortData.key ?? "",
              sortDir: sortData.sort ?? "",
            }));
          }}
          enableSerial={true}
          isLoading={earningsHistoryLoading}
          setPageSize={(pageSize: number) => {
            setFilter((prv) => ({ ...prv, pageNo: 1, pageSize: pageSize }));
          }}
        />
      </div>
    </div>
  );
}
