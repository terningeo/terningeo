// ============================================================
// TERNINGEO — UNIVERSAL ADMIN CMS
// admin/admin.js
// ============================================================

const SUPABASE_URL = "https://lohoxjwfhjudzmpwhcyv.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_LeBJ_X9VLHu05ImQlaTe8g_uH9y19cA";

const STORAGE_BUCKET = "site-media";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);


// ============================================================
// PAGE CONFIG
// ============================================================

const PAGE_NAMES = {
    home: "Головна",
    vynos: "Винос меж",
    topo: "Топографія",
    suprovid: "Геодезичний супровід",
    kgz: "Контрольні геодезичні роботи"
};


// ============================================================
// DEFAULT SECTION TITLES
// ============================================================

const SECTION_NAMES = {
    seo: "SEO",
    header: "Шапка сайту",
    navigation: "Навігація",
    hero: "Головний екран",
    about: "Про нас",
    services: "Послуги",
    service: "Послуга",
    gallery: "Фотогалерея",
    process: "Етапи роботи",
    documents: "Документи",
    faq: "Часті запитання",
    contact: "Контакти",
    map: "Карта та зона роботи",
    footer: "Футер",
    general: "Загальні налаштування"
};


// ============================================================
// FIELD TITLES
// ============================================================

const FIELD_NAMES = {

    title: "Заголовок",
    subtitle: "Підзаголовок",

    heading: "Заголовок блоку",

    description: "Опис",

    text: "Текст",
    text_1: "Текст 1",
    text_2: "Текст 2",
    text_3: "Текст 3",
    text_4: "Текст 4",
    text_5: "Текст 5",

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
    image_5: "Фото 5",

    logo: "Логотип",

    background: "Фонове фото",
    background_image: "Фонове фото",

    question: "Питання",
    answer: "Відповідь",

    faq_question: "Питання",
    faq_answer: "Відповідь",

    item_1: "Пункт 1",
    item_2: "Пункт 2",
    item_3: "Пункт 3",
    item_4: "Пункт 4",
    item_5: "Пункт 5",

    meta_title: "SEO Title",
    meta_description: "SEO Description",
    keywords: "SEO Keywords",
    canonical: "Canonical URL",

    url: "Посилання"
};


// ============================================================
// DOM
// ============================================================

const loginSection =
    document.getElementById("login-section");

const adminSection =
    document.getElementById("admin-section");

const loginForm =
    document.getElementById("login-form");

const emailInput =
    document.getElementById("email");

const passwordInput =
    document.getElementById("password");

const loginMessage =
    document.getElementById("login-message");

const logoutButton =
    document.getElementById("logout-button");

const contentEditor =
    document.getElementById("content-editor");

const pageTitle =
    document.getElementById("page-title");

const saveAllButton =
    document.getElementById("save-all-button");

const globalMessage =
    document.getElementById("global-message");


// ============================================================
// STATE
// ============================================================

let currentPage = "home";

let currentContent = [];

let isSaving = false;


// ============================================================
// INIT
// ============================================================

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        setupPageButtons();

        setupLogin();

        setupLogout();

        setupSaveAll();

        await checkSession();

    }
);


// ============================================================
// SESSION
// ============================================================

async function checkSession() {

    const {
        data,
        error
    } = await supabaseClient.auth.getSession();


    if (error) {

        console.error(error);

        showLogin();

        return;
    }


    const session =
        data?.session;


    if (!session) {

        showLogin();

        return;
    }


    const isAdmin =
        await checkAdmin(
            session.user.id
        );


    if (!isAdmin) {

        await supabaseClient.auth.signOut();

        showLogin();

        setLoginMessage(
            "У вас немає прав адміністратора.",
            "error"
        );

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

        console.error(
            "Admin check:",
            error
        );

        return false;
    }


    return Boolean(data);

}


// ============================================================
// LOGIN
// ============================================================

