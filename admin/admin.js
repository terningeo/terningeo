// ============================================================
// TERNINGEO CMS
// admin/admin.js
// ============================================================

const SUPABASE_URL = "https://lohoxjwfhjudzmpwhcyv.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_LeBJ_X9VLHu05ImQlaTe8g_uH9y19cA";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);


// ============================================================
// DOM
// ============================================================

const loginSection = document.getElementById("login-section");
const adminSection = document.getElementById("admin-section");

const loginForm = document.getElementById("login-form");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const loginMessage = document.getElementById("login-message");

const logoutButton = document.getElementById("logout-button");

const contentEditor = document.getElementById("content-editor");
const pageTitle = document.getElementById("page-title");

const saveAllButton = document.getElementById("save-all-button");
const globalMessage = document.getElementById("global-message");


// ============================================================
// PAGE NAMES
// ============================================================

const PAGE_NAMES = {
    home: "Головна",
    vynos: "Винос меж",
    topo: "Топографія",
    suprovid: "Геодезичний супровід",
    kgz: "Контрольні геодезичні роботи"
};


// ============================================================
// SECTION NAMES
// ============================================================

const SECTION_NAMES = {

    seo: "SEO",

    header: "Шапка сайту",

    hero: "Головний екран",

    about: "Про нас",

    services: "Послуги",

    service_1: "Послуга 1 — Винос меж",

    service_2: "Послуга 2 — Топографія",

    service_3: "Послуга 3 — Геодезичний супровід",

    service_4: "Послуга 4 — Контрольні геодезичні роботи",

    faq: "Часті запитання",

    contact: "Контакти",

    map: "Карта та зона роботи",

    footer: "Футер",

    general: "Загальні налаштування"
};


// ============================================================
// FIELD NAMES
// ============================================================

const FIELD_NAMES = {

    title: "Заголовок",

    subtitle: "Підзаголовок",

    description: "Опис",

    heading: "Заголовок блоку",

    text: "Текст",

    text_1: "Текст 1",

    text_2: "Текст 2",

    text_3: "Текст 3",

    text_4: "Текст 4",

    button_text: "Текст кнопки",

    button_url: "Посилання кнопки",

    phone: "Телефон",

    phone_display: "Телефон для відображення",

    email: "Email",

    telegram: "Telegram",

    whatsapp: "WhatsApp",

    work_area: "Зона роботи",

    areas: "Області / населені пункти",

    image: "Фото",

    image_1: "Фото 1",

    image_2: "Фото 2",

    image_3: "Фото 3",

    image_4: "Фото 4",

    logo: "Логотип",

    background: "Фонове фото",

    background_image: "Фонове фото",

    faq_question: "Питання",

    faq_answer: "Відповідь",

    question: "Питання",

    answer: "Відповідь",

    item_1: "Пункт 1",

    item_2: "Пункт 2",

    item_3: "Пункт 3",

    item_4: "Пункт 4",

    meta_title: "SEO Title",

    meta_description: "SEO Description",

    keywords: "SEO Keywords",

    canonical: "Canonical URL"
};


// ============================================================
// CURRENT STATE
// ============================================================

let currentPage = "home";

let currentContent = [];

let selectedImages = {};


// ============================================================
// INIT
// ============================================================

document.addEventListener("DOMContentLoaded", async () => {

    setupPageButtons();

    setupLogin();

    setupLogout();

    setupSaveAll();

    await checkSession();

});


// ============================================================
// SESSION
// ============================================================

async function checkSession() {

    const {
        data: {
            session
        }
    } = await supabaseClient.auth.getSession();


    if (!session) {

        showLogin();

        return;
    }


    const isAdmin = await checkAdmin(session.user.id);


    if (!isAdmin) {

        await supabaseClient.auth.signOut();

        showLogin();

        loginMessage.textContent =
            "У вас немає прав адміністратора.";

        loginMessage.style.color = "#dc3545";

        return;
    }


    showAdmin();

    await loadPage(currentPage);
}


// ============================================================
// ADMIN CHECK
// ============================================================

