'use client';
import { useState, useEffect, useCallback } from 'react';
import PageHeader from '@/components/PageHeader';
import SaveButton from '@/components/SaveButton';
import Toast from '@/components/Toast';

interface BlogPost { id: string; title: string; slug: string; excerpt: string; content: string }
interface BlogData { posts: BlogPost[] }

export default function BlogPage() {
  const [data, setData] = useState<BlogData | null>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [open, setOpen] = useState<number | null>(null);

  useEffect(() => {
    fetch('/api/content?file=blog.json').then(r => r.json()).then((res: { data: BlogData }) => setData(res.data));
  }, []);

  const save = useCallback(async () => {
    if (!data) return;
    setSaving(true);
    const res = await fetch('/api/content', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ file: 'blog.json', content: data, section: 'Blog' }) });
    const result = await res.json() as { ok?: boolean; error?: string };
    setSaving(false);
    setToast(result.ok ? { message: 'Blog saved! Publishing now...', type: 'success' } : { message: result.error ?? 'Failed', type: 'error' });
  }, [data]);

  function update(i: number, field: keyof BlogPost, value: string) {
    if (!data) return;
    const updated = [...data.posts];
    updated[i] = { ...updated[i], [field]: value };
    setData({ ...data, posts: updated });
  }

  function add() {
    if (!data) return;
    setData({ ...data, posts: [...data.posts, { id: `post-${Date.now()}`, title: '', slug: '', excerpt: '', content: '' }] });
  }

  function remove(i: number) {
    if (!data || !confirm('Remove this post?')) return;
    setData({ ...data, posts: data.posts.filter((_, idx) => idx !== i) });
  }

  if (!data) return <div className="text-muted text-sm">Loading...</div>;

  return (
    <div>
      <div className="flex items-start justify-between mb-8 pb-6 border-b border-border">
        <PageHeader title="Blog" description="Blog posts and articles" />
        <SaveButton saving={saving} onClick={save} />
      </div>
      <div className="space-y-3">
        <div className="flex justify-end"><button onClick={add} className="text-accent text-sm hover:underline">+ Add post</button></div>
        {data.posts.map((post, i) => (
          <div key={post.id} className="bg-card border border-border rounded-lg overflow-hidden">
            <button onClick={() => setOpen(open === i ? null : i)} className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-border/30 transition-colors">
              <span className="text-sm font-medium text-text">{post.title || 'Untitled post'}</span>
              <div className="flex items-center gap-3">
                <button onClick={e => { e.stopPropagation(); remove(i); }} className="text-danger text-xs hover:underline">Remove</button>
                <span className="text-muted text-sm">{open === i ? '▲' : '▼'}</span>
              </div>
            </button>
            {open === i && (
              <div className="px-5 pb-5 border-t border-border space-y-3 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div><label>Title</label><input value={post.title} onChange={e => update(i, 'title', e.target.value)} /></div>
                  <div><label>Slug (URL)</label><input value={post.slug} onChange={e => update(i, 'slug', e.target.value)} /></div>
                </div>
                <div><label>Excerpt</label><textarea rows={2} value={post.excerpt} onChange={e => update(i, 'excerpt', e.target.value)} /></div>
                <div><label>Content</label><textarea rows={8} value={post.content} onChange={e => update(i, 'content', e.target.value)} /></div>
              </div>
            )}
          </div>
        ))}
      </div>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
