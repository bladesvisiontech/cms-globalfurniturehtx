'use client';
import { useState, useEffect, useCallback } from 'react';
import PageHeader from '@/components/PageHeader';
import SaveButton from '@/components/SaveButton';
import Toast from '@/components/Toast';

interface SiteData {
  name: string; tagline: string;
  address: string; city: string; state: string; zip: string;
  phone: string; phoneUrl: string; email: string;
  googleMapsUrl: string; hours: string;
  instagram: string; instagramHandle: string;
  deliveryNote: string;
  googleRating: string; googleReviewCount: string; googleReviewsUrl: string;
}

export default function SitePage() {
  const [data, setData] = useState<SiteData | null>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    fetch('/api/content?file=site.json').then(r => r.json()).then((res: { data: SiteData }) => setData(res.data));
  }, []);

  const save = useCallback(async () => {
    if (!data) return;
    setSaving(true);
    const res = await fetch('/api/content', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ file: 'site.json', content: data, section: 'Site Info' }) });
    const result = await res.json() as { ok?: boolean; error?: string };
    setSaving(false);
    setToast(result.ok ? { message: 'Saved! Publishing now...', type: 'success' } : { message: result.error ?? 'Failed', type: 'error' });
  }, [data]);

  if (!data) return <div className="text-muted text-sm">Loading...</div>;

  const f = (field: keyof SiteData, label: string) => (
    <div><label>{label}</label><input value={data[field] as string} onChange={e => setData({ ...data, [field]: e.target.value })} /></div>
  );

  return (
    <div>
      <div className="flex items-start justify-between mb-8 pb-6 border-b border-border">
        <PageHeader title="Site Info" description="Business name, contact details and social links" />
        <SaveButton saving={saving} onClick={save} />
      </div>
      <div className="space-y-6">
        <section className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-sm font-semibold text-text mb-4">Business</h2>
          <div className="space-y-3">
            {f('name', 'Business Name')}
            {f('tagline', 'Tagline')}
            {f('deliveryNote', 'Delivery Note')}
          </div>
        </section>
        <section className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-sm font-semibold text-text mb-4">Address & Hours</h2>
          <div className="grid grid-cols-2 gap-4">
            {f('address', 'Street Address')}
            {f('city', 'City')}
            {f('state', 'State')}
            {f('zip', 'ZIP')}
            <div className="col-span-2">{f('hours', 'Hours')}</div>
            <div className="col-span-2">{f('googleMapsUrl', 'Google Maps URL')}</div>
          </div>
        </section>
        <section className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-sm font-semibold text-text mb-4">Contact</h2>
          <div className="grid grid-cols-2 gap-4">
            {f('phone', 'Phone (display)')}
            {f('phoneUrl', 'Phone URL (tel:+1...)')}
            <div className="col-span-2">{f('email', 'Email')}</div>
          </div>
        </section>
        <section className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-sm font-semibold text-text mb-4">Social & Reviews</h2>
          <div className="grid grid-cols-2 gap-4">
            {f('instagram', 'Instagram URL')}
            {f('instagramHandle', 'Instagram Handle')}
            {f('googleRating', 'Google Rating')}
            {f('googleReviewCount', 'Review Count')}
            <div className="col-span-2">{f('googleReviewsUrl', 'Google Reviews URL')}</div>
          </div>
        </section>
      </div>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
