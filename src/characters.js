import * as T from '../dist/vendor/three.module.js';
// Original articulated character assets. Each limb is separately authored and animated.
const material=(color,roughness=.86)=>new T.MeshStandardMaterial({color,roughness});
const C={skin:material(0xf0c5a1),oldskin:material(0xc99c76),hair:material(0x27333b),grey:material(0xc9c8bc),ink:material(0x344044),ivory:material(0xf0e7ce),teal:material(0x286f70),indigo:material(0x384e63),trousers:material(0x3a4b57),leather:material(0xa87943),gold:material(0xc8ab6c),white:material(0xfff6e4),iris:material(0x605242),shoe:material(0x485354),sole:material(0xc5bea6)};
function add(g,geo,mat,pos=[0,0,0],scale=[1,1,1]){const m=new T.Mesh(geo,mat);m.position.set(...pos);m.scale.set(...scale);m.castShadow=m.receiveShadow=true;mat.side=T.DoubleSide;g.add(m);return m;}
const sphere=(g,m,pos,scale)=>add(g,new T.SphereGeometry(1,20,14),m,pos,scale);
function profile(g,points,m,pos=[0,0,0],zscale=1){const o=add(g,new T.LatheGeometry(points.map(p=>new T.Vector2(...p)),24),m,pos);o.scale.z=zscale;return o;}
function line(g,points,m,r=.008){const curve=new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p)));return add(g,new T.TubeGeometry(curve,16,r,5,false),m);}
function patch(g,points,m){const shape=new T.Shape();shape.moveTo(points[0][0],points[0][1]);points.slice(1).forEach(p=>shape.lineTo(...p));shape.closePath();const mesh=add(g,new T.ShapeGeometry(shape),m);return mesh;}
function hairLock(g,from,to,width,m,curve=0){
 const a=new T.Vector3(...from),b=new T.Vector3(...to),verts=[],indices=[];
 for(let i=0;i<=8;i++){const t=i/8,p=a.clone().lerp(b,t);p.z+=Math.sin(t*Math.PI)*curve;const w=width*Math.pow(1-t,.7);verts.push(p.x-w,p.y,p.z,p.x+w,p.y,p.z);if(i<8){const j=i*2;indices.push(j,j+1,j+2,j+1,j+3,j+2);}}
 const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(verts,3));geo.setIndex(indices);geo.computeVertexNormals();const mat=m.clone();mat.side=T.DoubleSide;return add(g,geo,mat);
}
export function createCharacter(old=false,female=false){
 const group=new T.Group(),body=new T.Group();group.add(body);
 const skin=old?C.oldskin:C.skin,shirt=old?C.indigo:C.ivory;
 const torso=profile(body,[[.12,0],[.17,.03],[.175,.14],[.19,.33],[.235,.46],[.2,.52],[.075,.56]],shirt,[0,.86,0],.67);
 profile(body,[[.07,0],[.06,.13]],skin,[0,1.39,0]);
 if(!old){
  for(const side of [-1,1]){const vest=patch(body,[[side*.027,.89],[side*.17,.89],[side*.22,1.32],[side*.1,1.4],[side*.04,1.26]],C.teal);vest.position.z=.138;line(body,[[side*.027,.9,.145],[side*.04,1.25,.145],[side*.1,1.4,.12]],C.gold,.009);}
  for(const side of [-1,1]){const collar=patch(body,[[0,1.38],[side*.08,1.43],[side*.13,1.32],[side*.045,1.3]],C.ivory);collar.position.z=.157;}
 }else{
  line(body,[[.04,.9,.13],[.025,1.35,.14],[-.07,1.41,.08]],C.gold,.009);
  for(let i=0;i<4;i++){sphere(body,C.gold,[.035,1.02+i*.087,.15],[.012,.012,.008]);line(body,[[.035,1.02+i*.087,.15],[.095,1.02+i*.087,.15]],C.ink,.007);}
  const apron=patch(body,[[-.15,1.11],[.15,1.11],[.19,.63],[-.18,.63]],material(0x6e786e));apron.position.z=.15;
  line(body,[[-.19,.95,.14],[0,.97,.16],[.19,.95,.14]],C.ivory,.012);
  line(body,[[-.08,.84,.16],[.08,.84,.16],[.085,.73,.16],[-.08,.73,.16],[-.08,.84,.16]],C.gold,.005);
 }
 const legs=[],knees=[],arms=[],elbows=[];
 for(const side of [-1,1]){
  const leg=new T.Group();leg.position.set(side*.105,.9,0);body.add(leg);legs.push(leg);
  profile(leg,[[.076,-.42],[.095,-.32],[.106,-.07],[.09,.02]],C.trousers,[0,0,0],.93);
  const knee=new T.Group();knee.position.y=-.4;leg.add(knee);knees.push(knee);
  profile(knee,[[.059,-.35],[.069,-.28],[.075,-.08],[.077,.04]],C.trousers,[0,0,0],.92);
  profile(knee,[[.063,-.34],[.071,-.33],[.071,-.29],[.065,-.28]],old?C.indigo:C.ivory);
  sphere(knee,C.shoe,[0,-.395,.035],[.079,.067,.155]);sphere(knee,C.sole,[0,-.435,.038],[.081,.021,.157]);
  if(!old)for(let j=0;j<3;j++)line(knee,[[-.04,-.355,.075+j*.018],[.04,-.355,.075+j*.018]],C.ivory,.005);
  const arm=new T.Group();arm.position.set(side*.213,1.34,0);arm.rotation.z=side*.1;body.add(arm);arms.push(arm);
  profile(arm,[[.052,-.31],[.072,-.24],[.087,-.06],[.066,.03]],shirt,[0,0,0]);
  const elbow=new T.Group();elbow.position.set(0,-.28,0);arm.add(elbow);elbows.push(elbow);
  profile(elbow,[[.04,-.24],[.052,-.15],[.057,.01]],skin,[0,0,0],.88);
  profile(elbow,[[.058,.02],[.07,.025],[.069,-.035],[.057,-.04]],C.ivory);
  sphere(elbow,skin,[0,-.29,.012],[.043,.071,.026]);
  for(let j=0;j<4;j++)sphere(elbow,skin,[(j-1.5)*.018,-.34,.017],[.009,.034-(Math.abs(j-1.5)*.004),.012]);
  sphere(elbow,skin,[-side*.045,-.283,.02],[.018,.037,.017]);
 }
 const head=new T.Group();head.position.set(0,1.59,0);body.add(head);
 const faceGeo=new T.SphereGeometry(1,28,20);const pos=faceGeo.attributes.position;
 for(let i=0;i<pos.count;i++){const y=pos.getY(i);if(y<0)pos.setX(i,pos.getX(i)*(.83+.17*(y+1)));}faceGeo.computeVertexNormals();
 add(head,faceGeo,skin,[0,0,0],[.153,.197,.14]);
 const eyes=[];
 for(const side of [-1,1]){
  sphere(head,skin,[side*.15,-.005,0],[.031,.052,.022]);
  const eye=new T.Group();eye.position.set(side*.061,.014,.123);head.add(eye);eyes.push(eye);
  sphere(eye,C.white,[0,0,0],[.039,.023,.013]);sphere(eye,C.iris,[0,-.001,.012],[.016,.021,.005]);sphere(eye,C.ink,[0,.001,.016],[.008,.015,.003]);sphere(eye,C.white,[-.006,.009,.019],[.005,.006,.002]);
  line(head,[[side*.022,.032,.13],[side*.06,.043,.132],[side*.101,.029,.115]],C.hair,.005);
  line(head,[[side*.028,.074,.119],[side*.065,.082,.127],[side*.102,.069,.11]],old?C.grey:C.hair,.006);
  if(old){line(head,[[side*.102,.01,.116],[side*.126,.018,.093]],C.leather,.0025);line(head,[[side*.104,-.006,.116],[side*.124,-.014,.097]],C.leather,.0025);}
 }
 sphere(head,skin,[0,-.025,.14],[.021,.039,.027]);
 line(head,[[-.027,-.091,.118],[0,-.097,.128],[.027,-.091,.118]],material(0x9a6b57),.0035);
 const hair=old?C.grey:C.hair;
 const cap=add(head,new T.SphereGeometry(1,26,18,0,Math.PI*2,0,Math.PI*.59),hair,[0,.008,-.008],[.163,.202,.15]);
 for(let j=0;j<9;j++){const x=(j-4)*.036;hairLock(head,[x,.15-Math.abs(x)*.18,.103],[x+.017*Math.sin(j),.042+Math.abs(x)*.15,.148-Math.abs(x)*.2],.032,hair,.02);}
 for(const side of [-1,1])hairLock(head,[side*.14,.1,.036],[side*.151,-.055,.02],.026,hair,.015);
 if(old){
  for(let j=0;j<7;j++)hairLock(head,[(j-3)*.023,-.085,.124],[(j-3)*.018,-.17+Math.abs(j-3)*.009,.107],.021,C.grey,.02);
  for(const side of [-1,1])sphere(head,C.grey,[side*.028,-.062,.151],[.037,.013,.012]);
  profile(head,[[0,.2],[.13,.25],[.27,.18],[.38,.135],[.4,.13]],material(0xd5bb80));
  for(let i=0;i<24;i++){const a=i*Math.PI/12;line(head,[[Math.sin(a)*.06,.24,Math.cos(a)*.06],[Math.sin(a)*.25,.185,Math.cos(a)*.25],[Math.sin(a)*.395,.13,Math.cos(a)*.395]],C.leather,.0025);}
  profile(head,[[.16,.233],[.17,.25],[.17,.265]],C.indigo);
 }else{
  // Soft backpack shape, separate flap, straps and notebook make a readable student silhouette.
  sphere(body,C.leather,[0,1.15,-.185],[.16,.225,.092]);sphere(body,C.gold,[0,1.29,-.22],[.165,.09,.075]);
  for(const side of [-1,1]){line(body,[[side*.15,.99,-.19],[side*.19,1.25,-.15],[side*.17,1.39,0],[side*.13,1.02,.15]],C.leather,.022);sphere(body,C.gold,[side*.085,1.14,-.27],[.018,.03,.008]);}
  const notebook=add(body,new T.BoxGeometry(.11,.16,.025),C.ivory,[.065,1.08,-.28]);notebook.rotation.z=-.1;
  const scarf=patch(body,[[0,1.36],[.07,1.31],[.045,1.18],[-.012,1.25]],C.gold);scarf.position.z=.17;
 }
 if(female){for(const side of [-1,1])sphere(head,C.hair,[side*.12,-.12,-.07],[.07,.2,.06]);}
 let pose='idle';
 return {group,head,arms,legs,elbows,body,height:1.88,setPose(p){pose=p;},animate(t,moving){
  const walk=moving?Math.sin(t*8):0;legs.forEach((l,i)=>l.rotation.x=walk*(i?-1:1)*.43);knees.forEach((k,i)=>k.rotation.x=moving?Math.max(0,Math.sin(t*8+i*Math.PI))*.55:0);
  arms.forEach((a,i)=>{a.rotation.x=moving?-walk*(i?-1:1)*.3:Math.sin(t*1.3+i)*.026;a.rotation.z=(i?1:-1)*.09;});elbows.forEach(e=>e.rotation.x=-.12);
  body.position.y=moving?Math.abs(walk)*.025:Math.sin(t*1.7)*.006;body.rotation.x=old?.045:0;
  head.rotation.y=Math.sin(t*.6)*.025;head.rotation.z=Math.sin(t*.4)*.015;
  const blink=(t%4.8)>4.62?.15:1;eyes.forEach(e=>e.scale.y=blink);
  if(pose==='work'){body.rotation.x=.28;body.position.y=-.12;arms.forEach(a=>a.rotation.x=-.75);elbows.forEach(e=>e.rotation.x=-.7);head.rotation.x=.25;}
  else if(pose==='talk'){arms[0].rotation.x=-.35-Math.sin(t*1.5)*.1;elbows[0].rotation.x=-.7;head.rotation.x=Math.sin(t*1.9)*.025;}
  else head.rotation.x=0;
 }};
}
