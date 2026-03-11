import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'motion/react';
import { Save, Image as ImageIcon, Star, Check, X, Upload, Loader2 } from 'lucide-react';
import { Product } from '../../types';
import toast from 'react-hot-toast';

const ImageInput = ({ 
  label, 
  settingKey, 
  settings, 
  handleSettingChange, 
  fileInputRefs, 
  uploadingKey, 
  handleFileUpload 
}: { 
  label: string, 
  settingKey: string,
  settings: Record<string, string>,
  handleSettingChange: (key: string, value: string) => void,
  fileInputRefs: React.MutableRefObject<Record<string, HTMLInputElement | null>>,
  uploadingKey: string | null,
  handleFileUpload: (key: string, file: File) => void
}) => (
  <div className="space-y-2">
    <label className="block text-xs font-bold uppercase tracking-widest text-neutral-500">{label}</label>
    <div className="flex gap-4">
      <div className="flex-1 relative">
        <input 
          type="text" 
          className="input-field pr-10"
          value={settings[settingKey] || ''}
          onChange={(e) => handleSettingChange(settingKey, e.target.value)}
          placeholder="Image URL or upload..."
        />
        <button 
          onClick={() => fileInputRefs.current[settingKey]?.click()}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-neutral-400 hover:text-black transition-colors"
          title="Upload from device"
        >
          {uploadingKey === settingKey ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
        </button>
        <input 
          type="file" 
          className="hidden" 
          accept="image/*"
          ref={el => fileInputRefs.current[settingKey] = el}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFileUpload(settingKey, file);
          }}
        />
      </div>
      {settings[settingKey] && (
        <div className="w-12 h-12 rounded-lg overflow-hidden border border-black/5 flex-shrink-0">
          <img src={settings[settingKey]} alt="Preview" className="w-full h-full object-cover" />
        </div>
      )}
    </div>
  </div>
);

export const Settings = () => {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => setSettings(data));
  }, []);

  const handleSettingChange = (key: string, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleFileUpload = async (key: string, file: File) => {
    setUploadingKey(key);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        handleSettingChange(key, data.url);
        toast.success('Image uploaded successfully');
      } else {
        throw new Error(data.error || 'Upload failed');
      }
    } catch (e) {
      toast.error('Error uploading image');
    } finally {
      setUploadingKey(null);
    }
  };

  const saveSettings = async () => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.indexOf("application/json") !== -1) {
        const data = await res.json();
        if (res.ok) {
          toast.success('Homepage settings saved successfully!');
        } else {
          throw new Error(data.error || 'Failed to save settings');
        }
      } else {
        const text = await res.text();
        console.error("Non-JSON response:", text);
        throw new Error(`Server returned an unexpected response (Status: ${res.status})`);
      }
    } catch (e: any) {
      toast.error(e.message || 'Error saving settings');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-10 pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl md:text-3xl font-display font-bold uppercase italic">Homepage Management</h1>
        <button 
          onClick={saveSettings}
          disabled={isSaving}
          className="btn-primary flex items-center gap-2 w-full sm:w-auto justify-center"
        >
          <Save size={18} /> {isSaving ? 'Saving...' : 'Save All Changes'}
        </button>
      </div>

      <div className="max-w-3xl mx-auto">
        {/* Image Settings */}
        <div className="space-y-6">
          <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-black/5">
            <h2 className="text-xl font-display font-bold uppercase italic mb-6 flex items-center gap-2">
              <ImageIcon size={20} /> General Settings
            </h2>
            
            <div className="space-y-6">
              <ImageInput label="Main Header Image" settingKey="hero_image" settings={settings} handleSettingChange={handleSettingChange} fileInputRefs={fileInputRefs} uploadingKey={uploadingKey} handleFileUpload={handleFileUpload} />
              
              <div className="space-y-2 pt-4 border-t border-black/10">
                <label className="block text-xs font-bold uppercase tracking-widest text-neutral-500">Delivery Cost</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 font-mono">$</span>
                  <input 
                    type="number" 
                    className="input-field w-full pl-8"
                    value={settings['delivery_cost'] || '0'}
                    onChange={(e) => handleSettingChange('delivery_cost', e.target.value)}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                  />
                </div>
                <p className="text-[10px] text-neutral-400 font-mono">This cost will be added to all orders during checkout.</p>
              </div>

              <div className="space-y-2 pt-4 border-t border-black/10">
                <label className="block text-xs font-bold uppercase tracking-widest text-neutral-500">Scrolling Notification Text (Marquee)</label>
                <input 
                  type="text" 
                  className="input-field w-full"
                  value={settings['marquee_text'] || ''}
                  onChange={(e) => handleSettingChange('marquee_text', e.target.value)}
                  placeholder="e.g. FREE SHIPPING ON ALL ORDERS OVER $100 • NEW ARRIVALS THIS WEEK"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