async function checkAdmin(userId) {

    const {
        data,
        error
    } = await supabaseClient
        .from("admin_users")
        .select("user_id")
        .eq("user_id", userId)
        .maybeSingle();


    if (error) {

        console.error("Admin check error:", error);

        return false;
    }


    return !!data;
}


// ============================================================
// LOGIN
// ============================================================

function setupLogin() {

    if (!loginForm) return;


    loginForm.addEventListener("submit", async (event) => {

        event.preventDefault();


        const email = emailInput.value.trim();
        const password = passwordInput.value;


        loginMessage.textContent =
            "Виконується вхід...";

        loginMessage.style.color = "#6b7280";


        const {
            data,
            error
        } = await supabaseClient.auth.signInWithPassword({
            email,
            password
        });


        if (error) {

            console.error(error);

            loginMessage.textContent =
                error.message;

            loginMessage.style.color =
                "#dc3545";

            return;
        }


        const isAdmin =
            await checkAdmin(data.user.id);


        if (!isAdmin) {

            await supabaseClient.auth.signOut();

            loginMessage.textContent =
                "Цей користувач не є адміністратором.";

            loginMessage.style.color =
                "#dc3545";

            return;
        }


        loginMessage.textContent = "";

        showAdmin();

        await loadPage(currentPage);

    });

}


// ============================================================
// LOGOUT
// ============================================================

function setupLogout() {

    if (!logoutButton) return;


    logoutButton.addEventListener("click", async () => {

        await supabaseClient.auth.signOut();

        currentContent = [];
        selectedImages = {};

        showLogin();

    });

}


// ============================================================
// SHOW LOGIN
// ============================================================

function showLogin() {

    if (loginSection) {

        loginSection.style.display = "flex";

    }


    if (adminSection) {

        adminSection.style.display = "none";

    }

}


// ============================================================
// SHOW ADMIN
// ============================================================

function showAdmin() {

    if (loginSection) {

        loginSection.style.display = "none";

    }


    if (adminSection) {

        adminSection.style.display = "block";

    }

}


// ============================================================
// PAGE BUTTONS
// ============================================================

function setupPageButtons() {

    const buttons =
        document.querySelectorAll(".page-button");


    buttons.forEach(button => {

        button.addEventListener("click", async () => {

            const page =
                button.dataset.page;


            if (!page) return;


            buttons.forEach(item => {

                item.classList.remove("active");

            });


            button.classList.add("active");


            currentPage = page;


            await loadPage(page);

        });

    });

}


// ============================================================
// LOAD PAGE
// ============================================================

async function loadPage(page) {

    pageTitle.textContent =
        PAGE_NAMES[page] || page;


    contentEditor.innerHTML = `
        <div style="
            background:#fff;
            border-radius:22px;
            padding:40px;
            text-align:center;
            color:#6b7280;
            box-shadow:0 12px 35px rgba(0,0,0,.08);
        ">
            Завантаження...
        </div>
    `;


    selectedImages = {};


    const {
        data,
        error
    } = await supabaseClient
        .from("site_content")
        .select("*")
        .eq("page", page)
        .order("sort_order", {
            ascending: true
        });


    if (error) {

        console.error(error);

        contentEditor.innerHTML = `
            <div style="
                background:#fff;
                border-radius:22px;
                padding:30px;
                color:#dc3545;
            ">
                Помилка завантаження даних.
                <br><br>
                ${escapeHtml(error.message)}
            </div>
        `;

        return;
    }


    currentContent = data || [];


    renderContent(currentContent);

}


// ============================================================
// RENDER CONTENT
// ============================================================

function renderContent(items) {

    contentEditor.innerHTML = "";


    if (!items.length) {

        contentEditor.innerHTML = `
            <div class="cms-section">

                <div class="cms-section-body">

                    <strong>
                        Для цієї сторінки ще немає контенту.
                    </strong>

                </div>

            </div>
        `;

        return;
    }


    const sections = {};


    items.forEach(item => {

        const section =
            item.section || "general";


        if (!sections[section]) {

            sections[section] = [];

        }


        sections[section].push(item);

    });


    let sectionNumber = 1;


    Object.entries(sections).forEach(
        ([section, fields]) => {

            const sectionElement =
                createSection(
                    section,
                    fields,
                    sectionNumber
                );


            contentEditor.appendChild(
                sectionElement
            );


            sectionNumber++;

        }
    );

}


