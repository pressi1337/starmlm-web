import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { 
  Wallet, 
  TrendingUp, 
  Calendar, 
  Filter,
  Download,
  DollarSign,
  Gift,
  Award,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

// Mock earnings data - in real app this would come from your data context
const mockEarningsData = [
  {
    id: '1',
    type: 'quiz',
    amount: 25,
    wallet: 'scratch',
    description: 'Training Day 3 Quiz Completion',
    date: '2024-01-10T10:30:00Z',
    status: 'completed'
  },
  {
    id: '2',
    type: 'referral',
    amount: 150,
    wallet: 'scratch',
    description: 'Referral Bonus - alice_smith joined',
    date: '2024-01-09T15:45:00Z',
    status: 'completed'
  },
  {
    id: '3',
    type: 'promotion_quiz',
    amount: 30,
    wallet: 'scratch',
    description: 'Morning Session Video 1 Quiz',
    date: '2024-01-09T09:15:00Z',
    status: 'completed'
  },
  {
    id: '4',
    type: 'level_bonus',
    amount: 500,
    wallet: 'grow',
    description: 'Level Upgrade Bonus - Promotor 1',
    date: '2024-01-08T14:20:00Z',
    status: 'completed'
  },
  {
    id: '5',
    type: 'quiz',
    amount: 20,
    wallet: 'scratch',
    description: 'Training Day 2 Quiz Completion',
    date: '2024-01-08T11:00:00Z',
    status: 'completed'
  },
  {
    id: '6',
    type: 'withdrawal',
    amount: -200,
    wallet: 'cash',
    description: 'Withdrawal to Bank Account',
    date: '2024-01-07T16:30:00Z',
    status: 'completed'
  },
  {
    id: '7',
    type: 'transfer',
    amount: 200,
    wallet: 'cash',
    description: 'Transfer from Scratch Wallet',
    date: '2024-01-07T16:25:00Z',
    status: 'completed'
  },
  {
    id: '8',
    type: 'referral',
    amount: 100,
    wallet: 'scratch',
    description: 'Referral Bonus - bob_jones joined',
    date: '2024-01-06T12:10:00Z',
    status: 'completed'
  }
];

export default function EarningsHistory() {
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const [filterType, setFilterType] = useState('all');
  const [filterWallet, setFilterWallet] = useState('all');
  const [dateRange, setDateRange] = useState('all');
  const [sortOrder, setSortOrder] = useState('desc');

  const itemsPerPage = 10;

  // Filter and sort earnings
  const filteredEarnings = mockEarningsData
    .filter(earning => {
      const matchesType = filterType === 'all' || earning.type === filterType;
      const matchesWallet = filterWallet === 'all' || earning.wallet === filterWallet;
      
      let matchesDate = true;
      if (dateRange !== 'all') {
        const earningDate = new Date(earning.date);
        const now = new Date();
        const daysAgo = parseInt(dateRange);
        const cutoffDate = new Date(now.getTime() - (daysAgo * 24 * 60 * 60 * 1000));
        matchesDate = earningDate >= cutoffDate;
      }
      
      return matchesType && matchesWallet && matchesDate;
    })
    .sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });

  const totalPages = Math.ceil(filteredEarnings.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedEarnings = filteredEarnings.slice(startIndex, startIndex + itemsPerPage);

  // Calculate totals
  const totalEarnings = filteredEarnings
    .filter(e => e.amount > 0)
    .reduce((sum, e) => sum + e.amount, 0);
  
  const totalWithdrawals = Math.abs(filteredEarnings
    .filter(e => e.amount < 0)
    .reduce((sum, e) => sum + e.amount, 0));

  const getTypeIcon = (type) => {
    const icons = {
      quiz: Award,
      promotion_quiz: Award,
      referral: TrendingUp,
      level_bonus: Gift,
      withdrawal: ArrowDownRight,
      transfer: ArrowUpRight
    };
    return icons[type] || DollarSign;
  };

  const getTypeColor = (type) => {
    const colors = {
      quiz: 'text-blue-600 bg-blue-100',
      promotion_quiz: 'text-purple-600 bg-purple-100',
      referral: 'text-green-600 bg-green-100',
      level_bonus: 'text-yellow-600 bg-yellow-100',
      withdrawal: 'text-red-600 bg-red-100',
      transfer: 'text-indigo-600 bg-indigo-100'
    };
    return colors[type] || 'text-gray-600 bg-gray-100';
  };

  const getWalletColor = (wallet) => {
    const colors = {
      cash: 'text-green-600',
      grow: 'text-purple-600',
      scratch: 'text-orange-600'
    };
    return colors[wallet] || 'text-gray-600';
  };

  const formatAmount = (amount, wallet) => {
    const sign = amount >= 0 ? '+' : '';
    return `${sign}₹${Math.abs(amount)}`;
  };

  const exportData = () => {
    const csvContent = [
      ['Date', 'Type', 'Description', 'Amount', 'Wallet', 'Status'],
      ...filteredEarnings.map(earning => [
        new Date(earning.date).toLocaleDateString(),
        earning.type,
        earning.description,
        earning.amount,
        earning.wallet,
        earning.status
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'earnings-history.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Earnings History</h1>
            <p className="mt-2 text-gray-600">
              Track all your earnings, bonuses, and transactions
            </p>
          </div>
          <button
            onClick={exportData}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </button>
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
              <p className="text-sm font-medium text-gray-500">Total Earnings</p>
              <p className="text-2xl font-bold text-gray-900">₹{totalEarnings}</p>
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
              <p className="text-2xl font-bold text-gray-900">₹{user?.earnings?.cash || 0}</p>
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
              <p className="text-2xl font-bold text-gray-900">₹{user?.earnings?.grow || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center">
              <Gift className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Scratch Wallet</p>
              <p className="text-2xl font-bold text-gray-900">₹{user?.earnings?.scratch || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white shadow-sm rounded-xl border border-gray-200 mb-6">
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Wallet</label>
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Sort Order</label>
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
                  setFilterType('all');
                  setFilterWallet('all');
                  setDateRange('all');
                  setSortOrder('desc');
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

      {/* Earnings Table */}
      <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Transaction
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Wallet
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedEarnings.map((earning) => {
                const Icon = getTypeIcon(earning.type);
                return (
                  <tr key={earning.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getTypeColor(earning.type)}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900 capitalize">
                            {earning.type.replace('_', ' ')}
                          </div>
                          <div className="text-sm text-gray-500">{earning.status}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{earning.description}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                        {new Date(earning.date).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(earning.date).toLocaleTimeString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full capitalize ${getWalletColor(earning.wallet)} bg-opacity-10`}>
                        {earning.wallet} Wallet
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className={`text-sm font-medium ${earning.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatAmount(earning.amount, earning.wallet)}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
                  <span className="font-medium">{Math.min(startIndex + itemsPerPage, filteredEarnings.length)}</span> of{' '}
                  <span className="font-medium">{filteredEarnings.length}</span> results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        page === currentPage
                          ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      } ${page === 1 ? 'rounded-l-md' : ''} ${page === totalPages ? 'rounded-r-md' : ''}`}
                    >
                      {page}
                    </button>
                  ))}
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {filteredEarnings.length === 0 && (
        <div className="text-center py-12">
          <Wallet className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No Earnings Found</h3>
          <p className="mt-1 text-sm text-gray-500">
            No earnings match your current filter criteria.
          </p>
        </div>
      )}
    </div>
  );
}