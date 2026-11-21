// ===== 1. SUPABASE CONFIGURATION =====
const SUPABASE_URL = 'https://pqtzhbpdgsqqgejxzpho.supabase.co/rest/v1/.supabase.co';
const SUPABASE_KEY = 'sb_publishable_veLllK4Ar1C0RT_wu4S6ng_XHsAfDKD'; // ប្រើ Publishable Key ត្រង់នេះ
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// ===== 2. CONSTANTS & CONFIGURATIONS =====
const GRADES=[['A',90],['B',80],['C',70],['D',60],['E',50],['F',0]]; // និទ្ទេសតាម % នៃពិន្ទុអតិបរមា
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
const badge=g=>g=='-'?'-':`<span class="g g${g}">${g}</span>`;
const curM=()=>String(new Date().getMonth()+1).padStart(2,'0');
const today=()=>new Date().toISOString().slice(0,10);

let S=[],SC={},AT={},CT={},SUBJ={},editId=null,isT=true,lv='10';
const LV=[['10','ថ្នាក់ទី ១០'],['11-sci','ថ្នាក់ទី ១១ វិទ្យាសាស្ត្រ'],['11-soc','ថ្នាក់ទី ១១ សង្គម'],['12-sci','ថ្នាក់ទី ១២ វិទ្យាសាស្ត្រ'],['12-soc','ថ្នាក់ទី ១២ សង្គម']];
let SEM={'11':1,'12':1,'01':1,'02':1,'03':2,'04':2,'05':2,'06':2,'07':2,'08':2,'09':0,'10':0};

for(const k in OFF)SUBJ[k]=cp(OFF[k]);

// ===== 3. SUPABASE SYNC FUNCTIONS =====
async function syncFromSupabase() {
  try {
    const { data: dbStudents, error: errS } = await _supabase.from('students').select('*').order('id', { ascending: true });
    if (!errS && dbStudents && dbStudents.length > 0) {
      S = dbStudents.map(s => ({ id: s.id, name: s.name, sex: s.sex, cls: s.cls }));
    }

    const { data: dbScores, error: errSC } = await _supabase.from('scores_data').select('*');
    if (!errSC && dbScores && dbScores.length > 0) {
      SC = {};
      dbScores.forEach(r => {
        (SC[r.student_id] ??= {})[r.month] = r.scores || {};
      });
    }

    const { data: dbAtt, error: errAT } = await _supabase.from('attendance_data').select('*');
    if (!errAT && dbAtt && dbAtt.length > 0) {
      AT = {};
      dbAtt.forEach(r => {
        AT[r.student_id] = r.attendance || {};
      });
    }

    saveLocal();
    render();
  } catch (e) {
    console.warn('Supabase Offline / Error, falling back to LocalStorage', e);
  }
}

// ===== 4. LOCALSTORAGE BACKUP =====
(function loadLocal(){
  try{const d=JSON.parse(localStorage.getItem('sms4'));if(d&&d.S){({S,SC,AT}=d);SUBJ=d.SUBJ||SUBJ;CT=d.CT||{};SEM=d.SEM||SEM;return}}catch(e){}
  S=[{id:1,name:'សុខ ចាន់ធា',sex:'ប្រុស',cls:'10B'},{id:2,name:'ចាន់ សុភា',sex:'ស្រី',cls:'10B'},{id:3,name:'លី វិចិត្រ',sex:'ប្រុស',cls:'10A'}];
  S.forEach(s=>{SC[s.id]={[curM()]:Object.fromEntries(SUBJ['10'].map(([j,m],k)=>[j,Math.round(m*(.55+((s.id*17+k*13)%40)/100))]))}});
})();

const saveLocal=()=>{try{localStorage.setItem('sms4',JSON.stringify({S,SC,AT,SUBJ,CT,SEM}))}catch(e){}};
const save=async (type, id)=>{
  saveLocal();
  if (type === 'student_add' && id) {
    const s = S.find(x => x.id === id);
    if(s) await _supabase.from('students').insert([{ id: s.id, name: s.name, sex: s.sex, cls: s.cls }]);
  } else if (type === 'student_update' && id) {
    const s = S.find(x => x.id === id);
    if(s) await _supabase.from('students').update({ name: s.name, sex: s.sex, cls: s.cls }).eq('id', id);
  } else if (type === 'student_delete' && id) {
    await _supabase.from('students').delete().eq('id', id);
    await _supabase.from('scores_data').delete().eq('student_id', id);
    await _supabase.from('attendance_data').delete().eq('student_id', id);
  } else if (type === 'scores' && id) {
    const m = mo();
    await _supabase.from('scores_data').upsert({ student_id: id, month: m, scores: SC[id]?.[m] || {} }, { onConflict: 'student_id,month' });
  } else if (type === 'attendance' && id) {
    await _supabase.from('attendance_data').upsert({ student_id: id, attendance: AT[id] || {} }, { onConflict: 'student_id' });
  }
};

