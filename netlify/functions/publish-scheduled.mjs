// Rebuilds the site once a future dated post has come due. The live
// /scheduled.json holds the next due date, so most runs do nothing.

const site = process.env.URL ?? 'https://mikefallows.com';

export default async () => {
  const hook = process.env.BUILD_HOOK_URL;
  if (!hook) {
    console.warn('BUILD_HOOK_URL is not set');
    return;
  }

  const response = await fetch(new URL('/scheduled.json', site));
  if (!response.ok) {
    console.warn(`Could not read scheduled.json: ${response.status}`);
    return;
  }

  const { next } = await response.json();
  if (next && new Date(next) <= new Date()) {
    await fetch(hook, { method: 'POST' });
    console.log(`Triggered a build for the post due at ${next}`);
  }
};

export const config = {
  schedule: '@hourly',
};
