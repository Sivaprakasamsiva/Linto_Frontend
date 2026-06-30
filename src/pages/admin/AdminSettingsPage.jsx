/**
 * Admin settings page - system settings, banners, theme.
 *
 * BUG-002 fix: System Settings tab now fetches real settings from the backend
 * and wires the Save buttons to PATCH /api/system/settings/<key>/.
 */
import { useState, useEffect } from 'react';
import { FiSettings, FiPlus, FiTrash2, FiSave, FiLayout, FiDroplet } from 'react-icons/fi';
import { systemAPI } from '../../api';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Spinner } from '../../components/ui';
import { formatApiError } from '../../utils/helpers';

// Map of known system settings (label -> key + value type + default)
const KNOWN_SETTINGS = [
  { key: 'listing_expiry_days', label: 'Listing Expiry Days', defaultValue: '30', value_type: 'integer' },
  { key: 'max_images_per_listing', label: 'Maximum Images per Listing', defaultValue: '5', value_type: 'integer' },
  { key: 'twenty_four_hour_action_hours', label: '24-Hour Action Window (hours)', defaultValue: '24', value_type: 'integer' },
  { key: 'seven_day_cleanup_days', label: '7-Day Cleanup Window (days)', defaultValue: '7', value_type: 'integer' },
  { key: 'otp_length', label: 'OTP Length', defaultValue: '6', value_type: 'integer' },
  { key: 'otp_expiry_minutes', label: 'OTP Expiry (minutes)', defaultValue: '10', value_type: 'integer' },
  { key: 'platform_notice', label: 'Platform Notice', defaultValue: 'Buyers must verify the seller before making any payment. The platform only connects users and is not responsible for offline transactions.', value_type: 'string' },
];

