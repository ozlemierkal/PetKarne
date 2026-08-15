
const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];
const storeKey = 'petkarnem_web_test_v1';

let state = loadState();
function normalizeState(){ state.profile ||= {name:'',email:'',phone:''}; state.settings ||= {defaultReminder:1,repeatOverdue:true}; }
normalizeState();
let selectedPetId = state.pets[0]?.id || null;
let healthHistoryFilter='all';
let calendarCursor=new Date();
let selectedCalendarDate=null;
let calendarListMode='upcoming';
let calendarTab='upcoming';
let modalSave = null;

function loadState(){
  try { return JSON.parse(localStorage.getItem(storeKey)) || baseState(); }
  catch { return baseState(); }
}
function baseState(){ return {pets:[], records:[], vets:[], meds:[], weights:[], docs:[], profile:{name:'',email:'',phone:''}, settings:{defaultReminder:1,repeatOverdue:true}}; }
function saveState(){ localStorage.setItem(storeKey, JSON.stringify(state)); renderAll(); }
function uid(){ return crypto.randomUUID ? crypto.randomUUID() : String(Date.now()+Math.random()); }
function todayISO(){ return new Date().toISOString().slice(0,10); }
function fmt(d){ if(!d) return '—'; const x=new Date(d+'T12:00:00'); return x.toLocaleDateString('tr-TR'); }
function petById(id){ return state.pets.find(p=>p.id===id); }





function pkResetPageScroll(activeViewId){
  requestAnimationFrame(()=>{
    try{ window.scrollTo(0,0); }catch(e){}
    document.documentElement.scrollTop=0;
    document.body.scrollTop=0;
  });
}

window.switchView=(viewId,btn)=>{
  if(viewId==='calendarView'){
    selectedCalendarDate=todayISO();
    calendarListMode='upcoming';
  }
  document.body.classList.remove('petDetailMode');
  $$('.navitem').forEach(b=>b.classList.remove('active'));
  if(btn) btn.classList.add('active');
  $$('.view').forEach(v=>v.classList.toggle('active',v.id===viewId));
  renderAll();

  pkResetPageScroll(viewId);
};

function openModal(title, bodyHtml, onSave){
  resetModalActions();
  $('#modalTitle').textContent = title;
  $('#modalBody').innerHTML = bodyHtml;
  modalSave = onSave;
  $('#modal').showModal();
}

function openInfoModal(title, bodyHtml){
  $('#modalTitle').textContent=title;
  $('#modalBody').innerHTML=bodyHtml;
  modalSave=null;
  const save=$('#saveModalBtn');
  const cancel=$('#modalForm .modalActions button[value="cancel"]');
  save.style.display='none';
  if(cancel) cancel.textContent='Kapat';
  $('#modal').showModal();
}

function resetModalActions(){
  const save=$('#saveModalBtn');
  const cancel=$('#modalForm .modalActions button[value="cancel"]');
  save.style.display='';
  if(cancel) cancel.textContent='Vazgeç';
}

const modalCloseX=$('#modalCloseX');
if(modalCloseX) modalCloseX.onclick=(e)=>{ e.preventDefault(); $('#modal').close(); };

const saveModalBtn=$('#saveModalBtn');
if(saveModalBtn){
  saveModalBtn.onclick=(e)=>{
    e.preventDefault();
    if(modalSave){
      const ok=modalSave();
      if(ok!==false) $('#modal').close();
    }
  };
}

$('#modalForm').addEventListener('submit',(e)=>{
  e.preventDefault();
  const submitter=e.submitter;
  if(submitter?.id==='saveModalBtn' && modalSave){
    const ok=modalSave();
    if(ok!==false) $('#modal').close();
  }
});

$('#addPetBtn').onclick = ()=>openModal('Pet Ekle',`
  <label>Adı *</label><input id="petName" placeholder="Örn. Misket">
  <label>Türü *</label><select id="petType"><option value="cat">Kedi</option><option value="dog">Köpek</option></select>
  <label>Cinsiyet</label><select id="petSex"><option>Dişi</option><option>Erkek</option></select>
  <label>Cinsi</label><input id="petBreed" placeholder="Örn. Tekir, Golden Retriever, Melez">
  <label>Doğum tarihi</label><input id="petBirthDate" type="date">
  <label>Kısırlaştırma</label><select id="petNeutered"><option value="">Belirtilmedi</option><option value="yes">Kısır</option><option value="no">Kısır değil</option></select>
  <label>Notlar</label><textarea id="petNote" placeholder="İsteğe bağlı"></textarea>
  <label>Kilo (kg)</label><input id="petWeight" inputmode="decimal" placeholder="4,8">
  <label>Mikroçip no (isteğe bağlı)</label><input id="petChip">
`,()=>{
  const name=$('#petName').value.trim(); if(!name) return false;
  const petWeightRaw=$('#petWeight').value.trim();
  if(petWeightRaw){
    const petWeightNum=Number(petWeightRaw.replace(',','.'));
    if(!Number.isFinite(petWeightNum) || petWeightNum<=0){
      alert('Kilo 0’dan büyük olmalı.');
      return false;
    }
  }
  const p={id:uid(),name,type:$('#petType').value,sex:$('#petSex').value,breed:$('#petBreed').value.trim(),birthDate:$('#petBirthDate').value,neutered:$('#petNeutered').value,note:$('#petNote').value.trim(),weight:$('#petWeight').value,chip:$('#petChip').value};
  state.pets.push(p); if(p.weight){state.weights.push({id:uid(),petId:p.id,value:p.weight,date:todayISO(),createdAt:new Date().toISOString(),initial:true});} selectedPetId=p.id; saveState();
});

$('#addVetBtn').onclick=()=>openModal('Veteriner / Klinik Ekle',`
  <label>Klinik adı *</label><input id="vetName">
  <label>Veteriner hekim</label><input id="vetDoctor">
  <label>Telefon</label><input id="vetPhone" inputmode="tel">
  <label>Adres</label><textarea id="vetAddress"></textarea>
`,()=>{
  const name=$('#vetName').value.trim(); if(!name) return false;
  state.vets.push({id:uid(),name,doctor:$('#vetDoctor').value,phone:$('#vetPhone').value,address:$('#vetAddress').value,primary:state.vets.length===0});
  saveState();
});

$('#resetBtn').onclick=()=>{
  if(confirm('Tüm PetKarnem test verileri silinsin mi?')){
    state=baseState(); normalizeState(); selectedPetId=null; saveState();
  }
};

