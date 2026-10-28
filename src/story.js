export const initial = () => ({version:2,phase:'arrival',planted:[],samples:[],talkedAI:false,question:'',messages:[],tool:null,test:null,days:0,plan:null,rainChoice:null,notes:'',position:[0,17],history:[]});
export const observations={west:{name:'西畦的土样',value:'18%',text:'根部附近 10 cm 深处，同一时段取三点：17%、18%、19%。沙粒较多，叶片微卷。'},east:{name:'东畦的土样',value:'32%',text:'用相同方法取三点：31%、32%、33%。土壤细软，青菜的叶片舒展。'},ditch:{name:'新修的田埂',value:'新沙土',text:'雨水冲刷出新旧土层的界线。西畦混入了修田埂时留下的沙土，两边保水可能不同。'}};
export const phases=['arrival','plant','discover','investigate','research','trial','findings','care','rain','harvest','ending','complete'];
export function goal(s){switch(s.phase){case'arrival':return ['一位在田里等你的人','沿着石径，去见周伯。','farmer'];case'plant':return ['把这一季种下去',s.planted.length?'还有一畦，等着你的种子。':'走进菜畦，亲手播下青菜。',s.planted.includes('west')?'east':'west'];case'discover':return ['第十二天 · 风带来的疑问','周伯站在田边，像在等你说些什么。','farmer'];case'investigate':return ['土壤里藏着线索','去两侧菜畦取样，也可以看看新田埂。',!s.samples.includes('west')?'west':!s.samples.includes('east')?'east':'ditch'];case'research':return ['和小禾商量一下','打开随身 AI，把两侧观测带给它。','ai'];case'trial':return ['让一个想法，在小块田里生长',s.tool?'回到西畦，只在标记的一小组使用工具。':'到工具棚，拿起你想试的工具。',s.tool?'west':'water'];case'findings':return ['让土地慢慢回答',s.days<3?'到树下长椅，继续照料并观察几天。':'小试验有了变化，去和周伯聊聊。',s.days<3?'bench':'farmer'];case'care':return ['这次，换你来照料','在田里采取行动；准备好后，到长椅继续这一季。',s.plan?'bench':'west'];case'rain':return ['一场雨之后','到田边看看。今天的决定，可以和昨天不同。','east'];case'harvest':return ['把这一季带回家','菜熟了，去收下你的青菜。','basket'];case'ending':return ['秋日饭桌，为你留了一个位置','周伯有句话想对你说。','farmer'];default:return ['下一季，田里再见','你可以继续散步，或打开这一季的手记。','journal'];}}
export function reply(question,attached,s){
 if(!attached||!s.samples.includes('west')||!s.samples.includes('east'))return '我想先听见土地的声音。两边的菜分别是什么样？如果你把同一时间、同样深度采到的两份土样记录带给我，我们就能一起比较。';
 if(/肥|养分/.test(question))return '养分也可能有影响，但现在还没有检测它。叶子小，不能直接等同于缺肥。水分记录有差别；你可以只补水，也可以只施肥，先在西畦选两小组，留一组按原样照料。你更想先验证哪种解释？';
 if(/虫|病/.test(question))return '暂时没看到虫斑，不代表完全没有虫害。可以看看叶背、换时间再观察。现在两侧的水分差异是一条线索；如果补水后没有改善，我们就要认真考虑其他解释。';
 if(/直接|答案|告诉我/.test(question))return '我可以帮你想办法，但最后得由你和周伯决定。18% 和 32% 说明两侧不同，还不能证明原因。先做一小块，留一小块不动；如果结果不支持你的想法，就改计划。土地不一定按我们的猜测生长。';
 if(/正常|标准|多少/.test(question))return '这里的数值不是通用标准，不同土壤和作物需要的水分不同。比起找一个“正确数字”，先看同一块田改变补水后有没有恢复，更能帮助这次判断。';
 if(/试|水|为什么|原因|样|记录|联系|建议|比较/.test(question))return '西畦 18%，东畦 32%。'+(s.samples.includes('ditch')?'你在田埂发现的新沙土，也可能影响保水。':'两侧保水可能不同，但土壤原因还值得继续调查。')+'我有个可试的想法：在西畦选长势相近的两组，一组少量补水，另一组照旧，其他条件尽量相同。过几天看株高和叶片。若没明显差别，就别急着认定是缺水。你愿意拿工具去试试吗？';
 return '这次我是本地规则模拟，还不能理解所有自由提问。不过，两侧的观测让我想追问：有什么小试验，能让我们区分“缺水”和“缺肥”？你可以问我怎样公平比较，也可以先和周伯聊聊。';
}
export function result(s){const base={zone:92,uniform:67,feed:48}[s.plan]??58;const n={pause:5,keep:-12,drain:1}[s.rainChoice]??0;return {count:Math.min(100,Math.max(0,base+n)),water:({zone:24,uniform:48,feed:18}[s.plan]??20)+({pause:0,keep:12,drain:4}[s.rainChoice]??0),supported:s.test==='water'};}
export function advance(s,type,id){const n=JSON.parse(JSON.stringify(s));let error=null;
 switch(type){
 case 'WELCOME':if(s.phase==='arrival')n.phase='plant';else error='先见见周伯。';break;
 case 'PLANT':if(s.phase!=='plant'||!['west','east'].includes(id))error='现在还不能播种。';else{if(!n.planted.includes(id))n.planted.push(id);if(n.planted.length===2)n.phase='discover';}break;
 case 'DISCOVER':if(s.phase==='discover')n.phase='investigate';else error='先看看田地。';break;
 case 'SAMPLE':if(s.phase!=='investigate'||!observations[id])error='先沿着线索调查。';else{if(!n.samples.includes(id))n.samples.push(id);if(n.samples.includes('west')&&n.samples.includes('east'))n.phase='research';}break;
 case 'CLUE':if(!observations[id])error='没有这条线索。';else if(!n.samples.includes(id))n.samples.push(id);break;
 case 'RESEARCH':if(s.phase!=='research'||!s.talkedAI)error='先把两侧记录带给小禾，讨论一个可以验证的想法。';else{n.talkedAI=true;n.phase='trial';}break;
 case 'TOOL':if(s.phase!=='trial'||!['water','feed'].includes(id))error='先确定要试的想法。';else n.tool=id;break;
 case 'TEST':if(s.phase!=='trial'||!s.tool)error='先到棚下拿一件工具。';else{n.test=s.tool;n.tool=null;n.phase='findings';n.days=0;}break;
 case 'WAIT':if(s.phase==='findings'&&s.days<3)n.days++;else if(s.phase==='care'&&s.plan)n.phase='rain';else error='还有事情要先做。';break;
 case 'FINDINGS':if(s.phase==='findings'&&s.days===3)n.phase='care';else error='让两组青菜再长几天。';break;
 case 'CARE':if(s.phase!=='care'||!['zone','uniform','feed'].includes(id))error='还没到这个时候。';else n.plan=id;break;
 case 'RAIN':if(s.phase!=='rain'||!['pause','keep','drain'].includes(id))error='先去看看雨后的田地。';else{n.rainChoice=id;n.phase='harvest';}break;
 case 'HARVEST':if(s.phase==='harvest')n.phase='ending';else error='还没到收获的时候。';break;
 case 'END':if(s.phase==='ending')n.phase='complete';else error='再和周伯说句话。';break;
 default:error='没有这个行动。';
 }if(error)return {state:s,error};n.history.push({type,id:id??null});return {state:n,error:null};}
export function restore(raw){try{const s=JSON.parse(raw);if(s.version!==2||!phases.includes(s.phase)||!Array.isArray(s.planted)||!Array.isArray(s.samples)||!Array.isArray(s.messages)||!Array.isArray(s.history)||!Array.isArray(s.position)||s.position.length!==2||!s.position.every(Number.isFinite))return null;if(s.samples.some(k=>!observations[k])||s.planted.some(k=>!['west','east'].includes(k)))return null;if(!Number.isInteger(s.days)||s.days<0||s.days>3||typeof s.notes!=='string'||typeof s.question!=='string')return null;for(const [key,values] of Object.entries({tool:['water','feed'],test:['water','feed'],plan:['zone','uniform','feed'],rainChoice:['pause','keep','drain']}))if(s[key]!==null&&!values.includes(s[key]))return null;if(s.messages.some(m=>!m||!['user','assistant'].includes(m.role)||typeof m.text!=='string'))return null;return {...initial(),...s};}catch{return null;}}
