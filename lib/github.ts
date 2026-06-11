import { Octokit } from '@octokit/rest';

function client(): Octokit {
  return new Octokit({ auth: process.env.GITHUB_TOKEN });
}

const owner = () => process.env.GITHUB_OWNER!;
const repo = () => process.env.GITHUB_REPO!;
const branch = () => process.env.GITHUB_BRANCH ?? 'main';
const basePath = () => process.env.CONTENT_BASE_PATH ?? 'src/data';

export async function readFile(filename: string): Promise<unknown> {
  const octokit = client();
  const path = `${basePath()}/${filename}`;

  const { data } = await octokit.repos.getContent({
    owner: owner(),
    repo: repo(),
    path,
    ref: branch(),
  });

  if (Array.isArray(data) || data.type !== 'file') {
    throw new Error(`${path} is not a file`);
  }

  const content = Buffer.from(data.content, 'base64').toString('utf-8');
  return JSON.parse(content);
}

export async function writeFile(
  filename: string,
  content: unknown,
  section: string
): Promise<void> {
  const octokit = client();
  const path = `${basePath()}/${filename}`;

  let sha: string | undefined;
  try {
    const { data } = await octokit.repos.getContent({
      owner: owner(),
      repo: repo(),
      path,
      ref: branch(),
    });
    if (!Array.isArray(data) && data.type === 'file') {
      sha = data.sha;
    }
  } catch {
    // File does not exist yet — will be created
  }

  const date = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  await octokit.repos.createOrUpdateFileContents({
    owner: owner(),
    repo: repo(),
    path,
    message: `CMS: Updated ${section} — ${date}`,
    content: Buffer.from(JSON.stringify(content, null, 2)).toString('base64'),
    sha,
    branch: branch(),
  });
}

export async function uploadImage(
  filename: string,
  base64Data: string
): Promise<string> {
  const octokit = client();
  const path = `public/${filename}`;

  let sha: string | undefined;
  try {
    const { data } = await octokit.repos.getContent({
      owner: owner(),
      repo: repo(),
      path,
      ref: branch(),
    });
    if (!Array.isArray(data) && data.type === 'file') {
      sha = data.sha;
    }
  } catch {
    // New file
  }

  const date = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  await octokit.repos.createOrUpdateFileContents({
    owner: owner(),
    repo: repo(),
    path,
    message: `CMS: Uploaded image ${filename} — ${date}`,
    content: base64Data,
    sha,
    branch: branch(),
  });

  return `/${filename}`;
}
