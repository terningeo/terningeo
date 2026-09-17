"use strict";

/*
============================================================
TERNINGEO UNIVERSAL ADMIN CMS
============================================================

Pages:
    home
    vynos
    topo
    suprovid
    kgz

Database:
    public.site_content

Storage:
    site-media

IMPORTANT:
    Images use FIXED storage_path.

Example:

    images/about.jpg

becomes:

    site-media/images/about.jpg

No random filenames.
No timestamp filenames.
No page-generated image folders.
============================================================
*/


/* =========================================================
   CONFIG
========================================================= */

const SUPABASE_URL =
    "https://lohoxjwfhjudzmpwhcyv.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_LeBJ_X9VLHu05ImQlaTe8g_uH9y19cA";

const STORAGE_BUCKET =
    "site-media";

const SITE_URL =
    "https://terningeo.pp.ua";


/* =========================================================
   SUPABASE
========================================================= */

const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );


/* =========================================================
   PAGE NAMES
========================================================= */

const PAGE_NAMES = {

    home: "Головна",

    vynos: "Винос в натуру",

    topo: "Топографічна зйомка",

    suprovid: "Геодезичний супровід",

    kgz: "Кадастрові та земельні роботи"

};


/* =========================================================
   GLOBAL STATE
========================================================= */

let currentPage =
    "home";

let currentItems =
    [];

let isSaving =
    false;


/* =========================================================
   DOM
========================================================= */

const loginScreen =
    document.getElementById(
        "login-screen"
    );

const adminScreen =
    document.getElementById(
        "admin-screen"
    );

const loginForm =
    document.getElementById(
        "login-form"
    );

const loginEmail =
    document.getElementById(
        "login-email"
    );

const loginPassword =
    document.getElementById(
        "login-password"
    );

const loginError =
    document.getElementById(
        "login-error"
    );

const logoutButton =
    document.getElementById(
        "logout-button"
    );

const pageButtons =
    document.querySelectorAll(
        "[data-page]"
    );

const contentContainer =
    document.getElementById(
        "content-container"
    );

const currentPageTitle =
    document.getElementById(
        "current-page-title"
    );

const saveButton =
    document.getElementById(
        "save-all"
    );


/* =========================================================
   START
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    initialize
);


async function initialize() {

    setupEvents();

    await checkSession();

}


/* =========================================================
   EVENTS
========================================================= */

function setupEvents() {

    if (loginForm) {

        loginForm.addEventListener(
            "submit",
            handleLogin
        );

    }


    if (logoutButton) {

        logoutButton.addEventListener(
            "click",
            handleLogout
        );

    }


    pageButtons.forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    const page =
                        button.dataset.page;

                    if (!page) {
                        return;
                    }

                    selectPage(
                        page
                    );

                }
            );

        }
    );


    if (saveButton) {

        saveButton.addEventListener(
            "click",
            saveAllChanges
        );

    }

}


/* =========================================================
   SESSION
========================================================= */

async function checkSession() {

    try {

        const {
            data,
            error
        } =
            await supabaseClient
                .auth
                .getSession();


        if (error) {

            throw error;

        }


        const session =
            data.session;


        if (!session) {

            showLogin();

            return;

        }


        const admin =
            await checkAdmin(
                session.user.id
            );


        if (!admin) {

            await supabaseClient
                .auth
                .signOut();

            showLogin();

            showLoginError(
                "У вас немає доступу до адміністративної панелі."
            );

            return;

        }


        showAdmin();

        await loadPage(
            currentPage
        );


    } catch (error) {

        console.error(
            "Session error:",
            error
        );

        showLogin();

    }

}


/* =========================================================
   ADMIN CHECK
========================================================= */

async function checkAdmin(
    userId
) {

    const {
        data,
        error
    } =
        await supabaseClient
            .from("admin_users")
            .select("user_id")
            .eq(
                "user_id",
                userId
            )
            .maybeSingle();


    if (error) {

        console.error(
            "Admin check:",
            error
        );

        return false;

    }


    return !!data;

}


/* =========================================================
   LOGIN
========================================================= */

