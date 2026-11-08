import assert from 'node:assert/strict';
import {initialState,holds,support,roots,lengths,jointIK,distance,surfaceNormal,dot,len} from '../physics.js';
import {poseIntent,bendPole,contactBasis,fingerCurl} from '../pose.js';
import {rockRecess} from '../hold-layout.js';
let s=initialState(),before=JSON.stringify(s),intent=poseIntent(s,support(s),null);assert(Object.values(intent).every(Number.isFinite));assert.equal(JSON.stringify(s),before);
for(let h of holds){let n=surfaceNormal(h.x,h.y),basis=contactBasis(n);assert(Math.abs(len(n)-1)<1e-8);assert(Math.abs(dot(basis.y,basis.z))<1e-8);assert(rockRecess(h.x,h.y+.047)<=0);assert(rockRecess(h.x,h.y+.047)>-.1);}
assert.equal(rockRecess(20,3),0);assert(fingerCurl(.95,false)>fingerCurl(.25,false));assert(fingerCurl(.95,true)<fingerCurl(.95,false));
for(let i=0;i<4;i++){let root=roots(s.pelvis)[i],end=s.contacts[i],joint=jointIK(root,end,...lengths[i],bendPole(i,root,end,support(s).loads[i]));assert(Math.abs(distance(root,joint)-lengths[i][0])<.01);assert(Math.abs(distance(joint,end)-lengths[i][1])<.035);}
console.log('PASS: finite contact frames, bounded inset rock, contact-dependent fingers, stable two-bone limb lengths');
