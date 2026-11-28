// ===== 1. SUPABASE CONFIGURATION =====
const SUPABASE_URL = 'https://pqtzhbpdgsqqgejxzpho.supabase.co';
const SUPABASE_KEY = 'sb_publishable_veLllK4Ar1C0RT_wu4S6ng_XHsAfDKD';
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// ===== 2. CONSTANTS & CONFIGURATIONS =====
const GRADES=[['A',90],['B',80],['C',70],['D',60],['E',50],['F',0]];
const CLASSES=[10,11,12].flatMap(g=>[...'ABCDE'].map(c=>g+c));
const MN=['មករា','កុម្ភៈ','មីនា','មេសា','ឧសភា','មិថុនា','កក្កដា','សីហា','កញ្ញា','តុលា','វិច្ឆិកា','ធ្នូ'];
const NAME={P:'មក',L:'យឺត',X:'អវត្តមាន'};

const cp=L=>L.map(x=>[...x]);
const G10=[['ភាសាខ្មែរ',150],['គណិតវិទ្យា',150],['រូបវិទ្យា',50],['គីមីវិទ្យា',37],['ជីវវិទ្យា',38],['ផែនដី និងបរិស្ថានវិទ្យា',25],['ប្រវត្តិវិទ្យា',37],['ភូមិវិទ្យា',38],['សីលធម៌-ពលរដ្ឋវិជ្ជា',38],['គេហវិទ្យា',37],['ភាសាបរទេស',100],['អប់រំកាយ កីឡា និងសុខភាព',50],['បំណិនជីវិតតាមមូលដ្ឋាន',50]];
const TBL=[['ភាសាខ្មែរ',75,125,75,125],['គណិតវិទ្យា',125,75,125,75],['រូបវិទ្យា',75,50,75,50],['គីមីវិទ្យា',75,50,75,50],['ជីវវិទ្យា',75,50,75,50],['ផែនដី និងបរិស្ថានវិទ្យា',50,50,50,50],['ភូមិវិទ្យា',50,75,50,75],['ប្រវត្តិវិទ្យា',50,75,50,75],['សីលធម៌-ពលរដ្ឋវិជ្ជា',50,75,50,75],['ភាសាបរទេស',50,50,50,50],['អប់រំកាយ កីឡា និងសុខភាព',50,50,50,50],['សេដ្ឋកិច្ច',50,50,50,50],['អប់រំជីវៈជម្រើស',50,50,50,50]];
const col=i=>TBL.filter(r=>r[i]!=null).map(r=>[r[0],r[i]]);
const OFF={'10':G10,'11-sci':col(1),'11-soc':col(2),'12-sci':col(3),'12-soc':col(4)};