async function handleLogin(
    event
) {

    event.preventDefault();


    clearLoginError();


    const email =
        loginEmail
            ? loginEmail.value.trim()
            : "";

    const password =
        loginPassword
            ? loginPassword.value
            : "";


    if (!email || !password) {

        showLoginError(
            "Введіть email та пароль."
        );

        return;

    }


    try {

        setLoginLoading(
            true
        );


        const {
            data,
            error
        } =
            await supabaseClient
                .auth
                .signInWithPassword({
                    email,
                    password
                });


        if (error) {

            throw error;

        }


        if (!data.user) {

            throw new Error(
                "Не вдалося отримати користувача."
            );

        }


        const admin =
            await checkAdmin(
                data.user.id
            );


        if (!admin) {

            await supabaseClient
                .auth
                .signOut();

            throw new Error(
                "Цей користувач не є адміністратором."
            );

        }


        showAdmin();

        await loadPage(
            currentPage
        );


    } catch (error) {

        console.error(
            "Login:",
            error
        );

        showLoginError(
            error.message ||
            "Помилка авторизації."
        );

    } finally {

        setLoginLoading(
            false
        );

    }

}


/* =========================================================
   LOGOUT
========================================================= */

async function handleLogout() {

    try {

        await supabaseClient
            .auth
            .signOut();

    } catch (error) {

        console.error(
            "Logout:",
            error
        );

    }


    showLogin();

}


/* =========================================================
   SCREEN
========================================================= */

function showLogin() {

    if (loginScreen) {

        loginScreen.style.display =
            "flex";

    }


    if (adminScreen) {

        adminScreen.style.display =
            "none";

    }

}


function showAdmin() {

    if (loginScreen) {

        loginScreen.style.display =
            "none";

    }


    if (adminScreen) {

        adminScreen.style.display =
            "block";

    }

}


/* =========================================================
   LOGIN UI
========================================================= */

function setLoginLoading(
    loading
) {

    const button =
        loginForm
            ?.querySelector(
                'button[type="submit"]'
            );


    if (!button) {
        return;
    }


    button.disabled =
        loading;


    button.textContent =
        loading
            ? "Вхід..."
            : "Увійти";

}


function showLoginError(
    message
) {

    if (!loginError) {
        return;
    }


    loginError.textContent =
        message;

    loginError.style.display =
        "block";

}


function clearLoginError() {

    if (!loginError) {
        return;
    }


    loginError.textContent =
        "";

    loginError.style.display =
        "none";

}


/* =========================================================
   PAGE SELECT
========================================================= */

async function selectPage(
    page
) {

    if (!PAGE_NAMES[page]) {
        return;
    }


    currentPage =
        page;


    pageButtons.forEach(
        button => {

            button.classList.toggle(
                "active",
                button.dataset.page === page
            );

        }
    );


    if (currentPageTitle) {

        currentPageTitle.textContent =
            PAGE_NAMES[page];

    }


    await loadPage(
        page
    );

}


/* =========================================================
   LOAD PAGE
========================================================= */

async function loadPage(
    page
) {

    if (!contentContainer) {
        return;
    }


    contentContainer.innerHTML =
        createLoadingHTML();


    try {

        const {
            data,
            error
        } =
            await supabaseClient
                .from("site_content")
                .select("*")
                .eq(
                    "page",
                    page
                )
                .order(
                    "sort_order",
                    {
                        ascending: true
                    }
                );


        if (error) {

            throw error;

        }


        currentItems =
            data || [];


        renderContent(
            currentItems
        );


    } catch (error) {

        console.error(
            "Load page:",
            error
        );


        contentContainer.innerHTML =
            createErrorHTML(
                error.message
            );

    }

}


/* =========================================================
   RENDER CONTENT
========================================================= */

function renderContent(
    items
) {

    if (!items.length) {

        contentContainer.innerHTML =
            `
            <div class="empty-state">
                Для цієї сторінки поки немає
                записів у CMS.
            </div>
            `;

        return;

    }


    const sections =
        groupBySection(
            items
        );


    contentContainer.innerHTML =
        "";


    Object.keys(sections)
        .forEach(
            section => {

                const card =
                    createSectionCard(
                        section,
                        sections[section]
                    );


                contentContainer.appendChild(
                    card
                );

            }
        );

}


/* =========================================================
   GROUP
========================================================= */

function groupBySection(
    items
) {

    return items.reduce(
        (
            result,
            item
        ) => {

            const section =
                item.section ||
                "general";


            if (!result[section]) {

                result[section] =
                    [];

            }


            result[section].push(
                item
            );


            return result;

        },
        {}
    );

}