// ============================================================
// CREATE SECTION
// ============================================================

function createSection(
    section,
    fields,
    sectionNumber
) {

    const wrapper =
        document.createElement("section");


    wrapper.className =
        "cms-section";


    const title =
        SECTION_NAMES[section] ||
        prettify(section);


    wrapper.innerHTML = `

        <div class="cms-section-header">

            <div class="number">
                ${sectionNumber}
            </div>

            <h3>
                ${escapeHtml(title)}
            </h3>

        </div>

        <div class="cms-section-body">

            <div class="fields-grid"></div>

        </div>
    `;


    const grid =
        wrapper.querySelector(".fields-grid");


    fields.forEach(item => {

        const field =
            createField(item);


        grid.appendChild(field);

    });


    return wrapper;

}


// ============================================================
// CREATE FIELD
// ============================================================

function createField(item) {

    const wrapper =
        document.createElement("div");


    wrapper.className =
        "cms-field";


    if (
        item.content_type === "textarea" ||
        item.content_type === "image"
    ) {

        wrapper.classList.add("full");

    }


    const label =
        FIELD_NAMES[item.content_key] ||
        prettify(item.content_key);


    // IMAGE
    if (item.content_type === "image") {

        wrapper.innerHTML = `
            <label>
                ${escapeHtml(label)}
            </label>

            <div class="image-editor">

                <div
                    class="image-preview"
                    id="image-preview-${item.id}"
                >
                    ${
                        item.content_value
                        ?
                        `<img
                            src="${escapeAttribute(item.content_value)}"
                            alt="${escapeAttribute(label)}"
                        >`
                        :
                        `<div class="image-empty">
                            Фото не завантажене
                        </div>`
                    }
                </div>

                <div class="image-actions">

                    <label
                        class="image-button"
                        style="display:inline-block;"
                    >
                        Вибрати фото

                        <input
                            type="file"
                            class="image-file"
                            data-id="${item.id}"
                            data-key="${escapeAttribute(item.content_key)}"
                            accept="image/jpeg,image/png,image/webp,image/avif"
                        >
                    </label>

                    <button
                        type="button"
                        class="image-button secondary preview-image-button"
                        data-url="${escapeAttribute(item.content_value || "")}"
                    >
                        Відкрити
                    </button>

                    <button
                        type="button"
                        class="image-button danger delete-image-button"
                        data-id="${item.id}"
                    >
                        Видалити
                    </button>

                </div>

                <div
                    class="image-status"
                    style="
                        margin-top:10px;
                        font-size:12px;
                        color:#6b7280;
                    "
                ></div>

            </div>
        `;


        setupImageField(wrapper, item);

        return wrapper;
    }


    // TEXTAREA
    if (
        item.content_type === "textarea" ||
        item.content_key.includes("description") ||
        item.content_key.includes("answer") ||
        item.content_key.includes("text")
    ) {

        wrapper.innerHTML = `
            <label>
                ${escapeHtml(label)}
            </label>

            <textarea
                data-id="${item.id}"
                data-type="${escapeAttribute(item.content_type)}"
                data-key="${escapeAttribute(item.content_key)}"
            >${escapeHtml(item.content_value || "")}</textarea>
        `;

        return wrapper;

    }


    // INPUT
    wrapper.innerHTML = `
        <label>
            ${escapeHtml(label)}
        </label>

        <input
            type="${getInputType(item.content_type)}"
            value="${escapeAttribute(item.content_value || "")}"
            data-id="${item.id}"
            data-type="${escapeAttribute(item.content_type)}"
            data-key="${escapeAttribute(item.content_key)}"
        >
    `;


    return wrapper;

}


// ============================================================
// IMAGE FIELD
// ============================================================