const $=s=>document.querySelector(s);
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const kh=n=>String(n).replace(/\d/g,d=>'០១២៣៤៥៦៧៨៩'[d]);
const f1=v=>Math.round(v*10)/10;
const coef=mx=>Math.round(mx/50*100)/100;
const grade=v=>v==null?'-':GRADES.find(g=>v>=g[1])[0];
const badge=g=>g=='-'?'-':`<span class="g g${g}">${g}</span>`; const curM=()=>String(new Date().getMonth()+1).padStart(2,'0'); const today=()=>new Date().toISOString().slice(0,10);  let S=[],SC={},AT={},CT={},SUBJ={},editId=null,isT=true,lv='10',draggedIndex=null; const LV=[['10','ថ្នាក់ទី ១០'],['11-sci','ថ្នាក់ទី ១១ វិទ្យាសាស្ត្រ'],['11-soc','ថ្នាក់ទី ១១ សង្គម'],['12-sci','ថ្នាក់ទី ១២ វិទ្យាសាស្ត្រ'],['12-soc','ថ្នាក់ទី ១២ សង្គម']]; let SEM={'11':1,'12':1,'01':1,'02':1,'03':2,'04':2,'05':2,'06':2,'07':2,'08':2,'09':0,'10':0};  for(const k in OFF)SUBJ[k]=cp(OFF[k]);  // ===== 3. SUPABASE SYNC FUNCTIONS ===== async function syncFromSupabase() { try { const { data: dbStudents, error: errS } = await _supabase.from('students').select('*').order('id', { ascending: true }); if (!errS && dbStudents && dbStudents.length > 0) { S = dbStudents.map(s => ({ id: s.id, name: s.name, sex: s.sex, cls: s.cls })); }  const { data: dbScores, error: errSC } = await _supabase.from('scores_data').select('*'); if (!errSC && dbScores && dbScores.length > 0) { SC = {}; dbScores.forEach(r => { (SC[r.student_id] ??= {})[r.month] = r.scores \vert{}\vert{} {}; }); }  const { data: dbAtt, error: errAT } = await _supabase.from('attendance_data').select('*'); if (!errAT && dbAtt && dbAtt.length > 0) { AT = {}; dbAtt.forEach(r => { AT[r.student_id] = r.attendance \vert{}\vert{} {}; }); }  saveLocal(); render(); } catch (e) { console.warn('Supabase Offline / Error, falling back to LocalStorage', e); } }  // ===== 4. LOCALSTORAGE BACKUP ===== (function loadLocal(){ try{const d=JSON.parse(localStorage.getItem('sms4'));if(d&&d.S){({S,SC,AT}=d);SUBJ=d.SUBJ\vert{}\vert{}SUBJ;CT=d.CT\vert{}\vert{}{};SEM=d.SEM\vert{}\vert{}SEM;return}}catch(e){} S=[{id:1,name:'សុខ ចាន់ធា',sex:'ប្រុស',cls:'10B'},{id:2,name:'ចាន់ សុភា',sex:'ស្រី',cls:'10B'},{id:3,name:'លី វិចិត្រ',sex:'ប្រុស',cls:'10A'}]; S.forEach(s=>{SC[s.id]={[curM()]:Object.fromEntries(SUBJ['10'].map(([j,m],k)=>[j,Math.round(m*(.55+((s.id*17+k*13)\%40)/100))]))}}); })();  const saveLocal=()=>{try{localStorage.setItem('sms4',JSON.stringify({S,SC,AT,SUBJ,CT,SEM}))}catch(e){}}; const save=async (type, id)=>{ saveLocal(); if (type === 'student_add' && id) { const s = S.find(x => x.id === id); if(s) await _supabase.from('students').insert([{ id: s.id, name: s.name, sex: s.sex, cls: s.cls }]); } else if (type === 'student_update' && id) { const s = S.find(x => x.id === id); if(s) await _supabase.from('students').update({ name: s.name, sex: s.sex, cls: s.cls }).eq('id', id); } else if (type === 'student_delete' && id) { await _supabase.from('students').delete().eq('id', id); await _supabase.from('scores_data').delete().eq('student_id', id); await _supabase.from('attendance_data').delete().eq('student_id', id); } else if (type === 'scores' && id) { const m = mo(); await _supabase.from('scores_data').upsert({ student_id: id, month: m, scores: SC[id]?.[m] \vert{}\vert{} {} }, { onConflict: 'student_id,month' }); } else if (type === 'attendance' && id) { await _supabase.from('attendance_data').upsert({ student_id: id, attendance: AT[id] \vert{}\vert{} {} }, { onConflict: 'student_id' }); } };  // ===== 5. UI CORE & HELPERS ===== const mo=()=>$('#selMonth').value,cls=()=>$('#filterClass').value,sj=()=>$('#selSubj').value; const gOf=c=>String(c).slice(0,2),kOf=c=>gOf(c)=='10'?'10':gOf(c)+'-'+(CT[c]\vert{}\vert{}'sci'),subsG=k=>SUBJ[k]\vert{}\vert{}OFF[k]\vert{}\vert{}[],subs=s=>subsG(kOf(s.cls)),G=()=>cls()=='ALL'?null:kOf(cls());  const opts=CLASSES.map(c=>`<option>${c}</option>`).join('');
$('#studentClass').innerHTML=opts;$('#studentClass').value='10B';
$('#filterClass').innerHTML='<option value="ALL">ថ្នាក់ទាំងអស់</option>'+opts;
$('#selMonth').innerHTML=MN.map((n,i)=>`<option value="${String(i+1).padStart(2,'0')}">${n}</option>`).join(''); $('#selMonth').value=curM();$('#atDay').value=today();  function fillSubj(){const v=sj(),g=G();let L; if(g)L=subsG(g).map(x=>[x[0],` (${x[1]})`]);
  else{const seen=new Set();L=[];Object.values(SUBJ).forEach(a=>a.forEach(x=>{if(!seen.has(x[0])){seen.add(x[0]);L.push([x[0],''])}}))}
  $('#selSubj').innerHTML=`<option value="ALL">${g?'សរុបគ្រប់មុខវិជ្ជា':'ភាគរយសរុប'}</option>`+L.map(x=>`<option value="${esc(x[0])}">${esc(x[0])}${x[1]}</option>`).join('');
  $('#selSubj').value=L.some(x=>x[0]==v)?v:'ALL'}