// ===== 5. UI CORE & HELPERS =====
const mo=()=>$('#selMonth').value,cls=()=>$('#filterClass').value,sj=()=>$('#selSubj').value;
const gOf=c=>String(c).slice(0,2),kOf=c=>gOf(c)=='10'?'10':gOf(c)+'-'+(CT[c]||'sci'),subsG=k=>SUBJ[k]||OFF[k]||[],subs=s=>subsG(kOf(s.cls)),G=()=>cls()=='ALL'?null:kOf(cls());

const opts=CLASSES.map(c=>`<option>${c}</option>`).join('');
$('#studentClass').innerHTML=opts;$('#studentClass').value='10B';
$('#filterClass').innerHTML='<option value="ALL">ថ្នាក់ទាំងអស់</option>'+opts;
$('#selMonth').innerHTML=MN.map((n,i)=>`<option value="${String(i+1).padStart(2,'0')}">${n}</option>`).join('');
$('#selMonth').value=curM();$('#atDay').value=today();

function fillSubj(){const v=sj(),g=G();let L;
  if(g)L=subsG(g).map(x=>[x[0],` (${x[1]})`]);
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
const tot=s=>{const p=pt(s,'ALL');return p?`<b>${p.t}</b> <small>/${p.m} · ${f1(p.t/p.m*100)}% · ម.ភាគ ${(p.t*50/p.m).toFixed(2)}</small>`:'-'};

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
  $('#scClass').innerHTML='<option value="ALL">គ្រប់ថ្នាក់ក្នុងកម្រិតនេះ</option>'+cs.map(c=>`<option>${c}</option>`).join('');
  $('#scClass').value=cs.includes(v)?v:'ALL';
  $('#trackBox').innerHTML=CLASSES.filter(c=>gOf(c)!='10').map(c=>{const t=kOf(c).endsWith('soc');return`<label>${c}<select onchange="setCT('${c}',this.value)"><option value="sci" ${t?'':'selected'}>វិទ្យាសាស្ត្រ</option><option value="soc" ${t?'selected':''}>សង្គម</option></select></label>`}).join('')}
function setLv(k){lv=k;renderLv();renderGrid()}
function setCT(c,v){CT[c]=v;saveLocal();render()}
function renderGrid(){const L=subsG(lv),T=L.reduce((a,x)=>a+x[1],0),cs=$('#scClass').value;
  const C=S.filter(s=>kOf(s.cls)==lv&&(cs=='ALL'||s.cls==cs));
  $('#subjChips').innerHTML=L.map(([j,mx],k)=>`<span class="chip">${esc(j)} · ${mx} <small>(មេគុណ ${coef(mx)})</small><button onclick="rmSubject(${k})" aria-label="លុប">✕</button></span>`).join('')+`<span class="chip"><b>ពិន្ទុសរុប ${T} · មេគុណសរុប ${coef(T)}</b></span>`;
  $('#scHead').innerHTML=`<tr><th>#</th><th>ឈ្មោះ</th><th>ថ្នាក់</th>${L.map(([j,mx])=>`<th>${esc(j)}<br><small>/${mx} · ×${coef(mx)}</small></th>`).join('')}<th>សរុប</th></tr>`;
  const none=CLASSES.some(c=>kOf(c)==lv)?'មិនមានសិស្សក្នុងកម្រិតនេះ':'មិនមានថ្នាក់ណាក្នុងកម្រិតនេះ — សូមកំណត់ឆាក់នៅខាងលើ';
  $('#scBody').innerHTML=C.length?C.map((s,i)=>{const o=sc(s.id);return`<tr><td>${i+1}</td><td>${esc(s.name)}</td><td>${s.cls}</td>${L.map(([j,mx],k)=>`<td><input class="num" type="number" min="0" max="${mx}" value="${o[j]??''}" onchange="setScore(${s.id},${k},this)"></td>`).join('')}<td id="av${s.id}">${tot(s)}</td></tr>`}).join(''):`<tr><td colspan="${L.length+4}" class="empty">${none}</td></tr>`}

function setScore(id,k,el){const [j,mx]=subsG(lv)[k],o=((SC[id]??={})[mo()]??={});
  if(el.value==='')delete o[j];else{o[j]=Math.min(mx,Math.max(0,Math.round(+el.value*10)/10));el.value=o[j]}
  save('scores', id);$('#av'+id).innerHTML=tot(S.find(s=>s.id==id));renderRest()}
function addSubject(){const g=lv;
  const v=$('#newSubj').value.trim(),mx=+$('#newMax').value;if(!v||!(mx>0))return alert('សូមបញ្ចូលឈ្មោះ និងពិន្ទុអតិបរមា');
  const L=SUBJ[g]??=cp(OFF[g]||[]);if(L.some(x=>x[0]==v))return;L.push([v,mx]);$('#newSubj').value='';$('#newMax').value='';saveLocal();render()}
