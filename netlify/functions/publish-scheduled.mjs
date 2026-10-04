// Rebuilds the site once a future dated post has come due. The live
// /scheduled.json holds the next due date, so most runs do nothing.

const site = process.env.URL ?? 'https://mikefallows.com';

// A failed build leaves scheduled.json unchanged, so without a limit every
// hourly run would start another one. Two hourly runs fall inside this
// window, so a post gets one attempt and one retry.
const RETRY_WINDOW_MS = 2 * 60 * 60 * 1000;

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
  const overdue = next ? Date.now() - new Date(next).valueOf() : -1;
  if (overdue >= 0 && overdue < RETRY_WINDOW_MS) {
    await fetch(hook, { method: 'POST' });
    console.log(`Triggered a build for the post due at ${next}`);
  }
};

export const config = {
  schedule: '@hourly',
};
