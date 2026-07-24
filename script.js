// ===== Mobile menu =====

const menuToggle = document.querySelector(".menu-toggle");
const menu = document.getElementById("main-menu");

menuToggle?.addEventListener("click", () => {
    menu?.classList.toggle("active");
});

// ===== Smooth scroll =====

document.querySelectorAll('nav a').forEach(link => {

    link.addEventListener("click", e => {

        const target = document.querySelector(link.getAttribute("href"));

        if (!target) return;

        e.preventDefault();

        target.scrollIntoView({
            behavior: "smooth"
        });

        menu?.classList.remove("active");

    });

});

// ===== Floating buttons =====

const topBtn = document.getElementById("topBtn");
const callBtn = document.getElementById("callBtn");

let hideTimer;

function resetButtonsTimer() {

    if (window.scrollY <= 300) {

        topBtn?.classList.remove("float-visible");
        callBtn?.classList.remove("float-visible");
        return;

    }

    topBtn?.classList.add("float-visible");

    if (window.innerWidth <= 768) {
        callBtn?.classList.add("float-visible");
    } else {
        callBtn?.classList.remove("float-visible");
    }

    clearTimeout(hideTimer);

    hideTimer = setTimeout(() => {

        topBtn?.classList.remove("float-visible");
        callBtn?.classList.remove("float-visible");

    }, 2500);

}

window.addEventListener("scroll", resetButtonsTimer, { passive: true });
window.addEventListener("resize", resetButtonsTimer);

["touchstart","touchmove","mousemove"].forEach(event=>{
    window.addEventListener(event, resetButtonsTimer, {passive:true});
});

topBtn?.addEventListener("click", () => {

    window.scrollTo({
        top:0,
        behavior:"smooth"
    });

});

resetButtonsTimer();

// ===== Gallery =====

document.querySelectorAll(".gallery img").forEach(img => {

    img.addEventListener("click", () => {

        const overlay = document.createElement("div");

        overlay.style.cssText = `
            position:fixed;
            inset:0;
            background:rgba(0,0,0,.85);
            display:flex;
            align-items:center;
            justify-content:center;
            z-index:99999;
            cursor:pointer;
        `;

        overlay.innerHTML = `
            <img src="${img.src}"
            style="max-width:90%;max-height:90%;border-radius:12px;">
        `;

        overlay.onclick = () => overlay.remove();

        document.body.appendChild(overlay);

    });

});

// ===== Modal =====

const modal = document.getElementById("orderModal");

document
.querySelectorAll("#openOrderModal, .open-modal")
.forEach(btn => {

    btn.addEventListener("click", e => {

        e.preventDefault();

        modal.classList.add("show");

    });

});

document.querySelector(".close-modal")?.addEventListener("click", () => {
    modal?.classList.remove("show");
});

modal?.addEventListener("click",e=>{

    if(e.target===modal){

        modal.classList.remove("show");

    }

});

// ===== Telegram form =====

const orderForm = document.getElementById("orderForm");

orderForm?.addEventListener("submit",function(e){

    e.preventDefault();

const name = this.querySelector('input[type="text"]').value.trim();
const phone = this.querySelector('input[type="tel"]').value.trim();
const msg = this.querySelector("textarea").value.trim();

// Перевірка імені
if (name.length < 2) {
    alert("Введіть коректне ім'я.");
    return;
}

// Перевірка номера (+380XXXXXXXXX, 380XXXXXXXXX або 0XXXXXXXXX)
const phoneRegex = /^(\+380|380|0)\d{9}$/;

if (!phoneRegex.test(phone)) {
    alert("Введіть номер у форматі +380XXXXXXXXX, 380XXXXXXXXX або 0XXXXXXXXX.");
    return;
}

// Перевірка повідомлення
if (msg.length < 5) {
    alert("Введіть повідомлення (мінімум 5 символів).");
    return;
}

const text = `📩 Нова заявка

👤 Ім'я: ${name}
📞 Телефон: ${phone}

💬 Повідомлення:
${msg}`;

fetch("https://bot.terningeo.workers.dev", {
    method: "POST",
    headers: {
        "Content-Type": "application/json"
    },
    body: JSON.stringify({
        name: name,
        phone: phone,
        message: msg
    })
})
    
.then(() => {

    alert("Дякуємо! Заявку відправлено.");

    orderForm.reset();

    setTimeout(() => {
        modal.classList.remove("show");
    }, 200);

})
    
.catch(err => {
    console.error(err);
    alert("Помилка відправлення.");
});

}); 

// ===== Gallery slider =====

const gallerySlider = document.getElementById("gallerySlider");

if (gallerySlider) {

    const galleryDots = document.querySelectorAll(".gallery-dot");

    gallerySlider.addEventListener("scroll", () => {

        const index = Math.round(
            gallerySlider.scrollLeft / gallerySlider.clientWidth
        );

        galleryDots.forEach((dot, i) => {

            dot.classList.toggle("active", i === index);

        });

    });

}

// ===== Work area map =====

const mapModal = document.getElementById("mapModal");

document.getElementById("openMap")?.addEventListener("click",(e)=>{

    e.preventDefault();

    mapModal.classList.add("show");

});

document.querySelector(".close-map")?.addEventListener("click", () => {
    mapModal?.classList.remove("show");
});

mapModal?.addEventListener("click",(e)=>{

    if(e.target===mapModal){

        mapModal.classList.remove("show");

    }

});

// ===== Universal sliders =====

document.querySelectorAll(".services-grid").forEach(slider => {

    const dotsContainer = slider.parentElement.nextElementSibling;

    if (!dotsContainer) return;

    const dots = dotsContainer.querySelectorAll(".dot");

    if (!dots.length) return;

    slider.addEventListener("scroll", () => {

        const first = slider.firstElementChild;

        let step;

        if (first.tagName === "IMG") {

            step = slider.clientWidth;

        } else {

            const gap = parseInt(getComputedStyle(slider).gap) || 0;
            step = first.offsetWidth + gap;

        }

        const index = Math.round(slider.scrollLeft / step);

        dots.forEach((dot, i) => {
            dot.classList.toggle("active", i === index);
        });

    });

});

// ===== FAQ =====

document.querySelectorAll(".faq-question").forEach(question => {

    question.addEventListener("click", () => {

        const item = question.parentElement;

        const answer = item.querySelector(".faq-answer");

        document.querySelectorAll(".faq-item").forEach(faq => {

            if(faq !== item){

                faq.classList.remove("active");

                faq.querySelector(".faq-answer").style.maxHeight = null;

            }

        });

        if(item.classList.contains("active")){

            item.classList.remove("active");

            answer.style.maxHeight = null;

        }else{

            item.classList.add("active");

            answer.style.maxHeight = answer.scrollHeight + "px";

        }

    });

});
