import {buildCharacter} from './character.js?v=09a';
import {buildTerrain as terrainV3,buildWorld as worldV3} from './environment.js?v=09a';
import * as THREE from './vendor/three.module.min.js?v=09a';
import {holds,wallZ,surfaceNormal,roots,jointIK,lengths,v,add,sub,mul,distance,clamp} from './physics.js?v=09a';
const V=p=>new THREE.Vector3(p.x,p.y,p.z), Y=new THREE.Vector3(0,1,0);
function rng(seed=81){return()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};}
export class ClimbScene{
 constructor(canvas){
 this.canvas=canvas;this.renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:false,powerPreference:'high-performance'});this.renderer.setPixelRatio(Math.min(devicePixelRatio,1.7));this.renderer.shadowMap.enabled=true;this.renderer.shadowMap.type=THREE.PCFSoftShadowMap;this.renderer.outputColorSpace=THREE.SRGBColorSpace;this.renderer.toneMapping=THREE.ACESFilmicToneMapping;this.renderer.toneMappingExposure=1.05;
 this.scene=new THREE.Scene();this.scene.background=new THREE.Color('#b5c6c6');this.scene.fog=new THREE.FogExp2('#a4b8b8',.012);this.camera=new THREE.PerspectiveCamera(43,1,.05,250);this.yaw=-.43;this.pitch=.04;this.distance=6.6;this.focus=new THREE.Vector3(-22,-10,-18);this.camera.position.set(95,75,440);this.ray=new THREE.Raycaster();this.pointer=new THREE.Vector2();this.pickables=[];this.elapsed=0;this.markers=[];this.particles=[];this.limbMesh=[];
 this.scene.add(new THREE.HemisphereLight('#c4d6e5','#424d53',1.6));this.sun=new THREE.DirectionalLight('#fff0d5',2.9);this.sun.position.set(-8,18,12);this.sun.castShadow=true;this.sun.shadow.mapSize.set(2048,2048);Object.assign(this.sun.shadow.camera,{left:-9,right:9,top:12,bottom:-10,near:1,far:48});this.sun.shadow.bias=-.00025;this.sun.shadow.normalBias=.012;this.scene.add(this.sun);this.scene.add(this.sun.target);let rim=new THREE.DirectionalLight('#9ec5dd',.7);rim.position.set(8,7,-5);this.scene.add(rim);
 this.assetTasks=[];this.buildTerrain();this.buildWorld();this.ready=Promise.all(this.assetTasks);this.buildClimber();this.buildHelpers();this.resize();
 }
 material(color,roughness=.85){return new THREE.MeshStandardMaterial({color,roughness});}
 buildTerrain(){terrainV3(this);}
 buildWorld(){worldV3(this);}
 mesh(geo,mat,parent=this.scene){let m=new THREE.Mesh(geo,mat);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
 ellipsoid(size,mat,parent=this.scene){let m=this.mesh(new THREE.SphereGeometry(1,16,12),mat,parent);m.scale.set(...size);return m;}
 buildClimber(){buildCharacter(this);}
 buildHelpers(){this.helperGroup=new THREE.Group();this.scene.add(this.helperGroup);for(let i=0;i<4;i++){let ring=new THREE.Mesh(new THREE.TorusGeometry(.065,.007,6,32),new THREE.MeshBasicMaterial({color:i<2?'#f1d9a0':'#b9d5c5',depthTest:false,transparent:true,opacity:.85}));ring.renderOrder=5;this.helperGroup.add(ring);this.markers.push(ring);}
 this.guide=new THREE.Mesh(new THREE.TorusGeometry(.10,.009,6,40),new THREE.MeshBasicMaterial({color:'#f4ce86',depthTest:false,transparent:true}));this.guide.renderOrder=7;this.guide.visible=false;this.scene.add(this.guide);
 this.cursor=new THREE.Mesh(new THREE.TorusGeometry(.085,.008,6,32),new THREE.MeshBasicMaterial({color:'#d1e4c8',depthTest:false}));this.cursor.renderOrder=6;this.scene.add(this.cursor);this.cursor.visible=false;
 this.comMarker=new THREE.Mesh(new THREE.SphereGeometry(.035,10,8),new THREE.MeshBasicMaterial({color:'#edb969',depthTest:false}));this.comMarker.renderOrder=5;this.scene.add(this.comMarker);
 this.loadLines=[];for(let i=0;i<4;i++){let g=new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(),new THREE.Vector3()]),m=new THREE.Line(g,new THREE.LineDashedMaterial({color:i<2?'#dca877':'#a7d8c4',dashSize:.04,gapSize:.025,transparent:true,opacity:.6,depthTest:false}));m.renderOrder=5;this.scene.add(m);this.loadLines.push(m);}
 this.holdDots=new THREE.Group();this.scene.add(this.holdDots);for(let h of holds){let m=new THREE.Mesh(new THREE.CircleGeometry(.022,8),new THREE.MeshBasicMaterial({color:'#e6d7af',transparent:true,opacity:.55,depthTest:false}));m.position.set(h.x,h.y,h.z+.06);m.renderOrder=3;m.userData.hold=h;this.holdDots.add(m);}
 }
 segment(mesh,a,b,r=1){let av=V(a),bv=V(b),d=bv.clone().sub(av);mesh.position.copy(av).add(bv).multiplyScalar(.5);mesh.quaternion.setFromUnitVectors(Y,d.clone().normalize());mesh.scale.set(r,d.length(),r);}
 updateCharacter(state,dt,forces){if(!this.visualPelvis)this.visualPelvis=V(state.pelvis);this.visualPelvis.lerp(V(state.pelvis),1-Math.exp(-dt*10));let p=this.visualPelvis;let lean=clamp((state.contacts[0].x+state.contacts[1].x)/2-p.x,-.25,.25)*.55;let r=roots(p,lean),energy=Math.min(...state.energy.slice(0,2)),t=this.elapsed;this.torsoGroup.position.copy(p);this.torsoGroup.rotation.z=-lean;this.torsoGroup.rotation.y=clamp((state.contacts[0].z-state.contacts[1].z)*1.8,-.35,.35);this.torsoGroup.rotation.x=.09+Math.sin(t*2.3)*.012*(1+Math.max(0,50-energy)*.02);
 if(!this.visualContacts)this.visualContacts=state.contacts.map(p=>V(p));for(let i=0;i<4;i++){let dest=state.active===i&&this.preview?this.preview:state.contacts[i];if(state.active===i&&this.preview){let delta=sub(dest,r[i]),reach=lengths[i][0]+lengths[i][1]-.003,d=Math.hypot(delta.x,delta.y,delta.z);if(d>reach)dest=add(r[i],mul(delta,reach/d));}this.visualContacts[i].lerp(V(dest),1-Math.exp(-dt*14));let end=this.visualContacts[i].clone();if(energy<25&&i<2){end.x+=Math.sin(t*28+i)*.009*(1-energy/25);}let side=i%2?-1:1;let pole=i<2?v(-side*.65,-.3,.35):v(-side*.48,.2,.85);let joint=jointIK(r[i],end,...lengths[i],pole);let mesh=this.limbMesh[i];this.segment(mesh.upper,r[i],joint);this.segment(mesh.lower,joint,end);mesh.joint.position.copy(V(joint));mesh.end.position.copy(end);mesh.end.rotation.set(i<2?-.12:0, i<2?0:(i===2?-.18:.18),i<2?(i===0?-.12:.12):0);this.markers[i].position.copy(end).add(new THREE.Vector3(0,0,.045));this.markers[i].scale.setScalar(state.selected===i?1.5:1);this.markers[i].material.opacity=state.selected===i?.95:.35;
 let a=V(p).add(new THREE.Vector3(0,.15,.04));let arr=this.loadLines[i].geometry.attributes.position;arr.setXYZ(0,a.x,a.y,a.z);arr.setXYZ(1,end.x,end.y,end.z+.04);arr.needsUpdate=true;this.loadLines[i].computeLineDistances();this.loadLines[i].material.opacity=forces.loads[i]*.8+.10;}
 this.comMarker.position.copy(p).add(new THREE.Vector3(0,.16,.16));let check=state.checkpoint;let anchor=new THREE.Vector3(check.pelvis.x,check.pelvis.y-.10,wallZ(check.pelvis.x,check.pelvis.y-.10)+.12);this.piton.position.copy(anchor);if(this.rope){this.rope.geometry.dispose();this.scene.remove(this.rope);}let waist=p.clone().add(new THREE.Vector3(0,0,.12)),sag=Math.min(.55,anchor.distanceTo(waist)*.17+.15),middle=anchor.clone().add(waist).multiplyScalar(.5).add(new THREE.Vector3(.08,-sag,.12));let curve=new THREE.QuadraticBezierCurve3(anchor,middle,waist);this.rope=new THREE.Mesh(new THREE.TubeGeometry(curve,16,.009,5,false),this.ropeMaterial);this.scene.add(this.rope);
 }
 setPreview(p,ok){this.preview=p;this.cursor.visible=!!p;if(p){this.cursor.position.copy(V(p)).add(new THREE.Vector3(0,0,.08));this.cursor.material.color.set(ok?'#b8dfb5':'#e98466');}}
 update(state,dt,forces,options){this.elapsed+=dt;if(this.guide.visible)this.guide.scale.setScalar(1+Math.sin(this.elapsed*3)*.1);this.updateCharacter(state,dt,forces);this.helperGroup.visible=options.assist;this.comMarker.visible=options.forces;this.loadLines.forEach(m=>m.visible=options.forces);this.holdDots.children.forEach(m=>{m.visible=options.assist&&Math.abs(m.position.y-state.pelvis.y)<1.65&&distance(m.position,roots(state.pelvis)[state.selected])<.98;});
 let p=this.visualPelvis,panorama=options.overview,inspect=options.inspect,look=options.look,aspect=this.camera.aspect;
 let target=panorama?new THREE.Vector3(-52,-12,-24):new THREE.Vector3(p.x+(inspect?.12:aspect<.7?.48:1.3),p.y+(inspect?.40:.64),p.z-.1);
 if(look)target=new THREE.Vector3(p.x+(look==='up'?1:12),p.y+(look==='up'?25:-100),look==='up'?-3:-24);let speed=panorama?.85:2.2;this.focus.lerp(target,1-Math.exp(-dt*speed));
 let dist=panorama?(aspect<.7?690:540):inspect?3.4:this.distance*(aspect<.7?1.2:1);
 let yaw=panorama?-.22:this.yaw,pitch=panorama?.12:inspect?.08:this.pitch;
 let desired=new THREE.Vector3(this.focus.x+Math.sin(yaw)*dist,this.focus.y+Math.sin(pitch)*dist,this.focus.z+Math.cos(yaw)*Math.cos(pitch)*dist);
 if(look)desired=new THREE.Vector3(p.x+(look==='up'?-1:1),p.y+(look==='up'?1:2),p.z+(look==='up'?6:9));this.camera.position.lerp(desired,1-Math.exp(-dt*speed));this.camera.lookAt(this.focus);
 this.sun.position.set(p.x-8,p.y+12,12);this.sun.target.position.set(p.x,p.y,0);this.sun.target.updateMatrixWorld();
 this.clouds.forEach((m,i)=>m.position.x+=dt*(.09+i*.002));this.birds?.forEach((b,i)=>{b.position.x=20+i*16+Math.sin(this.elapsed*.12+i)*20;b.position.y=-12-i*9+Math.sin(this.elapsed*.23+i)*2;b.rotation.z=Math.sin(this.elapsed*.4+i)*.12;});
 if(this.head)this.head.rotation.y=Math.sin(this.elapsed*.27)*.18+(state.selected===1?-.12:.08);
 this.helperGroup.visible=!panorama&&!inspect&&!look;this.markers.forEach((m,i)=>{let chosen=options.pickHover>=0?options.pickHover:state.selected;m.visible=options.assist||i===chosen;m.scale.setScalar(i===chosen?1.65:1);m.material.opacity=i===chosen?.95:.35;});this.holdDots.visible=!panorama&&!inspect&&!look;this.guide.visible=this.guide.visible&&!panorama;
 this.renderer.render(this.scene,this.camera);
 }
 resize(){let w=this.canvas.clientWidth,h=this.canvas.clientHeight;this.renderer.setSize(w,h,false);this.camera.aspect=w/h;this.camera.updateProjectionMatrix();}
 hit(clientX,clientY){let b=this.canvas.getBoundingClientRect();this.pointer.set((clientX-b.left)/b.width*2-1,-(clientY-b.top)/b.height*2+1);this.ray.setFromCamera(this.pointer,this.camera);let hits=this.ray.intersectObjects(this.pickables,false);return hits.length?hits[0]:null;}
 project(p){let q=V(p).project(this.camera),b=this.canvas.getBoundingClientRect();return {x:(q.x+1)/2*b.width+b.left,y:(1-q.y)/2*b.height+b.top,visible:q.z<1};}
 nearestLimb(x,y,s){let result=-1,best=32;for(let i=0;i<4;i++){let p=this.project(s.contacts[i]),d=Math.hypot(p.x-x,p.y-y);if(d<best){best=d;result=i;}}return result;}
 orbit(dx,dy){this.yaw=clamp(this.yaw-dx*.005,-.95,.95);this.pitch=clamp(this.pitch+dy*.004,-.30,.6);}
 resetCamera(){this.yaw=-.43;this.pitch=.04;this.distance=6.6;}
}
