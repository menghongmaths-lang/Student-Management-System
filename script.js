const GRADES=[['A',90],['B',80],['C',70],['D',60],['E',50],['F',0]]; // ប្តូរតាមលក្ខខណ្ឌសាលា
const CLASSES=[10,11,12].flatMap(g=>[...'ABCDE'].map(c=>g+c));
const MN=['មករា','កុម្ភៈ','មីនា','មេសា','ឧសភា','មិថុនា','កក្កដា','សីហា','កញ្ញា','តុលា','វិច្ឆិកា','ធ្នូ'];
const NAME={P:'មក',L:'យឺត',X:'អវត្តមាន'};
const $=s=>document.querySelector(s);
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const kh=n=>String(n).replace(/\d/g,d=>'០១២៣៤៥៦៧៨៩'[d]);
const f1=v=>Math.round(v*10)/10;
const grade=v=>v==null?'-':GRADES.find(g=>v>=g[1])[0];
const badge=g=>g=='-'?'-':`<span class="g g${g}">${g}</span>`;
const curM=()=>String(new Date().getMonth()+1).padStart(2,'0');
const today=()=>new Date().toISOString().slice(0,10);
let S=[],SC={},AT={},SUBJ=['គណិតវិទ្យា','ភាសាខ្មែរ','ភាសាអង់គ្លេស','រូបវិទ្យា'],editId=null;

(function load(){
  try{const d=JSON.parse(localStorage.getItem('sms2'));if(d&&d.S){({S,SC,AT,SUBJ}=d);return}}catch(e){}
  try{const o=JSON.parse(localStorage.getItem('sms1'));if(o&&o.length){SUBJ=['គណិតវិទ្យា','ប្រឡង'];o.forEach(s=>{S.push({id:s.id,name:s.name,sex:s.sex,cls:s.cls});SC[s.id]={[curM()]:{'គណិតវិទ្យា':s.math,'ប្រឡង':s.exam}}});return}}catch(e){}
  S=[{id:1,name:'សុខ ចាន់ធា',sex:'ប្រុស',cls:'10B'},{id:2,name:'ចាន់ សុភា',sex:'ស្រី',cls:'10B'},{id:3,name:'លី វិចិត្រ',sex:'ប្រុស',cls:'10A'}];
  S.forEach(s=>{SC[s.id]={[curM()]:Object.fromEntries(SUBJ.map((j,k)=>[j,(s.id*17+k*13)%40+55]))}});
})();
const save=()=>{try{localStorage.setItem('sms2',JSON.stringify({S,SC,AT,SUBJ}))}catch(e){}};

const mo=()=>$('#selMonth').value,cls=()=>$('#filterClass').value,sj=()=>$('#selSubj').value;
const opts=CLASSES.map(c=>`<option>${c}</option>`).join('');
$('#studentClass').innerHTML=opts;$('#studentClass').value='10B';
$('#filterClass').innerHTML='<option value="ALL">ថ្នាក់ទាំងអស់</option>'+opts;
$('#selMonth').innerHTML=MN.map((n,i)=>`<option value="${String(i+1).padStart(2,'0')}">${n}</option>`).join('');
$('#selMonth').value=curM();$('#atDay').value=today();
function fillSubj(){const v=sj();$('#selSubj').innerHTML='<option value="ALL">មធ្យមភាគគ្រប់មុខវិជ្ជា</option>'+SUBJ.map(j=>`<option>${esc(j)}</option>`).join('');$('#selSubj').value=SUBJ.includes(v)?v:'ALL'}

const sc=(id)=>(SC[id]||{})[mo()]||{};
function val(s,j=sj()){const o=sc(s.id);
  if(j=='ALL'){const v=SUBJ.map(x=>o[x]).filter(x=>typeof x=='number');return v.length?v.reduce((a,b)=>a+b,0)/v.length:null}
  return typeof o[j]=='number'?o[j]:null}
function attMonth(id){const c={P:0,L:0,X:0};Object.entries(AT[id]||{}).forEach(([d,v])=>{if(d.slice(5,7)==mo())c[v]++});return c}
const inCls=()=>S.filter(s=>cls()=='ALL'||s.cls==cls());
function ranks(L){const o=L.filter(s=>val(s)!=null).sort((a,b)=>val(b)-val(a)),r={};
  o.forEach((s,i)=>r[s.id]=i&&val(s)==val(o[i-1])?r[o[i-1].id]:i+1);return r}

