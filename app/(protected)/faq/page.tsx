'use client';
import { useState, useEffect, useCallback } from 'react';
import PageHeader from '@/components/PageHeader';
import SaveButton from '@/components/SaveButton';
import Toast from '@/components/Toast';

interface FaqItem { id: string; question: string; answer: string; category: string }
interface FaqData { faqs: FaqItem[] }

export default function FaqPage() {
  const [data, setData] = useState<FaqData | null>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    fetch('/api/content?file=faq.json').then(r => r.json()).then((res: { data: FaqData }) => setData(res.data));
  }, []);

  const save = useCallback(async () => {
    if (!data) return;
    setSaving(true);
    const res = await fetch('/api/content', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ file: 'faq.json', content: data, section: 'FAQ' }) });
    const result = await res.json() as { ok?: boolean; error?: string };
    setSaving(false);
    setToast(result.ok ? { message: 'FAQ saved! Publishing now...', type: 'success' } : { message: result.error ?? 'Failed', type: 'error' });
  }, [data]);

  function update(i: number, field: keyof FaqItem, value: string) {
    if (!data) return;
    const updated = [...data.faqs];
    updated[i] = { ...updated[i], [field]: value };
    setData({ ...data, faqs: updated });
  }

  function add() {
    if (!data) return;
    setData({ ...data, faqs: [...data.faqs, { id: `faq-${Date.now()}`, question: '', answer: '', category: 'General' }] });
  }

  function remove(i: number) {
    if (!data || !confirm('Remove this question?')) return;
    setData({ ...data, faqs: data.faqs.filter((_, idx) => idx !== i) });
  }

  if (!data) return <div className="text-muted text-sm">Loading...</div>;

  return (
    <div>
      <div className="flex items-start justify-between mb-8 pb-6 border-b border-border">
        <PageHeader title="FAQ" description="Frequently asked questions" />
        <SaveButton saving={saving} onClick={save} />
      </div>
      <div className="space-y-4">
        <div className="flex justify-end"><button onClick={add} className="text-accent text-sm hover:underline">+ Add question</button></div>
        {data.faqs.map((faq, i) => (
          <section key={faq.id} className="bg-card border border-border rounded-lg p-5">
            <div className="flex justify-between items-center mb-4">
              <span className="text-xs text-muted uppercase tracking-wider">Question {i + 1}</span>
              <button onClick={() => remove(i)} className="text-danger text-xs hover:underline">Remove</button>
            </div>
            <div className="grid grid-cols-4 gap-4 mb-3">
              <div className="col-span-3"><label>Question</label><input value={faq.question} onChange={e => update(i, 'question', e.target.value)} /></div>
              <div><label>Category</label><input value={faq.category} onChange={e => update(i, 'category', e.target.value)} /></div>
            </div>
            <div><label>Answer</label><textarea rows={3} value={faq.answer} onChange={e => update(i, 'answer', e.target.value)} /></div>
          </section>
        ))}
      </div>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