window.healthAction=function healthAction(type){
  if(!selectedPetId && state.pets.length) selectedPetId=state.pets[0].id;
  if(!selectedPetId){ alert('Önce bir pet ekle.'); return; }
  const pet=petById(selectedPetId);
  if(!pet){ alert('Pet seçimi bulunamadı. Lütfen peti yeniden seç.'); return; }


  if(['vaccine','internal','external'].includes(type)){
    const labels={vaccine:'Aşı',internal:'İç Parazit',external:'Dış Parazit'};
    const titleLabel=labels[type];
    openModal(`${pet.name} • ${titleLabel}`,`
      <label>${titleLabel} adı / ürün *</label><input id="recTitle" placeholder="${type==='vaccine'?'Örn. Karma Aşı':'Uygulanan ürün'}">
      <label>Uygulama tarihi</label><input id="recDate" type="date" value="${todayISO()}">
      <label>Uygulayan</label><select id="recBy"><option value="home">Evde</option><option value="vet">Veteriner</option></select>
      <div id="vetSelectWrap" style="display:none">
        <label>Veteriner kliniği</label>
        <select id="recVet"><option value="">Seçiniz</option>${state.vets.map(v=>`<option value="${v.id}" ${v.primary?'selected':''}>${v.primary?'⭐ ':''}${v.name}</option>`).join('')}</select>
      </div>
      <label>Sonraki tarih</label><input id="recNext" type="date">
      <label>Hatırlatma</label><select id="recReminder">
        <option value="0">Hatırlatma yok</option>
        <option value="1" selected>1 gün önce</option>
        <option value="3">3 gün önce</option>
        <option value="7">7 gün önce</option>
        <option value="14">14 gün önce</option>
      </select>
      <label>Not</label><textarea id="recNote"></textarea>
    `,()=>{
      const title=$('#recTitle').value.trim(); if(!title) return false;
      if(type==='vaccine' && /iç\\s*parazit|dış\\s*parazit/i.test(title)){
        alert('Bu alan aşı kaydı içindir. İç/Dış Parazit için ilgili butonu kullan.');
        return false;
      }
      const by=$('#recBy').value;
      state.records.push({id:uid(),petId:pet.id,type,title,date:$('#recDate').value,by,
        vetId:by==='vet'?$('#recVet').value:'',next:$('#recNext').value,reminderDays:+$('#recReminder').value,note:$('#recNote').value,done:true});
      saveState();
    });
    setTimeout(()=>{
      const by=$('#recBy'), wrap=$('#vetSelectWrap');
      const rr=$('#recReminder'), nextDate=$('#recNext');
      if(rr){
        const preferred=Number(state.settings?.defaultReminder);
        rr.value=String(preferred>0?preferred:1);
      }
      if(nextDate && rr){
        nextDate.addEventListener('change',()=>{
          if(nextDate.value && Number(rr.value)===0){
            const preferred=Number(state.settings?.defaultReminder);
            rr.value=String(preferred>0?preferred:1);
          }
        });
      }
      const sync=()=>wrap.style.display=by.value==='vet'?'block':'none';
      by.addEventListener('change',sync); sync();
    },0);
  } else if(type==='weight'){
    openModal(`${pet.name} • Kilo Ekle`,`
      <label>Kilo (kg) *</label><input id="wValue" inputmode="decimal">
      <label>Tarih</label><input id="wDate" type="date" value="${todayISO()}">
    `,()=>{
      const val=$('#wValue').value.trim();
      const num=Number(String(val).replace(',','.'));
      if(!val || !Number.isFinite(num) || num<=0){
        alert('Kilo 0’dan büyük olmalı.');
        return false;
      }
      const weightDate=$('#wDate').value;
      state.weights.push({id:uid(),petId:pet.id,value:val,date:weightDate,createdAt:new Date().toISOString()});
      const latestWeight=state.weights
        .map((x,index)=>({...x,_index:index}))
        .filter(x=>x.petId===pet.id && x.date)
        .sort((a,b)=>{
          const dateCompare=b.date.localeCompare(a.date);
          if(dateCompare!==0) return dateCompare;
          if(a.createdAt && b.createdAt){
            const createdCompare=b.createdAt.localeCompare(a.createdAt);
            if(createdCompare!==0) return createdCompare;
          }
          return b._index-a._index;
        })[0];

      if(latestWeight) pet.weight=latestWeight.value;
      saveState();
    });
  } else if(type==='med'){
    openModal(`${pet.name} • İlaç Ekle`,`
      <label>İlaç adı *</label><input id="mName">
      <label>Doz</label><input id="mDose" placeholder="Örn. 1/2 tablet">
      <label>Saatler</label><input id="mTimes" value="09:00,21:00">
      <label>Kaç gün?</label><input id="mDays" type="number" min="1" value="7">
      <label>Hatırlatma</label><select id="mReminder">
        <option value="on" selected>İlaç saatlerinde hatırlat</option>
        <option value="off">Hatırlatma yok</option>
      </select>
    `,()=>{
      const name=$('#mName').value.trim(); if(!name) return false;
      state.meds.push({id:uid(),petId:pet.id,name,dose:$('#mDose').value,times:$('#mTimes').value,days:+$('#mDays').value||7,start:todayISO(),reminder:$('#mReminder').value==='on'}); saveState();
    });
  }
};

function editPet(id){
  const p=petById(id); if(!p)return;
  openModal('Profili Düzenle',`
    <label>Adı *</label><input id="editPetName" value="${p.name}">
    <label>Türü</label><select id="editPetType"><option value="cat" ${p.type==='cat'?'selected':''}>Kedi</option><option value="dog" ${p.type==='dog'?'selected':''}>Köpek</option></select>
    <label>Cinsiyet</label><select id="editPetSex"><option ${p.sex==='Dişi'?'selected':''}>Dişi</option><option ${p.sex==='Erkek'?'selected':''}>Erkek</option></select>
    <label>Cinsi</label><input id="editPetBreed" value="${p.breed||''}">
    <label>Doğum tarihi</label><input id="editPetBirthDate" type="date" value="${p.birthDate||''}">
    <label>Kısırlaştırma</label><select id="editPetNeutered"><option value="" ${!p.neutered?'selected':''}>Belirtilmedi</option><option value="yes" ${p.neutered==='yes'?'selected':''}>Kısır</option><option value="no" ${p.neutered==='no'?'selected':''}>Kısır değil</option></select>
    <label>Notlar</label><textarea id="editPetNote">${p.note||''}</textarea>
    <label>Kilo (kg)</label><input id="editPetWeight" value="${p.weight||''}">
    <label>Mikroçip no</label><input id="editPetChip" value="${p.chip||''}">
    <button type="button" class="danger big" id="deletePetBtn" style="margin-top:18px">Profili Sil</button>
  `,()=>{
    const name=$('#editPetName').value.trim(); if(!name)return false;
    const editWeightRaw=$('#editPetWeight').value.trim();
    if(editWeightRaw){
      const editWeightNum=Number(editWeightRaw.replace(',','.'));
      if(!Number.isFinite(editWeightNum) || editWeightNum<=0){
        alert('Kilo 0’dan büyük olmalı.');
        return false;
      }
    }
    const newWeight=$('#editPetWeight').value;
      const oldWeight=p.weight;
      Object.assign(p,{name,type:$('#editPetType').value,sex:$('#editPetSex').value,breed:$('#editPetBreed').value.trim(),birthDate:$('#editPetBirthDate').value,neutered:$('#editPetNeutered').value,note:$('#editPetNote').value.trim(),weight:newWeight,chip:$('#editPetChip').value});
      if(newWeight && String(newWeight)!==String(oldWeight||'')){
        const today=todayISO();
        const existingToday=state.weights.find(w=>w.petId===p.id && w.date===today);
        if(existingToday){
          existingToday.value=newWeight;
        }else{
          state.weights.push({id:uid(),petId:p.id,date:today,value:newWeight});
        }
      }
    saveState();
  });
  setTimeout(()=>$('#deletePetBtn').onclick=()=>{
    if(confirm(`${p.name} profili silinsin mi?`)){
      state.pets=state.pets.filter(x=>x.id!==id);
      state.records=state.records.filter(x=>x.petId!==id);
      state.weights=state.weights.filter(x=>x.petId!==id);
      state.meds=state.meds.filter(x=>x.petId!==id);
      selectedPetId=state.pets[0]?.id||null; saveState(); $('#modal').close();
    }
  },0);
}

