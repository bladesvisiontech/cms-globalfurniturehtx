'use client';

import { useEffect, useRef, useState } from 'react';

const PREVIEW_URL = process.env.NEXT_PUBLIC_PREVIEW_URL ?? 'http://localhost:5173';

export default function PreviewFrame() {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [loaded, setLoaded] = useState(false);
  const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop');

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (event.data?.type === 'cms-iframe-ready') {
        setLoaded(true);
      }
    }
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  return (
    <div className="flex-1 flex flex-col bg-[#111] overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-surface shrink-0">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
          <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
          <div className="w-3 h-3 rounded-full bg-[#28c840]" />
        </div>
        <div className="flex items-center gap-2 bg-card border border-border rounded px-3 py-1 text-xs text-muted font-mono">
          {PREVIEW_URL}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setDevice('desktop')}
            className={`px-2 py-1 text-xs rounded transition-colors ${device === 'desktop' ? 'bg-accent text-white' : 'text-muted hover:text-text'}`}
          >
            Desktop
          </button>
          <button
            onClick={() => setDevice('mobile')}
            className={`px-2 py-1 text-xs rounded transition-colors ${device === 'mobile' ? 'bg-accent text-white' : 'text-muted hover:text-text'}`}
          >
            Mobile
          </button>
        </div>
      </div>

      {/* Frame area */}
      <div className="flex-1 overflow-auto flex items-start justify-center p-4">
        <div
          className="relative transition-all duration-300 bg-white overflow-hidden rounded shadow-2xl"
          style={device === 'mobile' ? { width: 390, height: 844 } : { width: '100%', height: '100%' }}
        >
          {!loaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-surface z-10">
              <div className="flex flex-col items-center gap-3 text-muted text-sm">
                <div className="w-5 h-5 border-2 border-muted border-t-accent rounded-full animate-spin" />
                Cargando preview...
              </div>
            </div>
          )}
          <iframe
            ref={iframeRef}
            id="cms-preview-frame"
            src={PREVIEW_URL}
            className="w-full h-full border-0"
            onLoad={() => setLoaded(true)}
            title="Site preview"
          />
        </div>
      </div>
    </div>
  );
}
