
(() => {
  const screens=[...document.querySelectorAll('.screen')];
  const done=document.getElementById('done');
  let index=0, selectedPet='cat', sx=0, sy=0;

  function show(i){
    index=Math.max(0,Math.min(screens.length-1,i));
    screens.forEach((s,n)=>s.classList.toggle('active',n===index));
  }
  function finish(){
    screens.forEach(s=>s.classList.remove('active'));
    done.classList.add('show');
  }

  document.querySelectorAll('.skip').forEach(b=>b.onclick=finish);
  document.querySelectorAll('.dot').forEach(b=>b.onclick=()=>show(Number(b.dataset.go)));

  document.querySelectorAll('.petCard').forEach(card=>{
    card.onclick=()=>{
      selectedPet=card.dataset.pet;
      document.querySelectorAll('.petCard').forEach(x=>x.classList.toggle('selected',x===card));
    }
  });
  document.querySelector('.catCard').classList.add('selected');

  document.getElementById('addFriend').onclick=finish;
  document.getElementById('restart').onclick=()=>{
    done.classList.remove('show');
    show(0);
  };

  document.getElementById('onboarding').addEventListener('touchstart',e=>{
    const t=e.touches[0];sx=t.clientX;sy=t.clientY
  },{passive:true});
  document.getElementById('onboarding').addEventListener('touchend',e=>{
    const t=e.changedTouches[0];
    const dx=t.clientX-sx,dy=t.clientY-sy;
    if(Math.abs(dx)>55 && Math.abs(dx)>Math.abs(dy)){
      if(dx<0 && index<2) show(index+1);
      if(dx>0 && index>0) show(index-1);
    }
  },{passive:true});

  show(0);
})();
