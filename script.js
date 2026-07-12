// ===== Mobile menu =====

const menuToggle=document.querySelector(".menu-toggle");
const menu=document.getElementById("main-menu");

if(menuToggle && menu){

    menuToggle.addEventListener("click",()=>{

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

["touchstart", "touchmove", "mousemove"].forEach(event => {
    window.addEventListener(event, resetButtonsTimer, { passive: true });
});

topBtn?.addEventListener("click", () => {

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

});

resetButtonsTimer();

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
