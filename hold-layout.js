import {routeCenter,restStance} from './route.js?v=19a';
export function makeHoldLayout(){let a=[];for(let r=0;r<=40;r++){let y=r*.43+.10;for(let c=0;c<6;c++){let x=(c-2.5)*.61+Math.sin(r*1.71+c*2.2)*.14;let yy=y+Math.sin(c*3.4+r*.9)*(r===0||r===4?.08:.19);let q=.65+.3*(.5+.5*Math.sin(r*7.7+c*9.1));if((r+c*3)%9===0)q=.4;if(r<5&&(c===2||c===3))q=.95;if(r>=5&&r<=16){x+=routeCenter(yy)*Math.max(0,1-Math.abs(c-2.5)*.23);q=(c===2||c===3)?.96:.38;}if(r===13&&(c===2||c===3)){yy=restStance.y;x=restStance.x+(c===2?-.30:.30);q=1;}a.push({id:a.length,x,y:yy,q,kind:q<.5?'碎岩':q>.85?'岩台':'裂隙',width:.075+q*.09});}}return a;}
export const holdLayout=makeHoldLayout();
const rows=Array.from({length:41},(_,r)=>holdLayout.slice(r*6,r*6+6));
// Shallow broken recesses are cut into the same surface used by collision and contact normals.
export function rockRecess(x,y){if(Math.abs(x)>2.3||y<-.2||y>18)return 0;let row=Math.round((y-.1)/.43),z=0;
 for(let r=Math.max(0,row-1);r<=Math.min(40,row+1);r++)for(let h of rows[r]){if(h.q<.65)continue;let dx=x-h.x,dy=y-h.y,width=h.width*(h.q>.85?1.7:.65);if(Math.abs(dx)>width*2.5||Math.abs(dy)>.19)continue;let seam=dy+dx*(h.q>.85?.12:.5)-.047;z-=.020*Math.exp(-Math.pow(dx/width,4)-Math.pow(seam/.038,2));}return z;
}
