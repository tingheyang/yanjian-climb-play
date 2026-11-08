const KEY='yanjian-progress-v1';
const point=p=>p&&['x','y','z'].every(k=>Number.isFinite(p[k]))&&Math.abs(p.x)<3&&p.y>=-.1&&p.y<=18&&Math.abs(p.z)<3;
const pose=p=>p&&point(p.pelvis)&&Array.isArray(p.contacts)&&p.contacts.length===4&&p.contacts.every(c=>point(c)&&Number.isFinite(c.q)&&c.q>=0&&c.q<=1);
export function saveProgress(storage,s){if(s.phase!=='climbing'||s.active>=0||!s.moves)return false;try{storage.setItem(KEY,JSON.stringify({version:1,pelvis:s.pelvis,contacts:s.contacts,energy:s.energy,checkpoint:s.checkpoint,anchors:s.anchors,moves:s.moves,falls:s.falls,elapsed:s.elapsed,selected:s.selected}));return true;}catch{return false;}}
export function loadProgress(storage){try{let p=JSON.parse(storage.getItem(KEY));if(p?.version!==1||!pose(p)||!pose(p.checkpoint)||!Array.isArray(p.energy)||p.energy.length!==4||!p.energy.every(n=>Number.isFinite(n)&&n>=0&&n<=100)||!['anchors','moves','falls','elapsed','selected'].every(k=>Number.isFinite(p[k])&&p[k]>=0)||p.anchors>3||p.selected>3)return null;return p;}catch{return null;}}
export function clearProgress(storage){try{storage.removeItem(KEY);}catch{}}