/* =========================================================
   SECTION CARD
========================================================= */

function createSectionCard(
    section,
    items
) {

    const card =
        document.createElement(
            "section"
        );


    card.className =
        "admin-section-card";


    const title =
        document.createElement(
            "h2"
        );


    title.className =
        "admin-section-title";


    title.textContent =
        formatSectionName(
            section
        );


    card.appendChild(
        title
    );


    const grid =
        document.createElement(
            "div"
        );


    grid.className =
        "admin-fields-grid";


    items.forEach(
        item => {

            const field =
                createField(
                    item
                );


            grid.appendChild(
                field
            );

        }
    );


    card.appendChild(
        grid
    );


    return card;

}


/* =========================================================
   FIELD
========================================================= */

function createField(
    item
) {

    if (
        item.content_type ===
        "image"
    ) {

        return createImageField(
            item
        );

    }


    return createTextField(
        item
    );

}


/* =========================================================
   TEXT FIELD
========================================================= */

function createTextField(
    item
) {

    const wrapper =
        document.createElement(
            "div"
        );


    wrapper.className =
        "admin-field";


    const label =
        document.createElement(
            "label"
        );


    label.textContent =
        formatFieldName(
            item.content_key
        );


    wrapper.appendChild(
        label
    );


    let input;


    if (
        item.content_type ===
        "textarea"
    ) {

        input =
            document.createElement(
                "textarea"
            );

        input.rows =
            5;

    } else {

        input =
            document.createElement(
                "input"
            );

        input.type =
            getInputType(
                item.content_type
            );

    }


    input.value =
        item.content_value ||
        "";


    input.dataset.id =
        item.id;


    input.dataset.field =
        "content_value";


    input.className =
        "admin-input";


    wrapper.appendChild(
        input
    );


    return wrapper;

}


/* =========================================================
   INPUT TYPE
========================================================= */