function rmSubject(k){const g=lv,L=SUBJ[g]??=cp(OFF[g]||[]);if(!confirm('លុបមុខវិជ្ជា "'+L[k][0]+'" ចេញពី '+LV.find(x=>x[0]==g)[1]+'?'))return;L.splice(k,1);saveLocal();render()}

function renderAt(){const C=inCls(),d=$('#atDay').value,c={P:0,L:0,X:0,N:0};
  C.forEach(s=>c[(AT[s.id]||{})[d]||'N']++);
  $('#atStats').innerHTML=`<span class="chip">មក ${c.P}</span><span class="chip">យឺត ${c.L}</span><span class="chip">អវត្តមាន ${c.X}</span><span class="chip">មិនទាន់កត់ត្រា ${c.N}</span>`;
  $('#atBody').innerHTML=C.length?C.map((s,i)=>{const a=attMonth(s.id),v=(AT[s.id]||{})[d];return`<tr><td>${i+1}</td><td>${esc(s.name)}</td><td><span class="seg">${Object.keys(NAME).map(k=>`<button class="${k} ${v==k?'on':''}" onclick="setAt(${s.id},'${k}')">${NAME[k]}</button>`).join('')}</span></td><td>មក ${a.P} · យឺត ${a.L} · ខ្វះ ${a.X}</td></tr>`}).join(''):'<tr><td colspan="4" class="empty">មិនមានសិស្សក្នុងថ្នាក់នេះ</td></tr>'}
function setAt(id,v){const d=$('#atDay').value;if(!d)return;const o=AT[id]??={};if(o[d]==v)delete o[d];else o[d]=v;save('attendance', id);renderAt();renderRest()}
function allPresent(){const d=$('#atDay').value;if(!d)return;inCls().forEach(s=>{ (AT[s.id]??={})[d]='P'; save('attendance', s.id); });renderAt();renderRest()}

function renderOfficial(C,R){
  const g=G(),L=g?subsG(g):null;let mx='';
  if(L)mx=sj()=='ALL'?' (ពិន្ទុសរុប '+kh(L.reduce((a,x)=>a+x[1],0))+')':' (ពិន្ទុអតិបរមា '+kh((L.find(x=>x[0]==sj())||[0,''])[1])+')';
  $('#officialDocClass').textContent=`ពិន្ទុប្រឡងប្រចាំខែ ${MN[+mo()-1]} `+(g?'ថ្នាក់ទី '+kh(cls())+(g.includes('-')?' ('+(g.endsWith('soc')?'វិទ្យាសាស្ត្រសង្គម':'វិទ្យាសាស្ត្រ')+')':''):'គ្រប់ថ្នាក់');
  $('#officialSubj').textContent='មុខវិជ្ជា៖ '+(sj()=='ALL'?'គ្រប់មុខវិជ្ជា':sj())+mx+' ឆ្នាំសិក្សា ២០២៦-២០២៧';
  $('#offMonth').textContent=MN[+mo()-1];
  const H=['ល.រ','គោត្តនាម-នាម','ភេទ','សរុប','និទ្ទេស','ចំ.ថ្នាក់','ផ្សេងៗ'],W=[4,20,6,6,6,6,6];
  $('#officialHead').innerHTML='<tr>'+[...H,...H].map((h,i)=>`<th style="width:${W[i%7]}%">${h}</th>`).join('')+'</tr>';
  const half=Math.max(10,Math.ceil(C.length/2));
  const cell=(s,i)=>{if(!s)return'<td></td>'.repeat(7);const p=pt(s),v=val(s);return`<td>${kh(i+1)}</td><td class="nm">${esc(s.name)}</td><td>${s.sex=='ប្រុស'?'ប':'ស'}</td><td>${p?kh(f1(p.t)):''}</td><td>${v==null?'':grade(v)}</td><td>${v==null?'':kh(R[s.id])}</td><td></td>`};
  let rows='';for(let i=0;i<half;i++)rows+=`<tr>${cell(C[i],i)}${cell(C[i+half],i+half)}</tr>`;
  $('#officialTableBody').innerHTML=rows;
  const cnt={};GRADES.forEach(x=>cnt[x[0]]=0);C.forEach(s=>{const v=val(s);if(v!=null)cnt[grade(v)]++});
  const pair=x=>`<td class="gr">${x}</td><td>ចំនួន</td><td>${kh(cnt[x])}</td><td>នាក់</td>`;
  $('#sumTable').innerHTML=[['A','D'],['B','E'],['C','F']].map(p=>`<tr>${pair(p[0])}${pair(p[1])}</tr>`).join('')}