export default function AdminSettingsPage() {
  const qc = useQueryClient();
  const { data: theme, isLoading: themeLoading } = useQuery({
    queryKey: ['theme'],
    queryFn: () => systemAPI.theme().then((r) => r.data),
  });
  const { data: banners } = useQuery({
    queryKey: ['banners'],
    queryFn: () => systemAPI.banners().then((r) => r.data),
  });
  const { data: settingsList } = useQuery({
    queryKey: ['system-settings'],
    queryFn: () => systemAPI.settings().then((r) => r.data),
  });

  const [tab, setTab] = useState('theme');
  const [themeForm, setThemeForm] = useState(null);
  const [newBanner, setNewBanner] = useState({ title: '', message: '', link: '', is_active: true });

  useEffect(() => {
    if (theme) setThemeForm(theme);
  }, [theme]);

  const handleThemeSave = async () => {
    try {
      await systemAPI.updateTheme(themeForm);
      toast.success('Theme updated.');
      qc.invalidateQueries({ queryKey: ['theme'] });
      qc.invalidateQueries({ queryKey: ['public-config'] });
    } catch (err) {
      toast.error(formatApiError(err));
    }
  };

  const handleCreateBanner = async () => {
    try {
      await systemAPI.createBanner(newBanner);
      toast.success('Banner created.');
      setNewBanner({ title: '', message: '', link: '', is_active: true });
      qc.invalidateQueries({ queryKey: ['banners'] });
    } catch (err) {
      toast.error(formatApiError(err));
    }
  };

  const handleDeleteBanner = async (id) => {
    if (!confirm('Delete this banner?')) return;
    try {
      await systemAPI.deleteBanner(id);
      toast.success('Banner deleted.');
      qc.invalidateQueries({ queryKey: ['banners'] });
    } catch (err) {
      toast.error(formatApiError(err));
    }
  };

  const TABS = [
    { key: 'theme', label: 'Theme & Layout', icon: FiDroplet },
    { key: 'banners', label: 'Banners', icon: FiLayout },
    { key: 'system', label: 'System Settings', icon: FiSettings },
  ];

  if (themeLoading) return <div className="flex justify-center py-20"><Spinner size={32} /></div>;

  return (
    <div>
      <h1 className="font-display font-bold text-2xl mb-4">System Settings</h1>
      <div className="border-b border-slate-200 dark:border-slate-800 mb-4">
        <div className="flex gap-1">
          {TABS.map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`flex items-center gap-2 px-3 py-2 text-sm font-medium border-b-2 ${
                  tab === t.key ? 'border-brand text-brand' : 'border-transparent text-slate-500'
                }`}
              >
                <Icon size={14} /> {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {tab === 'theme' && themeForm && (
        <div className="card p-4 space-y-4">
          <h3 className="font-semibold">Color Scheme</h3>
          <div className="grid sm:grid-cols-3 gap-3">
            <ColorField label="Primary Color" value={themeForm.primary_color} onChange={(v) => setThemeForm({ ...themeForm, primary_color: v })} />
            <ColorField label="Secondary Color" value={themeForm.secondary_color} onChange={(v) => setThemeForm({ ...themeForm, secondary_color: v })} />
            <ColorField label="Accent Color" value={themeForm.accent_color} onChange={(v) => setThemeForm({ ...themeForm, accent_color: v })} />
            <ColorField label="Success" value={themeForm.success_color} onChange={(v) => setThemeForm({ ...themeForm, success_color: v })} />
            <ColorField label="Danger" value={themeForm.danger_color} onChange={(v) => setThemeForm({ ...themeForm, danger_color: v })} />
            <ColorField label="Background" value={themeForm.background_color} onChange={(v) => setThemeForm({ ...themeForm, background_color: v })} />
          </div>
          <h3 className="font-semibold">Homepage Layout</h3>
          <div>
            <label className="label">Layout Style</label>
            <select value={themeForm.homepage_layout} onChange={(e) => setThemeForm({ ...themeForm, homepage_layout: e.target.value })} className="input">
              <option value="default">Default</option>
              <option value="compact">Compact</option>
              <option value="grid">Grid</option>
            </select>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={themeForm.show_featured_section} onChange={(e) => setThemeForm({ ...themeForm, show_featured_section: e.target.checked })} />
              <span className="text-sm">Show Featured Section</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={themeForm.show_recent_section} onChange={(e) => setThemeForm({ ...themeForm, show_recent_section: e.target.checked })} />
              <span className="text-sm">Show Recent Section</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={themeForm.show_categories_section} onChange={(e) => setThemeForm({ ...themeForm, show_categories_section: e.target.checked })} />
              <span className="text-sm">Show Categories Section</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={themeForm.show_banner} onChange={(e) => setThemeForm({ ...themeForm, show_banner: e.target.checked })} />
              <span className="text-sm">Show Safety Banner</span>
            </label>
          </div>
          <button onClick={handleThemeSave} className="btn-primary"><FiSave /> Save Theme</button>
        </div>
      )}

      {tab === 'banners' && (
        <div className="space-y-4">
          <div className="card p-4">
            <h3 className="font-semibold mb-3">Create New Banner</h3>
            <div className="space-y-2">
              <input placeholder="Banner title" value={newBanner.title} onChange={(e) => setNewBanner({ ...newBanner, title: e.target.value })} className="input" />
              <textarea placeholder="Banner message" value={newBanner.message} onChange={(e) => setNewBanner({ ...newBanner, message: e.target.value })} className="input" rows="2" />
              <div className="grid sm:grid-cols-2 gap-2">
                <input placeholder="Link URL (optional)" value={newBanner.link} onChange={(e) => setNewBanner({ ...newBanner, link: e.target.value })} className="input" />
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={newBanner.is_active} onChange={(e) => setNewBanner({ ...newBanner, is_active: e.target.checked })} />
                  <span className="text-sm">Active</span>
                </label>
              </div>
              <button onClick={handleCreateBanner} className="btn-primary"><FiPlus /> Create Banner</button>
            </div>
          </div>
          <div className="space-y-2">
            {banners?.results?.map((b) => (
              <div key={b.id} className="card p-3 flex items-start justify-between">
                <div>
                  <p className="font-medium text-sm">{b.title}</p>
                  <p className="text-xs text-slate-500">{b.message}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`badge ${b.is_active ? 'badge-available' : 'badge bg-slate-100 text-slate-500'}`}>{b.is_active ? 'Active' : 'Inactive'}</span>
                  <button onClick={() => handleDeleteBanner(b.id)} className="btn-outline !p-2 text-red-600"><FiTrash2 size={12} /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'system' && (
        <div className="card p-4">
          <h3 className="font-semibold mb-3">System Configuration</h3>
          <p className="text-sm text-slate-500 mb-4">These values can also be set via environment variables. Changes here override env defaults.</p>
          <div className="space-y-3">
            {KNOWN_SETTINGS.map((s) => (
              <SettingItem
                key={s.key}
                settingKey={s.key}
                label={s.label}
                defaultValue={s.defaultValue}
                valueType={s.value_type}
                existing={settingsList?.results?.find((x) => x.key === s.key)}
              />
            ))}
          </div>
          <p className="text-xs text-slate-400 mt-4">Note: Settings changes apply immediately. Use with caution.</p>
        </div>
      )}
    </div>
  );
}

function ColorField({ label, value, onChange }) {
  return (
    <div>
      <label className="label">{label}</label>
      <div className="flex items-center gap-2">
        <input type="color" value={value} onChange={(e) => onChange(e.target.value)} className="w-10 h-10 rounded cursor-pointer" />
        <input value={value} onChange={(e) => onChange(e.target.value)} className="input" />
      </div>
    </div>
  );
}

function SettingItem({ settingKey, label, defaultValue, valueType, existing }) {
  const qc = useQueryClient();
  const [value, setValue] = useState(existing?.value ?? defaultValue);
  const [saving, setSaving] = useState(false);

  // Update local state when existing loads
  useEffect(() => {
    if (existing?.value !== undefined) setValue(existing.value);
  }, [existing]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await systemAPI.updateSetting(settingKey, {
        value: String(value),
        value_type: valueType,
        description: label,
        category: 'general',
        is_editable: true,
      });
      toast.success(`${label} saved.`);
      qc.invalidateQueries({ queryKey: ['system-settings'] });
    } catch (err) {
      toast.error(formatApiError(err));
    } finally {
      setSaving(false);
    }
  };

  const isLongText = valueType === 'string' && (defaultValue?.length || 0) > 60;

  return (
    <div className="flex items-start gap-3">
      <label className="flex-1 text-sm pt-2">{label}</label>
      {isLongText ? (
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="input flex-1"
          rows={3}
        />
      ) : (
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="input !w-32"
        />
      )}
      <button
        onClick={handleSave}
        disabled={saving}
        className="btn-outline !py-1 text-xs disabled:opacity-50"
        title="Save"
      >
        <FiSave /> {saving ? 'Saving...' : 'Save'}
      </button>
    </div>
  );
}
