import type { Store } from './domain'
const DB='freequiz-local', TABLE='state', KEY='main'
function openDb():Promise<IDBDatabase|null>{if(!('indexedDB' in globalThis))return Promise.resolve(null);return new Promise(resolve=>{const r=indexedDB.open(DB,1);r.onupgradeneeded=()=>r.result.createObjectStore(TABLE);r.onsuccess=()=>resolve(r.result);r.onerror=()=>resolve(null)})}
function fallback():Store|null{try{const s=localStorage.getItem(KEY);return s?JSON.parse(s) as Store:null}catch{return null}}
export async function loadStore():Promise<Store|null>{const db=await openDb();if(!db)return fallback();return new Promise(resolve=>{const r=db.transaction(TABLE,'readonly').objectStore(TABLE).get(KEY);r.onsuccess=()=>resolve((r.result as Store|undefined)??fallback());r.onerror=()=>resolve(fallback())})}
export async function saveStore(store:Store):Promise<void>{const db=await openDb();if(db)await new Promise<void>(resolve=>{const tx=db.transaction(TABLE,'readwrite');tx.objectStore(TABLE).put(store,KEY);tx.oncomplete=()=>resolve();tx.onerror=()=>resolve()});try{localStorage.setItem(KEY,JSON.stringify(store))}catch{/* Browser storage may be unavailable or full. */}}