function setupImageField(wrapper, item) {

    const fileInput =
        wrapper.querySelector(".image-file");


    const previewButton =
        wrapper.querySelector(".preview-image-button");


    const deleteButton =
        wrapper.querySelector(".delete-image-button");


    // ----------------------------------------
    // SELECT FILE
    // ----------------------------------------

    fileInput.addEventListener(
        "change",
        async () => {

            const file =
                fileInput.files?.[0];


            if (!file) return;


            const status =
                wrapper.querySelector(".image-status");


            status.textContent =
                "Завантаження фото...";


            status.style.color =
                "#6b7280";


            try {

                const publicUrl =
                    await uploadImage(
                        file,
                        item
                    );


                // Save URL in DB
                const {
                    error
                } = await supabaseClient
                    .from("site_content")
                    .update({
                        content_value: publicUrl
                    })
                    .eq("id", item.id);


                if (error) {

                    throw error;

                }


                item.content_value =
                    publicUrl;


                const preview =
                    wrapper.querySelector(
                        ".image-preview"
                    );


                preview.innerHTML = `
                    <img
                        src="${escapeAttribute(publicUrl)}"
                        alt="${escapeAttribute(item.content_key)}"
                    >
                `;


                previewButton.dataset.url =
                    publicUrl;


                status.textContent =
                    "Фото успішно завантажене.";


                status.style.color =
                    "#0d9b74";


                showMessage(
                    "Фото успішно оновлено."
                );


            } catch (error) {

                console.error(
                    "Image upload error:",
                    error
                );


                status.textContent =
                    "Помилка: " +
                    error.message;


                status.style.color =
                    "#dc3545";

            }


            fileInput.value = "";

        }
    );


    // ----------------------------------------
    // OPEN
    // ----------------------------------------

    previewButton.addEventListener(
        "click",
        () => {

            const url =
                previewButton.dataset.url;


            if (!url) {

                showMessage(
                    "Фото ще не завантажене."
                );

                return;
            }


            window.open(
                url,
                "_blank",
                "noopener,noreferrer"
            );

        }
    );


    // ----------------------------------------
    // DELETE
    // ----------------------------------------

    deleteButton.addEventListener(
        "click",
        async () => {

            if (!item.content_value) {

                showMessage(
                    "Фото вже відсутнє."
                );

                return;
            }


            const confirmed =
                confirm(
                    "Видалити це фото?"
                );


            if (!confirmed) return;


            try {

                await deleteStorageImage(
                    item.content_value
                );


                const {
                    error
                } = await supabaseClient
                    .from("site_content")
                    .update({
                        content_value: ""
                    })
                    .eq("id", item.id);


                if (error) {

                    throw error;

                }


                item.content_value = "";


                const preview =
                    wrapper.querySelector(
                        ".image-preview"
                    );


                preview.innerHTML = `
                    <div class="image-empty">
                        Фото не завантажене
                    </div>
                `;


                previewButton.dataset.url =
                    "";


                showMessage(
                    "Фото видалено."
                );


            } catch (error) {

                console.error(
                    "Delete image error:",
                    error
                );


                showMessage(
                    "Не вдалося видалити фото."
                );

            }

        }
    );

}


// ============================================================
// UPLOAD IMAGE
// ============================================================

async function uploadImage(file, item) {

    if (!file) {

        throw new Error(
            "Файл не вибраний."
        );

    }


    const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/avif"
    ];


    if (!allowedTypes.includes(file.type)) {

        throw new Error(
            "Дозволені JPG, PNG, WEBP або AVIF."
        );

    }


    // 10 MB
    if (file.size > 10 * 1024 * 1024) {

        throw new Error(
            "Максимальний розмір фото — 10 MB."
        );

    }


    // ----------------------------------------
    // DELETE OLD FILE
    // ----------------------------------------

    if (item.content_value) {

        try {

            await deleteStorageImage(
                item.content_value
            );

        } catch (error) {

            console.warn(
                "Old image delete warning:",
                error
            );

        }

    }


    // ----------------------------------------
    // CREATE FILE NAME
    // ----------------------------------------

    const extension =
        getExtension(file.name);


    const safeKey =
        (item.content_key || "image")
        .replace(/[^a-zA-Z0-9_-]/g, "_");


    const fileName =
        `${safeKey}_${Date.now()}.${extension}`;


    const filePath =
        `${currentPage}/${fileName}`;


    // ----------------------------------------
    // UPLOAD
    // ----------------------------------------

    const {
        error
    } = await supabaseClient
        .storage
        .from("site-media")
        .upload(
            filePath,
            file,
            {
                cacheControl: "3600",
                upsert: false,
                contentType: file.type
            }
        );


    if (error) {

        throw error;

    }


    // ----------------------------------------
    // PUBLIC URL
    // ----------------------------------------

    const {
        data
    } = supabaseClient
        .storage
        .from("site-media")
        .getPublicUrl(filePath);


    if (!data?.publicUrl) {

        throw new Error(
            "Не вдалося отримати URL фото."
        );

    }


    return data.publicUrl;

}


