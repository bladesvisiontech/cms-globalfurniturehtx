'use client';
import { useRef, useState } from 'react';

interface Props {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  siteUrl?: string;
}

export default function ImagePicker({ value, onChange, label, siteUrl }: Props) {
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const base = siteUrl ?? (process.env.NEXT_PUBLIC_PREVIEW_URL ?? '');
  function resolveUrl(v: string) {
    if (!v) return '';
    if (v.startsWith('http')) return v;
    return `${base}/${v.replace(/^\//, '')}`;
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const form = new FormData();
    form.append('file', file);
    const res = await fetch('/api/upload', { method: 'POST', body: form });
    const result = await res.json() as { ok?: boolean; url?: string; error?: string };
    setUploading(false);
    if (result.ok && result.url) onChange(result.url);
    if (fileRef.current) fileRef.current.value = '';
  }

  return (
    <div>
      {label && <label>{label}</label>}
      <div className="flex items-center gap-3 mt-1.5">
        {value && (
          <img src={resolveUrl(value)} alt="" className="w-16 h-16 object-cover rounded border border-border shrink-0"
            onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
        )}
        <div className="flex-1">
          <input value={value} onChange={e => onChange(e.target.value)} placeholder="/images/photo.jpg" className="mb-2" />
          <label className="inline-flex items-center gap-2 text-xs bg-card border border-border px-3 py-1.5 rounded cursor-pointer hover:border-accent/50 transition-colors">
            {uploading ? <><span className="w-3 h-3 border-2 border-muted border-t-text rounded-full animate-spin" /> Uploading...</> : <>↑ Upload new image</>}
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} disabled={uploading} />
          </label>
        </div>
      </div>
    </div>
  );
}