// ===== 6. DASHBOARD & REPORTS =====
function renderDash(C){
  const GC={A:'#2FA66F',B:'#3B82D6',C:'#6B63D6',D:'#D9A21B',E:'#E57C3A',F:'#D64545'};
  const none='<p class="empty">មិនទាន់មានពិន្ទុ</p>';
  const bar=(l,p,t,c)=>`<div class="br"><span>${l}</span><div class="bt"><i style="width:${Math.min(100,Math.max(0,p))}%;background:${c}"></i></div><b>${t}</b></div>`;
  const cnt={};GRADES.forEach(x=>cnt[x[0]]=0);C.forEach(s=>{const v=val(s);if(v!=null)cnt[grade(v)]++});
  const mxc=Math.max(1,...Object.values(cnt));
  $('#dGrades').innerHTML=GRADES.map(([g])=>bar(g,cnt[g]/mxc*100,cnt[g]+' នាក់',GC[g])).join('');
  const rows=CLASSES.map(c=>{const V=S.filter(s=>s.cls==c).map(s=>val(s)).filter(v=>v!=null);return V.length?[c,V.reduce((a,b)=>a+b,0)/V.length]:null}).filter(Boolean);
  $('#dClass').innerHTML=rows.length?rows.map(([c,a])=>bar(c,a,f1(a)+'%',a>=50?'#3B82D6':'#D64545')).join(''):none;
  const T=C.filter(s=>val(s)!=null).sort((a,b)=>val(b)-val(a)).slice(0,5);
  $('#dTop').innerHTML=T.length?'<ol class="top5">'+T.map(s=>`<li><span><b>${esc(s.name)}</b><small>ថ្នាក់ ${s.cls}</small></span><em>${f1(val(s))}%</em></li>`).join('')+'</ol>':none;
  const d=$('#atDay').value,c={P:0,L:0,X:0,N:0};C.forEach(s=>c[(AT[s.id]||{})[d]||'N']++);
  const n=C.length||1,AC={P:'#17795A',L:'#B7791F',X:'#B42318'};
  $('#dAtt').innerHTML=`<p class="hint">ថ្ងៃទី ${esc(d)}</p><div class="abar">${Object.keys(AC).map(k=>`<i style="width:${c[k]/n*100}%;background:${AC[k]}"></i>`).join('')}</div><div class="chips" style="margin-top:12px"><span class="chip">មក ${c.P}</span><span class="chip">យឺត ${c.L}</span><span class="chip">អវត្តមាន ${c.X}</span><span class="chip">មិនទាន់កត់ត្រា ${c.N}</span></div>`}

const avgOf=a=>a.reduce((x,y)=>x+y,0)/a.length;
const monthRes=(s,m)=>{const o=(SC[s.id]||{})[m]||{};let t=0,mx=0,n=0;
  subs(s).forEach(([j,x])=>{if(typeof o[j]=='number'){t+=o[j];mx+=x;n++}});
  return n?{t,m:mx,pct:t/mx*100,avg:t*50/mx}:null};
const combine=L=>L.length?{t:avgOf(L.map(x=>x.t)),m:avgOf(L.map(x=>x.m)),pct:avgOf(L.map(x=>x.pct)),avg:avgOf(L.map(x=>x.avg))}:null;
const semMonths=k=>Object.keys(SEM).filter(m=>SEM[m]==k).sort();
const semRes=(s,k)=>combine(semMonths(k).map(m=>monthRes(s,m)).filter(Boolean));
function periodRes(s,T){
  if(T=='month')return monthRes(s,mo());
  if(T=='s1'||T=='s2')return semRes(s,T=='s1'?1:2);
  return combine([semRes(s,1),semRes(s,2)].filter(Boolean))}
function renderSem(){
  $('#semBox').innerHTML=Object.keys(SEM).sort().map(m=>`<label>${MN[+m-1]}<select onchange="setSem('${m}',this.value)">${[[1,'ឆមាសទី១'],[2,'ឆមាសទី២'],[0,'មិនរាប់']].map(([v,n])=>`<option value="${v}" ${SEM[m]==v?'selected':''}>${n}</option>`).join('')}</select></label>`).join('')}