function petTodaySummary(petId){
  const now=new Date(); now.setHours(0,0,0,0);
  const relevant=state.records.filter(r=>r.petId===petId && r.next).map(r=>{
    const d=new Date(r.next+'T00:00:00');
    const diff=Math.round((d-now)/86400000);
    return {...r,diff};
  });
  const today=relevant.filter(r=>r.diff===0);
  const late=relevant.filter(r=>r.diff<0);
  const upcoming=relevant.filter(r=>r.diff>0);

  const meds=state.meds.filter(m=>{
    if(m.petId!==petId) return false;
    const start=new Date(m.start+'T00:00:00');
    const end=new Date(start); end.setDate(end.getDate()+(m.days||1)-1);
    return now>=start && now<=end;
  });

  const bits=[];
  if(today.length) bits.push(`Bugün ${today.length} işlem`);
  if(late.length) bits.push(`${late.length} geciken`);
  if(upcoming.length) bits.push(`${upcoming.length} yaklaşan`);
  if(meds.length) bits.push(`${meds.length} aktif ilaç`);
  return {today,late,upcoming,meds,text:bits.length?bits.join(' • '):'Bugün için kayıt yok.'};
}

window.showPetTodaySummary=(petId)=>{
  const p=petById(petId); if(!p)return;
  const s=petTodaySummary(petId);
  const rows=[];

  [...s.late,...s.today,...s.upcoming].forEach(r=>{
    const when=r.diff<0?`${Math.abs(r.diff)} gün gecikti`:r.diff===0?'Bugün':`${r.diff} gün sonra`;
    const icon=r.type==='appointment'?'🩺':r.type==='vaccine'?'💉':r.type==='internal'?'🪱':'🛡️';
    const reminderText=r.type==='appointment' && r.reminder!==0
      ? `<div class="muted">🔔 ${r.reminder===60?'1 saat önce':r.reminder===120?'2 saat önce':'1 gün önce'} hatırlat</div>`
      : (['vaccine','internal','external'].includes(r.type) && r.reminderDays>0
        ? `<div class="muted">🔔 ${r.reminderDays} gün önce hatırlat</div>` : '');
    rows.push(`<div class="card"><b>${icon} ${r.title}${r.type==='appointment' && r.reminder!==0?' 🔔':''}</b><div class="muted">${fmt(r.next)}${r.time?' • '+r.time:''} • ${when}</div>${reminderText}</div>`);
  });
  s.meds.forEach(m=>{
    rows.push(`<div class="card"><b>💊 ${m.name}${m.reminder?' 🔔':''}</b><div class="muted">${m.dose||''}${m.times?' • '+m.times:''}</div>${m.reminder?'<div class="muted">🔔 İlaç saatlerinde hatırlat</div>':''}</div>`);
  });

  openInfoModal(`${p.name} • Bugünkü Özet`,
    rows.length?`<div class="stack">${rows.join('')}</div>`:'<div class="empty">Bugün için gösterilecek kayıt yok.</div>');
};


let detailPetId=null;

function petAgeLabel(p){
  if(!p?.birthDate) return '';
  const b=new Date(p.birthDate+'T12:00:00'), n=new Date();
  let y=n.getFullYear()-b.getFullYear();
  if(n.getMonth()<b.getMonth() || (n.getMonth()===b.getMonth() && n.getDate()<b.getDate())) y--;
  if(y>0) return `${y} yaş`;
  const m=Math.max(0,(n.getFullYear()-b.getFullYear())*12+n.getMonth()-b.getMonth());
  return m>0?`${m} aylık`:'1 yaş altı';
}

function recordIcon(type){
  if(type==='appointment') return ['🩺','purple'];
  if(type==='vaccine') return ['🗓️','green'];
  if(type==='internal') return ['💊','blue'];
  if(type==='external') return ['🛡️','aqua'];
  return ['🔔','green'];
}

function showPetDetail(id){
  const p=petById(id); if(!p) return;
  detailPetId=id;
  selectedPetId=id;
  document.body.classList.add('petDetailMode');

  const photo=$('#petDetailPhoto');
  if(photo) photo.src=p.type==='cat'?'pet-cat.jpg':'pet-dog.jpg';

  $('#petDetailName').innerHTML=`${p.name} <span>🐾</span>`;
  $('#petDetailMeta').textContent=[p.type==='cat'?'Kedi':'Köpek',p.sex,petAgeLabel(p)].filter(Boolean).join(' • ');
  $('#petDetailBreed').textContent=p.breed||'—';
  $('#petDetailBirth').textContent=p.birthDate?fmt(p.birthDate):'—';

  const weights=state.weights
    .filter(w=>w.petId===id&&w.date)
    .sort((a,b)=>b.date.localeCompare(a.date));
  const currentWeight=(p.weight!==undefined && p.weight!==null && p.weight!=='') ? p.weight : (weights[0]?.value || '');
  $('#petDetailWeight').textContent=currentWeight?`${currentWeight} kg`:'—';
  $('#petDetailNeutered').textContent=p.neutered==='yes'?'Evet':p.neutered==='no'?'Hayır':'—';
  $('#petDetailChip').textContent=p.chip||'—';
  $('#petDetailNote').textContent=p.note||'—';

  $$('.navitem').forEach(b=>b.classList.remove('active'));
  $$('.view').forEach(v=>v.classList.toggle('active',v.id==='petDetailView'));
}

function renderPetDetailIfOpen(){
  if($('#petDetailView')?.classList.contains('active') && detailPetId) showPetDetail(detailPetId);
}

