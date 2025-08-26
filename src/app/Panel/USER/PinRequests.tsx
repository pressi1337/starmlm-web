import React, { useState, useEffect } from 'react';
import { useData } from '@/context/DataContext';
import { useAuth } from '@/context/AuthContext';
import { 
  Crown, 
  Plus, 
  CheckCircle, 
  Clock, 
  ArrowUp, 
  User, 
  Smartphone, 
  MapPin,
  Package,
  Edit
} from 'lucide-react';

export default function PinRequests() {
  const { pinRequests, updatePinRequest } = useData();
  const { user } = useAuth();
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [showActivationForm, setShowActivationForm] = useState(false);
  const [selectedPin, setSelectedPin] = useState(null);
  const [requestForm, setRequestForm] = useState({
    requestedLevel: ''
  });
  const [activationForm, setActivationForm] = useState({
    username: user?.username || '',
    mobile: user?.mobile || '',
    address: '',
    alternativeMobile: '',
    deliveryMethod: 'pickup'
  });

  const userRequests = pinRequests.filter(req => req.userId === user?.id);
  const availablePins = pinRequests.filter(req => 
    req.status === 'approved' && req.userId === user?.id
  );

  const getUpgradeOptions = (currentRole) => {
    const upgrades = {
      promotor: [{ key: 'promotor1', name: 'Promotor Level 1' }],
      promotor1: [{ key: 'promotor2', name: 'Promotor Level 2' }],
      promotor2: [
        { key: 'promotor3', name: 'Promotor Level 3' },
        { key: 'promotor4', name: 'Promotor Level 4' }
      ]
    };
    return upgrades[currentRole] || [];
  };

  const upgradeOptions = getUpgradeOptions(user?.role);

  const handleRequestSubmit = (e) => {
    e.preventDefault();
    // In real app, this would create a new pin request
    alert('Pin request submitted successfully! Admin will review your request.');
    setShowRequestForm(false);
    setRequestForm({ requestedLevel: '' });
  };

  const handleActivationSubmit = (e) => {
    e.preventDefault();
    if (selectedPin) {
      updatePinRequest(selectedPin.id, { status: 'activated' });
      alert('Pin activated successfully! Your level has been upgraded.');
      setShowActivationForm(false);
      setSelectedPin(null);
      setActivationForm({
        username: user?.username || '',
        mobile: user?.mobile || '',
        address: '',
        alternativeMobile: '',
        deliveryMethod: 'pickup'
      });
    }
  };

  const getLevelColor = (level) => {
    const colors = {
      promotor: 'text-blue-600',
      promotor1: 'text-green-600',
      promotor2: 'text-purple-600',
      promotor3: 'text-yellow-600',
      promotor4: 'text-pink-600'
    };
    return colors[level] || 'text-gray-600';
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock, text: 'Pending Review' },
      approved: { color: 'bg-green-100 text-green-800', icon: CheckCircle, text: 'Ready to Activate' },
      activated: { color: 'bg-blue-100 text-blue-800', icon: CheckCircle, text: 'Activated' }
    };
    const badge = badges[status] || badges.pending;
    const Icon = badge.icon;
    
    return (
      <span className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-full ${badge.color}`}>
        <Icon className="w-4 h-4 mr-1" />
        {badge.text}
      </span>
    );
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Pin Requests & Upgrades</h1>
        <p className="mt-2 text-gray-600">
          Request level upgrades and activate approved pins to unlock new features
        </p>
      </div>

      {/* Current Level & Upgrade Options */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <Crown className="w-5 h-5 mr-2" />
            Current Level & Upgrade Options
          </h3>
        </div>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                <Crown className="w-8 h-8 text-white" />
              </div>
              <div className="ml-4">
                <div className="text-2xl font-bold text-gray-900">{user?.level}</div>
                <div className="text-gray-600">Current Level</div>
              </div>
            </div>
          </div>

          {upgradeOptions.length > 0 ? (
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Available Upgrades:</h4>
              {upgradeOptions.map((option) => (
                <div key={option.key} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center">
                    <ArrowUp className="w-5 h-5 text-green-600 mr-3" />
                    <div>
                      <div className={`font-medium ${getLevelColor(option.key)}`}>
                        {option.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        Unlock advanced features and higher earnings
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setRequestForm({ requestedLevel: option.key });
                      setShowRequestForm(true);
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Request Pin
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Crown className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Maximum Level Reached</h3>
              <p className="mt-1 text-sm text-gray-500">
                You've reached the highest available level for your current path!
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Available Pins for Activation */}
      {availablePins.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-8">
          <h3 className="text-lg font-semibold text-green-900 mb-4 flex items-center">
            <CheckCircle className="w-5 h-5 mr-2" />
            Pins Ready for Activation
          </h3>
          <div className="space-y-4">
            {availablePins.map((pin) => (
              <div key={pin.id} className="bg-white rounded-lg p-4 border border-green-200">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">
                      Upgrade to {pin.requestedLevel.replace('promotor', 'Promotor Level ').replace('Level ', 'Level ')}
                    </div>
                    <div className="text-sm text-gray-600">
                      Requested on {new Date(pin.requestDate).toLocaleDateString()}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedPin(pin);
                      setShowActivationForm(true);
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Activate Pin
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pin Request History */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Pin Request History</h3>
        </div>
        <div className="p-6">
          {userRequests.length > 0 ? (
            <div className="space-y-4">
              {userRequests.map((request) => (
                <div key={request.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mr-4">
                      <ArrowUp className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">
                        {request.currentLevel} → {request.requestedLevel}
                      </div>
                      <div className="text-sm text-gray-600">
                        Requested on {new Date(request.requestDate).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    {getStatusBadge(request.status)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Crown className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No Pin Requests</h3>
              <p className="mt-1 text-sm text-gray-500">
                You haven't made any pin requests yet.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Request Form Modal */}
      {showRequestForm && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowRequestForm(false)}></div>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleRequestSubmit}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">Request Pin Upgrade</h3>
                    <button
                      type="button"
                      onClick={() => setShowRequestForm(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Current Level
                      </label>
                      <input
                        type="text"
                        value={user?.level}
                        disabled
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Requested Level
                      </label>
                      <select
                        value={requestForm.requestedLevel}
                        onChange={(e) => setRequestForm(prev => ({ ...prev, requestedLevel: e.target.value }))}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select level to upgrade to</option>
                        {upgradeOptions.map((option) => (
                          <option key={option.key} value={option.key}>
                            {option.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="font-medium text-blue-900 mb-2">Important Notes:</h4>
                      <ul className="text-sm text-blue-800 space-y-1">
                        <li>• Pin requests are reviewed by admin</li>
                        <li>• Approval may take 1-3 business days</li>
                        <li>• You'll be notified when your pin is ready</li>
                        <li>• Activation requires additional information</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Submit Request
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowRequestForm(false)}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Activation Form Modal */}
      {showActivationForm && selectedPin && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowActivationForm(false)}></div>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleActivationSubmit}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">Activate Pin</h3>
                    <button
                      type="button"
                      onClick={() => setShowActivationForm(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <User className="w-4 h-4 inline mr-1" />
                          Username
                        </label>
                        <input
                          type="text"
                          value={activationForm.username}
                          onChange={(e) => setActivationForm(prev => ({ ...prev, username: e.target.value }))}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <Smartphone className="w-4 h-4 inline mr-1" />
                          Mobile Number
                        </label>
                        <input
                          type="tel"
                          value={activationForm.mobile}
                          onChange={(e) => setActivationForm(prev => ({ ...prev, mobile: e.target.value }))}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <MapPin className="w-4 h-4 inline mr-1" />
                        Address
                      </label>
                      <textarea
                        rows={3}
                        value={activationForm.address}
                        onChange={(e) => setActivationForm(prev => ({ ...prev, address: e.target.value }))}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter your complete address"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Alternative Mobile Number
                      </label>
                      <input
                        type="tel"
                        value={activationForm.alternativeMobile}
                        onChange={(e) => setActivationForm(prev => ({ ...prev, alternativeMobile: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Optional alternative contact"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Package className="w-4 h-4 inline mr-1" />
                        Delivery Method
                      </label>
                      <select
                        value={activationForm.deliveryMethod}
                        onChange={(e) => setActivationForm(prev => ({ ...prev, deliveryMethod: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="pickup">Pick up from shop</option>
                        <option value="courier">Courier delivery</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Activate Pin
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowActivationForm(false)}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}