function setSem(m,v){SEM[m]=+v;saveLocal();renderPeriod()}
function renderPeriod(){
  const c=cls(),ok=c!='ALL',T=$('#perType').value;
  $('#perEmpty').hidden=ok;$('#perPaper').hidden=!ok;
  if(!ok)return;
  const C=S.filter(s=>s.cls==c).map(s=>({s,r:periodRes(s,T)}));
  const ord=C.filter(x=>x.r).sort((a,b)=>b.r.pct-a.r.pct);
  ord.forEach((x,i)=>x.rank=i&&x.r.pct==ord[i-1].r.pct?ord[i-1].rank:i+1);
  const all=[...ord,...C.filter(x=>!x.r)];
  const nm={month:'ប្រចាំខែ'+MN[+mo()-1],s1:'ប្រចាំឆមាសទី១',s2:'ប្រចាំឆមាសទី២',year:'ប្រចាំឆ្នាំ'}[T];
  $('#perTitle').textContent='ប្រកាសលទ្ធផល'+nm;
  $('#perClass').textContent='ថ្នាក់ទី '+kh(c)+' · ឆ្នាំសិក្សា ២០២៦-២០២៧';
  const H=['ល.រ','គោត្តនាម-នាម','ភេទ','ពិ.សរុប','ម.ភាគ','ចំ.ថ្នាក់','និទ្ទេស'],W=[5,23,6,8,8,7,7];
  $('#perHead').innerHTML='<tr>'+[...H,...H].map((h,i)=>`<th style="width:${W[i%7]}%">${h}</th>`).join('')+'</tr>';
  const half=Math.max(10,Math.ceil(all.length/2));
  const cell=(x,i)=>{if(!x)return'<td></td>'.repeat(7);const r=x.r;
    return`<td>${i+1}</td><td class="nm">${esc(x.s.name)}</td><td>${x.s.sex}</td><td>${r?f1(r.t):''}</td><td>${r?r.avg.toFixed(2):''}</td><td>${r?x.rank:''}</td><td>${r?badge(grade(r.pct)):''}</td>`};
  let rows='';for(let i=0;i<half;i++)rows+=`<tr>${cell(all[i],i)}${cell(all[i+half],i+half)}</tr>`;
  $('#perBody').innerHTML=rows;
  const sc2=ord,pass=sc2.filter(x=>x.r.pct>=50),fail=sc2.filter(x=>x.r.pct<50),fem=x=>x.s.sex=='ស្រី';
  const gc={};GRADES.forEach(([k])=>gc[k]=0);sc2.forEach(x=>gc[grade(x.r.pct)]++);
  $('#perStat').innerHTML=
    `<div>សិស្សសរុប ${kh(C.length)} នាក់ ស្រី ${kh(C.filter(fem).length)} នាក់</div>`
   +`<div>ជាប់មធ្យមភាគ ${kh(pass.length)} នាក់ ស្រី ${kh(pass.filter(fem).length)} នាក់</div>`
   +`<div>ធ្លាក់មធ្យមភាគ ${kh(fail.length)} នាក់ ស្រី ${kh(fail.filter(fem).length)} នាក់</div>`
   +`<div>និទ្ទេស ${GRADES.map(([k])=>`${k}៖${kh(gc[k])}`).join(' · ')}</div>`}

const monthSc=(s,m,j)=>{const v=((SC[s.id]||{})[m]||{})[j];return typeof v=='number'?v:null};
const meanOf=a=>{a=a.filter(v=>v!=null);return a.length?avgOf(a):null};
const semSc=(s,k,j)=>meanOf(semMonths(k).map(m=>monthSc(s,m,j)));
const perSc=(s,T,j)=>T=='month'?monthSc(s,mo(),j):T=='s1'?semSc(s,1,j):T=='s2'?semSc(s,2,j):meanOf([semSc(s,1,j),semSc(s,2,j)]);
function cardRes(s,T){let t=0,m=0,n=0;
  const rows=subs(s).map(([j,mx])=>{const v=perSc(s,T,j);if(v!=null){t+=v;m+=mx;n++}return{j,mx,v}});
  return n?{rows,t,m,n,pct:t/m*100,avg:t*50/m,mavg:50}:{rows,n:0}}
function cardRank(s,T){const me=cardRes(s,T);if(!me.n)return null;
  return 1+S.filter(x=>x.cls==s.cls).filter(x=>{const r=cardRes(x,T);return r.n&&r.pct>me.pct}).length}
function attPer(id,T){
  const M=T=='month'?[mo()]:T=='s1'?semMonths(1):T=='s2'?semMonths(2):[...semMonths(1),...semMonths(2)];
  const c={X:0,L:0};Object.entries(AT[id]||{}).forEach(([d,v])=>{if(M.includes(d.slice(5,7))&&c[v]!=null)c[v]++});return c}
