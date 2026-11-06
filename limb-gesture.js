// Gesture coordinates are CSS pixels relative to the stationary wheel centre.
export class LimbGesture {
 constructor(){this.reset();}
 reset(){this.mode='idle';this.hover=-1;this.id=null;}
 begin(id,x,y,now){if(this.mode!=='idle')return false;this.id=id;this.origin={x,y};this.started=now;this.mode=Math.hypot(x,y)<=20?'pending':'move';return true;}
 advance(now){if(this.mode==='pending'&&now-this.started>=300){this.mode='select';return true;}return false;}
 update(id,x,y,now){if(id!==this.id)return;if(this.mode==='pending'&&Math.hypot(x-this.origin.x,y-this.origin.y)>8)this.mode='move';this.advance(now);if(this.mode==='select')this.hover=Math.hypot(x,y)<23?-1:(y<0?0:2)+(x<0?0:1);}
 finish(id){if(id!==this.id)return null;const result={selected:this.mode==='select'?this.hover:-1,selecting:this.mode==='select'};this.reset();return result;}
}
