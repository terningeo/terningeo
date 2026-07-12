// ===== Mobile menu =====

const menuToggle = document.querySelector(".menu-toggle");
const menu = document.getElementById("main-menu");

if (menuToggle && menu) {
    menuToggle.addEventListener("click", () => {
        menu.classList.toggle("active");
    });
}

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

// ===== Button "Up" =====

const topBtn = document.getElementById("topBtn");

const callBtn = document.getElementById("callBtn");

if (topBtn) {

window.addEventListener("scroll", () => {

    const visible = window.scrollY > 300;

    if(topBtn){
        topBtn.style.display = visible ? "flex" : "none";
    }

    if(callBtn && window.innerWidth <= 768){
        callBtn.style.display = visible ? "flex" : "none";
    }

});

    topBtn.addEventListener("click", () => {

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    });

}

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

        overlay.addEventListener("click", () => overlay.remove());

        document.body.appendChild(overlay);

    });

});

// ===== Modal =====

const modal = document.getElementById("orderModal");

document.querySelectorAll("#openOrderModal, #openOrderModalBottom").forEach(button => {

    button.addEventListener("click", e => {

        e.preventDefault();

        modal?.classList.add("show");

    });

});

document.querySelector(".close-modal")?.addEventListener("click", () => {

    modal?.classList.remove("show");

});

modal?.addEventListener("click", e => {

    if (e.target === modal) {

        modal.classList.remove("show");

    }

});

// ===== Telegram form =====

const orderForm = document.getElementById("orderForm");

if (orderForm) {

    orderForm.addEventListener("submit", function (e) {

        e.preventDefault();

        const name = this.querySelector('input[type="text"]').value.trim();
        const phone = this.querySelector('input[type="tel"]').value.trim();
        const msg = this.querySelector("textarea").value.trim();

        const text =
`📩 Нова заявка

👤 Ім'я: ${name}
📞 Телефон: ${phone}

💬 Повідомлення:
${msg}`;

        fetch("https://api.telegram.org/botYOUR_TOKEN/sendMessage", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({

                chat_id: "YOUR_CHAT_ID",

                text: text

            })

        })
        .then(() => {

            alert("Заявку успішно відправлено!");

            orderForm.reset();

            modal?.classList.remove("show");

        })
        .catch(() => {

            alert("Помилка відправлення. Спробуйте ще раз.");

        });

    });

}
