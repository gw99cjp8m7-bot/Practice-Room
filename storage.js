// Cloudflare Pages Function — handles GET/POST for /api/storage
// Backed by a Cloudflare KV namespace bound as "PRACTICE_KV"
// (set this up in your Pages project: Settings > Bindings > Add > KV namespace).
//
// GET  /api/storage?key=roster:abc123        -> { value: "...json string..." }
// POST /api/storage  { key, value }          -> { ok: true }
//
// Every response explicitly disables caching. Without this, a GET request
// can get cached by the browser or an intermediate cache, which would make
// freshly-saved data (like a newly created class) invisible on the next
// load even though it saved correctly.

const NO_CACHE_HEADERS = {
  'Content-Type': 'application/json',
  'Cache-Control': 'no-store, no-cache, must-revalidate',
  'Pragma': 'no-cache'
};

export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const key = url.searchParams.get('key');

  if (!key) {
    return new Response(JSON.stringify({ error: 'missing key' }), {
      status: 400,
      headers: NO_CACHE_HEADERS
    });
  }
  if (!env.PRACTICE_KV) {
    return new Response(JSON.stringify({ error: 'PRACTICE_KV binding not configured' }), {
      status: 500,
      headers: NO_CACHE_HEADERS
    });
  }

  const value = await env.PRACTICE_KV.get(key);
  if (value === null) {
    return new Response(JSON.stringify({ error: 'not found' }), {
      status: 404,
      headers: NO_CACHE_HEADERS
    });
  }
  return new Response(JSON.stringify({ value }), {
    headers: NO_CACHE_HEADERS
  });
}

export async function onRequestPost(context) {
  const { request, env } = context;

  if (!env.PRACTICE_KV) {
    return new Response(JSON.stringify({ error: 'PRACTICE_KV binding not configured' }), {
      status: 500,
      headers: NO_CACHE_HEADERS
    });
  }

  let body;
  try {
    body = await request.json();
  } catch (e) {
    return new Response(JSON.stringify({ error: 'invalid JSON body' }), {
      status: 400,
      headers: NO_CACHE_HEADERS
    });
  }

  const { key, value } = body || {};
  if (!key || typeof value !== 'string') {
    return new Response(JSON.stringify({ error: 'missing key or value' }), {
      status: 400,
      headers: NO_CACHE_HEADERS
    });
  }

  await env.PRACTICE_KV.put(key, value);
  return new Response(JSON.stringify({ ok: true }), {
    headers: NO_CACHE_HEADERS
  });
}