function switchRole(r){const T=r=='teacher';
  $('#teacherArea').hidden=!T;$('#studentDashboard').hidden=T;$('#lblClass').hidden=!T;$('#lblSubj').hidden=!T;
  $('#btnTeacher').classList.toggle('on',T);$('#btnStudent').classList.toggle('on',!T);
  $('#headerTitle').textContent=T?'ប្រព័ន្ធគ្រប់គ្រងទិន្នន័យ និងពិន្ទុសិស្ស (សម្រាប់គ្រូបង្រៀន)':'ប្រព័ន្ធពិនិត្យមើលពិន្ទុសិក្សា (សម្រាប់សិស្សានុសិស្ស)';
  $('#headerDesc').textContent=T?'គ្រប់គ្រង បញ្ចូលពិន្ទុសិស្ស និងគណនាមធ្យមភាគដោយស្វ័យប្រវត្តិ។':'ស្វែងរក និងពិនិត្យមើលលទ្ធផលប្រឡងប្រចាំខែរបស់អ្នក។'}
function showTab(id){['pStu','pSc','pAt','officialSection'].forEach(x=>$('#'+x).hidden=x!=id);
  document.querySelectorAll('#tabs button').forEach(b=>b.classList.toggle('on',b.dataset.t==id))}
$('#tabs').onclick=e=>{if(e.target.dataset.t)showTab(e.target.dataset.t)};

function render(){fillSubj();renderGrid();renderAt();renderRest()}

function renderRest(){
  const C=inCls(),q=$('#q').value.trim().toLowerCase(),L=C.filter(s=>s.name.toLowerCase().includes(q)),R=ranks(C);
  const V=C.map(s=>val(s)).filter(v=>v!=null),m=V.length?V.reduce((a,b)=>a+b,0)/V.length:null;
  const pass=V.length?Math.round(V.filter(v=>v>=50).length/V.length*100)+'%':'-';
  const mk=C.filter(s=>(AT[s.id]||{})[$('#atDay').value]),ar=mk.length?Math.round(mk.filter(s=>AT[s.id][$('#atDay').value]!='X').length/mk.length*100)+'%':'-';
  $('#stats').innerHTML=`<div class="stat"><span>សិស្សសរុប</span><b>${C.length}</b></div><div class="stat"><span>មធ្យមភាគ</span><b>${m==null?'-':f1(m)}</b></div><div class="stat"><span>អត្រាជាប់ (≥៥០)</span><b>${pass}</b></div><div class="stat"><span>វត្តមានថ្ងៃ ${esc($('#atDay').value)}</span><b>${ar}</b></div>`;
  $('#studentTableBody').innerHTML=L.length?L.map((s,i)=>{const v=val(s),a=attMonth(s.id);return`<tr><td>${i+1}</td><td><b>${esc(s.name)}</b></td><td>${s.sex}</td><td>${s.cls}</td><td><b>${v==null?'-':f1(v)}</b></td><td>${badge(grade(v))}</td><td>${a.X}${a.L?` <small>(យឺត ${a.L})</small>`:''}</td><td class="act"><button onclick="editStudent(${s.id})">កែ</button><button class="del" onclick="deleteStudent(${s.id})">លុប</button></td></tr>`}).join(''):'<tr><td colspan="8" class="empty">មិនទាន់មានសិស្ស</td></tr>';
  renderOfficial(C,R)}

function renderGrid(){const C=inCls();
  $('#subjChips').innerHTML=SUBJ.map((j,k)=>`<span class="chip">${esc(j)}<button onclick="rmSubject(${k})" aria-label="លុប">✕</button></span>`).join('');
  $('#scHead').innerHTML=`<tr><th>#</th><th>ឈ្មោះ</th>${SUBJ.map(j=>`<th>${esc(j)}</th>`).join('')}<th>មធ្យមភាគ</th></tr>`;
  $('#scBody').innerHTML=C.length?C.map((s,i)=>{const o=sc(s.id);return`<tr><td>${i+1}</td><td>${esc(s.name)}</td>${SUBJ.map((j,k)=>`<td><input class="num" type="number" min="0" max="100" value="${o[j]??''}" onchange="setScore(${s.id},${k},this)"></td>`).join('')}<td id="av${s.id}"><b>${f1v(val(s,'ALL'))}</b></td></tr>`}).join(''):`<tr><td colspan="${SUBJ.length+3}" class="empty">មិនមានសិស្សក្នុងថ្នាក់នេះ</td></tr>`}
