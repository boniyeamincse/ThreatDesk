'use client';

import { useState, useEffect } from 'react';
import { User, Shield, Bell, Key, Save, Users } from 'lucide-react';
import { settingsApi } from '@/lib/api-client';

type Tab = 'profile' | 'security' | 'preferences' | 'apikeys' | 'users';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Profile state
  const [profile, setProfile] = useState({ firstName: '', lastName: '', email: '', phone: '' });

  // Preferences state
  const [preferences, setPreferences] = useState({
    emailAlerts: true,
    emailSeverity: ['critical', 'high'],
    slackAlerts: false,
    slackWebhook: '',
    dailySummary: true,
  });

  // Security state
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '' });

  // API Keys state
  const [apiKeys, setApiKeys] = useState<any[]>([]);
  const [newKeyName, setNewKeyName] = useState('');

  // Users state
  const [users, setUsers] = useState<any[]>([]);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState('L1 Analyst');
  const [newUserContact, setNewUserContact] = useState('');

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      if (activeTab === 'profile') {
        const data = await settingsApi.getProfile();
        setProfile(data);
      } else if (activeTab === 'preferences') {
        const data = await settingsApi.getPreferences();
        setPreferences(data);
      } else if (activeTab === 'apikeys') {
        const data = await settingsApi.getApiKeys();
        setApiKeys(data);
      } else if (activeTab === 'users') {
        const data = await settingsApi.listUsers();
        setUsers(data);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      await settingsApi.updateProfile({
        firstName: profile.firstName,
        lastName: profile.lastName,
        phone: profile.phone,
      });
      setSuccess('Profile updated');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSavePreferences = async () => {
    try {
      setLoading(true);
      await settingsApi.updatePreferences(preferences);
      setSuccess('Preferences updated');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async () => {
    try {
      setLoading(true);
      await settingsApi.updatePassword(passwordData);
      setSuccess('Password updated');
      setPasswordData({ currentPassword: '', newPassword: '' });
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateApiKey = async () => {
    if (!newKeyName) return;
    try {
      setLoading(true);
      const result = await settingsApi.generateApiKey(newKeyName);
      setSuccess(`API key created: ${result.key}`);
      setNewKeyName('');
      await loadData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRevokeApiKey = async (keyId: string) => {
    try {
      setLoading(true);
      await settingsApi.revokeApiKey(keyId);
      setSuccess('API key revoked');
      await loadData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async () => {
    if (!newUserName || !newUserEmail) return;
    try {
      setLoading(true);
      await settingsApi.createUser({
        firstName: newUserName.split(' ')[0],
        lastName: newUserName.split(' ')[1] || '',
        email: newUserEmail,
        role: newUserRole,
        phone: newUserContact,
      });
      setSuccess('User created');
      setNewUserName('');
      setNewUserEmail('');
      setNewUserRole('L1 Analyst');
      setNewUserContact('');
      await loadData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveUser = async (id: string) => {
    try {
      setLoading(true);
      await settingsApi.deleteUser(id);
      setSuccess('User deleted');
      await loadData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Operator Profile</h2>
              <p className="text-sm text-gray-600 mt-1">Update your personal information and SOC identifier.</p>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">First Name</label>
                <input
                  type="text"
                  value={profile.firstName}
                  onChange={(e) => setProfile({...profile, firstName: e.target.value})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Last Name</label>
                <input
                  type="text"
                  value={profile.lastName}
                  onChange={(e) => setProfile({...profile, lastName: e.target.value})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Phone</label>
                <input
                  type="tel"
                  value={profile.phone}
                  onChange={(e) => setProfile({...profile, phone: e.target.value})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email Address (Operator ID)</label>
                <input
                  type="email"
                  value={profile.email}
                  disabled
                  className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm sm:text-sm p-2 border text-gray-500 cursor-not-allowed"
                />
              </div>
            </div>
            <div className="pt-4 flex justify-end">
              <button
                onClick={handleSaveProfile}
                disabled={loading}
                className="flex items-center px-4 py-2 bg-slate-900 text-white rounded-md hover:bg-slate-800 transition disabled:opacity-50">
                <Save className="w-4 h-4 mr-2" /> Save Changes
              </button>
            </div>
          </div>
        );
      case 'security':
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Security Settings</h2>
              <p className="text-sm text-gray-600 mt-1">Manage your password and multi-factor authentication (MFA).</p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Current Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                  className="mt-1 block w-full max-w-md rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">New Password</label>
                <input
                  type="password"
                  placeholder="Enter new password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                  className="mt-1 block w-full max-w-md rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                />
              </div>
              <div className="pt-4">
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-gray-50 max-w-md">
                  <div>
                    <h4 className="text-sm font-bold text-gray-900">Two-Factor Authentication</h4>
                    <p className="text-xs text-gray-600 mt-1">Add an extra layer of security.</p>
                  </div>
                  <button className="px-3 py-1.5 text-sm bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200 font-medium transition">
                    Enable MFA
                  </button>
                </div>
              </div>
            </div>
            <div className="pt-4 flex justify-start">
              <button
                onClick={handleUpdatePassword}
                disabled={loading}
                className="flex items-center px-4 py-2 bg-slate-900 text-white rounded-md hover:bg-slate-800 transition disabled:opacity-50">
                <Save className="w-4 h-4 mr-2" /> Update Password
              </button>
            </div>
          </div>
        );
      case 'preferences':
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Notification Preferences</h2>
              <p className="text-sm text-gray-600 mt-1">Control how and when you receive SOC alerts.</p>
            </div>
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="email_alerts"
                    type="checkbox"
                    checked={preferences.emailAlerts}
                    onChange={(e) => setPreferences({...preferences, emailAlerts: e.target.checked})}
                    className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="email_alerts" className="font-medium text-gray-700">Email Alerts (Critical & High)</label>
                  <p className="text-gray-500">Receive an email immediately when a critical or high severity alert is ingested.</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="slack_alerts"
                    type="checkbox"
                    checked={preferences.slackAlerts}
                    onChange={(e) => setPreferences({...preferences, slackAlerts: e.target.checked})}
                    className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="slack_alerts" className="font-medium text-gray-700">Slack Webhook</label>
                  <p className="text-gray-500">Push notifications to your configured Slack incident channel.</p>
                  {preferences.slackAlerts && (
                    <input
                      type="text"
                      placeholder="https://hooks.slack.com/..."
                      value={preferences.slackWebhook}
                      onChange={(e) => setPreferences({...preferences, slackWebhook: e.target.value})}
                      className="mt-2 block w-full max-w-md rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                    />
                  )}
                </div>
              </div>
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="daily_summary"
                    type="checkbox"
                    checked={preferences.dailySummary}
                    onChange={(e) => setPreferences({...preferences, dailySummary: e.target.checked})}
                    className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="daily_summary" className="font-medium text-gray-700">Daily Digest</label>
                  <p className="text-gray-500">Receive a daily end-of-shift summary report via email.</p>
                </div>
              </div>
            </div>
            <div className="pt-4 flex justify-start">
              <button
                onClick={handleSavePreferences}
                disabled={loading}
                className="flex items-center px-4 py-2 bg-slate-900 text-white rounded-md hover:bg-slate-800 transition disabled:opacity-50">
                <Save className="w-4 h-4 mr-2" /> Save Preferences
              </button>
            </div>
          </div>
        );
      case 'users':
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">User Management</h2>
                <p className="text-sm text-gray-600 mt-1">Manage SOC operators, roles, and contacts.</p>
              </div>
              <button
                onClick={() => document.getElementById('quick-add-user')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-sm font-medium transition"
              >
                + Add User
              </button>
            </div>

            {users.length > 0 && (
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50 transition">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {user.firstName} {user.lastName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            user.role.name === 'Admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {user.role.name}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.phone || '-'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button onClick={() => handleRemoveUser(user.id)} disabled={loading} className="text-red-600 hover:text-red-900 disabled:opacity-50">
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div id="quick-add-user" className="bg-gray-50 p-4 rounded-lg border border-gray-200 mt-6">
              <h3 className="text-sm font-bold text-gray-900 mb-3">Quick Add User</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <input
                  type="text"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  placeholder="Full Name"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                />
                <input
                  type="email"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  placeholder="Email"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                />
                <select
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border bg-white"
                >
                  <option>Admin</option>
                  <option>L1 Analyst</option>
                  <option>L2 Responder</option>
                  <option>Viewer</option>
                </select>
                <input
                  type="text"
                  value={newUserContact}
                  onChange={(e) => setNewUserContact(e.target.value)}
                  placeholder="Phone"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                />
              </div>
              <div className="mt-3 flex justify-end">
                <button
                  onClick={handleAddUser}
                  disabled={loading}
                  className="px-4 py-2 bg-slate-900 text-white rounded-md hover:bg-slate-800 transition text-sm disabled:opacity-50">
                  Save User
                </button>
              </div>
            </div>
          </div>
        );
      case 'apikeys':
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div>
              <h2 className="text-xl font-bold text-gray-900">API Keys</h2>
              <p className="text-sm text-gray-600 mt-1">Manage API keys for external integrations and automation scripts.</p>
            </div>

            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <Key className="h-5 w-5 text-blue-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-blue-700">
                    Your API keys carry the same privileges as your user account. Keep them secure and never commit them to public repositories.
                  </p>
                </div>
              </div>
            </div>

            {apiKeys.length > 0 && (
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Key Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Used</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {apiKeys.map((key) => (
                      <tr key={key.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{key.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(key.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {key.lastUsedAt ? new Date(key.lastUsedAt).toLocaleDateString() : 'Never'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => handleRevokeApiKey(key.id)}
                            disabled={loading}
                            className="text-red-600 hover:text-red-900 disabled:opacity-50">
                            Revoke
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h3 className="text-sm font-bold text-gray-900 mb-3">Generate New Key</h3>
              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder="Key name (e.g., Grafana Dashboard)"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                />
                <button
                  onClick={handleGenerateApiKey}
                  disabled={loading || !newKeyName}
                  className="px-4 py-2 bg-slate-900 text-white rounded-md hover:bg-slate-800 transition disabled:opacity-50">
                  Generate
                </button>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen">
      <main className="max-w-7xl mx-auto px-6 py-8">
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}
        {success && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md">
            <p className="text-sm text-green-800">{success}</p>
          </div>
        )}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
            <p className="text-gray-600 mt-1">Manage your account and preferences</p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Settings Sidebar */}
          <div className="w-full md:w-64 flex-shrink-0">
            <nav className="space-y-1">
              <button
                onClick={() => setActiveTab('profile')}
                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === 'profile' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <User className={`mr-3 h-5 w-5 ${activeTab === 'profile' ? 'text-indigo-500' : 'text-gray-400'}`} />
                Profile
              </button>
              <button
                onClick={() => setActiveTab('security')}
                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === 'security' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Shield className={`mr-3 h-5 w-5 ${activeTab === 'security' ? 'text-indigo-500' : 'text-gray-400'}`} />
                Security
              </button>
              <button
                onClick={() => setActiveTab('preferences')}
                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === 'preferences' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Bell className={`mr-3 h-5 w-5 ${activeTab === 'preferences' ? 'text-indigo-500' : 'text-gray-400'}`} />
                Preferences
              </button>
              <button
                onClick={() => setActiveTab('apikeys')}
                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === 'apikeys' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Key className={`mr-3 h-5 w-5 ${activeTab === 'apikeys' ? 'text-indigo-500' : 'text-gray-400'}`} />
                API Keys
              </button>
              <button
                onClick={() => setActiveTab('users')}
                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === 'users' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Users className={`mr-3 h-5 w-5 ${activeTab === 'users' ? 'text-indigo-500' : 'text-gray-400'}`} />
                Users
              </button>
            </nav>
          </div>

          {/* Settings Content */}
          <div className="flex-1 bg-white shadow rounded-lg p-6 md:p-8 min-h-[500px]">
            {renderTabContent()}
          </div>
        </div>
      </main>
    </div>
  );
}
