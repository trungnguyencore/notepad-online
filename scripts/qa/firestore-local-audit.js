// In-memory Firestore double. This does not validate deployed Firebase rules.
// LOCAL AUDIT ONLY. Same app components, no Firebase connection.
const STORAGE = 'notepad-local-audit-v1';
const encode = () => JSON.stringify({ nextId, entries: [...records] }, (_key, value) => value?.toDate ? { __auditDate: value.toDate().toISOString() } : value);
const decode = text => JSON.parse(text, (_key, value) => value?.__auditDate ? { toDate: () => new Date(value.__auditDate) } : value);
const saved = localStorage.getItem(STORAGE);
const restored = saved ? decode(saved) : null;
const records = new Map(restored?.entries || []);
const listeners = new Set();
let nextId = restored?.nextId || 1;
const stamp = () => { const time = new Date(); return { toDate: () => time }; };
export const serverTimestamp = stamp;
export const getFirestore = () => ({});
export const collection = (_db, ...parts) => ({ path: parts.join('/') });
export const doc = (_db, ...parts) => ({ path: parts.join('/') });
export const orderBy = (...args) => ({ order: args });
export const where = (field, op, value) => ({ field, op, value });
export const query = (ref, ...constraints) => ({ ...ref, constraints });
function snapshot(ref) {
  const data = records.get(ref.path);
  return { ref, id: ref.path.split('/').at(-1), exists: () => !!data, data: () => data && {...data} };
}
function read(ref) {
  const docs = [...records.keys()].filter(p => p.startsWith(ref.path + '/') && !p.slice(ref.path.length + 1).includes('/'))
    .map(path => snapshot({path})).filter(d => (ref.constraints || []).every(c => !c.field || d.data()[c.field] === c.value));
  for (const constraint of ref.constraints || []) {
    if (!constraint.order) continue;
    const [field, direction = 'asc'] = constraint.order;
    docs.sort((a, b) => {
      const value = item => item.data()[field]?.toDate?.().getTime() ?? item.data()[field];
      const left = value(a), right = value(b);
      return (left < right ? -1 : left > right ? 1 : 0) * (direction === 'desc' ? -1 : 1);
    });
  }
  return { docs, size: docs.length, empty: !docs.length };
}
function emit() {
  try { localStorage.setItem(STORAGE, encode()); } catch { /* localStorage quota full for large images; keep in-memory store active */ }
  for (const l of listeners) l.fn(read(l.ref));
}
async function maybeSimulateImageIo(path) {
  if (!path.includes('/images')) return;
  const delay = Number(window.firestoreQA?.imageDelayMs || 0);
  if (delay > 0) await new Promise(resolve => setTimeout(resolve, delay));
  if (window.firestoreQA?.failImages) throw Error('simulated image network failure');
}
export async function getDoc(ref) {
  await maybeSimulateImageIo(ref.path);
  return snapshot(ref);
}
export function onSnapshot(ref, fn) { const l = {ref, fn}; listeners.add(l); fn(read(ref)); return () => listeners.delete(l); }
export async function addDoc(ref, data) {
  await maybeSimulateImageIo(ref.path);
  const result = {path: `${ref.path}/qa${nextId++}`}; records.set(result.path, {...data}); emit(); return {...result, id: result.path.split('/').at(-1)};
}
export async function updateDoc(ref, data) { if (!records.has(ref.path)) throw Error('missing document'); records.set(ref.path, {...records.get(ref.path), ...data}); emit(); }
export async function deleteDoc(ref) { records.delete(ref.path); emit(); }
export async function getDocsFromServer(ref) {
  const result = read(ref);
  // Optional concurrent writer, invoked after the query snapshot was captured.
  const hook = window.firestoreQA.afterRead;
  if (hook) { window.firestoreQA.afterRead = null; hook(); }
  return result;
}
export async function runTransaction(_db, fn) {
  const writes = [];
  const result = await fn({
    get: async ref => snapshot(ref),
    update: (ref, data) => writes.push(['update', ref, data]),
    delete: ref => writes.push(['delete', ref]),
  });
  if (window.firestoreQA.fail) throw Error('simulated permission/network failure');
  window.firestoreQA.transactions.push(writes.map(([type, ref, data]) => ({type, path:ref.path, data})));
  for (const [type, ref, data] of writes) {
    if (type === 'delete') records.delete(ref.path);
    else records.set(ref.path, {...records.get(ref.path), ...data});
  }
  emit();
  return result;
}
window.firestoreQA = { records, stamp, fail: false, failImages: false, imageDelayMs: 0, emit, transactions: [] };

window.addEventListener('storage', event => {
  if (event.key !== STORAGE || !event.newValue) return;
  const incoming = decode(event.newValue);
  records.clear();
  for (const [key, value] of incoming.entries) records.set(key, value);
  nextId = incoming.nextId;
  for (const l of listeners) l.fn(read(l.ref));
});