const f1v=v=>v==null?'-':f1(v);
function setScore(id,k,el){const j=SUBJ[k];const o=((SC[id]??={})[mo()]??={});
  if(el.value==='')delete o[j];else{o[j]=Math.min(100,Math.max(0,Math.round(+el.value)));el.value=o[j]}
  save();$('#av'+id).innerHTML=`<b>${f1v(val(S.find(s=>s.id==id),'ALL'))}</b>`;renderRest()}
function addSubject(){const v=$('#newSubj').value.trim();if(!v||SUBJ.includes(v))return;SUBJ.push(v);$('#newSubj').value='';save();render()}
function rmSubject(k){if(!confirm('លុបមុខវិជ្ជា "'+SUBJ[k]+'" ? ពិន្ទុរបស់វានឹងលែងបង្ហាញ'))return;SUBJ.splice(k,1);save();render()}

function renderAt(){const C=inCls(),d=$('#atDay').value,c={P:0,L:0,X:0,N:0};
  C.forEach(s=>c[(AT[s.id]||{})[d]||'N']++);
  $('#atStats').innerHTML=`<span class="chip">មក ${c.P}</span><span class="chip">យឺត ${c.L}</span><span class="chip">អវត្តមាន ${c.X}</span><span class="chip">មិនទាន់កត់ត្រា ${c.N}</span>`;
  $('#atBody').innerHTML=C.length?C.map((s,i)=>{const a=attMonth(s.id),v=(AT[s.id]||{})[d];return`<tr><td>${i+1}</td><td>${esc(s.name)}</td><td><span class="seg">${Object.keys(NAME).map(k=>`<button class="${k} ${v==k?'on':''}" onclick="setAt(${s.id},'${k}')">${NAME[k]}</button>`).join('')}</span></td><td>មក ${a.P} · យឺត ${a.L} · ខ្វះ ${a.X}</td></tr>`}).join(''):'<tr><td colspan="4" class="empty">មិនមានសិស្សក្នុងថ្នាក់នេះ</td></tr>'}
function setAt(id,v){const d=$('#atDay').value;if(!d)return;const o=AT[id]??={};if(o[d]==v)delete o[d];else o[d]=v;save();renderAt();renderRest()}
function allPresent(){const d=$('#atDay').value;if(!d)return;inCls().forEach(s=>(AT[s.id]??={})[d]='P');save();renderAt();renderRest()}

function renderOfficial(C,R){
  $('#officialDocClass').textContent=`ពិន្ទុប្រឡងប្រចាំខែ ${MN[+mo()-1]} `+(cls()=='ALL'?'គ្រប់ថ្នាក់':'ថ្នាក់ទី '+kh(cls()));
  $('#officialSubj').textContent='មុខវិជ្ជា៖ '+(sj()=='ALL'?'គ្រប់មុខវិជ្ជា (មធ្យមភាគ)':sj())+' ឆ្នាំសិក្សា ២០២៦-២០២៧';
  $('#offMonth').textContent=MN[+mo()-1];
  const H=['ល.រ','គោត្តនាម-នាម','ភេទ','សរុប','និទ្ទេស','ចំ.ថ្នាក់','ផ្សេងៗ'],W=[4,20,6,6,6,6,6];
  $('#officialHead').innerHTML='<tr>'+[...H,...H].map((h,i)=>`<th style="width:${W[i%7]}%">${h}</th>`).join('')+'</tr>';
  const half=Math.max(10,Math.ceil(C.length/2));
  const cell=(s,i)=>{if(!s)return'<td></td>'.repeat(7);const v=val(s);return`<td>${kh(i+1)}</td><td class="nm">${esc(s.name)}</td><td>${s.sex=='ប្រុស'?'ប':'ស'}</td><td>${v==null?'':kh(f1(v))}</td><td>${v==null?'':grade(v)}</td><td>${v==null?'':kh(R[s.id])}</td><td></td>`};
  let rows='';for(let i=0;i<half;i++)rows+=`<tr>${cell(C[i],i)}${cell(C[i+half],i+half)}</tr>`;
  $('#officialTableBody').innerHTML=rows;
  const cnt={};GRADES.forEach(g=>cnt[g[0]]=0);C.forEach(s=>{const v=val(s);if(v!=null)cnt[grade(v)]++});
  const pair=g=>`<td class="gr">${g}</td><td>ចំនួន</td><td>${kh(cnt[g])}</td><td>នាក់</td>`;
  $('#sumTable').innerHTML=[['A','D'],['B','E'],['C','F']].map(p=>`<tr>${pair(p[0])}${pair(p[1])}</tr>`).join('')}

