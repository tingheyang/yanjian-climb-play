// Contextual coaching expires in active play time; experienced players can dismiss it.
export class ClimbCoach {
 constructor(){this.reset();}
 reset(){this.time=0;this.until=8;this.moves=0;this.dismissed=false;this.warnAt=-30;}
 dismiss(){this.dismissed=true;}
 placed(){this.moves++;this.until=this.time+4;}
 update(dt,{holding=false,moving=false,valid=true,snapped=false,limb='',energy=100,resting=false,footShare=0}={}){
  this.time+=dt;
  if(energy<55&&footShare>.55&&!holding&&!resting&&this.time-this.warnAt>24){this.warnAt=this.time;return {text:'双脚已站稳 · 可以在 ··· 中休息，恢复手臂体力',warning:true};}
  if(energy<28&&!holding&&!resting&&this.time-this.warnAt>24){this.warnAt=this.time;return {text:'手臂快撑不住了：先踩稳双脚，再到 ··· 里休息',warning:true};}
  if(this.dismissed||this.moves>=3)return null;
  if(holding){if(!valid)return {text:'够不到了：把轮盘往回推一点，或松手返回',warning:false};return {text:!moving?'继续按住右侧按钮，左轮盘移动'+limb:snapped?'已对准岩点，松开右侧按钮落点':'金色圈是摩擦面，绿色圈是可用岩点',warning:false};}
  if(this.time>this.until)return null;
  return {text:this.moves===0?'右手按住「攀爬」，左手推轮盘，松开右手落点':this.moves===1?'再按住攀爬继续；轻点人物手脚可手动选肢':'四肢抓稳时，单独推轮盘可以调整重心',warning:false};
 }
}
