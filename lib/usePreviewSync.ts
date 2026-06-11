'use client';

import { useEffect } from 'react';

type Section = 'menu' | 'pricing' | 'gallery' | 'services' | 'site' | 'home' | 'about';

export function usePreviewSync(section: Section, data: unknown) {
  useEffect(() => {
    const iframe = document.getElementById('cms-preview-frame') as HTMLIFrameElement | null;
    if (!iframe?.contentWindow || !data) return;
    iframe.contentWindow.postMessage({ type: 'cms-preview', section, data }, '*');
  }, [section, data]);
}