$('#studentForm').addEventListener('submit',e=>{e.preventDefault();
  const o={name:$('#studentName').value.trim(),sex:$('#studentGender').value,cls:$('#studentClass').value};if(!o.name)return;
  if(editId)Object.assign(S.find(s=>s.id==editId),o);else S.push({id:Math.max(0,...S.map(s=>s.id))+1,...o});
  save();resetForm();render()});
function resetForm(){editId=null;$('#studentForm').reset();$('#studentClass').value='10B';$('#formTitle').textContent='បន្ថែមសិស្សថ្មី';$('#saveBtn').textContent='បន្ថែមសិស្ស';$('#cancelBtn').hidden=true}
function editStudent(id){const s=S.find(x=>x.id==id);if(!s)return;editId=id;
  $('#studentName').value=s.name;$('#studentGender').value=s.sex;$('#studentClass').value=s.cls;
  $('#formTitle').textContent='កែព័ត៌មានសិស្ស';$('#saveBtn').textContent='រក្សាទុកការកែប្រែ';$('#cancelBtn').hidden=false;
  $('#studentForm').scrollIntoView({behavior:'smooth',block:'center'});$('#studentName').focus()}
function deleteStudent(id){if(!confirm('លុបសិស្សនេះ រួមទាំងពិន្ទុ និងវត្តមាន?'))return;S=S.filter(s=>s.id!=id);delete SC[id];delete AT[id];if(editId==id)resetForm();save();render()}

function searchStudentResult(){
  const q=$('#searchStudentName').value.trim().toLowerCase(),box=$('#studentResultDisplay');
  if(!q){box.innerHTML='<p class="empty">សូមវាយឈ្មោះសិស្ស</p>';return}
  const M=S.filter(s=>s.name.toLowerCase().includes(q)).slice(0,5);
  box.innerHTML=M.length?M.map(s=>{const o=sc(s.id),a=attMonth(s.id),v=val(s,'ALL');
    return`<div class="res"><h3>${esc(s.name)} · ថ្នាក់ ${s.cls} · ខែ ${MN[+mo()-1]}</h3><div class="rg">${SUBJ.map(j=>`<div><span>${esc(j)}</span><b>${o[j]??'-'}</b></div>`).join('')}<div><span>មធ្យមភាគ</span><b>${f1v(v)}</b></div><div><span>និទ្ទេស</span>${badge(grade(v))}</div></div><p class="hint" style="margin-top:8px">វត្តមានក្នុងខែ៖ មក ${a.P} · យឺត ${a.L} · អវត្តមាន ${a.X}</p></div>`}).join(''):'<p class="empty">រកមិនឃើញសិស្សឈ្មោះនេះទេ</p>'}

function exportToExcel(){const C=inCls(),R=ranks(C);
  const rows=[['ល.រ','ឈ្មោះ','ភេទ','ថ្នាក់',...SUBJ,'មធ្យមភាគ','និទ្ទេស','ចំ.ថ្នាក់','អវត្តមាន']];
  C.forEach((s,i)=>{const o=sc(s.id),v=val(s,'ALL');rows.push([i+1,s.name,s.sex,s.cls,...SUBJ.map(j=>o[j]??''),v==null?'':f1(v),v==null?'':grade(v),R[s.id]??'',attMonth(s.id).X])});
  const t=rows.map(r=>r.map(x=>`"${String(x).replace(/"/g,'""')}"`).join(',')).join('\r\n');
  const a=document.createElement('a');a.href=URL.createObjectURL(new Blob(['\uFEFF'+t],{type:'text/csv'}));a.download=`ពិន្ទុសិស្ស-${MN[+mo()-1]}.csv`;a.click()}

switchRole('teacher');showTab('pStu');render();
