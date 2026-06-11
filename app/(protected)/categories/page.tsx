'use client';
import { useState, useEffect, useCallback } from 'react';
import PageHeader from '@/components/PageHeader';
import SaveButton from '@/components/SaveButton';
import Toast from '@/components/Toast';
import ImagePicker from '@/components/ImagePicker';

interface Category { id: string; name: string; slug: string; description: string; image: string; order: number }
interface CategoriesData { categories: Category[] }

const SITE_URL = process.env.NEXT_PUBLIC_PREVIEW_URL ?? '';

export default function CategoriesPage() {
  const [data, setData] = useState<CategoriesData | null>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    fetch('/api/content?file=categories.json').then(r => r.json()).then((res: { data: CategoriesData }) => setData(res.data));
  }, []);

  const save = useCallback(async () => {
    if (!data) return;
    setSaving(true);
    const res = await fetch('/api/content', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ file: 'categories.json', content: data, section: 'Categories' }) });
    const result = await res.json() as { ok?: boolean; error?: string };
    setSaving(false);
    setToast(result.ok ? { message: 'Categories saved! Publishing now...', type: 'success' } : { message: result.error ?? 'Failed', type: 'error' });
  }, [data]);

  function update(i: number, field: keyof Category, value: string | number) {
    if (!data) return;
    const updated = [...data.categories];
    updated[i] = { ...updated[i], [field]: value };
    setData({ ...data, categories: updated });
  }

  function add() {
    if (!data) return;
    setData({ ...data, categories: [...data.categories, { id: `cat-${Date.now()}`, name: '', slug: '', description: '', image: '', order: data.categories.length + 1 }] });
  }

  function remove(i: number) {
    if (!data || !confirm('Remove this category?')) return;
    setData({ ...data, categories: data.categories.filter((_, idx) => idx !== i) });
  }

  if (!data) return <div className="text-muted text-sm">Loading...</div>;

  return (
    <div>
      <div className="flex items-start justify-between mb-8 pb-6 border-b border-border">
        <PageHeader title="Categories" description="Product categories shown on the homepage" />
        <SaveButton saving={saving} onClick={save} />
      </div>
      <div className="space-y-4">
        <div className="flex justify-end">
          <button onClick={add} className="text-accent text-sm hover:underline">+ Add category</button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {data.categories.map((cat, i) => (
            <section key={cat.id} className="bg-card border border-border rounded-lg p-5">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs text-muted uppercase tracking-wider">Category {i + 1}</span>
                <button onClick={() => remove(i)} className="text-danger text-xs hover:underline">Remove</button>
              </div>
              <ImagePicker label="Category Image" value={cat.image} onChange={url => update(i, 'image', url)} siteUrl={SITE_URL} />
              <div className="mt-3 space-y-2">
                <div><label>Name</label><input value={cat.name} onChange={e => update(i, 'name', e.target.value)} /></div>
                <div><label>Slug (URL)</label><input value={cat.slug} onChange={e => update(i, 'slug', e.target.value)} /></div>
                <div><label>Description</label><textarea rows={2} value={cat.description} onChange={e => update(i, 'description', e.target.value)} /></div>
              </div>
            </section>
          ))}
        </div>
      </div>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
