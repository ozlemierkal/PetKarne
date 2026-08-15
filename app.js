
(()=>{const pages=[...document.querySelectorAll(".page")],done=document.getElementById("done");let n=0,sx=0,sy=0;
function show(x){n=Math.max(0,Math.min(2,x));pages.forEach((p,i)=>p.classList.toggle("active",i===n))}
function finish(){pages.forEach(p=>p.classList.remove("active"));done.classList.add("show")}
document.querySelectorAll(".skip").forEach(b=>b.onclick=finish);document.querySelector(".add").onclick=finish;
document.querySelectorAll(".dots").forEach((d,pi)=>[...d.children].forEach((x,i)=>x.onclick=()=>show(i)));
document.querySelector(".onboard").addEventListener("touchstart",e=>{sx=e.touches[0].clientX;sy=e.touches[0].clientY},{passive:true});
document.querySelector(".onboard").addEventListener("touchend",e=>{let t=e.changedTouches[0],dx=t.clientX-sx,dy=t.clientY-sy;if(Math.abs(dx)>50&&Math.abs(dx)>Math.abs(dy)){if(dx<0)show(n+1);else show(n-1)}},{passive:true});show(0)})();
