import crypto from 'crypto';
export function signObject(obj, secret = process.env.SIGNING_SECRET || ''){
  const keys = Object.keys(obj).sort();
  const canonical = JSON.stringify(obj, keys);
  return crypto.createHmac('sha256', secret).update(canonical).digest('hex');
}
