import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { 
  Users, 
  Share2, 
  Copy, 
  Crown, 
  TrendingUp,
  User,
  ChevronDown,
  ChevronRight,
  Gift,
  Link as LinkIcon
} from 'lucide-react';

// Mock referral data - in real app this would come from your data context
const mockReferralData = {
  totalReferrals: 15,
  activeReferrals: 12,
  totalEarnings: 2500,
  referralLink: 'https://promohub.com/ref/john_doe_123',
  tree: [
    {
      id: '1',
      username: 'alice_smith',
      mobile: '9876543220',
      level: 'Promotor',
      joinDate: '2024-01-20',
      status: 'active',
      earnings: 450,
      children: [
        {
          id: '2',
          username: 'bob_jones',
          mobile: '9876543221',
          level: 'Promotor',
          joinDate: '2024-01-25',
          status: 'active',
          earnings: 320,
          children: []
        },
        {
          id: '3',
          username: 'carol_white',
          mobile: '9876543222',
          level: 'Promotor 1',
          joinDate: '2024-01-28',
          status: 'active',
          earnings: 680,
          children: [
            {
              id: '4',
              username: 'david_brown',
              mobile: '9876543223',
              level: 'Promotor',
              joinDate: '2024-02-01',
              status: 'inactive',
              earnings: 150,
              children: []
            }
          ]
        }
      ]
    },
    {
      id: '5',
      username: 'eve_wilson',
      mobile: '9876543224',
      level: 'Promotor 2',
      joinDate: '2024-01-22',
      status: 'active',
      earnings: 890,
      children: [
        {
          id: '6',
          username: 'frank_davis',
          mobile: '9876543225',
          level: 'Promotor',
          joinDate: '2024-01-30',
          status: 'active',
          earnings: 280,
          children: []
        }
      ]
    }
  ]
};