function cardHtml(s,T){
  const r=cardRes(s,T),n=S.filter(x=>x.cls==s.cls).length,rk=cardRank(s,T),a=attPer(s.id,T);
  const nm={month:'ប្រចាំខែ'+MN[+mo()-1],s1:'ប្រចាំឆមាសទី១',s2:'ប្រចាំឆមាសទី២',year:'ប្រចាំឆ្នាំ'}[T];
  const body=r.rows.map(({j,mx,v},i)=>{const g=v==null?null:grade(v/mx*100);
    return`<tr><td>${kh(i+1)}</td><td class="nm">${esc(j)}</td><td>${mx}</td><td>${v==null?'':f1(v)}</td>${GRADES.map(([k])=>`<td>${g==k?'✓':''}</td>`).join('')}</tr>`}).join('');
  const sign='ថ្ងៃទី.......ខែ.......ឆ្នាំ........';
  return`<div class="paper-page rc-page">
<div class="bk-top"><div class="bk-l">មន្ទីរអប់រំ យុវជន និង កីឡាខេត្តកណ្ដាល<br>ការិយាល័យអប់រំ យុវជន និង កីឡាស្រុកកៀនស្វាយ<br>វិទ្យាល័យសាន់នីវូសំរោងធំ</div><div class="bk-r">ព្រះរាជាណាចក្រកម្ពុជា<br>ជាតិ សាសនា ព្រះមហាក្សត្រ</div></div>
<div class="doc-title"><h2>លទ្ធផលនៃការសិក្សា${nm}</h2><h3>ឆ្នាំសិក្សា ២០២៦-២០២៧</h3></div>
<div class="rc-info">សិស្សឈ្មោះ៖ <b>${esc(s.name)}</b> &nbsp; ភេទ <b>${s.sex}</b> &nbsp; ថ្នាក់ទី <b>${kh(s.cls)}</b> &nbsp; សិស្សសរុប <b>${kh(n)}</b> នាក់</div>
<table class="score-table rc-table"><thead><tr><th rowspan="2">ល.រ</th><th rowspan="2">មុខវិជ្ជា</th><th colspan="2">ពិន្ទុតាមមុខវិជ្ជា</th><th colspan="6">និទ្ទេសតាមមុខវិជ្ជា</th></tr>
<tr><th>ពិន្ទុអតិបរមា</th><th>ពិន្ទុទទួលបាន</th>${GRADES.map(([k])=>`<th>${k}</th>`).join('')}</tr></thead><tbody>${body}
<tr><td colspan="2">ពិន្ទុសរុប</td><td>${r.n?f1(r.m):''}</td><td>${r.n?f1(r.t):''}</td><td colspan="2" rowspan="2">វត្តមាន</td><td colspan="2">អវត្តមាន</td><td>${a.X}</td><td>ដង</td></tr>
<tr><td colspan="2">មធ្យមភាគ</td><td>${r.n?r.mavg.toFixed(2):''}</td><td>${r.n?r.avg.toFixed(2):''}</td><td colspan="2">យឺត</td><td>${a.L}</td><td>ដង</td></tr>
<tr><td colspan="2">ចំណាត់ថ្នាក់</td><td colspan="2">${rk??''}</td><td colspan="2">និទ្ទេសរួម</td><td colspan="4">${r.n?`<b>${grade(r.pct)}</b> (${f1(r.pct)}%)`:''}</td></tr></tbody></table>
<div class="rc-foot"><div class="signature-block" contenteditable="true">បានឃើញ និងឯកភាព<br>${sign}<br><b>នាយកវិទ្យាល័យ</b></div><div class="signature-block" contenteditable="true">${sign}<br><b>គ្រូទទួលបន្ទុកថ្នាក់</b><div class="name-line">ឈ្មោះគ្រូ</div></div></div>
<div class="rc-note">មតិមាតាបិតា ឬ អាណាព្យាបាល៖<i></i><i></i><i></i></div></div>`}
function renderCard(){
  const T=$('#rcType').value,C=inCls(),sel=$('#rcStu'),v=sel.value;
  sel.innerHTML=(cls()!='ALL'?`<option value="ALL">ទាំងថ្នាក់ (${C.length} នាក់)</option>`:'')+C.map(s=>`<option value="${s.id}">${esc(s.name)} · ${s.cls}</option>`).join('');
  sel.value=[...sel.options].some(o=>o.value==v)?v:(sel.options[0]?sel.options[0].value:'');
  const L=sel.value=='ALL'?C:C.filter(s=>s.id==sel.value);
  $('#rcBox').innerHTML=L.length?L.map(s=>cardHtml(s,T)).join(''):'<p class="empty">មិនមានសិស្ស</p>'}

