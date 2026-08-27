
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
function todayISO(){
  const d=new Date();
  const y=d.getFullYear();
  const m=String(d.getMonth()+1).padStart(2,'0');
  const day=String(d.getDate()).padStart(2,'0');
  return `${y}-${m}-${day}`;
}
function fmt(d){ if(!d) return '—'; const x=new Date(d+'T12:00:00'); return x.toLocaleDateString('tr-TR'); }
function petById(id){ return state.pets.find(p=>p.id===id); }

function recordEventDateTime(r){
  if(!r?.next) return null;
  const time=(r.time && /^\d{2}:\d{2}$/.test(r.time))?r.time:'23:59';
  const d=new Date(`${r.next}T${time}:00`);
  return Number.isFinite(d.getTime())?d:null;
}
function appointmentHasPassed(r){
  if(r?.type!=='appointment') return false;
  const d=recordEventDateTime(r);
  return !!d && d.getTime()<=Date.now();
}
function isUpcomingCalendarRecord(r){
  if(!r?.next || r.cancelled===true) return false;

  // "done" yalnız veteriner randevularında durum bilgisidir.
  // Aşı / iç parazit / dış parazit kayıtları geçmişte yapılmış sağlık
  // kaydından bir sonraki uygulama planı üretir; r.done değeri bu planı
  // Yaklaşanlar listesinden gizlememelidir.
  if(r.type==='appointment'){
    if(r.done===true) return false;
    return !appointmentHasPassed(r);
  }

  return ['vaccine','internal','external'].includes(r.type);
}





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
  <label>Kilo (kg)</label><input id="petWeight" inputmode="decimal" placeholder="4,8">
  <label>Mikroçip no (isteğe bağlı)</label><input id="petChip">
  <label>Notlar</label><textarea id="petNote" placeholder="İsteğe bağlı"></textarea>
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

