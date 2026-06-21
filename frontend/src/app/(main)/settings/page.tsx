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
  const [newUserRole, setNewUserRole] = useState('SOC L1');
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
      setNewUserRole('SOC L1');
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
              <h2 className="text-xl font-bold text-white">Operator Profile</h2>
              <p className="text-sm text-slate-400 mt-1">Update your personal information and SOC identifier.</p>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-slate-300">First Name</label>
                <input
                  type="text"
                  value={profile.firstName}
                  onChange={(e) => setProfile({...profile, firstName: e.target.value})}
                  className="mt-1 block w-full rounded-md border-slate-700 bg-slate-800 text-white shadow-sm focus:border-cyan-500 focus:ring-cyan-500 sm:text-sm p-2 border"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300">Last Name</label>
                <input
                  type="text"
                  value={profile.lastName}
                  onChange={(e) => setProfile({...profile, lastName: e.target.value})}
                  className="mt-1 block w-full rounded-md border-slate-700 bg-slate-800 text-white shadow-sm focus:border-cyan-500 focus:ring-cyan-500 sm:text-sm p-2 border"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300">Phone</label>
                <input
                  type="tel"
                  value={profile.phone}
                  onChange={(e) => setProfile({...profile, phone: e.target.value})}
                  className="mt-1 block w-full rounded-md border-slate-700 bg-slate-800 text-white shadow-sm focus:border-cyan-500 focus:ring-cyan-500 sm:text-sm p-2 border"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300">Email Address (Operator ID)</label>
                <input
                  type="email"
                  value={profile.email}
                  disabled
                  className="mt-1 block w-full rounded-md border-slate-700 bg-slate-900 text-slate-500 shadow-sm sm:text-sm p-2 border cursor-not-allowed"
                />
              </div>
            </div>
            <div className="pt-4 flex justify-end">
              <button
                onClick={handleSaveProfile}
                disabled={loading}
                className="flex items-center px-4 py-2 bg-cyan-600/20 text-cyan-400 border border-cyan-500/50 hover:bg-cyan-600/30 rounded-md transition disabled:opacity-50 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
                <Save className="w-4 h-4 mr-2" /> Save Changes
              </button>
            </div>
          </div>
        );
      case 'security':
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div>
              <h2 className="text-xl font-bold text-white">Security Settings</h2>
              <p className="text-sm text-slate-400 mt-1">Manage your password and multi-factor authentication (MFA).</p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300">Current Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                  className="mt-1 block w-full max-w-md rounded-md border-slate-700 bg-slate-800 text-white shadow-sm focus:border-cyan-500 focus:ring-cyan-500 sm:text-sm p-2 border"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300">New Password</label>
                <input
                  type="password"
                  placeholder="Enter new password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                  className="mt-1 block w-full max-w-md rounded-md border-slate-700 bg-slate-800 text-white shadow-sm focus:border-cyan-500 focus:ring-cyan-500 sm:text-sm p-2 border"
                />
              </div>
              <div className="pt-4">
                <div className="flex items-center justify-between p-4 border border-slate-700 rounded-lg bg-slate-800 max-w-md">
                  <div>
                    <h4 className="text-sm font-bold text-white">Two-Factor Authentication</h4>
                    <p className="text-xs text-slate-400 mt-1">Add an extra layer of security.</p>
                  </div>
                  <button className="px-3 py-1.5 text-sm bg-cyan-600/20 text-cyan-400 border border-cyan-500/50 hover:bg-cyan-600/30 rounded transition shadow-[0_0_10px_rgba(6,182,212,0.2)]">
                    Enable MFA
                  </button>
                </div>
              </div>
            </div>
            <div className="pt-4 flex justify-start">
              <button
                onClick={handleUpdatePassword}
                disabled={loading}
                className="flex items-center px-4 py-2 bg-cyan-600/20 text-cyan-400 border border-cyan-500/50 hover:bg-cyan-600/30 rounded-md transition disabled:opacity-50 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
                <Save className="w-4 h-4 mr-2" /> Update Password
              </button>
            </div>
          </div>
        );
      case 'preferences':
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div>
              <h2 className="text-xl font-bold text-white">Notification Preferences</h2>
              <p className="text-sm text-slate-400 mt-1">Control how and when you receive SOC alerts.</p>
            </div>
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="email_alerts"
                    type="checkbox"
                    checked={preferences.emailAlerts}
                    onChange={(e) => setPreferences({...preferences, emailAlerts: e.target.checked})}
                    className="focus:ring-cyan-500 h-4 w-4 text-cyan-600 border-slate-700 bg-slate-800 rounded"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="email_alerts" className="font-medium text-slate-300">Email Alerts (Critical & High)</label>
                  <p className="text-slate-500">Receive an email immediately when a critical or high severity alert is ingested.</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="slack_alerts"
                    type="checkbox"
                    checked={preferences.slackAlerts}
                    onChange={(e) => setPreferences({...preferences, slackAlerts: e.target.checked})}
                    className="focus:ring-cyan-500 h-4 w-4 text-cyan-600 border-slate-700 bg-slate-800 rounded"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="slack_alerts" className="font-medium text-slate-300">Slack Webhook</label>
                  <p className="text-slate-500">Push notifications to your configured Slack incident channel.</p>
                  {preferences.slackAlerts && (
                    <input
                      type="text"
                      placeholder="https://hooks.slack.com/..."
                      value={preferences.slackWebhook}
                      onChange={(e) => setPreferences({...preferences, slackWebhook: e.target.value})}
                      className="mt-2 block w-full max-w-md rounded-md border-slate-700 bg-slate-800 text-white shadow-sm focus:border-cyan-500 focus:ring-cyan-500 sm:text-sm p-2 border"
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
                    className="focus:ring-cyan-500 h-4 w-4 text-cyan-600 border-slate-700 bg-slate-800 rounded"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="daily_summary" className="font-medium text-slate-300">Daily Digest</label>
                  <p className="text-slate-500">Receive a daily end-of-shift summary report via email.</p>
                </div>
              </div>
            </div>
            <div className="pt-4 flex justify-start">
              <button
                onClick={handleSavePreferences}
                disabled={loading}
                className="flex items-center px-4 py-2 bg-cyan-600/20 text-cyan-400 border border-cyan-500/50 hover:bg-cyan-600/30 rounded-md transition disabled:opacity-50 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
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
                <h2 className="text-xl font-bold text-white">User Management</h2>
                <p className="text-sm text-slate-400 mt-1">Manage SOC operators, roles, and contacts.</p>
              </div>
              <button
                onClick={() => document.getElementById('quick-add-user')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-4 py-2 bg-cyan-600/20 text-cyan-400 border border-cyan-500/50 hover:bg-cyan-600/30 rounded-md text-sm font-medium transition shadow-[0_0_15px_rgba(6,182,212,0.3)]"
              >
                + Add User
              </button>
            </div>

            {users.length > 0 && (
              <div className="border border-slate-800 rounded-lg overflow-hidden bg-slate-900 shadow-xl">
                <table className="min-w-full divide-y divide-slate-800">
                  <thead className="bg-slate-800/50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Role</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Contact</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-slate-400 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-slate-900 divide-y divide-slate-800">
                    {users.map((user) => (
                      <tr key={user.id} className="hover:bg-slate-800/50 transition">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-200">
                          {user.firstName} {user.lastName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">{user.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full border ${
                            user.role.name === 'Admin' ? 'bg-purple-900/50 text-purple-400 border-purple-500/50' : 'bg-cyan-900/50 text-cyan-400 border-cyan-500/50'
                          }`}>
                            {user.role.name}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">{user.phone || '-'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button onClick={() => handleRemoveUser(user.id)} disabled={loading} className="text-red-400 hover:text-red-300 disabled:opacity-50">
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div id="quick-add-user" className="bg-slate-800/50 p-4 rounded-lg border border-slate-700 mt-6 shadow-lg backdrop-blur-sm">
              <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse"></span>
                Quick Add User
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <input
                  type="text"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  placeholder="Full Name"
                  className="block w-full rounded-md border-slate-600 bg-slate-900 text-white shadow-sm focus:border-cyan-500 focus:ring-cyan-500 sm:text-sm p-2 border"
                />
                <input
                  type="email"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  placeholder="Email"
                  className="block w-full rounded-md border-slate-600 bg-slate-900 text-white shadow-sm focus:border-cyan-500 focus:ring-cyan-500 sm:text-sm p-2 border"
                />
                <select
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value)}
                  className="block w-full rounded-md border-slate-600 bg-slate-900 text-white shadow-sm focus:border-cyan-500 focus:ring-cyan-500 sm:text-sm p-2 border"
                >
                  <option value="Admin">Admin</option>
                  <option value="SOC L1">SOC L1</option>
                  <option value="SOC L2">SOC L2</option>
                  <option value="SOC Engineer">SOC Engineer</option>
                  <option value="SOC Manager">SOC Manager</option>
                </select>
                <input
                  type="text"
                  value={newUserContact}
                  onChange={(e) => setNewUserContact(e.target.value)}
                  placeholder="Phone"
                  className="block w-full rounded-md border-slate-600 bg-slate-900 text-white shadow-sm focus:border-cyan-500 focus:ring-cyan-500 sm:text-sm p-2 border"
                />
              </div>
              <div className="mt-4 flex justify-end">
                <button
                  onClick={handleAddUser}
                  disabled={loading}
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-slate-900 font-bold rounded-md transition text-sm disabled:opacity-50 shadow-[0_0_15px_rgba(6,182,212,0.4)]">
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
              <h2 className="text-xl font-bold text-white">API Keys</h2>
              <p className="text-sm text-slate-400 mt-1">Manage API keys for external integrations and automation scripts.</p>
            </div>

            <div className="bg-cyan-900/20 border-l-4 border-cyan-500 p-4 mb-6 rounded-r-lg">
              <div className="flex">
                <div className="flex-shrink-0">
                  <Key className="h-5 w-5 text-cyan-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-cyan-100">
                    Your API keys carry the same privileges as your user account. Keep them secure and never commit them to public repositories.
                  </p>
                </div>
              </div>
            </div>

            {apiKeys.length > 0 && (
              <div className="border border-slate-800 rounded-lg overflow-hidden bg-slate-900 shadow-xl">
                <table className="min-w-full divide-y divide-slate-800">
                  <thead className="bg-slate-800/50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Key Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Created</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Last Used</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-slate-400 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-slate-900 divide-y divide-slate-800">
                    {apiKeys.map((key) => (
                      <tr key={key.id} className="hover:bg-slate-800/50 transition">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-200">{key.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                          {new Date(key.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                          {key.lastUsedAt ? new Date(key.lastUsedAt).toLocaleDateString() : 'Never'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => handleRevokeApiKey(key.id)}
                            disabled={loading}
                            className="text-red-400 hover:text-red-300 disabled:opacity-50">
                            Revoke
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700 shadow-lg backdrop-blur-sm">
              <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse"></span>
                Generate New Key
              </h3>
              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder="Key name (e.g., Grafana Dashboard)"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  className="flex-1 rounded-md border-slate-600 bg-slate-900 text-white shadow-sm focus:border-cyan-500 focus:ring-cyan-500 sm:text-sm p-2 border"
                />
                <button
                  onClick={handleGenerateApiKey}
                  disabled={loading || !newKeyName}
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-slate-900 font-bold rounded-md transition disabled:opacity-50 shadow-[0_0_15px_rgba(6,182,212,0.4)]">
                  Generate
                </button>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-300 pt-8 pb-12">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {error && (
          <div className="mb-6 p-4 bg-red-900/30 border border-red-500/50 rounded-lg shadow-lg">
            <p className="text-sm text-red-400 font-medium flex items-center">
              <span className="mr-2">⚠</span> {error}
            </p>
          </div>
        )}
        {success && (
          <div className="mb-6 p-4 bg-green-900/30 border border-green-500/50 rounded-lg shadow-lg">
            <p className="text-sm text-green-400 font-medium flex items-center">
              <span className="mr-2">✓</span> {success}
            </p>
          </div>
        )}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
              <div className="h-8 w-1.5 bg-cyan-500 rounded-full shadow-[0_0_10px_rgba(6,182,212,0.8)]"></div>
              Platform Settings
            </h1>
            <p className="text-slate-400 mt-2 text-sm ml-4">Manage your SOC environment, operators, and preferences.</p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Settings Sidebar */}
          <div className="w-full md:w-64 flex-shrink-0">
            <nav className="space-y-2 bg-slate-900/50 p-4 rounded-xl border border-slate-800 backdrop-blur-md">
              <button
                onClick={() => setActiveTab('profile')}
                className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                  activeTab === 'profile' ? 'bg-cyan-600/20 text-cyan-400 border border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.15)]' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-transparent'
                }`}
              >
                <User className={`mr-3 h-5 w-5 ${activeTab === 'profile' ? 'text-cyan-400 drop-shadow-[0_0_5px_rgba(6,182,212,0.8)]' : 'text-slate-500'}`} />
                Profile
              </button>
              <button
                onClick={() => setActiveTab('security')}
                className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                  activeTab === 'security' ? 'bg-cyan-600/20 text-cyan-400 border border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.15)]' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-transparent'
                }`}
              >
                <Shield className={`mr-3 h-5 w-5 ${activeTab === 'security' ? 'text-cyan-400 drop-shadow-[0_0_5px_rgba(6,182,212,0.8)]' : 'text-slate-500'}`} />
                Security
              </button>
              <button
                onClick={() => setActiveTab('preferences')}
                className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                  activeTab === 'preferences' ? 'bg-cyan-600/20 text-cyan-400 border border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.15)]' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-transparent'
                }`}
              >
                <Bell className={`mr-3 h-5 w-5 ${activeTab === 'preferences' ? 'text-cyan-400 drop-shadow-[0_0_5px_rgba(6,182,212,0.8)]' : 'text-slate-500'}`} />
                Preferences
              </button>
              <button
                onClick={() => setActiveTab('apikeys')}
                className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                  activeTab === 'apikeys' ? 'bg-cyan-600/20 text-cyan-400 border border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.15)]' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-transparent'
                }`}
              >
                <Key className={`mr-3 h-5 w-5 ${activeTab === 'apikeys' ? 'text-cyan-400 drop-shadow-[0_0_5px_rgba(6,182,212,0.8)]' : 'text-slate-500'}`} />
                API Keys
              </button>
              <button
                onClick={() => setActiveTab('users')}
                className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                  activeTab === 'users' ? 'bg-cyan-600/20 text-cyan-400 border border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.15)]' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-transparent'
                }`}
              >
                <Users className={`mr-3 h-5 w-5 ${activeTab === 'users' ? 'text-cyan-400 drop-shadow-[0_0_5px_rgba(6,182,212,0.8)]' : 'text-slate-500'}`} />
                Users
              </button>
            </nav>
          </div>

          {/* Settings Content */}
          <div className="flex-1 bg-slate-900/50 shadow-2xl rounded-xl border border-slate-800 p-6 md:p-8 min-h-[500px] backdrop-blur-xl">
            {renderTabContent()}
          </div>
        </div>
      </main>
    </div>
  );
}
