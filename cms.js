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
// VYNOS CMS
// ==========================================================

async function loadVynosCMS() {

    const { data, error } = await cmsClient
        .from("site_content")
        .select("section, content_key, content_value")
        .eq("page", "vynos")
        .eq("is_active", true)
        .order("sort_order", {
            ascending: true
        });

    if (error) {

        console.error(
            "TERNINGEO VYNOS CMS error:",
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

    const hero =
        document.querySelector(".vynos");

    if (hero) {

        const title =
            hero.querySelector("h1");

        const text =
            hero.querySelector("p");

        const button =
            hero.querySelector(".open-modal");


        if (title) {
            title.textContent =
                content.hero?.title || "";
        }


        if (text) {
            text.textContent =
                content.hero?.text || "";
        }


        if (button) {
            button.textContent =
                content.hero?.button || "";
        }


        if (content.hero?.image) {

            hero.style.backgroundImage =
                `url("${content.hero.image}")`;

        }

    }


    // ======================================================
    // СЕКЦІЇ
    // ======================================================

    const sections =
        document.querySelectorAll(
            "body > section.section"
        );


    // ------------------------------------------------------
    // WHEN
    // ------------------------------------------------------

    if (sections[0]) {

        const section =
            sections[0];

        const heading =
            section.querySelector("h2");

        if (heading) {

            heading.textContent =
                content.when?.title || "";

        }


        const cards =
            section.querySelectorAll(
                ".service-card"
            );


        cards.forEach((card, index) => {

            const number =
                index + 1;

            const title =
                card.querySelector("h3");

            const text =
                card.querySelector("p");


            if (title) {

                title.textContent =
                    content.when?.[
                        "item_" + number + "_title"
                    ] || "";

            }


            if (text) {

                text.textContent =
                    content.when?.[
                        "item_" + number + "_text"
                    ] || "";

            }

        });

    }


    // ------------------------------------------------------
    // ABOUT
    // ------------------------------------------------------

    if (sections[1]) {

        const section =
            sections[1];

        const heading =
            section.querySelector("h2");

        const subtitle =
            section.querySelector(".about-text h3");

        const paragraphs =
            section.querySelectorAll(
                ".about-text p"
            );

        const features =
            section.querySelectorAll(
                ".about-features div"
            );

        const images =
            section.querySelectorAll(
                ".about-image img"
            );


        if (heading) {

            heading.textContent =
                content.about?.title || "";

        }


        if (subtitle) {

            subtitle.textContent =
                content.about?.subtitle || "";

        }


        if (paragraphs[0]) {

            paragraphs[0].textContent =
                content.about?.text_1 || "";

        }


        if (paragraphs[1]) {

            paragraphs[1].textContent =
                content.about?.text_2 || "";

        }


        features.forEach((feature, index) => {

            const number =
                index + 1;

            feature.textContent =
                "✓ " +
                (
                    content.about?.[
                        "feature_" + number
                    ] || ""
                );

        });


        if (
            images[0] &&
            content.about?.image_1
        ) {

            images[0].src =
                content.about.image_1;

        }


        if (
            images[1] &&
            content.about?.image_2
        ) {

            images[1].src =
                content.about.image_2;

        }

    }


    // ------------------------------------------------------
    // PROCESS
    // ------------------------------------------------------

    if (sections[2]) {

        const section =
            sections[2];

        const heading =
            section.querySelector("h2");

        if (heading) {

            heading.textContent =
                content.process?.title || "";

        }


        const cards =
            section.querySelectorAll(
                ".service-card"
            );


        cards.forEach((card, index) => {

            const number =
                index + 1;

            const title =
                card.querySelector("h3");

            const text =
                card.querySelector("p");


            if (title) {

                title.textContent =
                    content.process?.[
                        "item_" + number + "_title"
                    ] || "";

            }


            if (text) {

                text.textContent =
                    content.process?.[
                        "item_" + number + "_text"
                    ] || "";

            }

        });

    }


    // ------------------------------------------------------
    // DOCUMENTS
    // ------------------------------------------------------

    if (sections[3]) {

        const section =
            sections[3];

        const heading =
            section.querySelector("h2");

        if (heading) {

            heading.textContent =
                content.documents?.title || "";

        }


        const cards =
            section.querySelectorAll(
                ".service-card"
            );


        cards.forEach((card, index) => {

            const number =
                index + 1;

            const title =
                card.querySelector("h3");

            const text =
                card.querySelector("p");


            if (title) {

                title.textContent =
                    content.documents?.[
                        "item_" + number + "_title"
                    ] || "";

            }


            if (text) {

                text.textContent =
                    content.documents?.[
                        "item_" + number + "_text"
                    ] || "";

            }

        });

    }


    // ------------------------------------------------------
    // RESULT
    // ------------------------------------------------------

    if (sections[4]) {

        const section =
            sections[4];

        const heading =
            section.querySelector("h2");

        if (heading) {

            heading.textContent =
                content.result?.title || "";

        }


        const cards =
            section.querySelectorAll(
                ".service-card"
            );


        cards.forEach((card, index) => {

            const number =
                index + 1;

            const title =
                card.querySelector("h3");

            const text =
                card.querySelector("p");


            if (title) {

                title.textContent =
                    content.result?.[
                        "item_" + number + "_title"
                    ] || "";

            }


            if (text) {

                text.textContent =
                    content.result?.[
                        "item_" + number + "_text"
                    ] || "";

            }

        });

    }


    // ------------------------------------------------------
    // FAQ
    // ------------------------------------------------------

    if (sections[5]) {

        const section =
            sections[5];

        const heading =
            section.querySelector("h2");

        if (heading) {

            heading.textContent =
                content.faq?.title || "";

        }


        const items =
            section.querySelectorAll(
                ".faq-item"
            );


        items.forEach((item, index) => {

            const number =
                index + 1;

            const question =
                item.querySelector(
                    ".faq-question span:first-child"
                );

            const answer =
                item.querySelector(
                    ".faq-answer p"
                );


            if (question) {

                question.textContent =
                    content.faq?.[
                        "item_" +
                        number +
                        "_question"
                    ] || "";

            }


            if (answer) {

                answer.textContent =
                    content.faq?.[
                        "item_" +
                        number +
                        "_answer"
                    ] || "";

            }

        });

    }


    // ------------------------------------------------------
    // OTHER SERVICES
    // ------------------------------------------------------

    if (sections[6]) {

        const section =
            sections[6];

        const heading =
            section.querySelector("h2");

        if (heading) {

            heading.textContent =
                content.other_services?.title || "";

        }


        const cards =
            section.querySelectorAll(
                ".service-card"
            );


        cards.forEach((card, index) => {

            const number =
                index + 1;

            const title =
                card.querySelector("h3");

            const text =
                card.querySelector("p");


            if (title) {

                title.textContent =
                    content.other_services?.[
                        "item_" + number + "_title"
                    ] || "";

            }


            if (text) {

                text.textContent =
                    content.other_services?.[
                        "item_" + number + "_text"
                    ] || "";

            }

        });

    }


    // ------------------------------------------------------
    // CTA
    // ------------------------------------------------------

    const openButtons =
        document.querySelectorAll(
            ".open-modal"
        );


    openButtons.forEach(button => {

        if (content.cta?.button) {

            button.textContent =
                content.cta.button;

        }

    });


    console.log(
        "TERNINGEO VYNOS CMS: loaded"
    );

}

// ==========================================================
// HELPERS
// ==========================================================

function setText(
    selector,
    value,
    parent = document
) {

    const element =
        parent.querySelector(selector);

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

    const path =
        window.location.pathname;

    if (
        path === "/vynos/" ||
        path === "/vynos/index.html"
    ) {

        loadVynosCMS();

    } else {

        loadHomeCMS();

    }

}