export default function ReferralTree() {
  const { user } = useAuth();
  const [expandedNodes, setExpandedNodes] = useState(new Set(['root']));
  const [copiedLink, setCopiedLink] = useState(false);

  const toggleNode = (nodeId) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  const copyReferralLink = async () => {
    try {
      await navigator.clipboard.writeText(mockReferralData.referralLink);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  const shareReferralLink = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join PromoHub',
          text: 'Join me on PromoHub and start earning today!',
          url: mockReferralData.referralLink,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      copyReferralLink();
    }
  };

  const getLevelColor = (level) => {
    const colors = {
      'Promotor': 'text-blue-600 bg-blue-100',
      'Promotor 1': 'text-green-600 bg-green-100',
      'Promotor 2': 'text-purple-600 bg-purple-100',
      'Promotor 3': 'text-yellow-600 bg-yellow-100',
      'Promotor 4': 'text-pink-600 bg-pink-100'
    };
    return colors[level] || 'text-gray-600 bg-gray-100';
  };

  const getStatusColor = (status) => {
    return status === 'active' ? 'text-green-600' : 'text-red-600';
  };

  const ReferralNode = ({ node, level = 0, parentId = 'root' }) => {
    const nodeId = `${parentId}-${node.id}`;
    const isExpanded = expandedNodes.has(nodeId);
    const hasChildren = node.children && node.children.length > 0;

    return (
      <div className="ml-4">
        <div className="flex items-center py-3 px-4 bg-white rounded-lg border border-gray-200 mb-2 hover:shadow-md transition-shadow">
          <div className="flex items-center flex-1">
            {hasChildren && (
              <button
                onClick={() => toggleNode(nodeId)}
                className="mr-2 p-1 hover:bg-gray-100 rounded"
              >
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4 text-gray-600" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-gray-600" />
                )}
              </button>
            )}
            
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mr-3">
              <User className="w-5 h-5 text-white" />
            </div>
            
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <span className="font-medium text-gray-900">{node.username}</span>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getLevelColor(node.level)}`}>
                  {node.level}
                </span>
                <span className={`text-xs font-medium ${getStatusColor(node.status)}`}>
                  {node.status}
                </span>
              </div>
              <div className="text-sm text-gray-600">
                {node.mobile} • Joined {new Date(node.joinDate).toLocaleDateString()}
              </div>
            </div>
            
            <div className="text-right">
              <div className="font-medium text-gray-900">₹{node.earnings}</div>
              <div className="text-xs text-gray-500">Total Earnings</div>
            </div>
          </div>
        </div>
        
        {hasChildren && isExpanded && (
          <div className="ml-6 border-l-2 border-gray-200 pl-4">
            {node.children.map((child) => (
              <ReferralNode
                key={child.id}
                node={child}
                level={level + 1}
                parentId={nodeId}
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Referral Network</h1>
        <p className="mt-2 text-gray-600">
          Manage your referral network and track your team's performance
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Referrals</p>
              <p className="text-2xl font-bold text-gray-900">{mockReferralData.totalReferrals}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Active Members</p>
              <p className="text-2xl font-bold text-gray-900">{mockReferralData.activeReferrals}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
              <Gift className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Earnings</p>
              <p className="text-2xl font-bold text-gray-900">₹{mockReferralData.totalEarnings}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center">
              <Crown className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Your Level</p>
              <p className="text-lg font-bold text-gray-900">{user?.level}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Referral Link Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <LinkIcon className="w-5 h-5 mr-2" />
            Your Referral Link
          </h3>
        </div>
        <div className="p-6">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <div className="flex items-center p-3 bg-gray-50 rounded-lg border">
                <input
                  type="text"
                  value={mockReferralData.referralLink}
                  readOnly
                  className="flex-1 bg-transparent border-none outline-none text-gray-900"
                />
                <button
                  onClick={copyReferralLink}
                  className={`ml-2 px-3 py-1 rounded text-sm font-medium transition-colors ${
                    copiedLink
                      ? 'bg-green-100 text-green-800'
                      : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                  }`}
                >
                  {copiedLink ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>
            <button
              onClick={shareReferralLink}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </button>
          </div>
          
          <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-medium text-blue-900 mb-2">How to Earn More:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Share your referral link with friends and family</li>
              <li>• Earn cashback for each successful referral</li>
              <li>• Higher levels unlock better referral rewards</li>
              <li>• Active referrals contribute to your monthly earnings</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Referral Tree */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <Users className="w-5 h-5 mr-2" />
            Referral Genealogy Tree
          </h3>
        </div>
        <div className="p-6">
          {/* Root Node (Current User) */}
          <div className="mb-6">
            <div className="flex items-center py-4 px-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mr-4">
                <Crown className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-lg">{user?.username}</span>
                  <span className="px-2 py-1 text-xs font-medium bg-white/20 rounded-full">
                    {user?.level}
                  </span>
                  <span className="text-xs">You</span>
                </div>
                <div className="text-sm opacity-90">
                  {user?.mobile} • Network Leader
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-lg">₹{user?.earnings?.scratch || 0}</div>
                <div className="text-xs opacity-75">Referral Earnings</div>
              </div>
            </div>
          </div>

          {/* Referral Tree */}
          {mockReferralData.tree.length > 0 ? (
            <div className="space-y-2">
              {mockReferralData.tree.map((node) => (
                <ReferralNode key={node.id} node={node} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Users className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No Referrals Yet</h3>
              <p className="mt-1 text-sm text-gray-500">
                Start sharing your referral link to build your network!
              </p>
              <div className="mt-6">
                <button
                  onClick={shareReferralLink}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share Referral Link
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Referral Tips */}
      <div className="mt-8 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 border border-green-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Referral Success Tips</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-start">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
              <div>
                <div className="font-medium text-gray-900">Personal Approach</div>
                <div className="text-sm text-gray-600">Share with people you know and trust</div>
              </div>
            </div>
            <div className="flex items-start">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
              <div>
                <div className="font-medium text-gray-900">Explain Benefits</div>
                <div className="text-sm text-gray-600">Help them understand the earning potential</div>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-start">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
              <div>
                <div className="font-medium text-gray-900">Provide Support</div>
                <div className="text-sm text-gray-600">Guide new members through the process</div>
              </div>
            </div>
            <div className="flex items-start">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
              <div>
                <div className="font-medium text-gray-900">Stay Active</div>
                <div className="text-sm text-gray-600">Lead by example with consistent activity</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}