function setupLogin() {

    if (!loginForm) return;


    loginForm.addEventListener(
        "submit",
        async event => {

            event.preventDefault();


            const email =
                emailInput.value.trim();

            const password =
                passwordInput.value;


            if (!email || !password) {

                setLoginMessage(
                    "Введіть email і пароль.",
                    "error"
                );

                return;
            }


            setLoginMessage(
                "Виконується вхід...",
                "normal"
            );


            const {
                data,
                error
            } = await supabaseClient.auth
                .signInWithPassword({
                    email,
                    password
                });


            if (error) {

                console.error(error);

                setLoginMessage(
                    getAuthErrorMessage(error),
                    "error"
                );

                return;
            }


            const isAdmin =
                await checkAdmin(
                    data.user.id
                );


            if (!isAdmin) {

                await supabaseClient.auth.signOut();

                setLoginMessage(
                    "Цей користувач не є адміністратором.",
                    "error"
                );

                return;
            }


            setLoginMessage("", "normal");

            showAdmin();

            await loadPage(currentPage);

        }
    );

}


// ============================================================
// LOGOUT
// ============================================================

function setupLogout() {

    if (!logoutButton) return;


    logoutButton.addEventListener(
        "click",
        async () => {

            await supabaseClient.auth.signOut();

            currentContent = [];

            showLogin();

        }
    );

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
        document.querySelectorAll(
            ".page-button"
        );


    buttons.forEach(button => {

        button.addEventListener(
            "click",
            async () => {

                const page =
                    button.dataset.page;


                if (!page) return;


                if (isSaving) {

                    showMessage(
                        "Зачекайте завершення збереження."
                    );

                    return;
                }


                buttons.forEach(item => {

                    item.classList.remove(
                        "active"
                    );

                });


                button.classList.add(
                    "active"
                );


                currentPage =
                    page;


                await loadPage(page);

            }
        );

    });

}


// ============================================================
// LOAD PAGE
// ============================================================

async function loadPage(page) {

    if (!contentEditor) return;


    if (pageTitle) {

        pageTitle.textContent =
            PAGE_NAMES[page] ||
            prettify(page);

    }


    contentEditor.innerHTML = loadingHTML();


    const {
        data,
        error
    } = await supabaseClient
        .from("site_content")
        .select("*")
        .eq("page", page)
        .order("sort_order", {
            ascending: true,
            nullsFirst: false
        })
        .order("id", {
            ascending: true
        });


    if (error) {

        console.error(
            "Load content:",
            error
        );


        contentEditor.innerHTML =
            errorHTML(
                error.message
            );

        return;
    }


    currentContent =
        Array.isArray(data)
            ? data
            : [];


    renderContent(
        currentContent
    );

}


// ============================================================
// RENDER UNIVERSAL CONTENT
// ============================================================

function renderContent(items) {

    contentEditor.innerHTML = "";


    if (!items.length) {

        contentEditor.innerHTML = `
            <section class="cms-section">

                <div class="cms-section-body">

                    <strong>
                        Для цієї сторінки ще немає контенту.
                    </strong>

                    <p style="
                        color:#6b7280;
                        margin-bottom:0;
                    ">
                        Додайте записи до таблиці
                        <code>site_content</code>.
                    </p>

                </div>

            </section>
        `;

        return;
    }


    const sections =
        groupBySection(items);


    let number = 1;


    Object.entries(sections)
        .forEach(
            ([section, fields]) => {

                const element =
                    createSection(
                        section,
                        fields,
                        number
                    );


                contentEditor.appendChild(
                    element
                );


                number++;

            }
        );

}


// ============================================================
// GROUP BY SECTION
// ============================================================