function renderBook(){
  const c=cls(),ok=c!='ALL';
  $('#bkEmpty').hidden=ok;$('#bkPaper').hidden=!ok;
  if(!ok)return;
  const L=subsG(kOf(c)),C=S.filter(s=>s.cls==c);

  const rows=C.map(s=>{
    const o=sc(s.id),p=pt(s,'ALL'),a=attMonth(s.id);
    const n=L.filter(([j])=>typeof o[j]=='number').length;
    return{s,o,p,a,pct:p?p.t/p.m*100:null,avg:p?p.t*50/p.m:null}});
  const ord=rows.filter(r=>r.pct!=null).sort((a,b)=>b.pct-a.pct);
  ord.forEach((r,i)=>r.rank=i&&r.pct==ord[i-1].pct?ord[i-1].rank:i+1);

  $('#bkTitle').textContent=`បញ្ជីពិន្ទុប្រឡងប្រចាំខែ ${MN[+mo()-1]} ថ្នាក់ទី ${kh(c)}`;

  const head=`<thead><tr><th rowspan="2">ល.រ</th><th rowspan="2">គោត្តនាម-នាម</th><th rowspan="2">ភេទ</th>`
    +L.map(([j])=>`<th rowspan="2" class="v"><span>${esc(j)}</span></th><th rowspan="2" class="v"><span>និទ្ទេស</span></th>`).join('')
    +`<th rowspan="2" class="v"><span>ពិន្ទុសរុប</span></th><th rowspan="2" class="v"><span>មធ្យមភាគ</span></th><th rowspan="2" class="v"><span>ចំណាត់ថ្នាក់</span></th><th rowspan="2" class="v"><span>និទ្ទេស</span></th><th colspan="2">អវត្តមាន</th></tr>`
    +`<tr><th>ខ្វះ</th><th>យឺត</th></tr></thead>`;
  const body='<tbody>'+rows.map((r,i)=>`<tr><td>${i+1}</td><td class="nm">${esc(r.s.name)}</td><td>${r.s.sex}</td>`
    +L.map(([j,mx])=>{const v=r.o[j];return typeof v=='number'?`<td>${v}</td><td>${badge(grade(v/mx*100))}</td>`:'<td></td><td></td>'}).join('')
    +`<td><b>${r.p?f1(r.p.t):''}</b></td><td>${r.avg==null?'':r.avg.toFixed(2)}</td><td>${r.rank??''}</td><td>${r.pct==null?'':badge(grade(r.pct))}</td><td>${r.a.X}</td><td>${r.a.L}</td></tr>`).join('')+'</tbody>';
  $('#bkTable').innerHTML=head+body;

  const fem=r=>r.s.sex=='ស្រី';
  const scored=rows.filter(r=>r.pct!=null),pass=scored.filter(r=>r.pct>=50),fail=scored.filter(r=>r.pct<50);
  $('#bkStat').innerHTML=
    `<div>សិស្សសរុប ${kh(rows.length)} នាក់ ស្រី ${kh(rows.filter(fem).length)} នាក់</div>`
   +`<div>ជាប់មធ្យមភាគ ${kh(pass.length)} នាក់ ស្រី ${kh(pass.filter(fem).length)} នាក់</div>`
   +`<div>ធ្លាក់មធ្យមភាគ ${kh(fail.length)} នាក់ ស្រី ${kh(fail.filter(fem).length)} នាក់</div>`;

  const cnt=L.map(([j,mx])=>{const k={};GRADES.forEach(x=>k[x[0]]=0);
    rows.forEach(r=>{const v=r.o[j];if(typeof v=='number')k[grade(v/mx*100)]++});return k});
  $('#bkMatrix').innerHTML=`<tr><th></th>${L.map(([j])=>`<th class="v"><span>${esc(j)}</span></th>`).join('')}</tr>`
    +GRADES.map(([gl])=>`<tr><th>${badge(gl)}</th>${cnt.map(k=>`<td>${kh(k[gl])}</td>`).join('')}</tr>`).join('');
}

// ===== 7. FORM HANDLERS & CRUD =====
$('#studentForm').addEventListener('submit', async e => {
  e.preventDefault();
  const o = { name: $('#studentName').value.trim(), sex: $('#studentGender').value, cls: $('#studentClass').value };
  if (!o.name) return;
  if (editId) {
    Object.assign(S.find(s => s.id == editId), o);
    await save('student_update', editId);
  } else {
    const newId = S.length ? Math.max(...S.map(s => s.id)) + 1 : 1;
    S.push({ id: newId, ...o });
    await save('student_add', newId);
  }
  resetForm();
  render();
});

function resetForm(){editId=null;$('#studentForm').reset();$('#studentClass').value='10B';$('#formTitle').textContent='បន្ថែមសិស្សថ្មី';$('#saveBtn').textContent='បន្ថែមសិស្ស';$('#cancelBtn').hidden=true}
function editStudent(id){const s=S.find(x=>x.id==id);if(!s)return;editId=id;
  $('#studentName').value=s.name;$('#studentGender').value=s.sex;$('#studentClass').value=s.cls;
  $('#formTitle').textContent='កែព័ត៌មានសិស្ស';$('#saveBtn').textContent='រក្សាទុកការកែប្រែ';$('#cancelBtn').hidden=false;
  $('#studentForm').scrollIntoView({behavior:'smooth',block:'center'});$('#studentName').focus()}

async function deleteStudent(id) {
  if (!confirm('លុបសិស្សនេះ រួមទាំងពិន្ទុ និងវត្តមាន?')) return;
  S = S.filter(s => s.id != id);
  delete SC[id];
  delete AT[id];
  if (editId == id) resetForm();
  await save('student_delete', id);
  render();
}

function searchStudentResult(){
  const q=$('#searchStudentName').value.trim().toLowerCase(),box=$('#studentResultDisplay');
  if(!q){box.innerHTML='<p class="empty">សូមវាយឈ្មោះសិស្ស</p>';return}
  const M=S.filter(s=>s.name.toLowerCase().includes(q)).slice(0,5);
  box.innerHTML=M.length?M.map(s=>{const o=sc(s.id),a=attMonth(s.id),p=pt(s,'ALL'),v=val(s,'ALL');
    return`<div class="res"><h3>${esc(s.name)} · ថ្នាក់ ${s.cls} · ខែ ${MN[+mo()-1]}</h3><div class="rg">${subs(s).map(([j,mx])=>`<div><span>${esc(j)}</span><b>${o[j]??'-'}</b><small>/${mx}</small></div>`).join('')}<div><span>សរុប</span><b>${p?p.t:'-'}</b>${p?`<small>/${p.m}</small>`:''}</div><div><span>ភាគរយ</span><b>${v==null?'-':f1(v)+'%'}</b></div><div><span>និទ្ទេស</span>${badge(grade(v))}</div></div><p class="hint" style="margin-top:8px">វត្តមានក្នុងខែ៖ មក ${a.P} · យឺត ${a.L} · អវត្តមាន ${a.X}</p></div>`}).join(''):'<p class="empty">រកមិនឃើញសិស្សឈ្មោះនេះទេ</p>'}

