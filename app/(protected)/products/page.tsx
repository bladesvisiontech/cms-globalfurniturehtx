'use client';
import { useState, useEffect, useCallback } from 'react';
import PageHeader from '@/components/PageHeader';
import SaveButton from '@/components/SaveButton';
import Toast from '@/components/Toast';
import ImagePicker from '@/components/ImagePicker';

interface Product {
  id: string; name: string; slug: string; category: string;
  price: number; salePrice: number | null; description: string;
  images: string[]; colors: string[]; dimensions: string;
  inStock: boolean; featured: boolean; tags: string[];
}
interface ProductsData { products: Product[] }

const SITE_URL = process.env.NEXT_PUBLIC_PREVIEW_URL ?? '';

const emptyProduct = (): Product => ({
  id: `prod-${Date.now()}`, name: '', slug: '', category: '',
  price: 0, salePrice: null, description: '', images: [''],
  colors: [], dimensions: '', inStock: true, featured: false, tags: []
});

export default function ProductsPage() {
  const [data, setData] = useState<ProductsData | null>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [open, setOpen] = useState<number | null>(null);

  useEffect(() => {
    fetch('/api/content?file=products.json').then(r => r.json()).then((res: { data: ProductsData }) => setData(res.data));
  }, []);

  const save = useCallback(async () => {
    if (!data) return;
    setSaving(true);
    const res = await fetch('/api/content', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ file: 'products.json', content: data, section: 'Products' }) });
    const result = await res.json() as { ok?: boolean; error?: string };
    setSaving(false);
    setToast(result.ok ? { message: 'Products saved! Publishing now...', type: 'success' } : { message: result.error ?? 'Failed', type: 'error' });
  }, [data]);

  function update(i: number, field: keyof Product, value: unknown) {
    if (!data) return;
    const updated = [...data.products];
    updated[i] = { ...updated[i], [field]: value };
    setData({ ...data, products: updated });
  }

  function add() {
    if (!data) return;
    const p = emptyProduct();
    setData({ ...data, products: [...data.products, p] });
    setOpen(data.products.length);
  }

  function remove(i: number) {
    if (!data || !confirm('Remove this product?')) return;
    setData({ ...data, products: data.products.filter((_, idx) => idx !== i) });
    setOpen(null);
  }

  function addImage(i: number) {
    if (!data) return;
    const imgs = [...data.products[i].images, ''];
    update(i, 'images', imgs);
  }

  function removeImage(i: number, ii: number) {
    if (!data) return;
    const imgs = data.products[i].images.filter((_, idx) => idx !== ii);
    update(i, 'images', imgs);
  }

  if (!data) return <div className="text-muted text-sm">Loading...</div>;

  return (
    <div>
      <div className="flex items-start justify-between mb-8 pb-6 border-b border-border">
        <PageHeader title="Products" description={`${data.products.length} products — click to expand and edit`} />
        <SaveButton saving={saving} onClick={save} />
      </div>
      <div className="space-y-3">
        <div className="flex justify-end">
          <button onClick={add} className="text-accent text-sm hover:underline">+ Add product</button>
        </div>
        {data.products.map((p, i) => (
          <div key={p.id} className="bg-card border border-border rounded-lg overflow-hidden">
            <button onClick={() => setOpen(open === i ? null : i)} className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-border/30 transition-colors">
              <div className="flex items-center gap-3">
                {p.images[0] && <img src={`${SITE_URL}${p.images[0]}`} alt={p.name} className="w-10 h-10 object-cover rounded" onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />}
                <div>
                  <div className="text-sm font-medium text-text">{p.name || 'New product'}</div>
                  <div className="text-xs text-muted">{p.category}{p.price ? ` · $${p.price}` : ''}{p.salePrice ? ` → $${p.salePrice}` : ''}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-xs px-2 py-0.5 rounded-full ${p.inStock ? 'bg-green-500/10 text-green-400' : 'bg-danger/10 text-danger'}`}>{p.inStock ? 'In Stock' : 'Out of Stock'}</span>
                <span className="text-muted text-sm">{open === i ? '▲' : '▼'}</span>
              </div>
            </button>
            {open === i && (
              <div className="px-5 pb-5 border-t border-border space-y-4 pt-4">
                <div className="flex justify-end">
                  <button onClick={() => remove(i)} className="text-danger text-xs hover:underline">Remove product</button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label>Name</label><input value={p.name} onChange={e => update(i, 'name', e.target.value)} /></div>
                  <div><label>Slug (URL)</label><input value={p.slug} onChange={e => update(i, 'slug', e.target.value)} /></div>
                  <div><label>Category</label><input value={p.category} onChange={e => update(i, 'category', e.target.value)} /></div>
                  <div><label>Price ($)</label><input type="number" value={p.price} onChange={e => update(i, 'price', Number(e.target.value))} /></div>
                  <div><label>Sale Price ($ — leave empty if none)</label><input type="number" value={p.salePrice ?? ''} onChange={e => update(i, 'salePrice', e.target.value ? Number(e.target.value) : null)} /></div>
                  <div><label>Dimensions / Weight</label><input value={p.dimensions} onChange={e => update(i, 'dimensions', e.target.value)} /></div>
                  <div><label>Colors (comma separated)</label><input value={p.colors.join(', ')} onChange={e => update(i, 'colors', e.target.value.split(',').map(c => c.trim()).filter(Boolean))} /></div>
                  <div><label>Tags (comma separated)</label><input value={p.tags.join(', ')} onChange={e => update(i, 'tags', e.target.value.split(',').map(t => t.trim()).filter(Boolean))} /></div>
                </div>
                <div><label>Description</label><textarea rows={4} value={p.description} onChange={e => update(i, 'description', e.target.value)} /></div>
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 text-sm text-muted cursor-pointer">
                    <input type="checkbox" checked={p.inStock} onChange={e => update(i, 'inStock', e.target.checked)} className="w-4 h-4" /> In Stock
                  </label>
                  <label className="flex items-center gap-2 text-sm text-muted cursor-pointer">
                    <input type="checkbox" checked={p.featured} onChange={e => update(i, 'featured', e.target.checked)} className="w-4 h-4" /> Featured
                  </label>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs text-muted">Product Images</label>
                    <button onClick={() => addImage(i)} className="text-accent text-xs hover:underline">+ Add image</button>
                  </div>
                  <div className="space-y-2">
                    {p.images.map((img, ii) => (
                      <div key={ii} className="flex items-start gap-2">
                        <div className="flex-1">
                          <ImagePicker label={`Image ${ii + 1}`} value={img} onChange={url => {
                            const imgs = [...p.images]; imgs[ii] = url; update(i, 'images', imgs);
                          }} siteUrl={SITE_URL} />
                        </div>
                        {p.images.length > 1 && (
                          <button onClick={() => removeImage(i, ii)} className="text-danger text-xs hover:underline mt-8 shrink-0">✕</button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
