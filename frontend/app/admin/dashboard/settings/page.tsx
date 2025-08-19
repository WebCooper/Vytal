"use client";
import AdminLayout from "@/components/admin/layout/AdminLayout";
import { useState } from "react";
import { FaCog, FaDatabase, FaShieldAlt, FaBell, FaUsers, FaEnvelope, FaSave } from "react-icons/fa";

export default function AdminSettings() {
  const [settings, setSettings] = useState({
    general: {
      siteName: "Vytal",
      siteDescription: "Your Health Companion",
      maintenanceMode: false,
      registrationEnabled: true,
    },
    notifications: {
      emailNotifications: true,
      newUserAlerts: true,
      postApprovalAlerts: true,
      systemAlerts: true,
    },
    security: {
      requireEmailVerification: true,
      passwordMinLength: 8,
      sessionTimeout: 30,
      maxLoginAttempts: 5,
    },
    moderation: {
      autoApproveUsers: false,
      autoApprovePosts: false,
      requirePostReview: true,
      allowAnonymousPosts: false,
    },
  });

  const [activeTab, setActiveTab] = useState("general");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSaving(false);
    alert("Settings saved successfully!");
  };

  const handleSettingChange = (category: string, key: string, value: string | number | boolean) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category as keyof typeof prev],
        [key]: value
      }
    }));
  };

  const tabs = [
    { id: "general", label: "General", icon: FaCog },
    { id: "security", label: "Security", icon: FaShieldAlt },
    { id: "notifications", label: "Notifications", icon: FaBell },
    { id: "moderation", label: "Moderation", icon: FaUsers },
  ];

  const TabButton = ({ tab, isActive, onClick }: {
    tab: typeof tabs[0];
    isActive: boolean;
    onClick: () => void;
  }) => {
    const Icon = tab.icon;
    return (
      <button
        onClick={onClick}
        className={`flex items-center space-x-2 px-4 py-3 rounded-lg transition-colors ${
          isActive
            ? "bg-red-100 text-red-700 border-l-4 border-red-500"
            : "text-gray-600 hover:bg-red-50 hover:text-red-600"
        }`}
      >
        <Icon className="w-5 h-5" />
        <span className="font-medium">{tab.label}</span>
      </button>
    );
  };

  const SettingItem = ({ label, description, children }: {
    label: string;
    description?: string;
    children: React.ReactNode;
  }) => (
    <div className="flex items-center justify-between py-4 border-b border-gray-200 last:border-b-0">
      <div className="flex-1">
        <h4 className="text-sm font-medium text-gray-900">{label}</h4>
        {description && <p className="text-sm text-gray-500 mt-1">{description}</p>}
      </div>
      <div className="ml-4">
        {children}
      </div>
    </div>
  );

  const ToggleSwitch = ({ checked, onChange }: {
    checked: boolean;
    onChange: (checked: boolean) => void;
  }) => (
    <button
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        checked ? "bg-red-600" : "bg-gray-200"
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          checked ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case "general":
        return (
          <div className="space-y-6">
            <SettingItem
              label="Site Name"
              description="The name of your application"
            >
              <input
                type="text"
                value={settings.general.siteName}
                onChange={(e) => handleSettingChange("general", "siteName", e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-black"
              />
            </SettingItem>
            <SettingItem
              label="Site Description"
              description="Brief description of your application"
            >
              <input
                type="text"
                value={settings.general.siteDescription}
                onChange={(e) => handleSettingChange("general", "siteDescription", e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-black"
              />
            </SettingItem>
            <SettingItem
              label="Maintenance Mode"
              description="Temporarily disable the site for maintenance"
            >
              <ToggleSwitch
                checked={settings.general.maintenanceMode}
                onChange={(checked) => handleSettingChange("general", "maintenanceMode", checked)}
              />
            </SettingItem>
            <SettingItem
              label="User Registration"
              description="Allow new users to register"
            >
              <ToggleSwitch
                checked={settings.general.registrationEnabled}
                onChange={(checked) => handleSettingChange("general", "registrationEnabled", checked)}
              />
            </SettingItem>
          </div>
        );

      case "security":
        return (
          <div className="space-y-6">
            <SettingItem
              label="Email Verification"
              description="Require users to verify their email address"
            >
              <ToggleSwitch
                checked={settings.security.requireEmailVerification}
                onChange={(checked) => handleSettingChange("security", "requireEmailVerification", checked)}
              />
            </SettingItem>
            <SettingItem
              label="Minimum Password Length"
              description="Minimum number of characters for passwords"
            >
              <input
                type="number"
                min="6"
                max="32"
                value={settings.security.passwordMinLength}
                onChange={(e) => handleSettingChange("security", "passwordMinLength", parseInt(e.target.value))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent w-20 text-black"
              />
            </SettingItem>
            <SettingItem
              label="Session Timeout"
              description="Session timeout in minutes"
            >
              <input
                type="number"
                min="5"
                max="1440"
                value={settings.security.sessionTimeout}
                onChange={(e) => handleSettingChange("security", "sessionTimeout", parseInt(e.target.value))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent w-20 text-black"
              />
            </SettingItem>
            <SettingItem
              label="Max Login Attempts"
              description="Maximum failed login attempts before lockout"
            >
              <input
                type="number"
                min="3"
                max="10"
                value={settings.security.maxLoginAttempts}
                onChange={(e) => handleSettingChange("security", "maxLoginAttempts", parseInt(e.target.value))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent w-20 text-black"
              />
            </SettingItem>
          </div>
        );

      case "notifications":
        return (
          <div className="space-y-6">
            <SettingItem
              label="Email Notifications"
              description="Send email notifications for important events"
            >
              <ToggleSwitch
                checked={settings.notifications.emailNotifications}
                onChange={(checked) => handleSettingChange("notifications", "emailNotifications", checked)}
              />
            </SettingItem>
            <SettingItem
              label="New User Alerts"
              description="Get notified when new users register"
            >
              <ToggleSwitch
                checked={settings.notifications.newUserAlerts}
                onChange={(checked) => handleSettingChange("notifications", "newUserAlerts", checked)}
              />
            </SettingItem>
            <SettingItem
              label="Post Approval Alerts"
              description="Get notified when posts need approval"
            >
              <ToggleSwitch
                checked={settings.notifications.postApprovalAlerts}
                onChange={(checked) => handleSettingChange("notifications", "postApprovalAlerts", checked)}
              />
            </SettingItem>
            <SettingItem
              label="System Alerts"
              description="Get notified about system issues"
            >
              <ToggleSwitch
                checked={settings.notifications.systemAlerts}
                onChange={(checked) => handleSettingChange("notifications", "systemAlerts", checked)}
              />
            </SettingItem>
          </div>
        );

      case "moderation":
        return (
          <div className="space-y-6">
            <SettingItem
              label="Auto-approve Users"
              description="Automatically approve new user registrations"
            >
              <ToggleSwitch
                checked={settings.moderation.autoApproveUsers}
                onChange={(checked) => handleSettingChange("moderation", "autoApproveUsers", checked)}
              />
            </SettingItem>
            <SettingItem
              label="Auto-approve Posts"
              description="Automatically approve new posts"
            >
              <ToggleSwitch
                checked={settings.moderation.autoApprovePosts}
                onChange={(checked) => handleSettingChange("moderation", "autoApprovePosts", checked)}
              />
            </SettingItem>
            <SettingItem
              label="Require Post Review"
              description="All posts must be reviewed before publishing"
            >
              <ToggleSwitch
                checked={settings.moderation.requirePostReview}
                onChange={(checked) => handleSettingChange("moderation", "requirePostReview", checked)}
              />
            </SettingItem>
            <SettingItem
              label="Allow Anonymous Posts"
              description="Allow users to post anonymously"
            >
              <ToggleSwitch
                checked={settings.moderation.allowAnonymousPosts}
                onChange={(checked) => handleSettingChange("moderation", "allowAnonymousPosts", checked)}
              />
            </SettingItem>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <AdminLayout currentPage="Settings">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white/70 backdrop-blur-md rounded-xl shadow-lg border border-white/20 overflow-hidden">
          <div className="px-6 py-4 border-b border-red-200">
            <h3 className="text-lg font-semibold text-red-700">System Settings</h3>
            <p className="text-sm text-gray-600 mt-1">Configure your application settings</p>
          </div>

          <div className="flex">
            {/* Sidebar */}
            <div className="w-64 bg-gray-50/50 border-r border-gray-200 p-4">
              <nav className="space-y-2">
                {tabs.map((tab) => (
                  <TabButton
                    key={tab.id}
                    tab={tab}
                    isActive={activeTab === tab.id}
                    onClick={() => setActiveTab(tab.id)}
                  />
                ))}
              </nav>
            </div>

            {/* Content */}
            <div className="flex-1 p-6">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 capitalize">{activeTab} Settings</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Manage your {activeTab} configuration
                </p>
              </div>

              {renderTabContent()}

              {/* Save Button */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center space-x-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FaSave className="w-4 h-4" />
                  <span>{saving ? "Saving..." : "Save Changes"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* System Info */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/70 backdrop-blur-md rounded-xl shadow-lg p-6 border border-white/20">
            <div className="flex items-center space-x-3">
              <FaDatabase className="text-blue-600 text-xl" />
              <div>
                <h4 className="font-semibold text-gray-900">Database</h4>
                <p className="text-sm text-green-600">Connected</p>
              </div>
            </div>
          </div>
          <div className="bg-white/70 backdrop-blur-md rounded-xl shadow-lg p-6 border border-white/20">
            <div className="flex items-center space-x-3">
              <FaEnvelope className="text-green-600 text-xl" />
              <div>
                <h4 className="font-semibold text-gray-900">Email Service</h4>
                <p className="text-sm text-green-600">Active</p>
              </div>
            </div>
          </div>
          <div className="bg-white/70 backdrop-blur-md rounded-xl shadow-lg p-6 border border-white/20">
            <div className="flex items-center space-x-3">
              <FaShieldAlt className="text-red-600 text-xl" />
              <div>
                <h4 className="font-semibold text-gray-900">Security</h4>
                <p className="text-sm text-green-600">Secure</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