const resetBtn=$('#resetBtn');
if(resetBtn){
  resetBtn.onclick=()=>{
    if(confirm('Tüm PetKarnem test verileri silinsin mi?')){
      state=baseState(); normalizeState(); selectedPetId=null; saveState();
    }
  };
}


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
      <label>Sonraki uygulama tarihi</label><input id="recNext" type="date">
      <label>Hatırlatma</label><select id="recReminder">
        <option value="0">Hatırlatma yok</option>
        <option value="1" selected>1 gün önce</option>
        <option value="3">3 gün önce</option>
        <option value="7">7 gün önce</option>
        <option value="14">14 gün önce</option>
      </select>
      <div class="muted" style="margin-top:-6px;margin-bottom:8px">Hatırlatma, sonraki uygulama tarihine göre gönderilir.</div>
      <label>Not</label><textarea id="recNote"></textarea>
    `,()=>{
      const title=$('#recTitle').value.trim(); if(!title) return false;
      if(type==='vaccine' && /iç\\s*parazit|dış\\s*parazit/i.test(title)){
        alert('Bu alan aşı kaydı içindir. İç/Dış Parazit için ilgili butonu kullan.');
        return false;
      }
      const by=$('#recBy').value;
      const next=$('#recNext').value;
      state.records.push({id:uid(),petId:pet.id,type,title,date:$('#recDate').value,by,
        vetId:by==='vet'?$('#recVet').value:'',next,reminderDays:next?+$('#recReminder').value:0,note:$('#recNote').value,done:true});
      saveState();
    });
    setTimeout(()=>{
      const by=$('#recBy'), wrap=$('#vetSelectWrap');
      const rr=$('#recReminder'), nextDate=$('#recNext');
      if(rr && nextDate){
        const preferred=Number(state.settings?.defaultReminder);
        rr.value=String(preferred>0?preferred:1);
        rr.disabled=!nextDate.value;
        const syncReminderToNextDate=()=>{
          rr.disabled=!nextDate.value;
          if(!nextDate.value){
            rr.value='0';
          }else if(Number(rr.value)===0){
            rr.value=String(preferred>0?preferred:1);
          }
        };
        nextDate.addEventListener('change',syncReminderToNextDate);
        syncReminderToNextDate();
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
      <label>Başlangıç tarihi *</label><input id="mStart" type="date" value="${todayISO()}">
      <label>Kaç gün? *</label><input id="mDays" type="number" min="1" step="1" inputmode="numeric" value="7">
      <label>Hatırlatma</label>
      <select id="mReminder">
        <option value="off" selected>Hatırlatma yok</option>
        <option value="on">İlaç saatlerinde hatırlat</option>
      </select>
      <div id="mTimesBlock" style="display:none">
        <label>İlaç saatleri *</label>
        <div id="mTimesList">
          <div class="medTimeRow" style="display:flex;gap:8px;align-items:center;margin-bottom:8px">
            <input class="mTime" type="time" style="flex:1">
          </div>
        </div>
        <button type="button" class="secondary smallbtn" id="mAddTime" style="margin-bottom:10px">+ Saat Ekle</button>
      </div>
    `,()=>{
      const name=$('#mName').value.trim();
      const start=$('#mStart').value;
      const daysRaw=$('#mDays').value.trim();
      const days=Number(daysRaw);
      const reminderOn=$('#mReminder').value==='on';
      const times=[...document.querySelectorAll('#mTimesList .mTime')].map(el=>el.value).filter(Boolean).join(',');
      if(!name) return false;
      if(!start){ alert('Başlangıç tarihi gerekli.'); return false; }
      if(!daysRaw || !Number.isInteger(days) || days<1){
        alert('Kaç gün alanı zorunludur ve en az 1 gün olmalıdır.'); return false;
      }
      if(reminderOn && !times){
        alert('Hatırlatma için en az bir ilaç saati seçin.'); return false;
      }
      state.meds.push({id:uid(),petId:pet.id,name,dose:$('#mDose').value,start,times,days,reminder:reminderOn});
      saveState();
    });
    setTimeout(()=>{
      const reminder=$('#mReminder'), block=$('#mTimesBlock'), list=$('#mTimesList'), add=$('#mAddTime');
      if(!reminder||!block||!list||!add) return;
      const sync=()=>{ block.style.display=reminder.value==='on'?'':'none'; };
      const bindRemove=()=>list.querySelectorAll('.medRemoveTime').forEach(btn=>{
        btn.onclick=()=>btn.closest('.medTimeRow')?.remove();
      });
      reminder.addEventListener('change',sync);
      add.onclick=()=>{
        const row=document.createElement('div');
        row.className='medTimeRow';
        row.style.cssText='display:flex;gap:8px;align-items:center;margin-bottom:8px';
        row.innerHTML=`<input class="mTime" type="time" style="flex:1"><button type="button" class="secondary smallbtn medRemoveTime">Sil</button>`;
        list.appendChild(row); bindRemove(); row.querySelector('.mTime')?.focus();
      };
      bindRemove(); sync();
    },0);
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
   
    <label>Kilo (kg)</label><input id="editPetWeight" value="${p.weight||''}">
    <label>Mikroçip no</label><input id="editPetChip" value="${p.chip||''}">
    <label>Notlar</label><textarea id="editPetNote">${p.note||''}</textarea>
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
  if(photo) photo.src=p.photo || (p.type==='cat'?'pet-cat.jpg':'pet-dog.jpg');

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
      <div class="refPetVisual"><img src="${p.photo || (p.type==='cat'?'pet-cat.jpg':'pet-dog.jpg')}" alt=""><span class="refPawBadge">🐾</span></div>
      <div class="refPetName">${p.name}</div>
      <span class="refSpecies">${p.type==='cat'?'Kedi':'Köpek'}</span>
      <div class="refPetMeta">${meta || p.breed || 'Bilgileri görüntüle'}</div>
    </button>`;
  }).join('');

  grid.innerHTML=cards+`<button type="button" class="refAddCard" id="refAddPet"><span class="refAddCircle">＋</span><b>Dost Ekle</b></button>`;

  $$('[data-pet-detail]').forEach(x=>x.onclick=()=>showPetDetail(x.dataset.petDetail));
  const add=$('#refAddPet'); if(add) add.onclick=()=>$('#addPetBtn').click();

  const now=todayISO();
  // Ana sayfa: bugün dahil tam 3 takvim günü (bugün + 2 gün).
  // Kayıt sayısını 3 ile sınırlamıyoruz; pencere içindeki tüm planları gösteriyoruz.
  const endDate=new Date(now+'T12:00:00');
  endDate.setDate(endDate.getDate()+2);
  const endISO=endDate.getFullYear()+'-'+String(endDate.getMonth()+1).padStart(2,'0')+'-'+String(endDate.getDate()).padStart(2,'0');

  const future=state.records
    .filter(r=>r.petId&&r.next&&r.next>=now&&r.next<=endISO&&['appointment','vaccine','internal','external'].includes(r.type)&&isUpcomingCalendarRecord(r))
    .sort((a,b)=>(a.next+(a.time||'')).localeCompare(b.next+(b.time||'')));

  upcoming.innerHTML=future.length?future.map(r=>{
    const p=petById(r.petId), [emoji,cls]=recordIcon(r.type);
    const days=Math.max(0,Math.ceil((new Date(r.next+'T12:00:00')-new Date(now+'T12:00:00'))/86400000));
    const title=r.type==='appointment'?'Veteriner Randevusu':
                r.type==='vaccine'?(r.title||'Aşı'):
                r.type==='internal'?'İç Parazit':'Dış Parazit';
    const detailText = r.type==='appointment'
      ? ''
      : (r.title && r.title!==title ? r.title : '');

    return `<div class="refUpcomingCard">
      <div class="refUpcomingIcon ${cls}">${emoji}</div>
      <div class="refUpcomingText">
        <b>${p?.name||''} – ${title}</b>
        ${detailText?`<small class="refUpcomingDetail">${detailText}</small>`:''}
        <span>${fmt(r.next)}${r.time?' • '+r.time:''}</span>
      </div>
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
  const activeMed=[...state.meds].reverse().find(m=>{
    if(m.petId!==selectedPetId) return false;
    const today=new Date(todayISO()+'T00:00:00');
    const start=new Date(m.start+'T00:00:00');
    const end=new Date(start); end.setDate(end.getDate()+(m.days||1)-1);
    return today>=start && today<=end;
  });
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
        <div><small>Aktif İlaç</small><b>${activeMed?activeMed.name:'Yok'}</b><em>${activeMed?`${activeMed.dose?activeMed.dose+' • ':''}${activeMed.days} gün`:'—'}</em></div>
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
  const defs=[['all','Tümü'],['appointment','Veteriner Ziyaretleri'],['internal','İç Parazit'],['external','Dış Parazit'],['vaccine','Aşılar'],['med','İlaçlar'],['weight','Kilo']];
  filters.innerHTML=defs.map(([k,l])=>`<button type="button" class="chip ${healthHistoryFilter===k?'active':''}" data-history-filter="${k}">${l}</button>`).join('');
  $$('#healthHistoryFilters [data-history-filter]').forEach(btn=>{
    btn.onclick=(e)=>{ e.preventDefault(); setHealthHistoryFilter(btn.dataset.historyFilter); };
  });

  const hist=$('#healthHistory');
  if(!selectedPetId){hist.innerHTML='<div class="card empty">Önce bir pet ekle.</div>';return;}

  const recs=state.records.filter(r=>r.petId===selectedPetId && (['vaccine','internal','external'].includes(r.type) || (r.type==='appointment' && r.done===true))).map(r=>({...r,category:r.type}));
  const weights=state.weights.filter(r=>r.petId===selectedPetId).map(w=>({title:`Kilo • ${w.value} kg`,date:w.date,type:'weight',category:'weight'}));
  const meds=state.meds.filter(r=>r.petId===selectedPetId).map(m=>({
    title:m.name||'İlaç',
    date:m.start,
    type:'med',
    category:'med',
    dose:m.dose||'',
    times:m.times||'',
    days:Number(m.days)||1,
    reminder:m.reminder===true
  }));

  let all=[...recs,...weights,...meds].sort((a,b)=>(b.date||b.next||'').localeCompare(a.date||a.next||''));
  if(healthHistoryFilter!=='all') all=all.filter(r=>r.category===healthHistoryFilter);

  hist.innerHTML=all.length?all.map(r=>{
    const label=r.type==='vaccine'?'💉 Aşı':r.type==='internal'?'🪱 İç Parazit':r.type==='external'?'🛡️ Dış Parazit':r.type==='med'?'💊 İlaç':r.type==='weight'?'⚖️ Kilo':'🩺 Veteriner';
    const displayTitle=r.type==='appointment'?'Veteriner Ziyareti':r.title;
    const when=`${fmt(r.date||r.next)}${r.type==='appointment'&&r.time?' • '+r.time:(r.next&&r.date?` • Sonraki ${fmt(r.next)}`:'')}`;
    const note=r.note?`<div class="healthHistoryNote" style="margin-top:7px">📝 ${r.note}</div>`:'';

    if(r.type==='med'){
      const timeList=(r.times||'').split(',').map(x=>x.trim()).filter(Boolean);
      const medMeta=[
        r.dose?`Doz: ${r.dose}`:'',
        `Süre: ${r.days||1} gün`
      ].filter(Boolean).join(' • ');
      const medTimes=timeList.length?`Saatler: ${timeList.join(' • ')}`:'Saat: Belirtilmedi';
      const medReminder=r.reminder?'🔔 Hatırlatma açık':'🔕 Hatırlatma kapalı';
      return `<div class="card">
        <b>💊 İlaç • ${displayTitle}</b>
        <div class="muted">Başlangıç: ${fmt(r.date)}</div>
        <div class="muted">${medMeta}</div>
        <div class="muted">${medTimes}</div>
        <div class="muted">${medReminder}</div>
      </div>`;
    }

    return `<div class="card"><b>${label} • ${displayTitle}</b><div class="muted">${when}</div>${note}</div>`;
  }).join(''):'<div class="card empty">Bu kategoride henüz kayıt yok.</div>';
}

