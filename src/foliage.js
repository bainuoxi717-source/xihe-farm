import * as T from '../dist/vendor/three.module.js';
// Leaf silhouettes are authored as a small local texture, then arranged in 3D crowns.
export function addCanopies(scene,positions,ground,rand,time){
 const c=document.createElement('canvas');c.width=c.height=128;const ctx=c.getContext('2d');
 function leaf(x,y,length,angle){ctx.save();ctx.translate(x,y);ctx.rotate(angle);const g=ctx.createLinearGradient(-length*.3,0,length*.3,length);g.addColorStop(0,'#dce6a8');g.addColorStop(.5,'#a9c282');g.addColorStop(1,'#769b69');ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(0,0);ctx.bezierCurveTo(-length*.42,length*.25,-length*.32,length*.7,0,length);ctx.bezierCurveTo(length*.35,length*.67,length*.32,length*.28,0,0);ctx.fill();ctx.strokeStyle='#e3dfac6b';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(0,4);ctx.lineTo(0,length*.87);ctx.stroke();ctx.restore();}
 leaf(66,15,82,.03);leaf(65,51,57,.94);leaf(61,54,55,-.95);leaf(68,28,46,1.2);leaf(60,32,47,-1.2);
 const texture=new T.CanvasTexture(c);texture.colorSpace=T.SRGBColorSpace;
 const mat=new T.MeshStandardMaterial({map:texture,alphaTest:.45,side:T.DoubleSide,roughness:1,color:0xffffff});
 mat.onBeforeCompile=shader=>{shader.uniforms.windTime=time;shader.vertexShader='uniform float windTime;\n'+shader.vertexShader;shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\n transformed.x+=sin(windTime*.8+instanceMatrix[3].x*.3+instanceMatrix[3].z*.2)*.06;');};
 const count=positions.length*260,leaves=new T.InstancedMesh(new T.PlaneGeometry(.95,.95),mat,count);leaves.castShadow=leaves.receiveShadow=true;leaves.frustumCulled=false;scene.add(leaves);
 const branches=new T.InstancedMesh(new T.CylinderGeometry(.055,.11,1,7),new T.MeshStandardMaterial({color:0x796b52,roughness:1}),positions.length*6);branches.castShadow=true;scene.add(branches);
 const o=new T.Object3D(),up=new T.Vector3(0,1,0);let k=0;
 positions.forEach(([x,z,s],i)=>{
  for(let j=0;j<260;j++){
   const a=rand()*Math.PI*2,u=rand()*2-1,r=Math.pow(rand(),.25),cx=Math.cos(a)*Math.sqrt(1-u*u)*r*2.1,cz=Math.sin(a)*Math.sqrt(1-u*u)*r*1.9;
   o.position.set(x+cx*s,ground(x,z)+(3.9+u*r*1.35)*s,z+cz*s);o.rotation.set((rand()-.5)*2,rand()*Math.PI*2,(rand()-.5)*2);const size=s*(.65+rand()*.5);o.scale.setScalar(size);o.updateMatrix();leaves.setMatrixAt(k,o.matrix);const hue=i%7===0?0xbdaa65:i%5===0?0xc8bd7f:0xa9c49e;const col=new T.Color(hue).multiplyScalar(.82+rand()*.3);leaves.setColorAt(k,col);k++;
  }
  for(let j=0;j<6;j++){const a=j*2.4,from=new T.Vector3(x,ground(x,z)+(2.1+j*.14)*s,z),to=new T.Vector3(x+Math.cos(a)*1.5*s,ground(x,z)+(3.5+j*.12)*s,z+Math.sin(a)*1.4*s);const d=to.clone().sub(from);o.position.copy(from).add(to).multiplyScalar(.5);o.quaternion.setFromUnitVectors(up,d.clone().normalize());o.scale.set(s,d.length(),s);o.updateMatrix();branches.setMatrixAt(i*6+j,o.matrix);}
 });
 return {leaves,branches};
}
