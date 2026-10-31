// In-memory Firestore double. This does not validate deployed Firebase rules.
const records = new Map();
const listeners = new Set();
let nextId = 1;
const stamp = () => ({ toDate: () => new Date() });
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
  return { docs, size: docs.length, empty: !docs.length };
}
function emit() { for (const l of listeners) l.fn(read(l.ref)); }
export function onSnapshot(ref, fn) { const l = {ref, fn}; listeners.add(l); fn(read(ref)); return () => listeners.delete(l); }
export async function addDoc(ref, data) { const result = {path: `${ref.path}/qa${nextId++}`}; records.set(result.path, {...data}); emit(); return {...result, id: result.path.split('/').at(-1)}; }
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
window.firestoreQA = { records, stamp, fail: false, emit, transactions: [] };