window.addAppointment=()=>{
  if(!state.pets.length){
    alert('Önce bir pet ekle.');
    return;
  }

  openModal('Veteriner Randevusu / Ziyareti',`
    <label>Pet *</label>
    <select id="apptPet">
      ${state.pets.map(p=>`<option value="${p.id}">${p.type==='cat'?'🐱':'🐶'} ${p.name}</option>`).join('')}
    </select>

    <label>Başlık *</label>
    <input id="apptTitle" value="Veteriner Randevusu">

    <label>Tarih *</label>
    <input id="apptDate" type="date">

    <label>Saat *</label>
    <input id="apptTime" type="time" required>

    <label>Durum</label>
    <select id="apptStatus">
      <option value="planned" selected>Planlı randevu</option>
      <option value="completed">Ziyaret tamamlandı</option>
    </select>
    <div class="muted" style="margin-top:6px">
      Ani bir veteriner ziyaretini sonradan kaydediyorsan “Ziyaret tamamlandı” seçebilirsin.
    </div>

    <label>Klinik</label>
    <select id="apptVet">
      <option value="">Seçilmedi</option>
      ${state.vets.map(v=>`<option value="${v.id}" ${v.primary?'selected':''}>${v.primary?'⭐ ':''}${v.name}</option>`).join('')}
    </select>

    <div id="apptReminderBlock">
      <label>Hatırlatma</label>
      <select id="apptReminder">
        <option value="0" selected>Hatırlatma yok</option>
        <option value="60">1 saat önce</option>
        <option value="120">2 saat önce</option>
        <option value="1440">1 gün önce</option>
      </select>
      <div class="muted" style="margin-top:6px">Planlı randevular için hatırlatmalar gerçek bildirim olarak gönderilir.</div>
    </div>

    <label>Not</label>
    <textarea id="apptNote"></textarea>
  `,()=>{
    const title=$('#apptTitle').value.trim();
    const date=$('#apptDate').value;
    const time=$('#apptTime').value;
    const status=$('#apptStatus').value;

    if(!title || !date || !time){
      alert('Başlık, tarih ve saat gerekli.');
      return false;
    }

    const eventAt=new Date(`${date}T${time}:00`);
    if(status==='completed' && eventAt.getTime()>Date.now()){
      alert('Gelecekteki bir ziyaret tamamlandı olarak kaydedilemez.');
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
      time,
      reminder: status==='completed' ? 0 : +$('#apptReminder').value,
      note:$('#apptNote').value,
      done:status==='completed',
      completedAt:status==='completed'?new Date().toISOString():null
    });

    saveState();
  });
  setTimeout(()=>{
    const status=$('#apptStatus'), block=$('#apptReminderBlock'), reminder=$('#apptReminder');
    if(!status||!block) return;
    const sync=()=>{ const completed=status.value==='completed'; block.style.display=completed?'none':''; if(completed&&reminder) reminder.value='0'; };
    status.addEventListener('change',sync); sync();
  },0);
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
      ${r.next?`<div class="muted">Sonraki uygulama tarihi: ${fmt(r.next)}</div>`:''}
      ${r.by==='vet'?`<div class="muted">Klinik: ${vet?.name||'Seçilmedi'}</div>`:''}
      <div class="muted">${reminderText}</div>
      ${r.note?`<div style="margin-top:10px">${r.note}</div>`:''}
    </div>
  `);
};


window.changeRecordDate=(id)=>{
  const r=state.records.find(x=>x.id===id);
  if(!r)return;

  openModal(r.type==='appointment'?'Veteriner Ziyaretini Düzenle':'Tarihi Değiştir',`
    ${r.type==='appointment'?`<label>Başlık</label><input id="editCalTitle" value="${r.title||''}">`:''}
    <label>Tarih *</label><input id="editCalDate" type="date" value="${r.next||''}">
    ${r.type==='appointment'?`
      <label>Saat *</label><input id="editCalTime" type="time" required value="${r.time||''}">
      <label>Durum</label>
      <select id="editCalStatus">
        <option value="planned" ${r.done===true?'':'selected'}>Planlı randevu</option>
        <option value="completed" ${r.done===true?'selected':''}>Ziyaret tamamlandı</option>
      </select>
      <label>Klinik</label>
      <select id="editCalVet">
        <option value="">Seçilmedi</option>
        ${state.vets.map(v=>`<option value="${v.id}" ${r.vetId===v.id?'selected':''}>${v.primary?'⭐ ':''}${v.name}</option>`).join('')}
      </select>
      <div id="editCalReminderBlock">
      <label>Hatırlatma</label>
      <select id="editCalReminder">
        <option value="0" ${(r.reminder??0)===0?'selected':''}>Hatırlatma yok</option>
        <option value="60" ${r.reminder===60?'selected':''}>1 saat önce</option>
        <option value="120" ${r.reminder===120?'selected':''}>2 saat önce</option>
        <option value="1440" ${r.reminder===1440?'selected':''}>1 gün önce</option>
      </select>
      </div>
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
    if(r.type==='appointment'){
      const t=$('#editCalTime').value;
      if(!t){ alert('Veteriner ziyareti için saat gerekli.'); return false; }
      const status=$('#editCalStatus').value;
      const eventAt=new Date(`${d}T${t}:00`);
      if(status==='completed' && eventAt.getTime()>Date.now()){
        alert('Gelecekteki bir ziyaret tamamlandı olarak işaretlenemez.');
        return false;
      }
    } else if(d<todayISO()){
      alert('Tarih bugünden eski olamaz.');
      return false;
    }
    r.next=d;

    // Tarih değişince eski seçili gün listesi açık kalmasın.
    // Kullanıcı doğrudan güncellenmiş Yaklaşanlar listesine dönsün.
    selectedCalendarDate=null;

    if(r.type==='appointment'){
      r.title=$('#editCalTitle').value.trim()||(r.done?'Veteriner Ziyareti':'Veteriner Randevusu');
      r.time=$('#editCalTime').value;
      r.vetId=$('#editCalVet').value;
      r.done=$('#editCalStatus').value==='completed';
      r.completedAt=r.done?(r.completedAt||new Date().toISOString()):null;
      r.reminder=r.done?0:+$('#editCalReminder').value;
      r.note=$('#editCalNote').value;
    } else {
      r.reminderDays=+$('#editHealthReminder').value;
    }

    saveState();
    renderCalendar();
    return true;
  });
  if(r.type==='appointment') setTimeout(()=>{
    const status=$('#editCalStatus'), block=$('#editCalReminderBlock'), reminder=$('#editCalReminder');
    if(!status||!block) return;
    const sync=()=>{ const completed=status.value==='completed'; block.style.display=completed?'none':''; if(completed&&reminder) reminder.value='0'; };
    status.addEventListener('change',sync); sync();
  },0);
};


window.showCalendarDetail=(id)=>{
  const r=state.records.find(x=>x.id===id);
  if(!r)return;
  const pet=petById(r.petId);
  const vet=state.vets.find(v=>v.id===r.vetId);

  openInfoModal(r.done===true?'Veteriner Ziyareti Detayı':'Veteriner Randevusu Detayı',`
    <div class="card">
      <h3>${pet?.name||''} • ${r.done===true?'Veteriner Ziyareti':'Veteriner Randevusu'}</h3>
      <div>📅 ${fmt(r.next)}${r.time?' • '+r.time:''}</div>
      <div>🩺 ${vet?.name||'Klinik seçilmedi'}</div>
      <div>${r.done===true?'✅ Tamamlandı':'🕒 Planlı'}</div>
      <div>🔔 ${r.reminder===0?'Hatırlatma yok':r.reminder===60?'1 saat önce':r.reminder===120?'2 saat önce':'1 gün önce'}</div>
      <div style="margin-top:12px"><b>Notlar</b><div style="margin-top:5px">${r.note||'Not eklenmemiş.'}</div></div>
    </div>
  `);
};

window.changeCalendarMonth=(delta)=>{
  const step=Number(delta)||0;
  calendarCursor=new Date(calendarCursor.getFullYear(),calendarCursor.getMonth()+step,1,12,0,0,0);
  selectedCalendarDate=null;
  renderCalendar();
};
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


function pkIsWithinUpcoming7Days(dateValue){
  if(!dateValue) return false;
  const d = new Date(String(dateValue).slice(0,10) + "T00:00:00");
  if(Number.isNaN(d.getTime())) return false;
  const today = new Date();
  today.setHours(0,0,0,0);
  const end = new Date(today);
  end.setDate(end.getDate() + 7);
  return d >= today && d <= end;
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
      title.textContent=`${pretty} Planları`;
    }
  }else{
    // Yaklaşanlar gerçekten gelecekte olan kayıtları gösterir.
    // Saati geçmiş veteriner randevuları burada kalmaz ve otomatik tamamlanmaz.
    list=list.filter(r=>r.diff>=0 && r.diff<=7 && isUpcomingCalendarRecord(r));
    if(title) title.textContent='Yaklaşanlar';
  }

  list.sort((a,b)=>(a.calendarDate+(a.time||'')).localeCompare(b.calendarDate+(b.time||'')));

  const listEl=$('#calendarList');
  if(!listEl) return;

  listEl.innerHTML=list.length?list.map(r=>{
    const p=petById(r.petId);
    const petIcon=p?.type==='dog'?'🐶':'🐱';
    const typeLabel=
      r.type==='appointment'?(r.done===true?'🩺 Veteriner Ziyareti':'🩺 Veteriner Randevusu'):
      r.type==='vaccine'?'💉 Aşı':
      r.type==='internal'?'🪱 İç Parazit':
      '🛡️ Dış Parazit';

    const status=(r.type==='appointment' && r.done===true)
      ? {key:'normal',label:'TAMAMLANDI'}
      : r.type==='appointment' && appointmentHasPassed(r)
      ? {key:'overdue',label:'SAATİ GEÇTİ'}
      : r.diff<0
      ? {key:'overdue',label:'GEÇMİŞ'}
      : r.diff===0
      ? {key:'today',label:'BUGÜN'}
      : r.diff<=7
      ? {key:'soon',label:`${r.diff} GÜN KALDI`}
      : {key:'normal',label:''};

    const bell=
      (r.type==='appointment'&&r.reminder!==0) ||
      (['vaccine','internal','external'].includes(r.type)&&r.reminderDays>0)
      ? '🔔 ':'';
    const displayTitle = r.type==='appointment' ? typeLabel : `${typeLabel} • ${r.title}`;

    return `<div class="card">
      <div class="calendarPetTitle">${petIcon} <b>${p?.name||''}</b></div>
      <div>
        <b>${displayTitle}</b>
        ${calendarListMode==='day'?'':(status.label?`<span class="pkDueBadge ${status.key}">${bell}${status.label}</span>`:'')}
      </div>
      <div class="muted">${fmt(r.calendarDate)}${r.time?' • '+r.time:''}</div>
      <div class="calendarActions" style="margin-top:10px">
        ${r.type==='appointment'
          ? `<button class="secondary smallbtn" onclick="showCalendarDetail('${r.id}')">Detay</button>
             <button class="secondary smallbtn" onclick="changeRecordDate('${r.id}')">Düzenle</button>
             ${r.done===true
               ? `<button class="secondary smallbtn" onclick="undoCompleteRecord('${r.id}')">Tamamlanmadı</button>`
               : `<button class="primary smallbtn ${r.diff>0?'disabledAction':''}" ${r.diff>0?'disabled':''} onclick="completeRecord('${r.id}')">Tamamlandı</button>`}`
          : `<button class="secondary smallbtn" onclick="showHealthCalendarDetail('${r.id}')">Detay</button>
             <button class="secondary smallbtn" onclick="changeRecordDate('${r.id}')">Tarihi Değiştir</button>`
        }
      </div>
    </div>`;
  }).join(''):`<div class="card empty">${calendarListMode==='day'?'Bu tarihte plan yok.':'Yaklaşan plan yok.'}</div>`;

  // Saati geçmiş ama sonucu belirtilmemiş veteriner randevuları kaybolmaz.
  // Yalnız Yaklaşanlar modunda, ayrı ve sadece gerektiğinde görünen bölümde tutulur.
  const pendingSection=$('#pendingAppointmentsSection');
  const pendingList=$('#pendingAppointmentsList');
  if(pendingSection && pendingList){
    const pending=(calendarListMode==='upcoming')
      ? items.filter(r=>r.type==='appointment' && r.done!==true && r.cancelled!==true && appointmentHasPassed(r))
          .sort((a,b)=>(b.calendarDate+(b.time||'')).localeCompare(a.calendarDate+(a.time||'')))
      : [];
    pendingSection.style.display=pending.length?'':'none';
    pendingList.innerHTML=pending.map(r=>{
      const pet=petById(r.petId);
      const petIcon=pet?.type==='dog'?'🐶':'🐱';
      return `<div class="card">
        <div class="calendarPetTitle">${petIcon} <b>${pet?.name||''}</b></div>
        <div><b>🩺 Veteriner Randevusu</b> <span class="pkDueBadge overdue">SAATİ GEÇTİ</span></div>
        <div class="muted">${fmt(r.calendarDate)}${r.time?' • '+r.time:''}</div>
        ${r.note?`<div class="muted" style="margin-top:6px">📝 ${r.note}</div>`:''}
        <div class="calendarActions" style="margin-top:10px">
          <button class="secondary smallbtn" onclick="showCalendarDetail('${r.id}')">Detay</button>
          <button class="primary smallbtn" onclick="completeRecord('${r.id}')">Tamamlandı</button>
          <button class="secondary smallbtn" onclick="cancelAppointment('${r.id}')">İptal</button>
        </div>
      </div>`;
    }).join('');
  }
}

window.cancelAppointment=(id)=>{
  const r=(state.records||[]).find(x=>x.id===id);
  if(!r || r.type!=='appointment') return;
  if(!confirm('Bu randevu iptal edildi olarak kapatılsın mı?')) return;
  r.cancelled=true;
  r.cancelledAt=new Date().toISOString();
  r.reminder=0;
  saveState();
};

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

  // Veteriner ziyareti tamamlanınca kayıt silinmez; geçmişte ve sağlık geçmişinde kalır.
  if(r.type==='appointment'){
    // Randevu günü geldiğinde saat henüz gelmemiş olsa bile kullanıcı
    // ziyareti tamamlandı olarak işaretleyebilir (erken gidilmiş olabilir).
    r.done=true;
    r.completedAt=new Date().toISOString();
    r.reminder=0;
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
window.undoCompleteRecord=(id)=>{
  const r=(state.records||[]).find(x=>x.id===id);
  if(!r || r.type!=='appointment') return;
  r.done=false;
  r.completedAt=null;
  if(r.reminder===0) r.reminder=0;
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





window.pkShowPrivacyPolicy=()=>openInfoModal('Gizlilik Politikası',`
<div class="legalText">
<p><b>Son güncelleme: 25 Ağustos 2026</b></p>
<p>PetKarnem, evcil hayvanlarının sağlık ve bakım bilgilerini düzenlemene yardımcı olmak için tasarlanmıştır.</p>
<h3>Hangi bilgiler işlenir?</h3>
<p>Uygulamaya senin girdiğin pet profili, fotoğraf, aşı ve parazit kayıtları, veteriner randevuları/ziyaretleri, ilaç planları, kilo kayıtları, veteriner bilgileri, notlar ve profil bilgileri işlenebilir.</p>
<h3>Veriler nerede tutulur?</h3>
<p>PetKarnem'in temel kayıtları öncelikle kullandığın cihazın yerel depolamasında tutulur. Takvim ve ilaç hatırlatmalarının çalışması için gerekli sınırlı planlama verileri ile bildirim aboneliğine ait teknik bilgiler PetKarnem'in Supabase altyapısına gönderilebilir.</p>
<h3>Bildirimler</h3>
<p>Hatırlatma seçtiğinde PetKarnem, cihazının bildirim sistemi ve Web Push altyapısını kullanabilir. Bildirim izni cihaz ayarlarından yönetilir.</p>
<h3>Yedekleme</h3>
<p>“Yedek Oluştur” özelliğini kullandığında kayıtların bir PetKarnem yedek dosyasına aktarılır. Dosyayı nerede saklayacağını sen seçersin. PetKarnem bu manuel yedek dosyasını senin adına otomatik olarak bir bulut hesabına yüklemez.</p>
<h3>Veri paylaşımı</h3>
<p>PetKarnem kişisel verilerini reklam amacıyla satmaz. Teknik hizmetlerin sağlanması için gerekli veriler, yalnızca uygulamanın çalışmasını sağlayan altyapı hizmetleri kapsamında işlenebilir.</p>
<h3>Verilerini silme</h3>
<p>Profildeki “Tüm Verilerimi Sil” seçeneğiyle bu cihazdaki PetKarnem kayıtlarını silebilirsin. Manuel olarak oluşturup başka bir yerde sakladığın yedek dosyaları ayrıca kendin silmelisin.</p>
<h3>İletişim</h3>
<p>Gizlilik ile ilgili soruların için: <a href="mailto:petkarnem07@gmail.com">petkarnem07@gmail.com</a></p>
<p class="muted">Bu metin, PetKarnem'in mevcut ücretsiz sürümündeki özelliklere göre hazırlanmıştır. Yeni hesap, bulut senkronizasyonu veya paylaşım özellikleri eklenirse politika güncellenecektir.</p>
</div>
`);
window.pkShowTerms=()=>openInfoModal('Kullanım Koşulları',`
<div class="legalText">
<p><b>Son güncelleme: 25 Ağustos 2026</b></p>
<p>PetKarnem'i kullanarak aşağıdaki koşulları kabul etmiş olursun.</p>
<h3>Hizmetin amacı</h3>
<p>PetKarnem; evcil hayvanların aşı, parazit uygulaması, ilaç, kilo, veteriner ve takvim kayıtlarını düzenlemeye yardımcı olan bir takip aracıdır.</p>
<h3>Veterinerlik hizmeti değildir</h3>
<p>PetKarnem veteriner hekimlik hizmeti sunmaz; tanı, tedavi veya acil sağlık hizmetinin yerine geçmez. Evcil hayvanının sağlığıyla ilgili kararlar için veteriner hekime başvurmalısın.</p>
<h3>Kayıtların doğruluğu</h3>
<p>Uygulamaya girilen bilgilerin, tarihlerinin, ilaç saatlerinin ve hatırlatma tercihlerinin doğruluğundan kullanıcı sorumludur.</p>
<h3>Hatırlatmalar</h3>
<p>Bildirimlerin ulaşması cihaz ayarları, internet bağlantısı ve işletim sistemi gibi PetKarnem dışındaki koşullardan etkilenebilir. Kritik sağlık işlemlerinde yalnızca uygulama bildirimlerine güvenilmemelidir.</p>
<h3>Yedekleme ve veri kaybı</h3>
<p>Ücretsiz sürümde kayıtların temel olarak cihazında tutulur. Düzenli olarak “Yedek Oluştur” özelliğini kullanman önerilir. Cihazın kaybolması, değiştirilmesi, uygulama/site verilerinin silinmesi veya teknik sorunlar veri kaybına yol açabilir.</p>
<h3>Değişiklikler</h3>
<p>PetKarnem'in özellikleri ve bu koşullar zaman içinde güncellenebilir. Önemli değişikliklerde metnin güncel sürümü uygulamada yayımlanır.</p>
<h3>İletişim</h3>
<p>Destek ve sorular için: <a href="mailto:petkarnem07@gmail.com">petkarnem07@gmail.com</a></p>
</div>
`);

window.pkDeleteAllData=()=>{
  const first=confirm('Bu cihazdaki tüm PetKarnem kayıtları kalıcı olarak silinecek. Devam edilsin mi?');
  if(!first) return;
  const second=confirm('Bu işlem geri alınamaz. Yedeğin yoksa verilerini geri getiremezsin. Tüm veriler silinsin mi?');
  if(!second) return;

  state=baseState();
  normalizeState();
  selectedPetId=null;
  detailPetId=null;
  healthHistoryFilter='all';
  selectedCalendarDate=null;
  calendarListMode='upcoming';
  localStorage.setItem(storeKey,JSON.stringify(state));
  pkQueueCalendarSync();
  pkQueueMedicationSync();
  renderAll();
  alert('Bu cihazdaki PetKarnem kayıtların silindi.');
};

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
function openUsageGuide(){
  openInfoModal('Nasıl Kullanılır?',`
    <div class="pkUsageGuide">
      <div class="pkGuideStep"><span>🐾</span><div><b>Dostunu ekle</b><p>Kedi veya köpeğinin temel bilgilerini kaydet.</p></div></div>
      <div class="pkGuideStep"><span>💉</span><div><b>Sağlık kayıtlarını gir</b><p>Aşı, iç/dış parazit, ilaç ve kilo bilgilerini ekle. Sonraki uygulama tarihini girersen PetKarnem takvimine ekler.</p></div></div>
      <div class="pkGuideStep"><span>🩺</span><div><b>Randevunu planla</b><p>Veteriner randevunu tarih ve saatiyle kaydet, istersen hatırlatma seç.</p></div></div>
      <div class="pkGuideStep"><span>🔔</span><div><b>Bildirimlerini açık tut</b><p>Hatırlatmaları alabilmek için cihazında PetKarnem bildirimlerinin açık olduğundan emin ol.</p></div></div>
      <div class="pkGuideTip">Yaklaşan işlemler Ana Sayfa ve Takvim’de görünür; tamamlanan veteriner ziyaretleri Sağlık Geçmişi’nde saklanır.</div>
    </div>
  `);
}

async function pkCreateBackup(){
  try{
    const backup={
      app:'PetKarnem',
      backupVersion:1,
      createdAt:new Date().toISOString(),
      data:state
    };

    const d=new Date();
    const stamp=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    const fileName=`PetKarnem-Yedek-${stamp}.json`;
    const json=JSON.stringify(backup,null,2);

    if(window.Capacitor?.isNativePlatform()){
      const Filesystem=window.Capacitor.Plugins.Filesystem;
      const Share=window.Capacitor.Plugins.Share;

      const result=await Filesystem.writeFile({
        path:fileName,
        data:json,
        directory:'CACHE',
        encoding:'utf8'
      });

      await Share.share({
        title:'PetKarnem Yedeği',
        text:'PetKarnem yedek dosyası',
        url:result.uri,
        dialogTitle:'Yedeği Kaydet'
      });

      return;
    }

    const blob=new Blob([json],{type:'application/json'});
    const url=URL.createObjectURL(blob);
    const a=document.createElement('a');
    a.href=url;
    a.download=fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(()=>URL.revokeObjectURL(url),1500);

  }catch(err){
    console.error('PetKarnem backup:',err);
    alert('Yedek oluşturulamadı. Lütfen tekrar dene.');
  }
}



async function pkRestoreBackupFile(file){
  if(!file) return false;
  try{
    const parsed=JSON.parse(await file.text());
    if(parsed?.app!=='PetKarnem'||!parsed?.data||!Array.isArray(parsed.data.pets)) throw new Error('invalid');

    const r=parsed.data;
    for(const k of ['pets','records','vets','meds','weights','docs']) if(!Array.isArray(r[k])) r[k]=[];
    r.profile=(r.profile&&typeof r.profile==='object')?r.profile:{name:'',email:'',phone:''};
    r.settings=(r.settings&&typeof r.settings==='object')?r.settings:{defaultReminder:1,repeatOverdue:true};

    state=r;
    normalizeState();
    selectedPetId=state.pets[0]?.id||null;
    localStorage.setItem(storeKey,JSON.stringify(state));
    renderAll();
    pkQueueCalendarSync();
    pkQueueMedicationSync();

    alert('PetKarnem yedeğin başarıyla geri yüklendi.');
    return true;
  }catch(e){
    console.error('PetKarnem restore:',e);
    alert('Bu dosya geçerli bir PetKarnem yedeği değil.');
    return false;
  }
}

function bindProfileSettings(){
  const privacy=$('#privacyPolicyBtn');
  if(privacy&&!privacy.dataset.bound){privacy.dataset.bound='1';privacy.onclick=pkShowPrivacyPolicy;}
  const terms=$('#termsBtn');
  if(terms&&!terms.dataset.bound){terms.dataset.bound='1';terms.onclick=pkShowTerms;}
  const deleteAll=$('#deleteAllDataBtn');
  if(deleteAll&&!deleteAll.dataset.bound){deleteAll.dataset.bound='1';deleteAll.onclick=pkDeleteAllData;}

  const backup=$('#backupDataBtn'), restore=$('#restoreDataBtn'), restoreInput=$('#restoreDataInput');
  if(backup&&!backup.dataset.bound){backup.dataset.bound='1';backup.onclick=pkCreateBackup;}
  if(restore&&restoreInput&&!restore.dataset.bound){
    restore.dataset.bound='1';
    restore.onclick=()=>{
      const ok=confirm('Bu işlem mevcut PetKarnem verilerinin yerine seçeceğin yedeği yükleyecek. Devam edilsin mi?');
      if(!ok) return;
      restoreInput.value='';
      restoreInput.click();
    };
    restoreInput.onchange=async()=>{
      const file=restoreInput.files && restoreInput.files[0];
      if(!file) return;
      await pkRestoreBackupFile(file);
      restoreInput.value='';
    };
  }
  const homeGuide=$('#openHomeUsageGuideBtn');
  if(homeGuide&&!homeGuide.dataset.bound){homeGuide.dataset.bound='1';homeGuide.onclick=openUsageGuide;}
  const guide=$('#openUsageGuideBtn');
  if(guide&&!guide.dataset.bound){guide.dataset.bound='1';guide.onclick=openUsageGuide;}
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
  // null = Yaklaşanlar modu. Bugünü otomatik seçme.
  calendarListMode='upcoming';
}
renderAll();

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
  if(diff<0) return {key:'overdue',label:'GEÇMİŞ',diff};
  if(diff===0) return {key:'today',label:'BUGÜN',diff};
  if(diff<=7) return {key:'soon',label:`${diff} GÜN KALDI`,diff};
  return {key:'normal',label:'',diff};
}




/* v2.70 visible camera photo picker */
(function(){
  function initPetCamera(){
    const picker=document.getElementById('petPhotoPicker');
    const camera=document.getElementById('petPhotoCameraBtn');
    if(!picker || !camera) return;

    camera.onclick=function(e){
      e.preventDefault(); e.stopPropagation();
      picker.value='';
      picker.click();
    };

    picker.onchange=function(){
      const file=picker.files && picker.files[0];
      if(!file || !file.type.startsWith('image/')) return;
      const reader=new FileReader();
      reader.onload=function(){
        const image=new Image();
        image.onload=function(){
          const max=900, ratio=Math.min(1,max/Math.max(image.width,image.height));
          const canvas=document.createElement('canvas');
          canvas.width=Math.round(image.width*ratio);
          canvas.height=Math.round(image.height*ratio);
          canvas.getContext('2d').drawImage(image,0,0,canvas.width,canvas.height);
          const p=petById(detailPetId);
          if(!p) return;
          p.photo=canvas.toDataURL('image/jpeg',0.82);
          saveState();

          // saveState() yeniden render ettiği için detayı doğrudan yeni kayıtla yenile.
          const detailPhoto=document.getElementById('petDetailPhoto');
          if(detailPhoto) detailPhoto.src=p.photo;
          if(detailPetId) showPetDetail(detailPetId);
        };
        image.src=reader.result;
      };
      reader.readAsDataURL(file);
    };
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',initPetCamera,{once:true});
  else initPetCamera();
})();


/* Yerel takvim bildirim motoru kaldırıldı. Hatırlatmalar Supabase Web Push ile gönderilir. */

/* ===== PetKarnem v2.59 — Supabase Takvim Sync ===== */
const PK_SUPABASE_URL='https://opjtpujxrveadptsizry.supabase.co';
const PK_SUPABASE_KEY_STORE='petkarnem_supabase_publishable_key';
const PK_SUPABASE_DEVICE_STORE='petkarnem_supabase_device_id';
let pkSupabaseSyncTimer=null;
let pkSupabaseSyncing=false;
let pkMedicationSyncTimer=null;
let pkMedicationSyncing=false;

function pkSupabaseKey(){ return (localStorage.getItem(PK_SUPABASE_KEY_STORE)||'').trim(); }
function pkSupabaseDeviceId(){
  let id=localStorage.getItem(PK_SUPABASE_DEVICE_STORE);
  if(!id){ id=uid(); localStorage.setItem(PK_SUPABASE_DEVICE_STORE,id); }
  return id;
}
function pkSupabaseHeaders(extra={}){
  const key=pkSupabaseKey();
  return {apikey:key,Authorization:`Bearer ${key}`,'Content-Type':'application/json',...extra};
}
function pkCalendarSyncRecords(){
  const allowed=new Set(['vaccine','internal','external','appointment']);
  return (state.records||[]).filter(r=>r && r.id && r.next && allowed.has(r.type));
}
function pkMedicationSyncRecords(){
  return (state.meds||[]).filter(m=>m && m.id && m.start && Number(m.days)>=1);
}
async function pkSyncMedicationsToSupabase(){
  const key=pkSupabaseKey();
  if(!key || pkMedicationSyncing) return;
  pkMedicationSyncing=true;
  const deviceId=pkSupabaseDeviceId();
  try{
    const del=await fetch(`${PK_SUPABASE_URL}/rest/v1/medication_schedules?device_id=eq.${encodeURIComponent(deviceId)}`,{
      method:'DELETE',headers:pkSupabaseHeaders({'Prefer':'return=minimal'})
    });
    if(!del.ok) throw new Error(`MED DELETE ${del.status}`);

    const rows=pkMedicationSyncRecords().map(m=>({
      local_id:String(m.id),
      device_id:deviceId,
      pet_name:petById(m.petId)?.name||'',
      medicine_name:m.name||'İlaç',
      dose:m.dose||null,
      start_date:m.start,
      days:Number(m.days),
      times:(m.times||'').split(',').map(x=>x.trim()).filter(Boolean),
      reminder_enabled:m.reminder===true,
      updated_at:new Date().toISOString()
    }));
    if(rows.length){
      const ins=await fetch(`${PK_SUPABASE_URL}/rest/v1/medication_schedules`,{
        method:'POST',
        headers:pkSupabaseHeaders({'Prefer':'return=minimal'}),
        body:JSON.stringify(rows)
      });
      if(!ins.ok) throw new Error(`MED POST ${ins.status}`);
    }
  }catch(err){
    console.warn('PetKarnem medication sync:',err);
  }finally{
    pkMedicationSyncing=false;
  }
}
function pkQueueMedicationSync(){
  if(!pkSupabaseKey()) return;
  clearTimeout(pkMedicationSyncTimer);
  pkMedicationSyncTimer=setTimeout(pkSyncMedicationsToSupabase,450);
}
function pkSupabaseStatus(text,ok=false){
  const el=document.querySelector('#supabaseStatus');
  if(el){ el.textContent=text; el.style.color=ok?'#237A57':''; }
}
async function pkSyncCalendarToSupabase(){
  const key=pkSupabaseKey();
  if(!key || pkSupabaseSyncing) return;
  pkSupabaseSyncing=true;
  const deviceId=pkSupabaseDeviceId();
  try{
    const rows=pkCalendarSyncRecords().map(r=>({
      local_id:String(r.id),
      device_id:deviceId,
      pet_name:petById(r.petId)?.name||'',
      title:r.title||'Takvim Kaydı',
      event_type:r.type||'',
      event_date:r.next,
      event_time:r.time||null,
      notes:r.note||'',
      completed:r.done===true,
      payload:r
    }));

    // Mevcut kayıtları silip yeniden oluşturmak yerine local_id üzerinden tek tek
    // güncelle/ekle. Böylece Supabase id sabit kalır ve push log geçerliliğini korur.
    for(const row of rows){
      const existing=await fetch(
        `${PK_SUPABASE_URL}/rest/v1/calendar_events?device_id=eq.${encodeURIComponent(deviceId)}&local_id=eq.${encodeURIComponent(row.local_id)}&select=id&limit=1`,
        {headers:pkSupabaseHeaders()}
      );
      if(!existing.ok) throw new Error(`LOOKUP ${existing.status}`);
      const found=await existing.json();

      if(found.length){
        const upd=await fetch(
          `${PK_SUPABASE_URL}/rest/v1/calendar_events?id=eq.${encodeURIComponent(found[0].id)}`,
          {
            method:'PATCH',
            headers:pkSupabaseHeaders({'Prefer':'return=minimal'}),
            body:JSON.stringify(row)
          }
        );
        if(!upd.ok) throw new Error(`PATCH ${upd.status}`);
      }else{
        const ins=await fetch(`${PK_SUPABASE_URL}/rest/v1/calendar_events`,{
          method:'POST',
          headers:pkSupabaseHeaders({'Prefer':'return=minimal'}),
          body:JSON.stringify(row)
        });
        if(!ins.ok) throw new Error(`POST ${ins.status}`);
      }
    }
    pkSupabaseStatus('Bağlı • Takvim eşitlendi',true);
  }catch(err){
    console.warn('PetKarnem Supabase sync:',err);
    pkSupabaseStatus('Bağlantı hatası');
  }finally{ pkSupabaseSyncing=false; }
}
function pkQueueCalendarSync(){
  if(!pkSupabaseKey()) return;
  clearTimeout(pkSupabaseSyncTimer);
  pkSupabaseSyncTimer=setTimeout(pkSyncCalendarToSupabase,350);
}
async function pkLoadCalendarFromSupabase(){
  const key=pkSupabaseKey();
  if(!key) return;
  const deviceId=pkSupabaseDeviceId();
  try{
    pkSupabaseStatus('Bağlanıyor…');
    const res=await fetch(`${PK_SUPABASE_URL}/rest/v1/calendar_events?device_id=eq.${encodeURIComponent(deviceId)}&select=payload&order=event_date.asc`,{
      headers:pkSupabaseHeaders()
    });
    if(!res.ok) throw new Error(`GET ${res.status}`);
    const rows=await res.json();
    const remote=(rows||[]).map(x=>x.payload).filter(Boolean);
    if(remote.length){
      const allowed=new Set(['vaccine','internal','external','appointment']);
      const keep=(state.records||[]).filter(r=>!(r?.next && allowed.has(r.type)));
      const byId=new Map();
      [...keep,...remote].forEach(r=>{ if(r?.id) byId.set(String(r.id),r); });
      state.records=[...byId.values()];
      localStorage.setItem(storeKey, JSON.stringify(state));
      renderAll();
    }else{
      await pkSyncCalendarToSupabase();
    }
    pkSupabaseStatus('Bağlı • Takvim eşitlendi',true);
  }catch(err){
    console.warn('PetKarnem Supabase load:',err);
    pkSupabaseStatus('Bağlantı hatası');
  }
}
function pkBindSupabaseSettings(){
  const input=document.querySelector('#supabasePublishableKey');
  const connect=document.querySelector('#connectSupabaseBtn');
  const disconnect=document.querySelector('#disconnectSupabaseBtn');
  if(input && !input.dataset.bound){
    input.dataset.bound='1';
    input.value=pkSupabaseKey();
  }
  if(connect && !connect.dataset.bound){
    connect.dataset.bound='1';
    connect.onclick=async()=>{
      const key=(document.querySelector('#supabasePublishableKey')?.value||'').trim();
      if(!key){ alert('Publishable Key alanını doldur.'); return; }
      localStorage.setItem(PK_SUPABASE_KEY_STORE,key);
      pkSupabaseStatus('Bağlanıyor…');
      await pkLoadCalendarFromSupabase();
      await pkSyncMedicationsToSupabase();
      if((document.querySelector('#supabaseStatus')?.textContent||'').startsWith('Bağlı')) alert('Supabase takvim bağlantısı tamamlandı.');
    };
  }
  if(disconnect && !disconnect.dataset.bound){
    disconnect.dataset.bound='1';
    disconnect.onclick=()=>{
      localStorage.removeItem(PK_SUPABASE_KEY_STORE);
      if(input) input.value='';
      pkSupabaseStatus('Bağlı değil');
      alert('Supabase bağlantısı bu cihazda kaldırıldı. Yerel kayıtlar silinmedi.');
    };
  }
  pkSupabaseStatus(pkSupabaseKey()?'Bağlı':'Bağlı değil',!!pkSupabaseKey());
}

// Existing renderAll is preserved; bind the new settings after every render.
const pkOriginalRenderAll=renderAll;
renderAll=function(){
  pkOriginalRenderAll();
  pkBindSupabaseSettings();
};

// Existing saveState is preserved; local save remains primary, cloud sync runs after it.
const pkOriginalSaveState=saveState;
saveState=function(){
  pkOriginalSaveState();
  pkQueueCalendarSync();
  pkQueueMedicationSync();
};

window.addEventListener('DOMContentLoaded',()=>{
  pkBindSupabaseSettings();
  if(pkSupabaseKey()) pkLoadCalendarFromSupabase();
});



/* ===== PetKarnem v2.79 — Web Push Subscription ===== */
(function(){
  const PK_VAPID_PUBLIC_KEY='BLylZr9miilUDZk7yNqM8HvBfo3Dlkh4C7YTB9BbezpkxLIwpboF4sku8tq3KN8KoiVAJKYqkEy_23pzGVHu4yQ';

  function b64ToUint8Array(base64String){
    const padding='='.repeat((4-base64String.length%4)%4);
    const base64=(base64String+padding).replace(/-/g,'+').replace(/_/g,'/');
    const raw=atob(base64); const out=new Uint8Array(raw.length);
    for(let i=0;i<raw.length;i++) out[i]=raw.charCodeAt(i);
    return out;
  }
  function setPushStatus(text,ok=false){
    const el=document.getElementById('pushSubscriptionStatus');
    if(el){el.textContent=text;el.style.color=ok?'#237A57':'';}
  }
  async function getPushWorker(){
    if(!('serviceWorker' in navigator)) throw new Error('Service Worker desteklenmiyor');
    const reg=await navigator.serviceWorker.register('./sw-notifications.js?v=2129',{scope:'./'});
    try{ await reg.update(); }catch(e){}
    return await navigator.serviceWorker.ready;
  }
  async function saveSubscriptionToSupabase(sub){
    const j=sub.toJSON();
    const row={
      device_id:pkSupabaseDeviceId(),
      endpoint:j.endpoint,
      p256dh:j.keys?.p256dh||'',
      auth:j.keys?.auth||'',
      enabled:true,
      updated_at:new Date().toISOString()
    };

    // Eski/bağlı cihazlarda mevcut REST yolu korunur.
    const key=pkSupabaseKey();
    if(key){
      const res=await fetch(`${PK_SUPABASE_URL}/rest/v1/push_subscriptions?on_conflict=endpoint`,{
        method:'POST',
        headers:pkSupabaseHeaders({'Prefer':'resolution=merge-duplicates,return=minimal'}),
        body:JSON.stringify(row)
      });
      if(!res.ok) throw new Error(`Supabase ${res.status}`);
      return;
    }

    // Yeni cihaz: kullanıcıya teknik Supabase anahtarı sormadan
    // aboneliği send-push Edge Function üzerinden kaydet.
    const res=await fetch(`${PK_SUPABASE_URL}/functions/v1/send-push`,{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({
        action:'register-subscription',
        device_id:row.device_id,
        subscription:{
          endpoint:row.endpoint,
          keys:{p256dh:row.p256dh,auth:row.auth}
        }
      })
    });
    let data={};
    try{ data=await res.json(); }catch(e){}
    if(!res.ok || data.ok===false){
      throw new Error(data.error||`Bildirim bağlantısı kurulamadı (${res.status})`);
    }
  }
  async function ensurePushSubscription(){
    try{
      if(window.Capacitor?.isNativePlatform()){
  const PushNotifications=window.Capacitor?.Plugins?.PushNotifications;

  if(!PushNotifications){
    setPushStatus('Kullanılamıyor');
    return;
  }

  let permission=await PushNotifications.checkPermissions();

  if(permission.receive==='prompt' || permission.receive==='prompt-with-rationale'){
    permission=await PushNotifications.requestPermissions();
  }

  if(permission.receive!=='granted'){
    setPushStatus('Kapalı');
    return;
  }

  await PushNotifications.register();
  setPushStatus('Açık',true);
  return;
}

      if(!('PushManager' in window) || !('Notification' in window)){
        setPushStatus('Kullanılamıyor');
        return;
      }

      // PetKarnem artık kullanıcıdan uygulama içinde izin istemez.
      // Cihaz ayarında izin açıksa aboneliği otomatik olarak hazırlar/kaydeder.
      if(Notification.permission!=='granted'){
        setPushStatus('Kapalı');
        return;
      }

      const reg=await getPushWorker();
      let sub=await reg.pushManager.getSubscription();
      if(!sub){
        sub=await reg.pushManager.subscribe({
          userVisibleOnly:true,
          applicationServerKey:b64ToUint8Array(PK_VAPID_PUBLIC_KEY)
        });
      }

      await saveSubscriptionToSupabase(sub);
      setPushStatus('Açık',true);
    }catch(err){
      console.error('PetKarnem automatic push sync',err);
      setPushStatus('Kapalı');
    }
  }

  async function refreshPushStatus(){
    await ensurePushSubscription();
  }

  function bindPush(){
    refreshPushStatus();
  }
  const prev=renderAll;
  renderAll=function(){prev();bindPush();};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bindPush,{once:true});else bindPush();

  // iPhone/iPad Ayarlar ekranından uygulamaya dönüldüğünde durumu hemen yenile.
  document.addEventListener('visibilitychange',()=>{
    if(document.visibilityState==='visible') refreshPushStatus();
  });
  window.addEventListener('pageshow',()=>refreshPushStatus());
})();
