import { POST as contact } from './contact';
import { POST as partner } from './partner';

const ROUTES = { '/api/contact': contact, '/api/partner': partner };
const NOT_ALLOWED = { status: 405, headers: { Allow: 'POST' } };

const worker = {
  fetch(request, env, ctx) {
    const handler = ROUTES[new URL(request.url).pathname];
    if (!handler) return env.ASSETS.fetch(request);
    return request.method === 'POST' ? handler(request, ctx) : new Response(null, NOT_ALLOWED);
  },
};

export default worker;
