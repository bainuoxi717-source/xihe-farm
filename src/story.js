import {makePlot,applyToPlot,stepPlot,reading,harvest,round} from './simulation.js';
export const phases=['arrival','plant','investigate','trial','care','rain','harvest','ending','complete'];
export const initial=()=>({version:3,phase:'arrival',day:1,position:[0,22],planted:[],clues:[],records:[],messages:[],notes:'',question:'',helpedSign:false,spoke:false,marked:[],tool:null,trial:null,trialDays:0,plans:{west:null,east:null},rainAction:null,plots:{west:makePlot(),east:makePlot('east')},memory:[],history:[],guide:false});
export const clues={
 sign:{title:'朝着路的木签',text:'“宁宁的菜畦”。背面还有一行褪色的小字：等你回来，一起收菜。',meaning:'周伯把字朝向村口。'},
 ditch:{title:'被雨冲开的土层',text:'新旧土颜色不同。西畦边缘能看到较粗的沙粒；它是否改变了保水，还需要比较。',meaning:'这是一种可能解释，需要验证。'},
 ledger:{title:'工具棚里的旧记录',text:'旧本子上，两畦曾用相同的方法照料。新田埂修好后，西畦开始比东畦更早干。',meaning:'过去的经验与现在的条件，可能不完全一样。'},
 stream:{title:'溪边的水痕',text:'石头上留着不同高度的水痕。一条浅沟绕过东畦，落叶堆在沟口。',meaning:'下次下雨，可以回来看看积水从哪里走。'},
 table:{title:'多留的一只碗',text:'晒场边摆着几只碗，其中一只新擦过。周伯说，女儿今年赶得上秋日饭桌。',meaning:'这一季，也是一份等人回家的约定。'}
};
export function goal(s){
  const map={arrival:[s.helpedSign?'扶正的木签，新的相识':'风把木签吹倒了','去田边认识周伯，也可以沿溪岸走走。','farmer'],plant:['给秋天留一个约定','和周伯一起，把两畦青菜种下。',s.planted.includes('west')?'east':'west'],investigate:['同一片田，两种长势','你想先看看叶片、土壤，还是过去的记录？','west'],trial:['让田地回应你的猜想',s.trial?'试验已经开始。去看看周伯，也可以继续观察。':'留下两组木签，决定先试什么。',s.trial?'farmer':s.marked.includes('trial')?'control':'trial'],care:['把发现带回整片田','两畦可以采用不同的照料办法。','west'],rain:['雨停以后，计划还适用吗','重新看一眼田地，再决定今天怎么做。','east'],harvest:['把这一季带回家','收下青菜，沿着石径去晒场。','basket'],ending:['饭桌上，多了你的位置','周伯在晒场等你。','table'],complete:['下个季节，田里再见','散散步，或把这一季的手记带走。','table']};
  return map[s.phase];
}
export function advance(s,type,payload){
  const n=structuredClone(s);let error=null;
  const validPlot=id=>['west','east'].includes(id);
  const discovery=()=>['investigate','trial','care','rain'].includes(s.phase);
  switch(type){
    case 'CLUE':if(!clues[payload])error='这里还没有可记录的发现。';else if(!n.clues.includes(payload)){n.clues.push(payload);n.memory.push(clues[payload].title);}break;
    case 'SIGN':n.helpedSign=true;if(!n.clues.includes('sign'))n.clues.push('sign');break;
    case 'WELCOME':if(s.phase==='arrival'){n.phase='plant';n.spoke=true;}else error='已经认识周伯了。';break;
    case 'PLANT':if(s.phase!=='plant'||!validPlot(payload))error='这一刻先看看别的事。';else {if(!n.planted.includes(payload))n.planted.push(payload);if(n.planted.length===2){n.phase='investigate';n.day=12;}}break;
    case 'MEASURE':if(!discovery()||!validPlot(payload?.plot)||!['root','surface'].includes(payload.depth)||!['morning','afternoon'].includes(payload.time))error='先走近一块菜畦，选择观察的位置。';else{const result=reading(n.plots[payload.plot],payload);n.records.push({id:n.records.length+1,plot:payload.plot,day:n.day,...result});n.records=n.records.slice(-60);}break;
    case 'START_TRIAL':if(s.phase==='investigate')n.phase='trial';else error='现在还不能布置新的试验。';break;
    case 'MARK':if(s.phase!=='trial'||s.trial||!['trial','control'].includes(payload))error='这组木签暂时不用再移动。';else if(!n.marked.includes(payload))n.marked.push(payload);break;
    case 'TOOL':if(s.phase!=='trial'||!['water','mulch','feed'].includes(payload)||s.trial)error='先把手边的观察完成。';else n.tool=payload;break;
    case 'TEST':if(s.phase!=='trial'||s.trial||!s.tool||s.marked.length!==2)error='先给两组插上木签，再带一件工具过来。';else{n.trial={action:s.tool,amount:[2,4,6,8].includes(payload)?payload:4,before:round(n.plots.west.height),rows:[]};n.plots.trial=applyToPlot(makePlot(),s.tool,n.trial.amount);n.plots.control=makePlot();n.tool=null;}break;
    case 'NEXT_DAY':if(s.phase!=='trial'||!s.trial||s.trialDays>=3)error='先完成眼前的小试验。';else{
      n.day+=2;n.trialDays++;
      for(const k of ['west','east'])n.plots[k]=stepPlot(n.plots[k],2);
      for(const k of ['trial','control']){let p=n.plots[k];if(k==='trial'&&n.trialDays>1&&n.trial.action==='water')p=applyToPlot(p,'water',n.trial.amount);n.plots[k]=stepPlot(p,2);}
      n.trial.rows.push({day:n.day,trial:round(n.plots.trial.height),control:round(n.plots.control.height),moisture:round(n.plots.trial.moisture)});
      if(n.trialDays===3)n.phase='care';
    }break;
    case 'CARE':if(s.phase!=='care'||!validPlot(payload?.plot)||!['observe','daily','mulch','feed'].includes(payload.plan))error='这一块田现在还不用安排整季照料。';else n.plans[payload.plot]=payload.plan;break;
    case 'TO_RAIN':if(s.phase!=='care'||Object.values(s.plans).some(p=>!p))error='先为两畦安排照料方式，准备好了再找周伯。';else{for(const k of ['west','east']){if(['mulch','feed'].includes(n.plans[k]))n.plots[k]=applyToPlot(n.plots[k],n.plans[k]);n.plots[k]=stepPlot(n.plots[k],6,{care:n.plans[k]});}for(const k of ['west','east'])n.plots[k]=stepPlot(n.plots[k],1,{rain:20});n.phase='rain';n.day=25;}break;
    case 'RAIN':if(s.phase!=='rain'||!['pause','drain','keep'].includes(payload))error='先看看雨后的田地。';else{n.rainAction=payload;for(const k of ['west','east']){if(payload==='drain')n.plots[k]=applyToPlot(n.plots[k],'drain');if(payload==='keep')n.plots[k]=applyToPlot(n.plots[k],'water',6);n.plots[k]=stepPlot(n.plots[k],3,{care:'none'});n.plots[k]=stepPlot(n.plots[k],7,{care:n.plans[k]});}n.day=35;n.phase='harvest';}break;
    case 'HARVEST':if(s.phase==='harvest')n.phase='ending';else error='还有一些日子，要一起照料。';break;
    case 'END':if(s.phase==='ending')n.phase='complete';else error='先和周伯说说这一季。';break;
    default:error='这个动作还没有准备好。';
  }
  if(error)return {state:s,error};
  n.history.push({day:n.day,type,payload:payload??null});n.history=n.history.slice(-120);
  return {state:n,error:null};
}
export const result=s=>harvest(s.plots);
// AI sees only explicitly attached evidence. Never pass hidden plot states or future weather here.
export function evidence(s,attached){return attached?{records:structuredClone(s.records),clues:s.clues.filter(k=>['ditch','ledger','stream'].includes(k)).map(k=>({id:k,text:clues[k].text})),trial:s.trial?structuredClone(s.trial.rows):[]}:{records:[],clues:[],trial:[]};}
export function reply(q,packet){
  if(!q.trim())return '你最想弄清楚的是哪一件事？';
  if(packet.trial.length&&/结果|差|支持|预测|改变|验证/.test(q)){const r=packet.trial.at(-1),diff=round(r.trial-r.control);return `你带来的第 ${r.day} 天记录里，试验组 ${r.trial} cm，照旧组 ${r.control} cm，相差 ${diff} cm。${Math.abs(diff)>.5?'这支持处理可能起作用，但还需要确认两组起点、位置和其他照料是否相近。':'目前差异不大，不足以把这个办法推广到整片田。'}你原来期待看到什么？下一次想复查哪一点？`;}
  const west=packet.records.filter(r=>r.plot==='west').at(-1),east=packet.records.filter(r=>r.plot==='east').at(-1);
  if(!west||!east)return '我还没有两侧可比较的记录。你可以把东、西畦在相同时间、相同深度的观察带来；也可以先告诉我你看见了什么。单凭“叶子蔫”，还不能确定原因。';
  if(west.day!==east.day||west.depth!==east.depth||west.time!==east.time)return `你带来的西畦 ${west.moisture}%、东畦 ${east.moisture}%，取样日期、时段或深度不同。这可能影响比较。要不要先补一组条件相同的记录？也可以先做小范围尝试，但要把这个不确定性留在手记里。`;
  if(/直接|答案|全浇|全部|照做/.test(q))return '我不会替你安排整片田。两侧不同是一条线索，原因还没有被验证。可以先选两小组，保留照旧组；看过几天的变化，再决定要不要扩大。';
  if(/肥|养分/.test(q))return `你还没有养分检测记录，所以“缺肥”仍是猜想。已知的是两侧水分读数不同。可以比较补水或少量施肥后的变化，一次只改一项；如果同时改两项，就难以区分是谁起作用。`;
  if(/雨|天气|积水/.test(q))return '我只能看到你附上的记录。下雨后，之前的计划可能需要调整。先重新测量，看看叶片和积水，再比较继续浇水、暂停或疏通水沟各自的理由。';
  if(/原因|为什么|水|试|比较|记录|建议|解释|怎样/.test(q))return `同样条件下，西畦 ${west.moisture}%、东畦 ${east.moisture}%。${packet.clues.some(c=>c.id==='ditch')?'你发现的新土层，提供了保水不同的解释。':'土壤保水、照料和取水位置都值得调查。'}这些还不是因果证明。一个可试的办法是：在西畦选两组起点相近的菜，只给其中一组补水，另一组照旧，隔几天比较。你也可以选择别的解释来验证。`;
  return '我是本地模拟伙伴，还不能理解所有提问。可以围绕已经附上的记录，问我“有哪些可能解释”“怎样比较”“结果支持什么”。我不会把还没观察到的事当成事实。';
}
export function restore(raw){
  try{const s=JSON.parse(raw);if(s.version!==3||!phases.includes(s.phase)||!Array.isArray(s.position)||s.position.length!==2||!s.position.every(Number.isFinite)||Math.abs(s.position[0])>100||Math.abs(s.position[1])>100)return null;
    if(!Number.isInteger(s.day)||s.day<1||s.day>35||!Number.isInteger(s.trialDays)||s.trialDays<0||s.trialDays>3)return null;
    for(const k of ['planted','clues','records','messages','marked','history','memory'])if(!Array.isArray(s[k]))return null;
    if(s.clues.some(k=>!clues[k])||s.planted.some(k=>!['west','east'].includes(k))||s.marked.some(k=>!['trial','control'].includes(k)))return null;
    if(typeof s.notes!=='string'||typeof s.question!=='string'||typeof s.guide!=='boolean')return null;
    if(!s.plans||Object.values(s.plans).some(p=>p!==null&&!['observe','daily','mulch','feed'].includes(p)))return null;
    if(!s.plots?.west||!s.plots?.east)return null;
    for(const p of Object.values(s.plots))if(!['west','east'].includes(p.kind)||!['moisture','height','health','water','nutrient'].every(k=>Number.isFinite(p[k])&&p[k]>=0)||p.moisture>65||p.health>100||!Array.isArray(p.history))return null;
    if(s.records.some(r=>!['west','east'].includes(r.plot)||!Number.isFinite(r.moisture)||!Number.isFinite(r.height)||!['root','surface'].includes(r.depth)||!['morning','afternoon'].includes(r.time)))return null;
    if(s.messages.some(m=>!['user','assistant'].includes(m.role)||typeof m.text!=='string'))return null;
    if(s.trial&&(!['water','mulch','feed'].includes(s.trial.action)||!Array.isArray(s.trial.rows)||!s.plots.trial||!s.plots.control))return null;
    if(s.tool!==null&&!['water','mulch','feed'].includes(s.tool))return null;
    if(['care','rain','harvest','ending','complete'].includes(s.phase)&&(!s.trial||s.trialDays!==3))return null;
    return {...initial(),...s};
  }catch{return null;}
}