function exportToExcel(){const C=inCls(),R=ranks(C),g=G();
  const names=g?subsG(g).map(x=>x[0]):[...new Set(C.flatMap(s=>subs(s).map(x=>x[0])))];
  const rows=[['ល.រ','ឈ្មោះ','ភេទ','ថ្នាក់',...names.map(n=>g?`${n} (${subsG(g).find(x=>x[0]==n)[1]})`:n),'សរុប','អតិបរមា','ភាគរយ','និទ្ទេស','ចំ.ថ្នាក់','អវត្តមាន']];
  C.forEach((s,i)=>{const o=sc(s.id),p=pt(s,'ALL'),v=val(s,'ALL');rows.push([i+1,s.name,s.sex,s.cls,...names.map(n=>o[n]??''),p?p.t:'',p?p.m:'',v==null?'':f1(v),v==null?'':grade(v),R[s.id]??'',attMonth(s.id).X])});
  const t=rows.map(r=>r.map(x=>`"${String(x).replace(/"/g,'""')}"`).join(',')).join('\r\n');
  const a=document.createElement('a');a.href=URL.createObjectURL(new Blob(['\uFEFF'+t],{type:'text/csv'}));a.download=`ពិន្ទុសិស្ស-${MN[+mo()-1]}.csv`;a.click()}

function resetSubj(){const g=lv;if(!confirm('ស្ដារមុខវិជ្ជា និងពិន្ទុអតិបរមាតាមរបបផ្លូវការ?'))return;SUBJ[g]=cp(OFF[g]);saveLocal();render()}

// ===== 8. INITIALIZATION =====
renderSem();
switchRole('teacher');
showTab('pDash');
render();
syncFromSupabase(); // ស្ទូច Data ពី Supabase នៅពេល App បើកដំបូង

// ===== មុខងារ Sync Data ពី Local ទៅ Supabase (Update ថ្មី) =====
async function pushAllToSupabase() {
  alert("កំពុងបញ្ជូនទិន្នន័យទៅ Supabase... សូមរង់ចាំមួយភ្លែត!");
  try {
    // ១. ស្វែងរក Array សិស្ស (ទោះជាឈ្មោះ S ឬ students)
    let studentArray = (typeof S !== 'undefined' && Array.isArray(S)) ? S : 
                       (typeof students !== 'undefined' && Array.isArray(students)) ? students : [];

    if (studentArray.length === 0) {
      alert("មិនមានទិន្នន័យសិស្សក្នុង LocalStorage សម្រាប់ Sync ទេ!");
      return;
    }

    // ២. រៀបចំទិន្នន័យសិស្ស ដោយបំប្លែង ID ឱ្យទៅជា Integer
    const formattedStudents = studentArray.map((s, idx) => {
      let numericId = parseInt(s.id, 10);
      if (isNaN(numericId)) numericId = idx + 1; // ប្រសិនបើ ID មិនមែនជាលេខ វានឹងបង្កើតលេខលំដាប់ 1, 2, 3...
      return {
        id: numericId,
        name: String(s.name || ''),
        sex: String(s.sex || 'ប្រុស'),
        cls: String(s.cls || s.class || '')
      };
    });

    // ៣. Push ចូល Table students
    const { data, error: e1 } = await _supabase.from('students').upsert(formattedStudents);
    if (e1) {
      console.error("Supabase Insert Error:", e1);
      alert("មានបញ្ហា Insert សិស្ស៖ " + e1.message);
      return;
    }

    // ៤. Push ពិន្ទុ (ប្រសិនបើមាន)
    if (typeof SC !== 'undefined') {
      for (const id in SC) {
        let numId = parseInt(id, 10);
        if (!isNaN(numId)) {
          for (const m in SC[id]) {
            await _supabase.from('scores_data').upsert({ student_id: numId, month: m, scores: SC[id][m] });
          }
        }
      }
    }

    // ៥. Push វត្តមាន (ប្រសិនបើមាន)
    if (typeof AT !== 'undefined') {
      for (const id in AT) {
        let numId = parseInt(id, 10);
        if (!isNaN(numId)) {
          await _supabase.from('attendance_data').upsert({ student_id: numId, attendance: AT[id] });
        }
      }
    }

    alert(" បញ្ជូនទិន្នន័យទៅ Supabase ជោគជ័យ ១០០%!");
  } catch (err) {
    console.error("Sync Error:", err);
    alert("មានបញ្ហាក្នុងការ Sync៖ " + err.message);
  }
}
