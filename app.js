
(() => {
  const slides = [...document.querySelectorAll('.slide')];
  const done = document.getElementById('done');
  let index = 0;
  let sx = 0, sy = 0;

  function show(i){
    index = Math.max(0, Math.min(slides.length - 1, i));
    slides.forEach((s,n)=>s.classList.toggle('active', n===index));
  }

  function finish(){
    slides.forEach(s=>s.classList.remove('active'));
    done.classList.add('show');
  }

  document.querySelectorAll('.skip').forEach(btn=>{
    btn.addEventListener('click', finish);
  });

  document.querySelectorAll('.dot').forEach(btn=>{
    btn.addEventListener('click', ()=>show(Number(btn.dataset.go)));
  });

  document.getElementById('addFriend').addEventListener('click', finish);
  document.getElementById('restart').addEventListener('click', ()=>{
    done.classList.remove('show');
    show(0);
  });

  document.getElementById('app').addEventListener('touchstart', e=>{
    const t=e.touches[0]; sx=t.clientX; sy=t.clientY;
  }, {passive:true});

  document.getElementById('app').addEventListener('touchend', e=>{
    const t=e.changedTouches[0];
    const dx=t.clientX-sx, dy=t.clientY-sy;
    if(Math.abs(dx)>55 && Math.abs(dx)>Math.abs(dy)){
      if(dx<0 && index<2) show(index+1);
      else if(dx>0 && index>0) show(index-1);
    }
  }, {passive:true});

  show(0);
})();
