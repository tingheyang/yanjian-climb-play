// Original generative score: slow suspended harmony, felt-like notes and long diffuse tails.
// No downloaded music or copyrighted melody. Schedule only a short look-ahead.
export class MountainMusic {
 constructor(ctx,output){
  this.ctx=ctx;this.voices=new Set();this.next=0;this.step=0;this.enabled=false;this.level=0;this.phrases=0;
  this.bus=ctx.createGain();this.bus.gain.value=0;this.bus.connect(output);
  this.dry=ctx.createGain();this.dry.gain.value=1.4;this.dry.connect(this.bus);
  this.reverb=ctx.createConvolver();let ir=ctx.createBuffer(2,Math.floor(ctx.sampleRate*3.6),ctx.sampleRate);
  for(let ch=0;ch<2;ch++){let d=ir.getChannelData(ch),smooth=0;for(let i=0;i<d.length;i++){smooth=.6*smooth+.4*(Math.random()*2-1);d[i]=smooth*Math.pow(1-i/d.length,3)*.5;}}
  this.reverb.buffer=ir;this.wet=ctx.createGain();this.wet.gain.value=.96;this.reverb.connect(this.wet).connect(this.bus);
 }
 stop(){this.enabled=false;this.level=0;let t=this.ctx.currentTime;this.bus.gain.cancelScheduledValues(t);this.bus.gain.setTargetAtTime(0,t,.09);for(let o of this.voices){try{o.stop(t+.5);}catch{}}this.voices.clear();this.next=t+.6;}
 tick(dt,{enabled=true,effort=0,open=false,resting=false,volume=.65}={}){
  if(!enabled){if(this.enabled)this.stop();return;}
  if(this.ctx.state!=='running')return;
  if(!this.enabled){this.enabled=true;this.next=Math.max(this.next,this.ctx.currentTime+.08);}
  // Pull music behind breath under load; let it open up during a rest or a mountain view.
  let target=volume*(open?1:resting?.86:.66)*(1-Math.min(1,Math.max(0,effort))*.42);
  this.level+=(target-this.level)*(1-Math.exp(-dt*.7));
  this.bus.gain.setTargetAtTime(this.level,this.ctx.currentTime,.3);
  if(this.next<this.ctx.currentTime-.5)this.next=this.ctx.currentTime+.08;
  if(this.next<this.ctx.currentTime+.2){this.phrase(this.next,this.step++);this.next+=12;}
 }
 phrase(at,step){
  const chords=[[38,45,52,57],[34,41,48,53],[41,48,55,60],[36,43,50,57],[38,45,53,60],[34,41,50,57],[41,48,52,59],[36,43,50,55]];
  let notes=chords[step%chords.length];this.phrases++;
  notes.forEach((n,i)=>this.tone(n,at+i*.18,15,.043*(i===0?1:.7),i%2?-.42:.42,false));
  // Leave entire phrases almost empty; motif varies over the 96-second harmonic arc.
  if(step%4!==3){this.tone(notes[2]+12,at+3.2,7,.072,-.32,true);this.tone(notes[3]+12,at+7.6,6,.047,.38,true);}
 }
 tone(midi,at,duration,volume,pan,pluck){
  let c=this.ctx,g=c.createGain(),p=c.createStereoPanner(),f=c.createBiquadFilter();p.pan.value=pan;f.type='lowpass';f.frequency.value=pluck?1900:680;f.Q.value=.4;
  g.gain.setValueAtTime(0,at);g.gain.linearRampToValueAtTime(volume,at+(pluck?.035:3.8));g.gain.exponentialRampToValueAtTime(.0001,at+duration);g.gain.linearRampToValueAtTime(0,at+duration+.1);
  g.connect(f).connect(p);p.connect(this.dry);p.connect(this.reverb);
  let remaining=pluck?3:2;
  for(let i=0;i<(pluck?3:2);i++){let o=c.createOscillator(),a=c.createGain();o.type='sine';o.frequency.value=440*Math.pow(2,(midi-69)/12)*(pluck?[1,2,3][i]:1);o.detune.value=pluck?0:(i?4:-4);a.gain.value=pluck?[.72,.2,.08][i]:.5;o.connect(a).connect(g);this.voices.add(o);o.onended=()=>{this.voices.delete(o);o.disconnect();a.disconnect();if(--remaining===0){g.disconnect();f.disconnect();p.disconnect();}};o.start(at);o.stop(at+duration+.15);}
 }
}
