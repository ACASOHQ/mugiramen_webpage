// The admin API on Netlify. Same routes as the local server (tools/api.mjs);
// publishing commits to GitHub, which triggers Netlify's next deploy.
//
// Site settings → Environment variables:
//   ADMIN_PASSWORD   required: the sign-in password
//   GITHUB_TOKEN     fine-grained token, "Contents: read and write" on this repo
//   GITHUB_REPO      owner/name, e.g. vicngan/mugiramen_webpage
//   GITHUB_BRANCH    optional, defaults to main (the branch Netlify deploys)
//   SESSION_SECRET   optional, any long random string
//   UMAMI_API_KEY, UMAMI_WEBSITE_ID   optional, real visitor numbers
import { handleApi, makeBackend } from '../../tools/api.mjs';

export const config = { path: '/api/*' };

export default async (req) => {
  const env = { ...process.env, NETLIFY: process.env.NETLIFY || 'true' };
  const url = new URL(req.url);
  let body = {};
  if (req.method === 'POST') {
    try { body = await req.json(); } catch { return Response.json({ error: 'invalid JSON' }, { status: 400 }); }
  }
  try {
    const [status, json] = await handleApi(
      { method: req.method, path: url.pathname, query: Object.fromEntries(url.searchParams), body, auth: req.headers.get('authorization') || '' },
      { backend: makeBackend(env), env },
    );
    return Response.json(json, { status, headers: { 'cache-control': 'no-store' } });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
};
