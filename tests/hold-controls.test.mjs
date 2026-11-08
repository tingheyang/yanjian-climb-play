import assert from 'node:assert/strict';
import {HoldInput} from '../hold-input.js';
import {ClimbControls} from '../controls.js';
import {initialState,holds,proposeMove} from '../physics.js';
const h=new HoldInput();assert(h.begin(1));assert(!h.begin(2));assert.equal(h.finish(2),null);assert.deepEqual(h.finish(1),{commit:false});h.begin(3);h.markMoved(.1);assert.deepEqual(h.finish(3,true),{commit:false});h.begin(4);h.markMoved(.1);assert.deepEqual(h.finish(4),{commit:true});
let s=initialState(),c=new ClimbControls();s.phase='climbing';let before=JSON.stringify(s.contacts);c.select(s,3);c.release(s);assert.equal(JSON.stringify(s.contacts),before);c.target={...holds[15],x:holds[15].x+.04};c.refresh(s);assert(c.result.ok);assert(c.snapped);assert.equal(c.candidate.id,15);let result=c.primary(s);assert(result.ok);assert.equal(s.moves,1);assert.equal(s.contacts[3].id,15);c.undo(s);assert.equal(JSON.stringify(s.contacts),before);
c.select(s,3);c.release(s);c.move(s,10,10);assert(Math.hypot(c.target.x-s.contacts[3].x,c.target.y-s.contacts[3].y)<=1.121);c.cancel(s);assert.equal(JSON.stringify(s.contacts),before);assert.equal(s.active,-1);
// A nearby occupied hold must never attract the free hand/foot.
c.select(s,3);c.release(s);c.target={...s.contacts[2]};c.refresh(s);assert(!c.snapped || proposeMove(s,3,c.candidate).ok);assert.equal(JSON.stringify(s.contacts),before);console.log('PASS: pointer ownership, tap/cancel safety, local valid snap, explicit foot placement, undo and reach bounds');
