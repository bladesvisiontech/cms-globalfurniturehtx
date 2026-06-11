import { NextRequest, NextResponse } from 'next/server';
import { readFile, writeFile } from '@/lib/github';
import { getSession } from '@/lib/auth';
import type { ContentFile } from '@/types';
import fs from 'fs';
import path from 'path';

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const file = request.nextUrl.searchParams.get('file') as ContentFile | null;
  if (!file) return NextResponse.json({ error: 'Missing file param' }, { status: 400 });

  try {
    const data = await readFile(file);
    return NextResponse.json({ ok: true, data });
  } catch {
    // In development, fall back to the local KKD data files for preview
    if (process.env.NODE_ENV === 'development') {
      const localPath = path.join(
        process.cwd(),
        '../kkd avenue/src/data',
        file
      );
      if (fs.existsSync(localPath)) {
        const raw = fs.readFileSync(localPath, 'utf-8');
        return NextResponse.json({ ok: true, data: JSON.parse(raw) });
      }
    }
    return NextResponse.json({ error: 'Failed to read file' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { file, content, section } = await request.json() as {
    file: ContentFile;
    content: unknown;
    section: string;
  };

  if (!file || !content || !section) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  try {
    await writeFile(file, content, section);
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to save file';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