const sc=id=>(SC[id]||{})[mo()]||{};
function pt(s,j=sj()){const o=sc(s.id),L=subs(s);
  if(j=='ALL'){let t=0,m=0,n=0;L.forEach(([x,mx])=>{if(typeof o[x]=='number'){t+=o[x];m+=mx;n++}});return n?{t,m}:null}
  const e=L.find(x=>x[0]==j);return e&&typeof o[j]=='number'?{t:o[j],m:e[1]}:null}
const val=(s,j)=>{const p=pt(s,j);return p?p.t/p.m*100:null};
function attMonth(id){const c={P:0,L:0,X:0};Object.entries(AT[id]||{}).forEach(([d,v])=>{if(d.slice(5,7)==mo())c[v]++});return c}
const inCls=()=>S.filter(s=>cls()=='ALL'||s.cls==cls());
function ranks(L){const o=L.filter(s=>val(s)!=null).sort((a,b)=>val(b)-val(a)),r={};
  o.forEach((s,i)=>r[s.id]=i&&val(s)==val(o[i-1])?r[o[i-1].id]:i+1);return r}
const tot=s=>{const p=pt(s,'ALL');return p?`<b>${p.t}</b> <small>/${p.m} · ${f1(p.t/p.m*100)}\% · ម.ភាគ ${(p.t*50/p.m).toFixed(2)}</small>`:'-'};

function switchRole(r){const T=r=='teacher';isT=T;
  $('#teacherArea').hidden=!T;$('#tabs').hidden=!T;$('#studentDashboard').hidden=T;$('#lblClass').hidden=!T;$('#lblSubj').hidden=!T;
  $('#btnTeacher').classList.toggle('on',T);$('#btnStudent').classList.toggle('on',!T);
  $('#headerTitle').textContent=T?'ប្រព័ន្ធគ្រប់គ្រងទិន្នន័យ និងពិន្ទុសិស្ស (សម្រាប់គ្រូបង្រៀន)':'ប្រព័ន្ធពិនិត្យមើលពិន្ទុសិក្សា (សម្រាប់សិស្សានុសិស្ស)';
  $('#headerDesc').textContent=T?'គ្រប់គ្រង បញ្ចូលពិន្ទុសិស្ស និងគណនាមធ្យមភាគដោយស្វ័យប្រវត្តិ។':'ស្វែងរក និងពិនិត្យមើលលទ្ធផលប្រឡងប្រចាំខែរបស់អ្នក។'}
function showTab(id){['pCard','pPeriod','pDash','pStu','pSc','pAt','officialSection','pBook'].forEach(x=>$('#'+x).hidden=x!=id);
  document.querySelectorAll('#tabs button').forEach(b=>b.classList.toggle('on',b.dataset.t==id))}
$('#tabs').onclick=e=>{const b=e.target.closest('button');if(b&&b.dataset.t)showTab(b.dataset.t)};
function render(){renderLv();fillSubj();renderGrid();renderAt();renderRest()}

