// The first pitch follows a rising seam, a right traverse and a broad rest stance.
export function routeCenter(y){
 const stops=[[0,0],[1.8,0],[3.3,.85],[4.5,.85],[5.7,.15],[7,.15]];
 for(let i=1;i<stops.length;i++){if(y<=stops[i][0]){let a=stops[i-1],b=stops[i],t=Math.max(0,(y-a[0])/(b[0]-a[0]));return a[1]+(b[1]-a[1])*t;}}
 return 0;
}
export const restStance={x:.15,y:5.69,halfWidth:.78};
export function routeStage(p){return p.y<2.3?'起攀 · 踩稳再上升':p.y<3.8?'横移 · 沿岩层向右':p.y<5.8?'转折 · 重心跟随双脚':p.y<6.8?'岩台 · 稳住后休息':'裂隙 · 继续上攀';}
export function atRestStance(s){return s.active<0&&s.contacts.slice(2).every(p=>Math.abs(p.y-restStance.y)<.22&&Math.abs(p.x-restStance.x)<restStance.halfWidth);}
