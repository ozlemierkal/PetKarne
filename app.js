
(()=>{const s=[...document.querySelectorAll(".slide")],done=document.getElementById("done");let n=0,x=0,y=0;
const show=i=>{n=Math.max(0,Math.min(2,i));s.forEach((p,k)=>p.classList.toggle("active",k===n))};
const finish=()=>{s.forEach(p=>p.classList.remove("active"));done.classList.add("show")};
document.querySelectorAll(".skip").forEach(b=>b.onclick=finish);
document.querySelectorAll(".next").forEach(b=>b.onclick=()=>show(n+1));
document.querySelector(".add").onclick=finish;
document.querySelectorAll(".dots").forEach(d=>[...d.children].forEach((q,i)=>q.onclick=()=>show(i)));
const a=document.getElementById("app");a.addEventListener("touchstart",e=>{x=e.touches[0].clientX;y=e.touches[0].clientY},{passive:true});
a.addEventListener("touchend",e=>{const t=e.changedTouches[0],dx=t.clientX-x,dy=t.clientY-y;if(Math.abs(dx)>50&&Math.abs(dx)>Math.abs(dy)){dx<0?show(n+1):show(n-1)}},{passive:true});show(0)})();