function renderPets(){
  const grid=$('#refPetsGrid'), upcoming=$('#refUpcomingList'), legacy=$('#petsList');
  if(legacy) legacy.innerHTML='';
  if(!grid || !upcoming) return;

  const cards=state.pets.slice(0,2).map(p=>{
    const meta=[petAgeLabel(p),p.weight?`${p.weight} kg`:null].filter(Boolean).join(' • ');
    return `<button type="button" class="refPetCard" data-pet-detail="${p.id}">
      <div class="refPetVisual"><img src="${p.type==='cat'?'pet-cat.jpg':'pet-dog.jpg'}" alt=""><span class="refPawBadge">🐾</span></div>
      <div class="refPetName">${p.name}</div>
      <span class="refSpecies">${p.type==='cat'?'Kedi':'Köpek'}</span>
      <div class="refPetMeta">${meta || p.breed || 'Bilgileri görüntüle'}</div>
    </button>`;
  }).join('');

  grid.innerHTML=cards+`<button type="button" class="refAddCard" id="refAddPet"><span class="refAddCircle">＋</span><b>Dost Ekle</b></button>`;

  $$('[data-pet-detail]').forEach(x=>x.onclick=()=>showPetDetail(x.dataset.petDetail));
  const add=$('#refAddPet'); if(add) add.onclick=()=>$('#addPetBtn').click();

  const now=todayISO();
  const future=state.records
    .filter(r=>r.petId&&r.next&&r.next>=now&&['appointment','vaccine','internal','external'].includes(r.type))
    .sort((a,b)=>(a.next+(a.time||'')).localeCompare(b.next+(b.time||'')));

  upcoming.innerHTML=future.length?future.slice(0,3).map(r=>{
    const p=petById(r.petId), [emoji,cls]=recordIcon(r.type);
    const days=Math.max(0,Math.ceil((new Date(r.next+'T12:00:00')-new Date(now+'T12:00:00'))/86400000));
    const title=r.type==='appointment'?'Veteriner Randevusu':
                r.type==='vaccine'?(r.title||'Aşı'):
                r.type==='internal'?'İç Parazit':'Dış Parazit';
    return `<div class="refUpcomingCard">
      <div class="refUpcomingIcon ${cls}">${emoji}</div>
      <div class="refUpcomingText"><b>${p?.name||''} – ${title}</b><span>${fmt(r.next)}${r.time?' • '+r.time:''}</span></div>
      <em>${days===0?'Bugün':`${days} gün kaldı`}</em>
    </div>`;
  }).join(''):'<div class="refUpcomingEmpty">Henüz yaklaşan kayıt yok.</div>';

  const showAll=$('#showAllPetsBtn');
  if(showAll) showAll.onclick=()=>{
    if(!state.pets.length){ $('#addPetBtn').click(); return; }
    openInfoModal('Dostlarım',`<div class="stack">${state.pets.map(p=>`
      <button type="button" class="card refAllPetRow" onclick="$('#modal').close();showPetDetail('${p.id}')">
        <span>${p.type==='cat'?'🐱':'🐶'}</span><div><b>${p.name}</b><div class="muted">${p.breed||(p.type==='cat'?'Kedi':'Köpek')}</div></div><strong>›</strong>
      </button>`).join('')}</div>`);
  };

  const cal=$('#goCalendarBtn');
  if(cal) cal.onclick=()=>{
    const nav=$('.navitem[data-view="calendarView"]');
    if(nav) nav.click();
  };

  const welcome=$('#welcomeName'), profileName=state.profile?.name?.trim();
  if(welcome) welcome.textContent=profileName?`Merhaba, ${profileName} 👋`:'Merhaba 👋';
}

window.setHealthHistoryFilter=(key)=>{healthHistoryFilter=key;renderHealth();};

function renderHealth(){
  const pick=$('#healthPetPicker');
  pick.innerHTML=state.pets.map(p=>`<button class="chip ${p.id===selectedPetId?'active':''}" data-id="${p.id}">${p.type==='cat'?'🐱':'🐶'} ${p.name}</button>`).join('');
  $$('#healthPetPicker .chip').forEach(b=>b.onclick=()=>{selectedPetId=b.dataset.id;renderHealth();});

  const petRecords=state.records.filter(r=>r.petId===selectedPetId);
  const lastOf=(type)=>petRecords.filter(r=>r.type===type).sort((a,b)=>(b.date||b.next||'').localeCompare(a.date||a.next||''))[0];
  const lastVaccine=lastOf('vaccine');
  const lastInternal=lastOf('internal');
  const lastExternal=lastOf('external');
  const activeMed=state.meds.find(m=>m.petId===selectedPetId);
  const mainVet=state.vets.find(v=>v.primary) || state.vets[0];

  const summary=$('#petHealthSummary');
  if(selectedPetId){
    const pet=petById(selectedPetId);
  const mainTitle=$('#healthMainTitle');
  const historyTitle=$('#healthHistoryTitle');
  if(mainTitle) mainTitle.textContent=pet ? `${pet.name} Sağlık Bilgileri` : 'Sağlık Bilgileri';
  if(historyTitle) historyTitle.textContent=pet ? `${pet.name} Sağlık Geçmişi` : 'Sağlık Geçmişi';
    const recs=state.records.filter(r=>r.petId===selectedPetId);
    const latest=(type)=>recs.filter(r=>r.type===type && r.date).sort((a,b)=>b.date.localeCompare(a.date))[0];
    const next=(type)=>recs.filter(r=>r.type===type && r.next).sort((a,b)=>a.next.localeCompare(b.next))[0];
    const vax=latest('vaccine'), intp=latest('internal'), extp=latest('external');
    const petWeights=state.weights
      .map((x,index)=>({...x,_index:index}))
      .filter(x=>x.petId===selectedPetId && x.date);

    const sortedWeights=[...petWeights].sort((a,b)=>{
      const dateCompare=b.date.localeCompare(a.date);
      if(dateCompare!==0) return dateCompare;

      // Aynı gün birden fazla kilo girildiyse:
      // createdAt varsa en son girilen öne gelir.
      if(a.createdAt && b.createdAt){
        const createdCompare=b.createdAt.localeCompare(a.createdAt);
        if(createdCompare!==0) return createdCompare;
      }

      // Eski test verilerinde createdAt yoksa,
      // listede daha sonra eklenen kayıt daha güncel kabul edilir.
      return b._index-a._index;
    });

    const w=sortedWeights[0];
    const prevW=sortedWeights[1];
    const meds=state.meds.filter(x=>x.petId===selectedPetId);
    const vet=state.vets.find(v=>v.primary)||state.vets[0];
    summary.innerHTML=`
    <div class="healthRefGrid">
      <div class="healthRefMetric">
        <span class="metricIcon">🛡️</span>
        <div><small>Son Aşı</small><b>${lastVaccine?(lastVaccine.title||'Aşı'):'Kayıt yok'}</b><em>${lastVaccine?fmt(lastVaccine.date||lastVaccine.next):'—'}</em></div>
      </div>
      <div class="healthRefMetric">
        <span class="metricIcon">🪱</span>
        <div><small>İç Parazit</small><b>${lastInternal?(lastInternal.title||'Kayıt var'):'Kayıt yok'}</b><em>${lastInternal?fmt(lastInternal.date||lastInternal.next):'—'}</em></div>
      </div>
      <div class="healthRefMetric">
        <span class="metricIcon">🐞</span>
        <div><small>Dış Parazit</small><b>${lastExternal?(lastExternal.title||'Kayıt var'):'Kayıt yok'}</b><em>${lastExternal?fmt(lastExternal.date||lastExternal.next):'—'}</em></div>
      </div>
      <div class="healthRefMetric">
        <span class="metricIcon">💊</span>
        <div><small>Aktif İlaç</small><b>${activeMed?activeMed.name:'Yok'}</b><em>${activeMed?'Aktif':'—'}</em></div>
      </div>
      <div class="healthRefMetric">
        <span class="metricIcon">⚖️</span>
        <div><small>Güncel Kilo</small><b>${pet?.weight?pet.weight+' kg':(w?`${w.value} kg`:'Kayıt yok')}</b><em>${w?.date?fmt(w.date):'—'}</em></div>
      </div>
      <div class="healthRefMetric">
        <span class="metricIcon">🩺</span>
        <div><small>Ana Veteriner</small><b>${mainVet?mainVet.name:'Belirtilmedi'}</b><em>${mainVet?.doctor||'—'}</em></div>
      </div>
    </div>
    <div class="healthRefAutoNote">ⓘ Bilgiler son kayıtlara göre otomatik güncellenir.</div>
  `;
  } else {
    summary.innerHTML='<div class="empty">Özet için bir pet seç.</div>';
  }

  $('#healthActions').innerHTML=`
    <button type="button" class="healthRefAction" data-health-action="internal"><span>🪱</span><b>İç Parazit</b></button>
    <button type="button" class="healthRefAction" data-health-action="external"><span>🐞</span><b>Dış Parazit</b></button>
    <button type="button" class="healthRefAction" data-health-action="vaccine"><span>🛡️</span><b>Aşı</b></button>
    <button type="button" class="healthRefAction" data-health-action="med"><span>💊</span><b>İlaç</b></button>
    <button type="button" class="healthRefAction" data-health-action="weight"><span>⚖️</span><b>Kilo</b></button>
  `;
  $$('#healthActions [data-health-action]').forEach(btn=>{
    btn.onclick=(e)=>{
      e.preventDefault();
      window.healthAction(btn.dataset.healthAction);
    };
  });
  const filters=$('#healthHistoryFilters');
  const defs=[['all','Tümü'],['internal','İç Parazit'],['external','Dış Parazit'],['vaccine','Aşılar'],['med','İlaçlar'],['weight','Kilo']];
  filters.innerHTML=defs.map(([k,l])=>`<button type="button" class="chip ${healthHistoryFilter===k?'active':''}" data-history-filter="${k}">${l}</button>`).join('');
  $$('#healthHistoryFilters [data-history-filter]').forEach(btn=>{
    btn.onclick=(e)=>{ e.preventDefault(); setHealthHistoryFilter(btn.dataset.historyFilter); };
  });

  const hist=$('#healthHistory');
  if(!selectedPetId){hist.innerHTML='<div class="card empty">Önce bir pet ekle.</div>';return;}

  const recs=state.records.filter(r=>r.petId===selectedPetId && ['vaccine','internal','external'].includes(r.type)).map(r=>({...r,category:r.type}));
  const weights=state.weights.filter(r=>r.petId===selectedPetId).map(w=>({title:`Kilo • ${w.value} kg`,date:w.date,type:'weight',category:'weight'}));
  const meds=state.meds.filter(r=>r.petId===selectedPetId).map(m=>({title:`İlaç • ${m.name}`,date:m.start,type:'med',category:'med'}));

  let all=[...recs,...weights,...meds].sort((a,b)=>(b.date||b.next||'').localeCompare(a.date||a.next||''));
  if(healthHistoryFilter!=='all') all=all.filter(r=>r.category===healthHistoryFilter);

  hist.innerHTML=all.length?all.map(r=>{
    const label=r.type==='vaccine'?'💉 Aşı':r.type==='internal'?'🪱 İç Parazit':r.type==='external'?'🛡️ Dış Parazit':r.type==='med'?'💊 İlaç':r.type==='weight'?'⚖️ Kilo':'🩺 Veteriner';
    return `<div class="card"><b>${label} • ${r.title}</b><div class="muted">${fmt(r.date||r.next)}${r.next&&r.date?` • Sonraki ${fmt(r.next)}`:''}</div></div>`;
  }).join(''):'<div class="card empty">Bu kategoride henüz kayıt yok.</div>';
}

