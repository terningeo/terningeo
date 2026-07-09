const menuToggle = document.querySelector(".menu-toggle");
const menu = document.getElementById("main-menu");

if (menuToggle && menu) {
    menuToggle.addEventListener("click", () => {
        menu.classList.toggle("active");
    });
}

document.querySelectorAll('nav a').forEach(a => {
    a.onclick = (e) => {
        e.preventDefault();

        const target = document.querySelector(a.getAttribute('href'));

        if (target) {
            target.scrollIntoView({
                behavior: 'smooth'
            });
        }

        if (menu) {
            menu.classList.remove("active");
        }
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
document.querySelector("form").addEventListener("submit", function(e){
e.preventDefault();

const name = this.querySelector('input[type="text"]').value;
const phone = this.querySelector('input[type="tel"]').value;
const msg = this.querySelector('textarea').value;

const text = `
📩 Нова заявка
👤 Ім'я: ${name}
📞 Телефон: ${phone}
💬 Повідомлення: ${msg}
`;

fetch("https://api.telegram.org/botYOUR_TOKEN/sendMessage", {
method: "POST",
headers: {"Content-Type":"application/json"},
body: JSON.stringify({
chat_id: "YOUR_CHAT_ID",
text: text
})
});

alert("Заявку відправлено!");
});
