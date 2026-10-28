// A deliberately small educational model. Values are scenario settings, not agronomic advice.
export const clamp=(x,a,b)=>Math.min(b,Math.max(a,x));
export const round=x=>Math.round(x*10)/10;
export function makePlot(kind='west'){
  return {kind,moisture:kind==='east'?31:18,height:kind==='east'?10.4:7.4,health:kind==='east'?92:69,mulch:false,nutrient:70,water:0,history:[]};
}
export function applyToPlot(plot,action,amount=4){
  const p=structuredClone(plot);
  if(action==='water'){p.moisture=clamp(p.moisture+amount*2.3,0,65);p.water+=amount;}
  if(action==='mulch')p.mulch=true;
  if(action==='feed')p.nutrient=clamp(p.nutrient+12,0,100);
  if(action==='drain')p.moisture=Math.min(p.moisture,Math.max(22,p.moisture-10));
  return p;
}
export function stepPlot(plot,days,{rain=0,care='none'}={}){
  let p=structuredClone(plot);
  for(let d=0;d<days;d++){
    // care is a player's ongoing plan, applied before the day's weather and growth.
    if(care==='observe'&&p.moisture<22)p=applyToPlot(p,'water',3);
    if(care==='daily')p=applyToPlot(p,'water',4);
    if(care==='mulch'&&p.moisture<22)p=applyToPlot(p,'water',2);
    const rainToday=d===0?rain:0;
    p.moisture=clamp(p.moisture+rainToday,0,65);
    const dryness=Math.max(0,23-p.moisture),excess=Math.max(0,p.moisture-38);
    const comfort=clamp(1-dryness/20-excess/19,.08,1);
    p.height+=.42*comfort*(.84+p.nutrient*.002);
    p.health=clamp(p.health+(comfort-.67)*5,12,100);
    const loss=(p.kind==='east'?1.35:2.65)*(p.mulch?.58:1);
    p.moisture=Math.max(6,p.moisture-loss-Math.max(0,p.moisture-38)*(p.kind==='east'?.15:.32));
    p.history.push({height:round(p.height),moisture:round(p.moisture),health:round(p.health)});
  }
  return p;
}
export function reading(plot,{depth='root',time='morning'}={}){
  const surface=depth==='surface'?(plot.kind==='west'?6:4):0;
  const heat=time==='afternoon'?2.1:0;
  const base=Math.max(2,plot.moisture-surface-heat);
  return {moisture:round(base),points:[round(base-.7),round(base+.3),round(base+.4)],height:round(plot.height),depth,time};
}
export function condition(p){return p.moisture<22?'叶片略卷，土面偏干':p.moisture>38?'土面潮湿，低处有积水':'叶片舒展，土壤湿润';}
export function harvest(plots){
  const count=Math.round((plots.west.health+plots.east.health)/2);
  return {count,water:round(Object.values(plots).reduce((sum,p)=>sum+p.water,0)),west:round(plots.west.health),east:round(plots.east.health)};
}