function getInputType(
    type
) {

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


/* =========================================================
   IMAGE FIELD
========================================================= */

function createImageField(
    item
) {

    const wrapper =
        document.createElement(
            "div"
        );


    wrapper.className =
        "admin-field image-field";


    wrapper.dataset.id =
        item.id;


    const label =
        document.createElement(
            "label"
        );


    label.textContent =
        formatFieldName(
            item.content_key
        );


    wrapper.appendChild(
        label
    );


    const storageInfo =
        document.createElement(
            "div"
        );


    storageInfo.className =
        "image-storage-path";


    storageInfo.textContent =
        item.storage_path
            ? item.storage_path
            : "Шлях фото не заданий";


    wrapper.appendChild(
        storageInfo
    );


    const preview =
        document.createElement(
            "div"
        );


    preview.className =
        "image-preview";


    wrapper.appendChild(
        preview
    );


    const currentUrl =
        getImageUrl(
            item
        );


    renderImagePreview(
        preview,
        currentUrl
    );


    const controls =
        document.createElement(
            "div"
        );


    controls.className =
        "image-controls";


    const fileInput =
        document.createElement(
            "input"
        );


    fileInput.type =
        "file";

    fileInput.accept =
        "image/*";

    fileInput.style.display =
        "none";


    controls.appendChild(
        fileInput
    );


    const replaceButton =
        createButton(
            "Замінити фото",
            "primary"
        );


    replaceButton.addEventListener(
        "click",
        () => {

            fileInput.click();

        }
    );


    controls.appendChild(
        replaceButton
    );


    const removeButton =
        createButton(
            "Прибрати",
            "secondary"
        );


    removeButton.addEventListener(
        "click",
        async () => {

            await removeImage(
                item,
                wrapper,
                preview
            );

        }
    );


    controls.appendChild(
        removeButton
    );


    const resetButton =
        createButton(
            "Відновити",
            "secondary"
        );


    resetButton.addEventListener(
        "click",
        async () => {

            await resetImage(
                item,
                wrapper,
                preview
            );

        }
    );


    controls.appendChild(
        resetButton
    );


    wrapper.appendChild(
        controls
    );


    const status =
        document.createElement(
            "div"
        );


    status.className =
        "image-status";


    wrapper.appendChild(
        status
    );


    fileInput.addEventListener(
        "change",
        async event => {

            const file =
                event.target.files?.[0];


            if (!file) {
                return;
            }


            await replaceImage(
                item,
                file,
                wrapper,
                preview
            );


            fileInput.value =
                "";

        }
    );


    return wrapper;

}


/* =========================================================
   IMAGE URL
========================================================= */

function getImageUrl(
    item
) {

    if (
        item.content_value
    ) {

        return resolveSiteUrl(
            item.content_value
        );

    }


    if (
        item.storage_path
    ) {

        return resolveSiteUrl(
            item.storage_path
        );

    }


    if (
        item.default_value
    ) {

        return resolveSiteUrl(
            item.default_value
        );

    }


    return "";

}


/* =========================================================
   RESOLVE URL
========================================================= */

function resolveSiteUrl(
    value
) {

    if (!value) {
        return "";
    }


    const url =
        String(value)
            .trim();


    if (
        url.startsWith(
            "http://"
        ) ||
        url.startsWith(
            "https://"
        )
    ) {

        return url;

    }


    if (
        url.startsWith("/")
    ) {

        return (
            SITE_URL +
            url
        );

    }


    return (
        SITE_URL +
        "/" +
        url.replace(
            /^\/+/,
            ""
        )
    );

}


/* =========================================================
   IMAGE PREVIEW
========================================================= */

function renderImagePreview(
    container,
    url
) {

    container.innerHTML =
        "";


    if (!url) {

        container.innerHTML =
            `
            <div class="image-empty">
                Фото відсутнє
            </div>
            `;

        return;

    }


    const image =
        document.createElement(
            "img"
        );


    image.src =
        addCacheBuster(
            url
        );


    image.alt =
        "Фото";


    image.loading =
        "lazy";


    image.onerror =
        () => {

            container.innerHTML =
                `
                <div class="image-empty">
                    Не вдалося завантажити фото
                </div>
                `;

        };


    container.appendChild(
        image
    );

}


/* =========================================================
   REPLACE IMAGE
========================================================= */

async function replaceImage(
    item,
    file,
    wrapper,
    preview
) {

    const status =
        wrapper.querySelector(
            ".image-status"
        );


    try {

        validateImage(
            file
        );


        if (
            !item.storage_path
        ) {

            throw new Error(
                "Для цього фото не заданий storage_path."
            );

        }


        status.textContent =
            "Завантаження...";


        status.style.color =
            "#6b7280";


        /*
        ----------------------------------------------------
        IMPORTANT:

        The file is uploaded to the FIXED path.

        Example:

        images/about.jpg

        NOT:

        home/about_123456.jpg
        ----------------------------------------------------
        */


        const {
            error: uploadError
        } =
            await supabaseClient
                .storage
                .from(
                    STORAGE_BUCKET
                )
                .upload(
                    item.storage_path,
                    file,
                    {
                        cacheControl:
                            "3600",
                        upsert:
                            true,
                        contentType:
                            file.type
                    }
                );


        if (uploadError) {

            throw uploadError;

        }


        const {
            data: publicData
        } =
            supabaseClient
                .storage
                .from(
                    STORAGE_BUCKET
                )
                .getPublicUrl(
                    item.storage_path
                );


        if (
            !publicData ||
            !publicData.publicUrl
        ) {

            throw new Error(
                "Не вдалося отримати URL."
            );

        }


        const publicUrl =
            publicData.publicUrl;


        const {
            error: updateError
        } =
            await supabaseClient
                .from(
                    "site_content"
                )
                .update({
                    content_value:
                        publicUrl
                })
                .eq(
                    "id",
                    item.id
                );


        if (updateError) {

            throw updateError;

        }


        item.content_value =
            publicUrl;


        renderImagePreview(
            preview,
            addCacheBuster(
                publicUrl
            )
        );


        status.textContent =
            "Фото замінено.";

        status.style.color =
            "#0d9b74";


        showMessage(
            "Фото успішно замінено."
        );


    } catch (error) {

        console.error(
            "Replace image:",
            error
        );


        status.textContent =
            error.message ||
            "Помилка завантаження.";

        status.style.color =
            "#dc3545";


        showMessage(
            error.message ||
            "Не вдалося замінити фото."
        );

    }

}


/* =========================================================
   REMOVE IMAGE
========================================================= */

async function removeImage(
    item,
    wrapper,
    preview
) {

    const confirmed =
        window.confirm(
            "Прибрати фото зі сторінки?\n\n" +
            "Фізичний файл у Storage залишиться."
        );


    if (!confirmed) {
        return;
    }


    const status =
        wrapper.querySelector(
            ".image-status"
        );


    try {

        status.textContent =
            "Збереження...";


        const {
            error
        } =
            await supabaseClient
                .from(
                    "site_content"
                )
                .update({
                    content_value:
                        ""
                })
                .eq(
                    "id",
                    item.id
                );


        if (error) {

            throw error;

        }


        item.content_value =
            "";


        renderImagePreview(
            preview,
            ""
        );


        status.textContent =
            "Фото прибрано.";

        status.style.color =
            "#0d9b74";


        showMessage(
            "Фото прибрано зі сторінки."
        );


    } catch (error) {

        console.error(
            "Remove image:",
            error
        );


        status.textContent =
            "Помилка.";

        status.style.color =
            "#dc3545";


        showMessage(
            "Не вдалося прибрати фото."
        );

    }

}


/* =========================================================
   RESET IMAGE
========================================================= */

async function resetImage(
    item,
    wrapper,
    preview
) {

    if (
        !item.default_value
    ) {

        showMessage(
            "Для цього поля немає default_value."
        );

        return;

    }


    const confirmed =
        window.confirm(
            "Відновити початкове фото?"
        );


    if (!confirmed) {
        return;
    }


    const status =
        wrapper.querySelector(
            ".image-status"
        );


    try {

        status.textContent =
            "Відновлення...";


        const {
            error
        } =
            await supabaseClient
                .from(
                    "site_content"
                )
                .update({
                    content_value:
                        item.default_value
                })
                .eq(
                    "id",
                    item.id
                );


        if (error) {

            throw error;

        }


        item.content_value =
            item.default_value;


        renderImagePreview(
            preview,
            resolveSiteUrl(
                item.default_value
            )
        );


        status.textContent =
            "Початкове фото відновлено.";

        status.style.color =
            "#0d9b74";


        showMessage(
            "Фото відновлено."
        );


    } catch (error) {

        console.error(
            "Reset image:",
            error
        );


        status.textContent =
            "Помилка.";

        status.style.color =
            "#dc3545";


        showMessage(
            "Не вдалося відновити фото."
        );

    }

}


/* =========================================================
   VALIDATE IMAGE
========================================================= */

function validateImage(
    file
) {

    if (!file) {

        throw new Error(
            "Файл не вибрано."
        );

    }


    if (
        !file.type.startsWith(
            "image/"
        )
    ) {

        throw new Error(
            "Можна завантажувати тільки зображення."
        );

    }


    const maxSize =
        10 * 1024 * 1024;


    if (
        file.size >
        maxSize
    ) {

        throw new Error(
            "Максимальний розмір фото — 10 МБ."
        );

    }

}


/* =========================================================
   SAVE ALL TEXT
========================================================= */

async function saveAllChanges() {

    if (isSaving) {
        return;
    }


    if (!contentContainer) {
        return;
    }


    isSaving =
        true;


    if (saveButton) {

        saveButton.disabled =
            true;

        saveButton.textContent =
            "Збереження...";

    }


    try {

        const inputs =
            contentContainer.querySelectorAll(
                "[data-id][data-field]"
            );


        const updates =
            [];


        inputs.forEach(
            input => {

                const id =
                    Number(
                        input.dataset.id
                    );


                const field =
                    input.dataset.field;


                const item =
                    currentItems.find(
                        row =>
                            Number(row.id) === id
                    );


                if (!item) {
                    return;
                }


                const value =
                    input.value;


                if (
                    item[field] !==
                    value
                ) {

                    updates.push({
                        id,
                        [field]:
                            value
                    });

                }

            }
        );


        for (
            const update
            of updates
        ) {

            const id =
                update.id;


            delete update.id;


            const {
                error
            } =
                await supabaseClient
                    .from(
                        "site_content"
                    )
                    .update(
                        update
                    )
                    .eq(
                        "id",
                        id
                    );


            if (error) {

                throw error;

            }


            const item =
                currentItems.find(
                    row =>
                        Number(row.id) ===
                        Number(id)
                );


            if (item) {

                Object.assign(
                    item,
                    update
                );

            }

        }


        showMessage(
            updates.length
                ? `Збережено полів: ${updates.length}`
                : "Змін немає."
        );


    } catch (error) {

        console.error(
            "Save all:",
            error
        );


        showMessage(
            error.message ||
            "Помилка збереження."
        );


    } finally {

        isSaving =
            false;


        if (saveButton) {

            saveButton.disabled =
                false;

            saveButton.textContent =
                "Зберегти зміни";

        }

    }

}


/* =========================================================
   BUTTON
========================================================= */

function createButton(
    text,
    type
) {

    const button =
        document.createElement(
            "button"
        );


    button.type =
        "button";


    button.textContent =
        text;


    button.className =
        `admin-button admin-button-${type}`;


    return button;

}


/* =========================================================
   SECTION NAME
========================================================= */

function formatSectionName(
    section
) {

    const names = {

        header:
            "Шапка сайту",

        seo:
            "SEO",

        hero:
            "Перший екран",

        about:
            "Про компанію",

        services:
            "Послуги",

        service_1:
            "Послуга 1",

        service_2:
            "Послуга 2",

        service_3:
            "Послуга 3",

        service_4:
            "Послуга 4",

        faq:
            "Часті питання",

        contact:
            "Контакти",

        map:
            "Карта",

        footer:
            "Футер",

        general:
            "Загальне"

    };


    return (
        names[section] ||
        prettifyName(section)
    );

}


/* =========================================================
   FIELD NAME
========================================================= */

function formatFieldName(
    key
) {

    const names = {

        title:
            "Заголовок",

        description:
            "Опис",

        heading:
            "Заголовок секції",

        text:
            "Текст",

        text_1:
            "Текст 1",

        text_2:
            "Текст 2",

        button_text:
            "Текст кнопки",

        phone:
            "Телефон",

        phone_display:
            "Телефон для відображення",

        email:
            "Email",

        work_area:
            "Район роботи",

        image:
            "Фото",

        image_1:
            "Фото 1",

        image_2:
            "Фото 2",

        feature_1:
            "Перевага 1",

        feature_2:
            "Перевага 2",

        feature_3:
            "Перевага 3",

        feature_4:
            "Перевага 4",

        item_1:
            "Пункт 1",

        item_2:
            "Пункт 2",

        item_3:
            "Пункт 3",

        item_4:
            "Пункт 4",

        question:
            "Питання",

        answer:
            "Відповідь",

        areas:
            "Зони / райони"

    };


    return (
        names[key] ||
        prettifyName(key)
    );

}


/* =========================================================
   PRETTIFY
========================================================= */

function prettifyName(
    value
) {

    return String(value || "")
        .replace(
            /_/g,
            " "
        )
        .replace(
            /\b\w/g,
            char =>
                char.toUpperCase()
        );

}


/* =========================================================
   CACHE BUSTER
========================================================= */

function addCacheBuster(
    url
) {

    if (!url) {
        return "";
    }


    const separator =
        url.includes("?")
            ? "&"
            : "?";


    return (
        url +
        separator +
        "v=" +
        Date.now()
    );

}


/* =========================================================
   LOADING
========================================================= */

function createLoadingHTML() {

    return `
        <div class="loading-state">
            Завантаження...
        </div>
    `;

}


/* =========================================================
   ERROR
========================================================= */

function createErrorHTML(
    message
) {

    return `
        <div class="error-state">
            <strong>
                Помилка завантаження
            </strong>

            <div>
                ${escapeHtml(
                    message || ""
                )}
            </div>
        </div>
    `;

}


/* =========================================================
   MESSAGE
========================================================= */

function showMessage(
    message
) {

    let element =
        document.getElementById(
            "admin-message"
        );


    if (!element) {

        element =
            document.createElement(
                "div"
            );


        element.id =
            "admin-message";


        element.className =
            "admin-message";


        document.body.appendChild(
            element
        );

    }


    element.textContent =
        message;


    element.classList.add(
        "show"
    );


    clearTimeout(
        element._timer
    );


    element._timer =
        setTimeout(
            () => {

                element.classList.remove(
                    "show"
                );

            },
            3000
        );

}


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHtml(
    value
) {

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


/* =========================================================
   END
========================================================= */
