// Lightweight synthesized inhalation/exhalation; no audio download gates gameplay.
export function breathDemand(energy,handShare,moving,resting){return Math.max(.08,Math.min(1,(1-energy/100)*.62+Math.max(0,handShare-.32)*.52+(moving?.22:0)-(resting?.24:0)));}
class SyntheticBreath{
 constructor(ctx,output){this.ctx=ctx;this.output=output;this.level=.12;this.next=0;this.nodes=new Set();this.cycles=0;this.enabled=true;this.buffer=ctx.createBuffer(1,ctx.sampleRate*2,ctx.sampleRate);let d=this.buffer.getChannelData(0),low=0;for(let i=0;i<d.length;i++){low=.78*low+.22*(Math.random()*2-1);d[i]=low*2.2;}}
 stop(){for(let s of this.nodes){try{s.stop();}catch{}}this.nodes.clear();this.next=this.ctx.currentTime+.25;}
 tick(dt,demand,enabled){this.level+=(demand-this.level)*(1-Math.exp(-dt*1.6));if(!enabled){if(this.enabled)this.stop();this.enabled=false;return;}this.enabled=true;if(this.ctx.state!=='running')return;if(this.ctx.currentTime>=this.next){this.play(this.level);this.next=this.ctx.currentTime+3.8-2.5*this.level+Math.random()*.22;}}
 play(e){const c=this.ctx,now=c.currentTime+.01,inhale=.34-.10*e,exhale=.58-.13*e,gap=.10-.04*e;this.cycles++;
 const puff=(at,dur,inward)=>{let s=c.createBufferSource(),hp=c.createBiquadFilter(),mouth=c.createBiquadFilter(),lp=c.createBiquadFilter(),g=c.createGain();s.buffer=this.buffer;s.playbackRate.value=.85+Math.random()*.20;hp.type='highpass';hp.frequency.value=inward?350:160;mouth.type='peaking';mouth.frequency.value=inward?1350:650;mouth.Q.value=.8;mouth.gain.value=5;lp.type='lowpass';lp.frequency.setValueAtTime(inward?2400:1550,at);lp.frequency.linearRampToValueAtTime(inward?1800:850,at+dur);let peak=(.16+e*.30)*(inward?.72:1);let env=new Float32Array(64);for(let i=0;i<64;i++){let t=i/63;env[i]=.0001+peak*Math.pow(Math.sin(Math.PI*t),inward?1.2:.8)*(1+.07*Math.sin(t*53));}g.gain.setValueCurveAtTime(env,at,dur);s.connect(hp).connect(mouth).connect(lp).connect(g).connect(this.output);this.nodes.add(s);s.onended=()=>{this.nodes.delete(s);[s,hp,mouth,lp,g].forEach(n=>n.disconnect());};s.start(at,Math.random()*.3);s.stop(at+dur+.02);};
 puff(now,inhale,true);puff(now+inhale+gap,exhale,false);
 // Quiet voiced strain underneath the exhale, only during harder effort.
 if(e>.35){let o=c.createOscillator(),f=c.createBiquadFilter(),g=c.createGain(),at=now+inhale+gap; o.type='triangle';o.frequency.setValueAtTime(151+e*23,at);o.frequency.exponentialRampToValueAtTime(114+e*18,at+exhale);f.type='lowpass';f.frequency.value=650;g.gain.setValueAtTime(.0001,at);g.gain.linearRampToValueAtTime((e-.35)*.034,at+.09);g.gain.exponentialRampToValueAtTime(.0001,at+exhale);o.connect(f).connect(g).connect(this.output);this.nodes.add(o);o.onended=()=>{this.nodes.delete(o);o.disconnect();f.disconnect();g.disconnect();};o.start(at);o.stop(at+exhale+.01);}
 }
}

// Real recorded breath is loaded independently: a network failure never blocks climbing.
export class ClimberBreath extends SyntheticBreath {
 constructor(ctx,output){super(ctx,output);this.sourceStatus='loading';this.recording=null;this.lastClip=-1;this.ready=this.loadRecording();}
 async loadRecording(){try{let r=await fetch(new URL('./assets/audio/breath-human.mp3',import.meta.url),{signal:AbortSignal.timeout(12000)});if(!r.ok)throw Error('breath download');this.recording=await this.ctx.decodeAudioData(await r.arrayBuffer());this.sourceStatus='recorded';}catch{this.sourceStatus='synth-fallback';}}
 tick(dt,demand,enabled){this.level+=(demand-this.level)*(1-Math.exp(-dt*(demand>this.level?1.4:.5)));if(!enabled){if(this.enabled)this.stop();this.enabled=false;return;}this.enabled=true;if(this.ctx.state!=='running')return;if(this.ctx.currentTime>=this.next){let duration=this.play(this.level)||1.1;this.next=this.ctx.currentTime+Math.max(duration+.15,3.9-1.7*this.level)+Math.random()*.25;}}
 play(e){if(!this.recording){super.play(e);return 1.1;}
 const bank=e>.65?[[3.10,1.45,.55],[4.55,1.95,.55],[6.50,1.8,.8]]:e>.3?[[8.3,2.2,1.4],[10.5,2.9,1.4],[12.2,2.3,1.2]]:[[14.4,2.7,2.2],[17.1,2.3,2.2],[19.4,3,2.2]];
 let index=(this.lastClip+1+Math.floor(Math.random()*2))%bank.length;this.lastClip=index;let [offset,length,trim]=bank[index],c=this.ctx,s=c.createBufferSource(),g=c.createGain(),at=c.currentTime+.01,rate=.98+Math.random()*.04,duration=length/rate,level=trim*(.4+.4*e);
 s.buffer=this.recording;s.playbackRate.value=rate;g.gain.setValueAtTime(0,at);g.gain.linearRampToValueAtTime(level,at+.07);g.gain.setValueAtTime(level,at+duration-.12);g.gain.linearRampToValueAtTime(0,at+duration);s.connect(g).connect(this.output);this.nodes.add(s);s.onended=()=>{this.nodes.delete(s);s.disconnect();g.disconnect();};s.start(at,offset,length);s.stop(at+duration+.02);this.cycles++;return duration;
 }
}
