import {clamp,v,sub,norm,dot,mul,add} from './physics.js?v=19a';
export function poseIntent(s,forces,target){let p=s.pelvis,h=s.contacts,active=s.active,aim=target||h[Math.max(0,active)],reach=active>=0?clamp(aim.x-p.x,-.7,.7):0;
 return {shoulderYaw:clamp((h[0].z-h[1].z)*.65+reach*(active<2?.10:.025),-.16,.16),shoulderRoll:clamp(((h[0].y-h[1].y)*.10)+(p.x-(h[0].x+h[1].x)/2)*.12,-.12,.12),hipYaw:clamp((h[2].z-h[3].z)*.5-reach*.045,-.12,.12),hipRoll:clamp((forces.loads[3]-forces.loads[2])*.09,-.065,.065)};
}
export function bendPole(i,root,end,load){let side=i%2?1:-1,high=clamp((end.y-root.y+.6)/1.2,0,1);return i<2?v(side*(.28+high*.16),-.55,.32):v(side*(.18+high*.22),.08,.65-load*.16);}
export function contactBasis(normal){let z=norm(normal),y=norm(sub(v(0,1,0),mul(z,dot(v(0,1,0),z))));if(Math.hypot(y.x,y.y,y.z)<.01)y=v(0,0,1);return {y,z};}
export function fingerCurl(q,moving){return moving?.22:q>=.65?.95:q>=.5?.65:.08;}
