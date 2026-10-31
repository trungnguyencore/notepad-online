import React, { useCallback, useState } from 'react';
import { createRoot } from 'react-dom/client';
import NoteEditor from '../../src/components/NoteEditor';
import App from '../../src/App';
import '../../src/index.css';

const store = { a: { id: 'a', title: 'A', content: '<p>A</p>', updatedAt: new Date() }, b: { id: 'b', title: 'B', content: '<p>B</p>', updatedAt: new Date() } };
window.qa = { store, saves: [], delay: 0 };
function Harness() {
  const [id, setId] = useState('a');
  const [version, setVersion] = useState(0);
  window.qa.switch = setId;
  window.qa.reload = () => setVersion(v => v + 1);
  const save = useCallback(async (noteId, data) => {
    window.qa.saves.push({ noteId, ...data });
    await new Promise(resolve => setTimeout(resolve, window.qa.delay));
    Object.assign(store[noteId], data);
    return true;
  }, []);
  return <div style={{height: '95dvh', maxWidth: 700, margin: 'auto'}}><NoteEditor key={`${id}:${version}`} note={{...store[id]}} folders={[]} onUpdate={save} onMoveFolder={() => {}} onDelete={() => {}} onBack={() => setId(id === 'a' ? 'b' : 'a')} /></div>;
}
createRoot(document.getElementById('root')).render(<React.StrictMode>{location.search.includes('app') ? <App /> : <Harness />}</React.StrictMode>);
