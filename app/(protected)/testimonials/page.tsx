'use client';
import { useState, useEffect, useCallback } from 'react';
import PageHeader from '@/components/PageHeader';
import SaveButton from '@/components/SaveButton';
import Toast from '@/components/Toast';

interface Testimonial { id: string; name: string; location: string; text: string; rating: number; date: string }
interface TestimonialsData { testimonials: Testimonial[] }

export default function TestimonialsPage() {
  const [data, setData] = useState<TestimonialsData | null>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    fetch('/api/content?file=testimonials.json').then(r => r.json()).then((res: { data: TestimonialsData }) => setData(res.data));
  }, []);

  const save = useCallback(async () => {
    if (!data) return;
    setSaving(true);
    const res = await fetch('/api/content', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ file: 'testimonials.json', content: data, section: 'Testimonials' }) });
    const result = await res.json() as { ok?: boolean; error?: string };
    setSaving(false);
    setToast(result.ok ? { message: 'Testimonials saved! Publishing now...', type: 'success' } : { message: result.error ?? 'Failed', type: 'error' });
  }, [data]);

  function update(i: number, field: keyof Testimonial, value: string | number) {
    if (!data) return;
    const updated = [...data.testimonials];
    updated[i] = { ...updated[i], [field]: value };
    setData({ ...data, testimonials: updated });
  }

  function add() {
    if (!data) return;
    const id = `t-${Date.now()}`;
    setData({ ...data, testimonials: [...data.testimonials, { id, name: '', location: '', text: '', rating: 5, date: new Date().toISOString().split('T')[0] }] });
  }

  function remove(i: number) {
    if (!data || !confirm('Remove this review?')) return;
    setData({ ...data, testimonials: data.testimonials.filter((_, idx) => idx !== i) });
  }

  if (!data) return <div className="text-muted text-sm">Loading...</div>;

  return (
    <div>
      <div className="flex items-start justify-between mb-8 pb-6 border-b border-border">
        <PageHeader title="Testimonials" description="Customer reviews shown on the site" />
        <SaveButton saving={saving} onClick={save} />
      </div>
      <div className="space-y-4">
        <div className="flex justify-end"><button onClick={add} className="text-accent text-sm hover:underline">+ Add review</button></div>
        {data.testimonials.map((t, i) => (
          <section key={t.id} className="bg-card border border-border rounded-lg p-5">
            <div className="flex justify-between items-center mb-4">
              <span className="text-xs text-muted uppercase tracking-wider">Review {i + 1}</span>
              <button onClick={() => remove(i)} className="text-danger text-xs hover:underline">Remove</button>
            </div>
            <div className="grid grid-cols-3 gap-4 mb-3">
              <div><label>Name</label><input value={t.name} onChange={e => update(i, 'name', e.target.value)} /></div>
              <div><label>Location</label><input value={t.location} onChange={e => update(i, 'location', e.target.value)} /></div>
              <div><label>Rating (1–5)</label><input type="number" min="1" max="5" value={t.rating} onChange={e => update(i, 'rating', Number(e.target.value))} /></div>
            </div>
            <div><label>Review Text</label><textarea rows={3} value={t.text} onChange={e => update(i, 'text', e.target.value)} /></div>
          </section>
        ))}
      </div>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