window.addAppointment=()=>{
  if(!state.pets.length){
    alert('Önce bir pet ekle.');
    return;
  }

  openModal('Veteriner Randevusu',`
    <label>Pet *</label>
    <select id="apptPet">
      ${state.pets.map(p=>`<option value="${p.id}">${p.type==='cat'?'🐱':'🐶'} ${p.name}</option>`).join('')}
    </select>

    <label>Randevu başlığı *</label>
    <input id="apptTitle" value="Veteriner Randevusu">

    <label>Tarih *</label>
    <input id="apptDate" type="date">

    <label>Saat</label>
    <input id="apptTime" type="time">

    <label>Klinik</label>
    <select id="apptVet">
      <option value="">Seçilmedi</option>
      ${state.vets.map(v=>`<option value="${v.id}" ${v.primary?'selected':''}>${v.primary?'⭐ ':''}${v.name}</option>`).join('')}
    </select>

    <label>Hatırlatma</label>
    <select id="apptReminder">
      <option value="1440" selected>1 gün önce</option>
      <option value="120">2 saat önce</option>
      <option value="60">1 saat önce</option>
      <option value="0">Hatırlatma yok</option>
    </select>

    <div class="muted" style="margin-top:6px">
      Web testinde gerçek iPhone bildirimi gönderilmez; hatırlatma tercihi kayda eklenir.
    </div>

    <label>Not</label>
    <textarea id="apptNote"></textarea>
  `,()=>{
    const title=$('#apptTitle').value.trim();
    const date=$('#apptDate').value;

    if(!title || !date){
      alert('Randevu başlığı ve tarih gerekli.');
      return false;
    }

    state.records.push({
      id:uid(),
      petId:$('#apptPet').value,
      type:'appointment',
      title,
      date:'',
      by:'vet',
      vetId:$('#apptVet').value,
      next:date,
      time:$('#apptTime').value,
      reminder:+$('#apptReminder').value,
      note:$('#apptNote').value,
      done:false
    });

    saveState();
  });
};


window.showHealthCalendarDetail=(id)=>{
  const r=state.records.find(x=>x.id===id);
  if(!r)return;
  const pet=petById(r.petId);
  const vet=state.vets.find(v=>v.id===r.vetId);

  const typeLabel=r.type==='vaccine'
    ? '💉 Aşı'
    : r.type==='internal'
      ? '🪱 İç Parazit'
      : r.type==='external'
        ? '🛡️ Dış Parazit'
        : 'Sağlık Kaydı';

  const reminderText=r.reminderDays>0
    ? `🔔 ${r.reminderDays} gün önce hatırlat`
    : '🔕 Hatırlatma yok';

  openInfoModal('Kayıt Detayı',`
    <div class="card">
      <h3>${pet?.name||''} • ${typeLabel}</h3>
      <div><b>${r.title||''}</b></div>
      ${r.date?`<div class="muted" style="margin-top:6px">Uygulama: ${fmt(r.date)}</div>`:''}
      <div class="muted">Uygulayan: ${r.by==='vet'?'Veteriner':'Evde'}</div>
      ${r.next?`<div class="muted">Sonraki tarih: ${fmt(r.next)}</div>`:''}
      ${r.by==='vet'?`<div class="muted">Klinik: ${vet?.name||'Seçilmedi'}</div>`:''}
      <div class="muted">${reminderText}</div>
      ${r.note?`<div style="margin-top:10px">${r.note}</div>`:''}
    </div>
  `);
};


