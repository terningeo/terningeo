document.querySelectorAll('nav a').forEach(a=>{
a.onclick=(e)=>{
e.preventDefault();
document.querySelector(a.getAttribute('href')).scrollIntoView({behavior:'smooth'});
};
});

const btn=document.getElementById('topBtn');

window.onscroll=()=>{
btn.style.display=window.scrollY>300?'block':'none';
};

btn.onclick=()=>{
window.scrollTo({top:0,behavior:'smooth'});
};

document.querySelectorAll('.gallery img').forEach(img=>{
img.onclick=()=>{
const d=document.createElement('div');
d.style.cssText="position:fixed;inset:0;background:rgba(0,0,0,.8);display:flex;align-items:center;justify-content:center";
d.innerHTML=`<img src="${img.src}" style="max-width:90%;max-height:90%;border-radius:10px">`;
d.onclick=()=>d.remove();
document.body.appendChild(d);
};
});
