import { afterEach, beforeEach, test } from 'node:test';
import assert from 'node:assert/strict';
import publishScheduled from '../netlify/functions/publish-scheduled.mjs';

const hook = 'https://api.netlify.com/build_hooks/test';
const realFetch = globalThis.fetch;
let calls;

function stubSchedule(next) {
  calls = [];
  globalThis.fetch = async (url, options) => {
    calls.push({ url: String(url), method: options?.method ?? 'GET' });
    return new Response(JSON.stringify({ next }));
  };
}

const hookCalls = () => calls.filter((call) => call.url === hook && call.method === 'POST');

beforeEach(() => {
  process.env.BUILD_HOOK_URL = hook;
});

afterEach(() => {
  globalThis.fetch = realFetch;
  delete process.env.BUILD_HOOK_URL;
});

test('triggers a build when the next post is due', async () => {
  stubSchedule(new Date(Date.now() - 60_000).toISOString());
  await publishScheduled();
  assert.equal(hookCalls().length, 1);
});

test('does nothing when the next post is still in the future', async () => {
  stubSchedule(new Date(Date.now() + 60_000).toISOString());
  await publishScheduled();
  assert.equal(hookCalls().length, 0);
});

test('retries once, an hour after the first attempt', async () => {
  stubSchedule(new Date(Date.now() - 60 * 60 * 1000 - 60_000).toISOString());
  await publishScheduled();
  assert.equal(hookCalls().length, 1);
});

test('stops retrying once a post has been due for two hours', async () => {
  stubSchedule(new Date(Date.now() - 2 * 60 * 60 * 1000 - 60_000).toISOString());
  await publishScheduled();
  assert.equal(hookCalls().length, 0);
});

test('does nothing when nothing is scheduled', async () => {
  stubSchedule(null);
  await publishScheduled();
  assert.equal(hookCalls().length, 0);
});

test('does nothing without a build hook', async () => {
  delete process.env.BUILD_HOOK_URL;
  stubSchedule(new Date(Date.now() - 60_000).toISOString());
  await publishScheduled();
  assert.equal(calls.length, 0);
});
