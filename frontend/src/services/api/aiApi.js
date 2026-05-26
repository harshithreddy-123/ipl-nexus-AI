import fetcher from './fetcher';
import MOCK from '../mock/mockData';

const BASE = import.meta.env.VITE_API_URL || '';
const KEY = import.meta.env.VITE_GROQ_API_KEY || import.meta.env.VITE_AI_API_KEY || '';

function buildUrl(path) {
  return `${BASE}${path}`;
}

export async function sendChat(message) {
  if (!BASE) return MOCK.chatReply(message);
  return fetcher(buildUrl('/api/chat'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: KEY ? `Bearer ${KEY}` : '' },
    body: JSON.stringify({ message }),
  });
}

export default { sendChat };