window.changeRecordDate=(id)=>{
  const r=state.records.find(x=>x.id===id);
  if(!r)return;

  openModal(r.type==='appointment'?'Randevuyu Düzenle':'Tarihi Değiştir',`
    ${r.type==='appointment'?`<label>Başlık</label><input id="editCalTitle" value="${r.title||''}">`:''}
    <label>Tarih *</label><input id="editCalDate" type="date" min="${todayISO()}" value="${r.next||''}">
    ${r.type==='appointment'?`
      <label>Saat</label><input id="editCalTime" type="time" value="${r.time||''}">
      <label>Klinik</label>
      <select id="editCalVet">
        <option value="">Seçilmedi</option>
        ${state.vets.map(v=>`<option value="${v.id}" ${r.vetId===v.id?'selected':''}>${v.primary?'⭐ ':''}${v.name}</option>`).join('')}
      </select>
      <label>Hatırlatma</label>
      <select id="editCalReminder">
        <option value="1440" ${(r.reminder??1440)===1440?'selected':''}>1 gün önce</option>
        <option value="120" ${r.reminder===120?'selected':''}>2 saat önce</option>
        <option value="60" ${r.reminder===60?'selected':''}>1 saat önce</option>
        <option value="0" ${r.reminder===0?'selected':''}>Hatırlatma yok</option>
      </select>
      <label>Not</label><textarea id="editCalNote">${r.note||''}</textarea>
    `:`
      <label>Hatırlatma</label>
      <select id="editHealthReminder">
        <option value="0" ${(r.reminderDays||0)===0?'selected':''}>Hatırlatma yok</option>
        <option value="1" ${(r.reminderDays||0)===1?'selected':''}>1 gün önce</option>
        <option value="3" ${(r.reminderDays||0)===3?'selected':''}>3 gün önce</option>
        <option value="7" ${(r.reminderDays||0)===7?'selected':''}>7 gün önce</option>
        <option value="14" ${(r.reminderDays||0)===14?'selected':''}>14 gün önce</option>
      </select>
    `}
  `,()=>{
    const d=$('#editCalDate').value;
    if(!d) return false;
    if(d<todayISO()){
      alert('Tarih bugünden eski olamaz.');
      return false;
    }
    r.next=d;

    // Tarih değişince eski seçili gün listesi açık kalmasın.
    // Kullanıcı doğrudan güncellenmiş Yaklaşanlar listesine dönsün.
    selectedCalendarDate=null;

    if(r.type==='appointment'){
      r.title=$('#editCalTitle').value.trim()||'Veteriner Randevusu';
      r.time=$('#editCalTime').value;
      r.vetId=$('#editCalVet').value;
      r.reminder=+$('#editCalReminder').value;
      r.note=$('#editCalNote').value;
    } else {
      r.reminderDays=+$('#editHealthReminder').value;
    }

    saveState();
    renderCalendar();
    return true;
  });
};


window.showCalendarDetail=(id)=>{
  const r=state.records.find(x=>x.id===id);
  if(!r)return;
  const pet=petById(r.petId);
  const vet=state.vets.find(v=>v.id===r.vetId);

  openInfoModal('Randevu Detayı',`
    <div class="card">
      <h3>${pet?.name||''} • ${r.title}</h3>
      <div>📅 ${fmt(r.next)}${r.time?' • '+r.time:''}</div>
      <div>🩺 ${vet?.name||'Klinik seçilmedi'}</div>
      <div>🔔 ${r.reminder===0?'Hatırlatma yok':r.reminder===60?'1 saat önce':r.reminder===120?'2 saat önce':'1 gün önce'}</div>
      ${r.note?`<div style="margin-top:8px">${r.note}</div>`:''}
    </div>
  `);
};

window.changeCalendarMonth=(delta)=>{calendarCursor=new Date(calendarCursor.getFullYear(),calendarCursor.getMonth()+delta,1);selectedCalendarDate=null;renderCalendar();};
window.setCalendarTab=(tab,btn)=>{calendarTab='upcoming';selectedCalendarDate=null;renderCalendar();};
window.selectCalendarDay=(dateStr)=>{
  selectedCalendarDate=dateStr;
  if(dateStr===todayISO()){
    calendarListMode='upcoming';
  }else{
    calendarListMode='day';
  }
  renderCalendar();
};

function calendarItems(){
  const allowed=new Set(['vaccine','internal','external','appointment']);
  return state.records.filter(r=>r.next&&allowed.has(r.type)).map(r=>({...r,calendarDate:r.next}));
}

