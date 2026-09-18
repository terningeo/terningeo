const CMS_SUPABASE_URL =
    "https://lohoxjwfhjudzmpwhcyv.supabase.co";

const CMS_SUPABASE_KEY =
    "sb_publishable_LeBJ_X9VLHu05ImQlaTe8g_uH9y19cA";

const cmsClient = supabase.createClient(
    CMS_SUPABASE_URL,
    CMS_SUPABASE_KEY
);


async function loadHomeCMS() {

    const { data, error } = await cmsClient
        .from("site_content")
        .select("section, content_key, content_value")
        .eq("page", "home")
        .eq("is_active", true);


    if (error) {

        console.error(
            "TERNINGEO CMS error:",
            error
        );

        return;
    }


    if (!data) {
        return;
    }


    const content = {};


    data.forEach(item => {

        if (!content[item.section]) {
            content[item.section] = {};
        }

        content[item.section][item.content_key] =
            item.content_value || "";

    });


    // ======================================================
    // HERO
    // ======================================================

    setText(
        ".hero h1",
        content.hero?.title
    );

    setText(
        ".hero p",
        content.hero?.description
    );

    setText(
        ".hero .open-modal",
        content.hero?.button_text
    );


    // ======================================================
    // ABOUT
    // ======================================================

    setText(
        "#about h2",
        content.about?.heading
    );

    setText(
        "#about h3",
        content.about?.title
    );


    const aboutParagraphs =
        document.querySelectorAll(
            "#about .about-text p"
        );


    if (aboutParagraphs[0]) {
        aboutParagraphs[0].textContent =
            content.about?.text_1 || "";
    }


    if (aboutParagraphs[1]) {
        aboutParagraphs[1].textContent =
            content.about?.text_2 || "";
    }


    const features =
        document.querySelectorAll(
            "#about .about-features div"
        );


    if (features[0]) {
        features[0].textContent =
            "✓ " + (content.about?.feature_1 || "");
    }

    if (features[1]) {
        features[1].textContent =
            "✓ " + (content.about?.feature_2 || "");
    }

    if (features[2]) {
        features[2].textContent =
            "✓ " + (content.about?.feature_3 || "");
    }

    if (features[3]) {
        features[3].textContent =
            "✓ " + (content.about?.feature_4 || "");
    }


    // ======================================================
    // ABOUT IMAGES
    // ======================================================

    const aboutImages =
        document.querySelectorAll(
            "#about img"
        );


    if (aboutImages[0] && content.about?.image_1) {
        aboutImages[0].src =
            content.about.image_1;
    }

    if (aboutImages[1] && content.about?.image_2) {
        aboutImages[1].src =
            content.about.image_2;
    }


    // ======================================================
    // SERVICES
    // ======================================================

    setText(
        "#services h2",
        content.services?.heading
    );


    const cards =
        document.querySelectorAll(
            "#services .service-card"
        );


    cards.forEach((card, index) => {

        const number = index + 1;

        const service =
            content["service_" + number];


        if (!service) {
            return;
        }


        const title =
            card.querySelector("h3");

        const description =
            card.querySelector("p");

        const items =
            card.querySelectorAll("li");

        const image =
            card.querySelector("img");


        if (title) {
            title.textContent =
                service.title || "";
        }


        if (description) {
            description.textContent =
                service.description || "";
        }


        items.forEach((item, itemIndex) => {

            const key =
                "item_" + (itemIndex + 1);

            if (service[key]) {
                item.textContent =
                    service[key];
            }

        });


        if (
            image &&
            service.image
        ) {

            image.src =
                service.image;
        }

    });


    // ======================================================
    // FAQ
    // ======================================================

    setText(
        "#faq h2",
        content.faq?.heading
    );


    const faqItems =
        document.querySelectorAll(
            "#faq .faq-item"
        );


    faqItems.forEach((item, index) => {

        const number = index + 1;

        const faq =
            content["faq_" + number];


        if (!faq) {
            return;
        }


        const question =
            item.querySelector(
                ".faq-question span"
            );


        const answer =
            item.querySelector(
                ".faq-answer p"
            );


        if (question) {
            question.textContent =
                faq.question || "";
        }


        if (answer) {
            answer.textContent =
                faq.answer || "";
        }

    });


    // ======================================================
    // CONTACT
    // ======================================================

    setText(
        "#contact h2",
        content.contact?.heading
    );


    const phoneCard =
        document.querySelector(
            "#contact .contact-card"
        );


    if (phoneCard) {

        const phoneDisplay =
            phoneCard.querySelector("span");


        if (phoneDisplay) {

            phoneDisplay.textContent =
                content.contact?.phone_display || "";

        }

    }


    const emailCard =
        document.querySelector(
            '#contact a[href^="mailto:"]'
        );


    if (emailCard) {

        const email =
            content.contact?.email || "";


        emailCard.href =
            "mailto:" + email;


        const emailText =
            emailCard.querySelector("span");


        if (emailText) {
            emailText.textContent =
                email;
        }

    }


    const workArea =
        document.querySelector(
            "#contact .contact-grid .contact-card:nth-child(3) span"
        );


    if (workArea) {

        workArea.innerHTML =
            escapeHTML(
            content.contact?.work_area || ""
            ) +
            "<br><br>" +
            "<strong>Показати карту →</strong>";

    }


    const contactButton =
        document.querySelector(
            "#contact .open-modal"
        );


    if (contactButton) {

        contactButton.textContent =
            content.contact?.button_text || "";

    }


    // ======================================================
    // MAP
    // ======================================================

    setText(
        "#mapModal h2",
        content.map?.heading
    );

    setText(
        "#mapModal .map-header p",
        content.map?.description
    );


    const mapImage =
        document.querySelector(
            "#mapModal img"
        );


    if (
        mapImage &&
        content.map?.image
    ) {

        mapImage.src =
            content.map.image;

    }


    setText(
        "#mapModal .map-footer p",
        content.map?.areas
    );

}


// ==========================================================
// HELPERS
// ==========================================================

function setText(selector, value) {

    const element =
        document.querySelector(selector);


    if (
        element &&
        value !== undefined
    ) {

        element.textContent =
            value;

    }

}


function escapeHTML(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


// ==========================================================
// START CMS
// ==========================================================

if (
    typeof supabase !== "undefined"
) {

    loadHomeCMS();

}