function renderRest(){
  const C=inCls(),q=$('#q').value.trim().toLowerCase(),L=C.filter(s=>s.name.toLowerCase().includes(q)),R=ranks(C);
  const V=C.map(s=>val(s)).filter(v=>v!=null),m=V.length?V.reduce((a,b)=>a+b,0)/V.length:null;
  const pass=V.length?Math.round(V.filter(v=>v>=50).length/V.length*100)+'%':'-';
  const d=$('#atDay').value,mk=C.filter(s=>(AT[s.id]||{})[d]),ar=mk.length?Math.round(mk.filter(s=>AT[s.id][d]!='X').length/mk.length*100)+'%':'-';
  $('#stats').innerHTML=`<div class="stat"><span>សិស្សសរុប</span><b>${C.length}</b></div><div class="stat"><span>មធ្យមភាគ (%)</span><b>${m==null?'-':f1(m)}</b></div><div class="stat"><span>អត្រាជាប់ (≥៥០%)</span><b>${pass}</b></div><div class="stat"><span>វត្តមានថ្ងៃ ${esc(d)}</span><b>${ar}</b></div>`;
  $('#studentTableBody').innerHTML=L.length?L.map((s,i)=>{const p=pt(s),a=attMonth(s.id);return`<tr><td>${i+1}</td><td><b>${esc(s.name)}</b></td><td>${s.sex}</td><td>${s.cls}</td><td>${p?`<b>${p.t}</b><small>/${p.m}</small>`:'-'}</td><td>${badge(grade(val(s)))}</td><td>${a.X}${a.L?` <small>(យឺត ${a.L})</small>`:''}</td><td class="act"><button onclick="editStudent(${s.id})">កែ</button><button class="del" onclick="deleteStudent(${s.id})">លុប</button></td></tr>`}).join(''):'<tr><td colspan="8" class="empty">មិនទាន់មានសិស្ស</td></tr>';
  renderOfficial(C,R);renderBook();renderDash(C);renderPeriod();renderCard()}

function renderLv(){
  $('#lvTabs').innerHTML=LV.map(([k,n])=>`<button class="${k==lv?'on':''}" onclick="setLv('${k}')">${n}</button>`).join('');
  const cs=CLASSES.filter(c=>kOf(c)==lv),v=$('#scClass').value;
  $('#scClass').innerHTML='<option value="ALL">គ្រប់ថ្នាក់ក្នុងកម្រិតនេះ</option>'+cs.map(c=>`<option>${c}</option>`).join(''); $('#scClass').value=cs.includes(v)?v:'ALL'; $('#trackBox').innerHTML=CLASSES.filter(c=>gOf(c)!='10').map(c=>{const t=kOf(c).endsWith('soc');return`<label>${c}<select onchange="setCT('${c}',this.value)"><option value="sci" ${t?'':'selected'}>វិទ្យាសាស្ត្រ</option><option value="soc" ${t?'selected':''}>សង្គម</option></select></label>`}).join('')}
function setLv(k){lv=k;renderLv();renderGrid()}
function setCT(c,v){CT[c]=v;saveLocal();render()}

// ===== មុខងារ DRAG & DROP ចាប់អូសមុខវិជ្ជា និង SYNC គ្រប់ថ្នាក់ ( GLOBAL ORDER SYNC ) =====
function renderGrid(){
  const L=subsG(lv),T=L.reduce((a,x)=>a+x[1],0),cs=$('#scClass').value;
  const C=S.filter(s=>kOf(s.cls)==lv&&(cs=='ALL'||s.cls==cs));
  
  // បង្កើត HTML Drag & Drop ដោយផ្ទាល់លើ CHIPS
  $('#subjChips').innerHTML=L.map(([j,mx],k)=>`
    <span class="chip" 
          draggable="true" 
          ondragstart="handleDragStart(event, ${k})" 
          ondragover="handleDragOver(event)" 
          ondrop="handleDrop(event, ${k})"
          style="cursor:grab; user-select:none; display:inline-flex; align-items:center; gap:6px;">
      <b>⋮⋮</b> ${esc(j)} · ${mx} <small>(មេគុណ ${coef(mx)})</small>
      <button onclick="rmSubject(${k})" aria-label="លុប">✕</button
