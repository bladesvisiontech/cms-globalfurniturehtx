'use client';
import { useState, useEffect, useCallback } from 'react';
import PageHeader from '@/components/PageHeader';
import SaveButton from '@/components/SaveButton';
import Toast from '@/components/Toast';
import ImagePicker from '@/components/ImagePicker';

interface Banner { id: string; title: string; subtitle: string; imageUrl: string; ctaText: string; ctaLink: string; order: number; active: boolean }
interface BannersData { banners: Banner[] }

const SITE_URL = process.env.NEXT_PUBLIC_PREVIEW_URL ?? '';

export default function BannersPage() {
  const [data, setData] = useState<BannersData | null>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    fetch('/api/content?file=banners.json').then(r => r.json()).then((res: { data: BannersData }) => setData(res.data));
  }, []);

  const save = useCallback(async () => {
    if (!data) return;
    setSaving(true);
    const res = await fetch('/api/content', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ file: 'banners.json', content: data, section: 'Banners' }) });
    const result = await res.json() as { ok?: boolean; error?: string };
    setSaving(false);
    setToast(result.ok ? { message: 'Banners saved! Publishing now...', type: 'success' } : { message: result.error ?? 'Failed', type: 'error' });
  }, [data]);

  function update(i: number, field: keyof Banner, value: string | boolean | number) {
    if (!data) return;
    const updated = [...data.banners];
    updated[i] = { ...updated[i], [field]: value };
    setData({ ...data, banners: updated });
  }

  function add() {
    if (!data) return;
    const newBanner: Banner = {
      id: `banner-${Date.now()}`, title: '', subtitle: '', imageUrl: '',
      ctaText: 'Shop Now', ctaLink: '/shop', order: data.banners.length + 1, active: true
    };
    setData({ ...data, banners: [...data.banners, newBanner] });
  }

  function remove(i: number) {
    if (!data || !confirm('Remove this banner?')) return;
    setData({ ...data, banners: data.banners.filter((_, idx) => idx !== i) });
  }

  if (!data) return <div className="text-muted text-sm">Loading...</div>;

  return (
    <div>
      <div className="flex items-start justify-between mb-8 pb-6 border-b border-border">
        <PageHeader title="Banners" description="Hero slider images and calls to action" />
        <SaveButton saving={saving} onClick={save} />
      </div>
      <div className="space-y-6">
        <div className="flex justify-end">
          <button onClick={add} className="text-accent text-sm hover:underline">+ Add banner</button>
        </div>
        {data.banners.map((b, i) => (
          <section key={b.id} className="bg-card border border-border rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-sm font-semibold text-text">Banner {i + 1}</h2>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-sm text-muted cursor-pointer">
                  <input type="checkbox" checked={b.active} onChange={e => update(i, 'active', e.target.checked)} className="w-4 h-4" />
                  Active
                </label>
                <button onClick={() => remove(i)} className="text-danger text-xs hover:underline">Remove</button>
              </div>
            </div>
            <div className="space-y-3">
              <div><label>Title</label><input value={b.title} onChange={e => update(i, 'title', e.target.value)} /></div>
              <div><label>Subtitle</label><textarea rows={2} value={b.subtitle} onChange={e => update(i, 'subtitle', e.target.value)} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label>CTA Button Text</label><input value={b.ctaText} onChange={e => update(i, 'ctaText', e.target.value)} /></div>
                <div><label>CTA Link</label><input value={b.ctaLink} onChange={e => update(i, 'ctaLink', e.target.value)} /></div>
              </div>
              <ImagePicker label="Banner Image" value={b.imageUrl} onChange={url => update(i, 'imageUrl', url)} siteUrl={SITE_URL} />
            </div>
          </section>
        ))}
      </div>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
