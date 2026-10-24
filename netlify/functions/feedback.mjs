// The feedback button's server side (assets/feedback.js posts here, at
// /.netlify/functions/feedback). It passes the message on to ACASOHQ, the
// studio's monitoring, with this site's key, so the key never reaches a
// browser. /api/* on this site is the admin portal's proxy, so this function
// keeps Netlify's own address.
//
// Site settings → Environment variables:
//   MONITOR_URL   ACASOHQ's address, e.g. https://hq.acasohq.com
//   MONITOR_KEY   this site's key, from its settings page in ACASOHQ
//
// Answers { ok: true }, or { error: 'busy' | 'off' | 'failed' | 'invalid' }.
// ACASOHQ being slow or down only shows the guest a friendly error.
const TYPES = ['problem', 'request', 'question', 'praise'];
const clip = (v, n) => (typeof v === 'string' ? v.trim().slice(0, n) : '');
const answer = (status, body) => Response.json(body, { status, headers: { 'cache-control': 'no-store' } });

export default async (req) => {
  if (req.method !== 'POST') return answer(405, { error: 'invalid' });
  const text = await req.text();
  if (text.length > 20000) return answer(413, { error: 'invalid' });
  let b;
  try { b = JSON.parse(text); } catch { return answer(400, { error: 'invalid' }); }
  if (!b || typeof b !== 'object') return answer(400, { error: 'invalid' });
  // The form's hidden decoy field: bots fill it in, people never see it.
  if (b.website) return answer(200, { ok: true });
  const message = clip(b.message, 5000);
  const email = clip(b.email, 200).toLowerCase();
  if (!message) return answer(400, { error: 'invalid', field: 'message' });
  if (email && !/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(email)) return answer(400, { error: 'invalid', field: 'email' });

  const url = (process.env.MONITOR_URL || '').replace(/\/+$/, '');
  const key = process.env.MONITOR_KEY;
  if (!url || !key) {
    console.error('[feedback] MONITOR_URL and MONITOR_KEY are not set; the message was not sent');
    return answer(503, { error: 'off' });
  }
  try {
    const res = await fetch(`${url}/api/ingest/message`, {
      method: 'POST',
      headers: { authorization: `Bearer ${key}`, 'content-type': 'application/json' },
      body: JSON.stringify({
        name: clip(b.name, 120), email, role: 'Website visitor',
        type: TYPES.includes(b.type) ? b.type : 'question',
        message, page: clip(b.page, 300) || null, attachments: [],
      }),
      signal: AbortSignal.timeout(5000),
    });
    if (res.ok) return answer(200, { ok: true });
    console.error(`[feedback] ACASOHQ answered ${res.status}: ${(await res.text()).slice(0, 200)}`);
    return answer(res.status === 429 ? 429 : 502, { error: res.status === 429 ? 'busy' : 'failed' });
  } catch (e) {
    console.error('[feedback] could not reach ACASOHQ:', e.message);
    return answer(502, { error: 'failed' });
  }
};