function groupBySection(items) {

    const result = {};


    items.forEach(item => {

        const section =
            item.section ||
            "general";


        if (!result[section]) {

            result[section] = [];

        }


        result[section].push(item);

    });


    return result;

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
        getSectionTitle(
            section
        );


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
        wrapper.querySelector(
            ".fields-grid"
        );


    fields.forEach(item => {

        grid.appendChild(
            createField(item)
        );

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


    const type =
        normalizeType(
            item.content_type
        );


    const key =
        item.content_key ||
        "";


    const label =
        getFieldTitle(
            key
        );


    if (type === "image") {

        wrapper.classList.add("full");

        renderImageField(
            wrapper,
            item,
            label
        );

        return wrapper;

    }


    if (
        type === "textarea" ||
        shouldUseTextarea(key)
    ) {

        wrapper.classList.add("full");


        wrapper.innerHTML = `

            <label>
                ${escapeHtml(label)}
            </label>

            <textarea
                data-cms-field="true"
                data-id="${item.id}"
                data-type="${escapeAttribute(type)}"
                data-key="${escapeAttribute(key)}"
            >${escapeHtml(
                item.content_value || ""
            )}</textarea>

            ${defaultButtonHTML(item)}

        `;


        return wrapper;

    }


    wrapper.innerHTML = `

        <label>
            ${escapeHtml(label)}
        </label>

        <input
            type="${getInputType(type)}"
            value="${escapeAttribute(
                item.content_value || ""
            )}"
            data-cms-field="true"
            data-id="${item.id}"
            data-type="${escapeAttribute(type)}"
            data-key="${escapeAttribute(key)}"
        >

        ${defaultButtonHTML(item)}

    `;


    return wrapper;

}


// ============================================================
// IMAGE FIELD
// ============================================================

function renderImageField(
    wrapper,
    item,
    label
) {

    const value =
        item.content_value ||
        "";


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
                    value
                    ?
                    `
                    <img
                        src="${escapeAttribute(value)}"
                        alt="${escapeAttribute(label)}"
                    >
                    `
                    :
                    `
                    <div class="image-empty">
                        Фото не завантажене
                    </div>
                    `
                }

            </div>


            <div class="image-actions">

                <label
                    class="image-button"
                >

                    📁 Вибрати фото

                    <input
                        type="file"
                        class="image-file"
                        data-id="${item.id}"
                        accept="
                            image/jpeg,
                            image/png,
                            image/webp,
                            image/avif
                        "
                    >

                </label>


                <button
                    type="button"
                    class="image-button secondary"
                    data-action="open-image"
                    data-url="${escapeAttribute(value)}"
                >
                    🔍 Переглянути
                </button>


                <button
                    type="button"
                    class="image-button danger"
                    data-action="delete-image"
                    data-id="${item.id}"
                >
                    🗑 Видалити
                </button>


                ${
                    item.default_value
                    ?
                    `
                    <button
                        type="button"
                        class="image-button secondary"
                        data-action="reset-image"
                        data-id="${item.id}"
                    >
                        ↩ Відновити
                    </button>
                    `
                    :
                    ""
                }

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


    const fileInput =
        wrapper.querySelector(
            ".image-file"
        );


    const openButton =
        wrapper.querySelector(
            '[data-action="open-image"]'
        );


    const deleteButton =
        wrapper.querySelector(
            '[data-action="delete-image"]'
        );


    const resetButton =
        wrapper.querySelector(
            '[data-action="reset-image"]'
        );


    // ----------------------------------------
    // SELECT / UPLOAD
    // ----------------------------------------

    fileInput.addEventListener(
        "change",
        async () => {

            const file =
                fileInput.files?.[0];


            if (!file) return;


            await replaceImage(
                item,
                file,
                wrapper
            );


            fileInput.value = "";

        }
    );


    // ----------------------------------------
    // OPEN
    // ----------------------------------------

    openButton.addEventListener(
        "click",
        () => {

            const url =
                openButton.dataset.url;


            if (!url) {

                showMessage(
                    "Фото відсутнє."
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

            await deleteImage(
                item,
                wrapper
            );

        }
    );


    // ----------------------------------------
    // RESET
    // ----------------------------------------

    if (resetButton) {

        resetButton.addEventListener(
            "click",
            async () => {

                await resetImage(
                    item,
                    wrapper
                );

            }
        );

    }

}


// ============================================================
// REPLACE IMAGE
// ============================================================

async function replaceImage(
    item,
    file,
    wrapper
) {

    const status =
        wrapper.querySelector(
            ".image-status"
        );


    try {

        validateImage(file);


        status.textContent =
            "Завантаження фото...";

        status.style.color =
            "#6b7280";


        const oldUrl =
            item.content_value || "";


        const newUrl =
            await uploadImage(
                file,
                item
            );


        const {
            error
        } = await supabaseClient
            .from("site_content")
            .update({
                content_value: newUrl
            })
            .eq("id", item.id);


        if (error) {

            // If database update failed,
            // remove newly uploaded file.
            try {

                await deleteStorageImage(
                    newUrl
                );

            } catch (_) {}

            throw error;
        }


        // Delete old image only AFTER
        // database has accepted the new URL.
        if (
            oldUrl &&
            oldUrl !== newUrl
        ) {

            try {

                await deleteStorageImage(
                    oldUrl
                );

            } catch (error) {

                console.warn(
                    "Old image delete:",
                    error
                );

            }

        }


        item.content_value =
            newUrl;


        updateImagePreview(
            wrapper,
            newUrl
        );


        status.textContent =
            "Фото успішно оновлено.";

        status.style.color =
            "#0d9b74";


        showMessage(
            "Фото успішно оновлено."
        );


    } catch (error) {

        console.error(
            "Image replacement:",
            error
        );


        status.textContent =
            "Помилка: " +
            error.message;

        status.style.color =
            "#dc3545";

    }

}


// ============================================================
// UPLOAD IMAGE
// ============================================================

async function uploadImage(
    file,
    item
) {

    validateImage(file);


    const extension =
        getExtension(
            file.name
        );


    const safeKey =
        sanitizeFileName(
            item.content_key ||
            "image"
        );


    const fileName =
        `${safeKey}_${Date.now()}_${randomString(6)}.${extension}`;


    const pageFolder =
        sanitizeFileName(
            currentPage
        );


    const filePath =
        `${pageFolder}/${fileName}`;


    const {
        error
    } = await supabaseClient
        .storage
        .from(STORAGE_BUCKET)
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


    const {
        data
    } = supabaseClient
        .storage
        .from(STORAGE_BUCKET)
        .getPublicUrl(
            filePath
        );


    if (!data?.publicUrl) {

        throw new Error(
            "Не вдалося отримати URL фото."
        );

    }


    return data.publicUrl;

}


// ============================================================
// DELETE IMAGE
// ============================================================

async function deleteImage(
    item,
    wrapper
) {

    if (!item.content_value) {

        showMessage(
            "Фото вже відсутнє."
        );

        return;
    }


    const confirmed =
        window.confirm(
            "Видалити це фото?\n\n" +
            "Файл буде видалений із Storage, " +
            "а поле сторінки стане порожнім."
        );


    if (!confirmed) return;


    const status =
        wrapper.querySelector(
            ".image-status"
        );


    try {

        status.textContent =
            "Видалення...";


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


        updateImagePreview(
            wrapper,
            ""
        );


        status.textContent =
            "Фото видалено.";

        status.style.color =
            "#0d9b74";


        showMessage(
            "Фото видалено."
        );


    } catch (error) {

        console.error(
            "Delete image:",
            error
        );


        status.textContent =
            "Помилка видалення.";

        status.style.color =
            "#dc3545";


        showMessage(
            "Не вдалося видалити фото."
        );

    }

}


// ============================================================
// RESET IMAGE
// ============================================================

async function resetImage(
    item,
    wrapper
) {

    const defaultUrl =
        item.default_value ||
        "";


    if (!defaultUrl) {

        showMessage(
            "Для цього фото немає резервного значення."
        );

        return;
    }


    const confirmed =
        window.confirm(
            "Відновити початкове фото?"
        );


    if (!confirmed) return;


    try {

        const oldUrl =
            item.content_value || "";


        const {
            error
        } = await supabaseClient
            .from("site_content")
            .update({
                content_value: defaultUrl
            })
            .eq("id", item.id);


        if (error) {

            throw error;

        }


        item.content_value =
            defaultUrl;


        updateImagePreview(
            wrapper,
            defaultUrl
        );


        if (
            oldUrl &&
            oldUrl !== defaultUrl
        ) {

            try {

                await deleteStorageImage(
                    oldUrl
                );

            } catch (error) {

                console.warn(
                    "Old image cleanup:",
                    error
                );

            }

        }


        showMessage(
            "Початкове фото відновлено."
        );


    } catch (error) {

        console.error(
            "Reset image:",
            error
        );


        showMessage(
            "Не вдалося відновити фото."
        );

    }

}


// ============================================================
// UPDATE IMAGE PREVIEW
// ============================================================

function updateImagePreview(
    wrapper,
    url
) {

    const preview =
        wrapper.querySelector(
            ".image-preview"
        );


    const openButton =
        wrapper.querySelector(
            '[data-action="open-image"]'
        );


    if (url) {

        preview.innerHTML = `
            <img
                src="${escapeAttribute(url)}"
                alt="Фото"
            >
        `;

    } else {

        preview.innerHTML = `
            <div class="image-empty">
                Фото не завантажене
            </div>
        `;

    }


    if (openButton) {

        openButton.dataset.url =
            url || "";

    }

}


// ============================================================
// DELETE STORAGE FILE
// ============================================================

async function deleteStorageImage(url) {

    if (!url) return;


    const filePath =
        getStoragePath(
            url
        );


    if (!filePath) {

        console.warn(
            "Storage path not found:",
            url
        );

        return;
    }


    const {
        error
    } = await supabaseClient
        .storage
        .from(STORAGE_BUCKET)
        .remove([
            filePath
        ]);


    if (error) {

        throw error;

    }

}


// ============================================================
// GET STORAGE PATH FROM PUBLIC URL
// ============================================================

function getStoragePath(url) {

    try {

        const parsed =
            new URL(url);


        const marker =
            `/storage/v1/object/public/${STORAGE_BUCKET}/`;


        const index =
            parsed.pathname.indexOf(
                marker
            );


        if (index === -1) {

            return null;

        }


        return decodeURIComponent(
            parsed.pathname.substring(
                index + marker.length
            )
        );

    } catch (error) {

        console.error(error);

        return null;

    }

}


// ============================================================
// SAVE ALL TEXT / INPUT FIELDS
// ============================================================

function setupSaveAll() {

    if (!saveAllButton) return;


    saveAllButton.addEventListener(
        "click",
        saveAllContent
    );

}


// ============================================================
// SAVE ALL
// ============================================================

async function saveAllContent() {

    if (isSaving) return;


    isSaving = true;


    saveAllButton.disabled = true;

    saveAllButton.textContent =
        "Збереження...";


    try {

        const fields =
            contentEditor.querySelectorAll(
                "[data-cms-field='true']"
            );


        for (const field of fields) {

            const id =
                Number(
                    field.dataset.id
                );


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


        // Refresh data from database.
        await loadPage(
            currentPage
        );


        showMessage(
            "Усі зміни збережено."
        );


    } catch (error) {

        console.error(
            "Save all:",
            error
        );


        showMessage(
            "Помилка збереження: " +
            error.message
        );

    } finally {

        isSaving = false;

        saveAllButton.disabled = false;

        saveAllButton.textContent =
            "Зберегти зміни";

    }

}


// ============================================================
// DEFAULT VALUE BUTTON
// ============================================================

function defaultButtonHTML(item) {

    if (!item.default_value) {

        return "";

    }


    return `

        <button
            type="button"
            class="image-button secondary"
            style="
                margin-top:8px;
                font-size:11px;
            "
            data-action="reset-field"
            data-id="${item.id}"
        >
            ↩ Відновити початкове
        </button>

    `;

}


// ============================================================
// RESET TEXT FIELD
// ============================================================

document.addEventListener(
    "click",
    async event => {

        const button =
            event.target.closest(
                '[data-action="reset-field"]'
            );


        if (!button) return;


        const id =
            Number(
                button.dataset.id
            );


        const item =
            currentContent.find(
                record =>
                    Number(record.id) === id
            );


        if (!item) return;


        const confirmed =
            window.confirm(
                "Відновити початкове значення?"
            );


        if (!confirmed) return;


        try {

            const {
                error
            } = await supabaseClient
                .from("site_content")
                .update({
                    content_value:
                        item.default_value
                })
                .eq("id", id);


            if (error) {

                throw error;

            }


            await loadPage(
                currentPage
            );


            showMessage(
                "Початкове значення відновлено."
            );


        } catch (error) {

            console.error(
                "Reset field:",
                error
            );


            showMessage(
                "Не вдалося відновити значення."
            );

        }

    }
);


// ============================================================
// VALIDATE IMAGE
// ============================================================

function validateImage(file) {

    const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/avif"
    ];


    if (
        !allowedTypes.includes(
            file.type
        )
    ) {

        throw new Error(
            "Дозволені формати: JPG, PNG, WEBP, AVIF."
        );

    }


    const maxSize =
        10 * 1024 * 1024;


    if (file.size > maxSize) {

        throw new Error(
            "Максимальний розмір фото — 10 MB."
        );

    }

}


// ============================================================
// FIELD TYPE
// ============================================================

function normalizeType(type) {

    const value =
        String(
            type || "text"
        )
        .toLowerCase()
        .trim();


    const allowed = [
        "text",
        "textarea",
        "image",
        "url",
        "email",
        "phone"
    ];


    if (
        allowed.includes(value)
    ) {

        return value;

    }


    return "text";

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
// TEXTAREA DETECTION
// ============================================================

function shouldUseTextarea(key) {

    const lower =
        String(key)
        .toLowerCase();


    const words = [
        "description",
        "answer",
        "text",
        "content",
        "about",
        "message",
        "keywords"
    ];


    return words.some(
        word =>
            lower.includes(word)
    );

}


// ============================================================
// SECTION TITLE
// ============================================================

function getSectionTitle(section) {

    if (
        SECTION_NAMES[section]
    ) {

        return SECTION_NAMES[section];

    }


    return prettify(section);

}


// ============================================================
// FIELD TITLE
// ============================================================

function getFieldTitle(key) {

    if (
        FIELD_NAMES[key]
    ) {

        return FIELD_NAMES[key];

    }


    // faq_1_question
    const faqMatch =
        key.match(
            /^faq_(\d+)_(question|answer)$/i
        );


    if (faqMatch) {

        const number =
            faqMatch[1];


        const type =
            faqMatch[2]
                .toLowerCase();


        return type === "question"
            ? `Питання ${number}`
            : `Відповідь ${number}`;

    }


    return prettify(key);

}


// ============================================================
// AUTH ERROR
// ============================================================

function getAuthErrorMessage(error) {

    if (!error) {

        return "Помилка авторизації.";

    }


    const message =
        String(
            error.message || ""
        );


    if (
        message
            .toLowerCase()
            .includes("invalid login credentials")
    ) {

        return "Неправильний email або пароль.";

    }


    return message ||
        "Помилка авторизації.";

}


// ============================================================
// LOGIN MESSAGE
// ============================================================

function setLoginMessage(
    message,
    type
) {

    if (!loginMessage) return;


    loginMessage.textContent =
        message;


    if (type === "error") {

        loginMessage.style.color =
            "#dc3545";

    } else {

        loginMessage.style.color =
            "#6b7280";

    }

}


// ============================================================
// GLOBAL MESSAGE
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
        setTimeout(
            () => {

                globalMessage.style.display =
                    "none";

            },
            3500
        );

}


// ============================================================
// LOADING HTML
// ============================================================

function loadingHTML() {

    return `
        <section class="cms-section">

            <div
                class="cms-section-body"
                style="
                    text-align:center;
                    padding:50px;
                    color:#6b7280;
                "
            >
                Завантаження...
            </div>

        </section>
    `;

}


// ============================================================
// ERROR HTML
// ============================================================

function errorHTML(message) {

    return `
        <section class="cms-section">

            <div
                class="cms-section-body"
                style="
                    color:#dc3545;
                "
            >

                <strong>
                    Помилка завантаження.
                </strong>

                <p>
                    ${escapeHtml(message)}
                </p>

            </div>

        </section>
    `;

}


// ============================================================
// PRETTIFY
// ============================================================

function prettify(value) {

    if (!value) {

        return "";

    }


    return String(value)
        .replace(/_/g, " ")
        .replace(/-/g, " ")
        .replace(/\b\w/g, letter =>
            letter.toUpperCase()
        );

}


// ============================================================
// FILE EXTENSION
// ============================================================

function getExtension(filename) {

    const parts =
        String(filename)
            .split(".");


    if (parts.length < 2) {

        return "jpg";

    }


    const extension =
        parts.pop()
            .toLowerCase()
            .replace(
                /[^a-z0-9]/g,
                ""
            );


    return extension || "jpg";

}


// ============================================================
// SAFE FILE NAME
// ============================================================

function sanitizeFileName(value) {

    return String(value || "file")
        .normalize("NFKD")
        .replace(
            /[\u0300-\u036f]/g,
            ""
        )
        .replace(
            /[^a-zA-Z0-9_-]/g,
            "_"
        )
        .replace(
            /_+/g,
            "_"
        )
        .replace(
            /^_+|_+$/g,
            ""
        )
        || "file";

}


// ============================================================
// RANDOM STRING
// ============================================================

function randomString(length) {

    const chars =
        "abcdefghijklmnopqrstuvwxyz0123456789";


    let result = "";


    for (
        let i = 0;
        i < length;
        i++
    ) {

        result +=
            chars[
                Math.floor(
                    Math.random() *
                    chars.length
                )
            ];

    }


    return result;

}


// ============================================================
// ESCAPE HTML
// ============================================================

function escapeHtml(value) {

    return String(
        value ?? ""
    )
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}


// ============================================================
// ESCAPE ATTRIBUTE
// ============================================================

function escapeAttribute(value) {

    return escapeHtml(value);

}