function renderCalendar(){
  const label=$('#calendarMonthLabel'), grid=$('#monthGrid');
  if(!label || !grid) return;

  const y=calendarCursor.getFullYear(), m=calendarCursor.getMonth();
  label.textContent=new Intl.DateTimeFormat('tr-TR',{month:'long',year:'numeric'})
    .format(new Date(y,m,1));

  const first=new Date(y,m,1);
  const days=new Date(y,m+1,0).getDate();
  const offset=(first.getDay()+6)%7;
  const items=calendarItems();

  let cells='';
  for(let i=0;i<offset;i++) cells+='<div class="dayCell blank"></div>';

  for(let d=1;d<=days;d++){
    const ds=`${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const di=items.filter(x=>x.calendarDate===ds);
    cells+=`<button class="dayCell${selectedCalendarDate===ds?' selected':''}${ds===todayISO()?' today':''}"
      onclick="selectCalendarDay('${ds}')">
      <span>${d}</span>
      ${di.length?`<span class="dayDots">${di.slice(0,3).map(x=>{const s=pkDueStatus(x.calendarDate); return `<i class="pkDot ${s.key}"></i>`}).join('')}</span>`:''}
    </button>`;
  }
  grid.innerHTML=cells;

  const now=new Date(); now.setHours(0,0,0,0);
  let list=items.map(r=>{
    const d=new Date(r.calendarDate+'T00:00:00');
    return {...r,diff:Math.round((d-now)/86400000)};
  });

  const title=$('#selectedDayTitle');
  if(calendarListMode==='day' && selectedCalendarDate){
    list=list.filter(r=>r.calendarDate===selectedCalendarDate);
    if(title){
      const pretty=new Intl.DateTimeFormat('tr-TR',{day:'numeric',month:'long'})
        .format(new Date(selectedCalendarDate+'T00:00:00'));
      title.textContent=`${pretty} Kayıtları`;
    }
  }else{
    // Yaklaşanlar: gecikenler + bugün + önümüzdeki 7 gün.
    // diff===0 olan bugünkü kayıtlar da bu listeye dahildir.
    list=list.filter(r=>r.diff<=7);
    if(title) title.textContent='Yaklaşanlar';
  }

  list.sort((a,b)=>(a.calendarDate+(a.time||'')).localeCompare(b.calendarDate+(b.time||'')));

  const listEl=$('#calendarList');
  if(!listEl) return;

  listEl.innerHTML=list.length?list.map(r=>{
    const p=petById(r.petId);
    const petIcon=p?.type==='dog'?'🐶':'🐱';
    const typeLabel=
      r.type==='appointment'?'🩺 Randevu':
      r.type==='vaccine'?'💉 Aşı':
      r.type==='internal'?'🪱 İç Parazit':
      '🛡️ Dış Parazit';

    const status=r.diff<0
      ? {key:'overdue',label:`${Math.abs(r.diff)} GÜN GECİKTİ`}
      : r.diff===0
      ? {key:'today',label:'BUGÜN'}
      : r.diff<=7
      ? {key:'soon',label:`${r.diff} GÜN KALDI`}
      : {key:'normal',label:''};

    const bell=
      (r.type==='appointment'&&r.reminder!==0) ||
      (['vaccine','internal','external'].includes(r.type)&&r.reminderDays>0)
      ? ' 🔔':'';

    return `<div class="card">
      <div class="calendarPetTitle">${petIcon} <b>${p?.name||''}</b></div>
      <div>
        <b>${typeLabel} • ${r.title}${bell}</b>
        ${status.label?`<span class="pkDueBadge ${status.key}">${status.label}</span>`:''}
      </div>
      <div class="muted">${fmt(r.calendarDate)}${r.time?' • '+r.time:''}</div>
      <div class="calendarActions" style="margin-top:10px">
        ${r.type==='appointment'
          ? `<button class="secondary smallbtn" onclick="showCalendarDetail('${r.id}')">Detay</button>
             <button class="secondary smallbtn" onclick="changeRecordDate('${r.id}')">Düzenle</button>
             <button class="primary smallbtn ${r.diff>0?'disabledAction':''}" ${r.diff>0?'disabled':''} onclick="completeRecord('${r.id}')">Tamamlandı</button>`
          : `<button class="secondary smallbtn" onclick="showHealthCalendarDetail('${r.id}')">Detay</button>
             <button class="primary smallbtn ${r.diff>0?'disabledAction':''}" ${r.diff>0?'disabled':''} onclick="completeRecord('${r.id}')">Yapıldı</button>
             <button class="secondary smallbtn" onclick="changeRecordDate('${r.id}')">Tarihi Değiştir</button>`
        }
      </div>
    </div>`;
  }).join(''):`<div class="card empty">${selectedCalendarDate?'Bu tarihte kayıt yok.':'Yaklaşan veya geciken kayıt yok.'}</div>`;
}

window.completeRecord=(id)=>{
  const r=(state.records||[]).find(x=>x.id===id);
  if(!r) return;

  const dueDate=r.date||r.next||r.calendarDate;
  if(!dueDate) return;

  // Gelecek tarihli kayıt "Yapıldı" olamaz.
  if(dueDate>todayISO()){
    alert('Bu kayıt henüz gelmedi. Yapıldı olarak işaretlemek için kayıt tarihini bekleyin.');
    return;
  }

  // Randevu tamamlanınca yalnız takvimden kaldırılır.
  if(r.type==='appointment'){
    state.records=state.records.filter(x=>x.id!==id);
    saveState();
    renderAll();
    return;
  }

  // Sağlık işlemi tamamlanınca Sağlık Geçmişi'ne taşınır.
  // Uygulama tarihi planlanan tarihtir; bugünün tarihine çevrilmez.
  const historyRecord={
    id:uid(),
    petId:r.petId,
    type:r.type,
    title:r.title||(
      r.type==='vaccine'?'Aşı':
      r.type==='internal'?'İç Parazit':
      r.type==='external'?'Dış Parazit':
      'Sağlık Kaydı'
    ),
    date:dueDate,
    application:r.application||r.product||r.name||'',
    appliedBy:r.appliedBy||r.practitioner||'',
    note:r.note||'',
    nextDate:r.nextDate||''
  };

  // Existing health history is stored in state.health.
  if(!Array.isArray(state.health)) state.health=[];
  state.health.push(historyRecord);

  // Completed task disappears from calendar.
  state.records=state.records.filter(x=>x.id!==id);

  // If a next date was defined, create a fresh future task.
  const nextDate=r.nextDate||'';
  if(nextDate && nextDate>dueDate){
    state.records.push({
      ...r,
      id:uid(),
      date:nextDate,
      next:nextDate,
      nextDate:'',
      completed:false
    });
  }

  saveState();
  renderAll();
};
window.snoozeRecord=(id,days)=>{
  const r=state.records.find(x=>x.id===id); if(!r||!r.next)return;
  const d=new Date(r.next+'T12:00:00'); d.setDate(d.getDate()+days); r.next=d.toISOString().slice(0,10); saveState();
};


window.editVet=(id)=>{
  const v=state.vets.find(x=>x.id===id); if(!v)return;
  openModal('Kliniği Düzenle',`
    <label>Klinik adı *</label><input id="evName" value="${v.name}">
    <label>Veteriner hekim</label><input id="evDoctor" value="${v.doctor||''}">
    <label>Telefon</label><input id="evPhone" value="${v.phone||''}">
    <label>Adres</label><textarea id="evAddress">${v.address||''}</textarea>
    ${v.primary?'':`<button type="button" class="secondary big" id="makePrimary" style="margin-top:14px">⭐ Ana Veterinerim Yap</button>`}
    <button type="button" class="danger big" id="deleteVet" style="margin-top:10px">Kliniği Sil</button>
  `,()=>{
    const name=$('#evName').value.trim(); if(!name)return false;
    Object.assign(v,{name,doctor:$('#evDoctor').value,phone:$('#evPhone').value,address:$('#evAddress').value}); saveState();
  });
  setTimeout(()=>{
    const mp=$('#makePrimary'); if(mp) mp.onclick=()=>{state.vets.forEach(x=>x.primary=x.id===id);saveState();$('#modal').close();};
    $('#deleteVet').onclick=()=>{if(confirm('Bu klinik silinsin mi?')){state.vets=state.vets.filter(x=>x.id!==id);if(state.vets.length&&!state.vets.some(x=>x.primary))state.vets[0].primary=true;saveState();$('#modal').close();}};
  },0);
};

function renderVet(){
  if(!state.vets.length){
    $('#vetCard').innerHTML='<div class="card empty">Henüz veteriner eklenmedi.</div>';
    return;
  }

  const primary=state.vets.find(v=>v.primary)||state.vets[0];
  const others=state.vets.filter(v=>v.id!==primary.id);

  $('#vetCard').innerHTML=`
    <div class="card" onclick="editVet('${primary.id}')" style="cursor:pointer">
      <div class="muted">⭐ Ana Veteriner</div>
      <h3>${primary.name}</h3>
      <div>${primary.doctor||''}</div>
      <div class="muted">${primary.phone||''}</div>
      <div class="muted">${primary.address||''}</div>
      <div class="muted" style="margin-top:8px">Düzenlemek için dokun</div>
    </div>
    ${others.length?`
      <h3 style="margin:18px 0 10px">Diğer Kayıtlı Klinikler</h3>
      <div class="stack">
        ${others.map(v=>`
          <div class="card" onclick="editVet('${v.id}')" style="cursor:pointer">
            <h3>${v.name}</h3>
            <div>${v.doctor||''}</div>
            <div class="muted">${v.phone||''}</div>
            <div class="muted">${v.address||''}</div>
            <div class="muted" style="margin-top:8px">Düzenlemek için dokun</div>
          </div>
        `).join('')}
      </div>`:''}
  `;
}




function renderProfile(){
  normalizeState();
  if($('#profileName')) $('#profileName').value=state.profile.name||'';
  if($('#profileEmail')) $('#profileEmail').value=state.profile.email||'';
  if($('#profilePhone')) $('#profilePhone').value=state.profile.phone||'';
  if($('#defaultReminder')) $('#defaultReminder').value=String(state.settings.defaultReminder??1);
  if($('#repeatOverdue')) $('#repeatOverdue').checked=state.settings.repeatOverdue!==false;

  const list=$('#profilePetsList');
  if(list) list.innerHTML=state.pets.length?state.pets.map(p=>`
    <div class="card petcard profilePet" onclick="editPet('${p.id}')">
      <div class="avatar">${p.type==='cat'?'🐱':'🐶'}</div>
      <div class="petmeta"><div class="petname">${p.name}</div><div class="muted">${p.type==='cat'?'Kedi':'Köpek'} • ${p.sex}</div></div><div>›</div>
    </div>`).join(''):'<div class="card empty">Henüz bir pet eklenmedi.</div>';
}
function bindProfileSettings(){
  const save=$('#saveProfileBtn');
  if(save&&!save.dataset.bound){save.dataset.bound='1';save.onclick=()=>{state.profile={name:$('#profileName').value.trim(),email:$('#profileEmail').value.trim(),phone:$('#profilePhone').value.trim()};saveState();alert('Profil bilgileri kaydedildi.');};}
  const rem=$('#defaultReminder');
  if(rem&&!rem.dataset.bound){rem.dataset.bound='1';rem.onchange=()=>{state.settings.defaultReminder=+rem.value;saveState();};}
  const rep=$('#repeatOverdue');
  if(rep&&!rep.dataset.bound){rep.dataset.bound='1';rep.onchange=()=>{state.settings.repeatOverdue=rep.checked;saveState();};}
}

function renderAll(){ renderPets(); renderHealth(); renderCalendar(); renderVet(); renderProfile(); bindProfileSettings(); renderPetDetailIfOpen(); }
state.pets=state.pets||[];
state.records=state.records||[];
state.vets=state.vets||[];
state.meds=state.meds||[];
state.weights=state.weights||[];
if(selectedCalendarDate===null){
  selectedCalendarDate=todayISO();
  calendarListMode='upcoming';
}
renderAll();

if('serviceWorker' in navigator){
  navigator.serviceWorker.getRegistrations().then(regs=>{
    regs.forEach(r=>r.unregister());
  }).catch(()=>{});
}
if('caches' in window){
  caches.keys().then(keys=>{
    keys.forEach(k=>caches.delete(k));
  }).catch(()=>{});
}

setTimeout(()=>{
  const back=$('#petDetailBack');
  if(back) back.onclick=()=>{ const nav=$('.navitem[data-view="homeView"]'); if(nav) nav.click(); };

  const edit=$('#petDetailEdit');
  if(edit) edit.onclick=()=>{ if(detailPetId) editPet(detailPetId); };

  const vaccines=$('#detailVaccines');
  if(vaccines) vaccines.onclick=()=>{
    if(!detailPetId) return;
    selectedPetId=detailPetId;
    const nav=$('.navitem[data-view="healthView"]'); if(nav) nav.click();
    setTimeout(()=>setHealthHistoryFilter('vaccine'),0);
  };

  const history=$('#detailHistory');
  if(history) history.onclick=()=>{
    if(!detailPetId) return;
    selectedPetId=detailPetId;
    const nav=$('.navitem[data-view="healthView"]'); if(nav) nav.click();
    setTimeout(()=>setHealthHistoryFilter('all'),0);
  };
},0);


document.addEventListener('click',(e)=>{
  const btn=e.target.closest('button');
  if(!btn) return;
  const txt=(btn.textContent||'').trim().toLowerCase();
  if(txt==='kapat' || txt==='vazgeç' || txt==='iptal'){
    const dlg=btn.closest('dialog');
    if(dlg){
      e.preventDefault();
      try{ dlg.close(); }catch(err){ dlg.removeAttribute('open'); }
    }
  }
},true);


function pkDueStatus(dateStr){
  if(!dateStr) return {key:'normal',label:'',diff:null};
  const today=new Date(); today.setHours(0,0,0,0);
  const due=new Date(String(dateStr).slice(0,10)+'T00:00:00');
  if(Number.isNaN(due.getTime())) return {key:'normal',label:'',diff:null};
  const diff=Math.round((due-today)/86400000);
  if(diff<0) return {key:'overdue',label:`${Math.abs(diff)} GÜN GECİKTİ`,diff};
  if(diff===0) return {key:'today',label:'BUGÜN',diff};
  if(diff<=7) return {key:'soon',label:`${diff} GÜN KALDI`,diff};
  return {key:'normal',label:'',diff};
}





/* v2.60 — CLEAN onboarding behavior */
(function(){
  function initPkCleanOnboarding(){
    const root=document.getElementById('pkCleanOnboarding');
    if(!root) return;

    const slides=[...root.querySelectorAll('.pkCleanSlide')];
    let index=0, sx=0, sy=0;

    document.body.classList.add('pkCleanOnboardingOpen');

    function show(n){
      index=Math.max(0,Math.min(slides.length-1,n));
      slides.forEach((s,i)=>s.classList.toggle('active',i===index));
    }

    function finish(openAddFriend){
      document.body.classList.remove('pkCleanOnboardingOpen');
      root.remove();

      if(openAddFriend){
        setTimeout(()=>{
          const addBtn=document.getElementById('addPetBtn');
          if(addBtn) addBtn.click();
        },0);
      }
    }

    root.querySelectorAll('.pkCleanSkip').forEach(btn=>{
      btn.addEventListener('click',(e)=>{
        e.preventDefault();
        e.stopPropagation();
        finish(false);
      });
    });

    const add=document.getElementById('pkCleanAddFriend');
    if(add){
      add.addEventListener('click',(e)=>{
        e.preventDefault();
        e.stopPropagation();
        finish(true);
      });
    }

    root.addEventListener('touchstart',(e)=>{
      const t=e.touches[0];
      sx=t.clientX; sy=t.clientY;
    },{passive:true});

    root.addEventListener('touchend',(e)=>{
      const t=e.changedTouches[0];
      const dx=t.clientX-sx, dy=t.clientY-sy;

      if(Math.abs(dx)>50 && Math.abs(dx)>Math.abs(dy)){
        if(dx<0 && index<slides.length-1) show(index+1);
        else if(dx>0 && index>0) show(index-1);
      }
    },{passive:true});

    show(0);
  }

  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',initPkCleanOnboarding,{once:true});
  }else{
    initPkCleanOnboarding();
  }
})();

