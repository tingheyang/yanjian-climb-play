import {contactAt,proposeMove,commitMove,shiftBody,clamp,distance,wallZ,support,holds,snapshot} from './physics.js?v=15a';
// The joystick changes role only when a limb is explicitly released.
export class ClimbControls{
 constructor(){this.target=null;this.candidate=null;this.result=null;this.history=[];this.direction={x:0,y:1};this.lastLimb=-1;}
 reset(){this.history=[];this.lastLimb=-1;this.direction={x:0,y:1};}
 choose(s){let loads=support(s).loads,best=-Infinity,limb=s.selected;for(let i=0;i<4;i++){let origin=s.contacts[i];for(let h of holds){let dx=h.x-origin.x,dy=h.y-origin.y,d=Math.hypot(dx,dy),progress=dx*this.direction.x+dy*this.direction.y;if(d<.15||d>.95||progress<.12)continue;let r=proposeMove(s,i,h);if(!r.ok)continue;let score=progress*.7+h.q*.25-loads[i]*.5+(r.pelvis.y-s.pelvis.y)*2-(i===this.lastLimb?.25:0);if(score>best){best=score;limb=i;}}}return limb;}
 primary(s){if(!this.moving){this.select(s,this.choose(s));this.release(s);return {ok:true,released:true};}let before=snapshot(s),r=this.grip(s);if(r.ok&&!r.returned){this.history.push(before);if(this.history.length>8)this.history.shift();this.lastLimb=r.limb;}return r;}
 undo(s){if(this.moving){this.cancel(s);return true;}let previous=this.history.pop();if(!previous)return false;s.pelvis=previous.pelvis;s.contacts=previous.contacts;s.active=-1;s.resting=false;this.lastLimb=-1;return true;}
 get moving(){return this.target!==null;}
 cancel(s){this.target=null;this.candidate=null;this.result=null;this.snapped=false;s.active=-1;}
 select(s,index){this.cancel(s);s.selected=index;s.resting=false;}
 cycle(s){this.select(s,(s.selected+1)%4);}
 release(s){if(this.moving)return;this.target={...s.contacts[s.selected]};s.active=s.selected;s.resting=false;this.refresh(s);}
 refresh(s){let x=this.target.x,y=this.target.y,raw=contactAt(x,y);if(raw.id>=0)raw={x,y,z:wallZ(x,y)+.025,q:.3,kind:'摩擦面',id:-1,width:.04};let previous=this.candidate,near=holds.filter(h=>Math.hypot(h.x-x,h.y-y)<(previous?.id===h.id?.20:.15)&&proposeMove(s,s.selected,h).ok).sort((a,b)=>Math.hypot(a.x-x,a.y-y)-Math.hypot(b.x-x,b.y-y));this.candidate=near.find(h=>h.id===previous?.id)||near[0]||raw;this.snapped=this.candidate.id>=0;this.result=proposeMove(s,s.selected,this.candidate);return this.result;}
 move(s,dx,dy){if(Math.hypot(dx,dy)>.0001){let d=Math.hypot(dx,dy);this.direction={x:dx/d,y:dy/d};}if(!this.moving){shiftBody(s,dx,dy);return;}let resistance=this.result?.ok?1:.3;this.target.x=clamp(this.target.x+dx*resistance,-2.03,2.03);this.target.y=clamp(this.target.y+dy*resistance,0,17.6);let origin=s.contacts[s.selected],d=Math.hypot(this.target.x-origin.x,this.target.y-origin.y);if(d>1.12){this.target.x=origin.x+(this.target.x-origin.x)*1.12/d;this.target.y=origin.y+(this.target.y-origin.y)*1.12/d;}this.target.z=wallZ(this.target.x,this.target.y)+.025;this.refresh(s);}
 grip(s){if(!this.moving){this.release(s);return {ok:true,released:true};}this.refresh(s);if(!this.result.ok)return this.result;let limb=s.selected,h={...this.candidate};if(distance(s.contacts[limb],h)<.025){this.cancel(s);return {ok:true,returned:true,limb,hold:h};}let r=commitMove(s,limb,h);if(r.ok){this.cancel(s);return {...r,limb,hold:h};}return r;}
}