// ============================================================
// DELETE STORAGE IMAGE
// ============================================================

async function deleteStorageImage(url) {

    if (!url) return;


    try {

        const parsed =
            new URL(url);


        const marker =
            "/storage/v1/object/public/site-media/";


        const index =
            parsed.pathname.indexOf(marker);


        if (index === -1) {

            console.warn(
                "Storage path not found:",
                url
            );

            return;
        }


        const filePath =
            decodeURIComponent(
                parsed.pathname.substring(
                    index + marker.length
                )
            );


        if (!filePath) return;


        const {
            error
        } = await supabaseClient
            .storage
            .from("site-media")
            .remove([
                filePath
            ]);


        if (error) {

            throw error;

        }

    } catch (error) {

        console.error(
            "Storage delete error:",
            error
        );

        throw error;

    }

}


// ============================================================
// SAVE ALL
// ============================================================

function setupSaveAll() {

    if (!saveAllButton) return;


    saveAllButton.addEventListener(
        "click",
        saveAllContent
    );

}


// ============================================================
// SAVE ALL CONTENT
// ============================================================

async function saveAllContent() {

    saveAllButton.disabled = true;

    saveAllButton.textContent =
        "Збереження...";


    try {

        const fields =
            contentEditor.querySelectorAll(
                "input[data-id], textarea[data-id]"
            );


        for (const field of fields) {

            const id =
                Number(field.dataset.id);


            const value =
                field.value;


            const {
                error
            } = await supabaseClient
                .from("site_content")
                .update({
                    content_value: value
                })
                .eq("id", id);


            if (error) {

                throw error;

            }

        }


        // Reload current data
        await loadPage(currentPage);


        showMessage(
            "Усі зміни успішно збережено."
        );


    } catch (error) {

        console.error(
            "Save error:",
            error
        );


        showMessage(
            "Помилка збереження: " +
            error.message
        );

    } finally {

        saveAllButton.disabled = false;

        saveAllButton.textContent =
            "Зберегти зміни";

    }

}


// ============================================================
// INPUT TYPE
// ============================================================

function getInputType(type) {

    switch (type) {

        case "email":
            return "email";

        case "url":
            return "url";

        case "phone":
            return "tel";

        default:
            return "text";

    }

}


// ============================================================
// EXTENSION
// ============================================================

function getExtension(filename) {

    const parts =
        filename.split(".");


    if (parts.length < 2) {

        return "jpg";

    }


    return parts
        .pop()
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "") || "jpg";

}


// ============================================================
// MESSAGE
// ============================================================

function showMessage(text) {

    if (!globalMessage) return;


    globalMessage.textContent =
        text;


    globalMessage.style.display =
        "block";


    clearTimeout(
        showMessage.timer
    );


    showMessage.timer =
        setTimeout(() => {

            globalMessage.style.display =
                "none";

        }, 3500);

}


// ============================================================
// PRETTIFY
// ============================================================

function prettify(value) {

    if (!value) {

        return "";

    }


    return value
        .replace(/_/g, " ")
        .replace(/-/g, " ")
        .replace(/\b\w/g, letter =>
            letter.toUpperCase()
        );

}


// ============================================================
// ESCAPE HTML
// ============================================================

function escapeHtml(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


// ============================================================
// ESCAPE ATTRIBUTE
// ============================================================

function escapeAttribute(value) {

    return escapeHtml(value);

}
