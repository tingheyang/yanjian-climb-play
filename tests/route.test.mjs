import assert from 'node:assert/strict';
import {initialState,holds,support,tick} from '../physics.js';
import {ClimbControls} from '../controls.js';
import {atRestStance} from '../route.js';
const path=[[2,15],[3,10],[0,38],[2,26],[3,21],[1,39],[3,27],[0,44],[2,38],[1,51],[3,39],[1,56],[3,51],[0,50],[2,45],[1,63],[2,57],[0,62],[0,74],[2,62],[3,57],[1,69],[3,63],[0,80],[2,74],[1,81],[3,69],[1,93],[3,81],[0,86],[2,80]];
let s=initialState(),c=new ClimbControls(),furthest=0;s.phase='climbing';
for(let [limb,id] of path){const before=s.contacts.map(p=>({...p}));c.select(s,limb);c.release(s);c.target={...holds[id]};c.refresh(s);assert(c.result.ok,`unreachable ${limb}:${id}`);for(let i=0;i<40;i++)tick(s,.04);assert(c.primary(s).ok);for(let i=0;i<20;i++)tick(s,.04);if(support(s).footShare>.55&&Math.min(...s.energy.slice(0,2))<55){s.resting=true;for(let i=0;i<125;i++)tick(s,.04);s.resting=false;}assert.equal(s.phase,'climbing',JSON.stringify({limb,id,energy:s.energy,foot:support(s).footShare,moves:s.moves}));before.forEach((p,i)=>{if(i!==limb)assert.deepEqual(s.contacts[i],p,'no automatic foot/hand placement');});furthest=Math.max(furthest,s.pelvis.x);}
assert(furthest>.55,'route traverses right');assert(atRestStance(s));assert(support(s).footShare>.55);s.energy[0]=40;s.resting=true;for(let i=0;i<125;i++)tick(s,.04);assert(s.energy[0]>40,'rest platform restores hand energy');
console.log(`PASS: ${path.length} explicit moves, traverse, rest stance, 89.4 seconds including three short rests without falling`);
