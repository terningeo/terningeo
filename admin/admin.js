"use strict";

/* =========================================================
   TERNINGEO ADMIN CMS
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

if (!window.supabase) {

    console.error(
        "Supabase library не завантажена."
    );

} else {

    window.supabaseClient =
        window.supabase.createClient(
            SUPABASE_URL,
            SUPABASE_KEY
        );

}


const supabaseClient =
    window.supabaseClient;


/* =========================================================
   STATE
   ========================================================= */

let currentPage = "home";
let currentItems = [];
let saving = false;


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
   START
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        console.log(
            "TERNINGEO ADMIN: start"
        );

        if (!supabaseClient) {

            showFatalError(
                "Supabase не завантажений. Перевір підключення supabase-js у admin/index.html."
            );

            return;

        }

        setupLogin();

        setupLogout();

        setupPageButtons();

        setupSaveButton();

        await restoreSession();

    }
);


/* =========================================================
   FIND LOGIN ELEMENTS
   ========================================================= */

function getLoginForm() {

    return (
        document.querySelector(
            "#login-form"
        ) ||
        document.querySelector(
            "form"
        )
    );

}


function getEmailInput(
    form
) {

    return (
        form?.querySelector(
            "#login-email"
        ) ||
        form?.querySelector(
            'input[type="email"]'
        ) ||
        form?.querySelector(
            'input[name="email"]'
        )
    );

}


function getPasswordInput(
    form
) {

    return (
        form?.querySelector(
            "#login-password"
        ) ||
        form?.querySelector(
            'input[type="password"]'
        ) ||
        form?.querySelector(
            'input[name="password"]'
        )
    );

}


function getLoginError() {

    return (
        document.querySelector(
            "#login-error"
        ) ||
        document.querySelector(
            ".login-error"
        )
    );

}


/* =========================================================
   LOGIN
   ========================================================= */

function setupLogin() {

    const form =
        getLoginForm();


    if (!form) {

        console.error(
            "Не знайдено форму авторизації."
        );

        return;

    }


    form.addEventListener(
        "submit",
        async event => {

            event.preventDefault();

            await login(
                form
            );

        }
    );

}


async function login(
    form
) {

    clearLoginError();


    const emailInput =
        getEmailInput(
            form
        );

    const passwordInput =
        getPasswordInput(
            form
        );


    if (!emailInput) {

        showLoginError(
            "Не знайдено поле email."
        );

        return;

    }


    if (!passwordInput) {

        showLoginError(
            "Не знайдено поле пароля."
        );

        return;

    }


    const email =
        emailInput.value.trim();

    const password =
        passwordInput.value;


    if (!email) {

        showLoginError(
            "Введіть email."
        );

        return;

    }


    if (!password) {

        showLoginError(
            "Введіть пароль."
        );

        return;

    }


    setLoginButton(
        form,
        true
    );


    try {

        console.log(
            "LOGIN:",
            email
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

            console.error(
                "Supabase login error:",
                error
            );

            throw error;

        }


        if (
            !data ||
            !data.user
        ) {

            throw new Error(
                "Supabase не повернув користувача."
            );

        }


        console.log(
            "USER:",
            data.user.id
        );


        const isAdmin =
            await checkAdmin(
                data.user.id
            );


        if (!isAdmin) {

            await supabaseClient
                .auth
                .signOut();

            throw new Error(
                "Користувач авторизований, але його немає в public.admin_users."
            );

        }


        showAdminPanel();

        await loadPage(
            currentPage
        );


    } catch (error) {

        console.error(
            "LOGIN ERROR:",
            error
        );


        showLoginError(
            translateAuthError(
                error
            )
        );


    } finally {

        setLoginButton(
            form,
            false
        );

    }

}


/* =========================================================
   RESTORE SESSION
   ========================================================= */

async function restoreSession() {

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
            data?.session;


        if (!session) {

            showLoginPanel();

            return;

        }


        console.log(
            "Existing session:",
            session.user.email
        );


        const isAdmin =
            await checkAdmin(
                session.user.id
            );


        if (!isAdmin) {

            await supabaseClient
                .auth
                .signOut();

            showLoginPanel();

            showLoginError(
                "Цей користувач не має прав адміністратора."
            );

            return;

        }


        showAdminPanel();

        await loadPage(
            currentPage
        );


    } catch (error) {

        console.error(
            "SESSION ERROR:",
            error
        );

        showLoginPanel();

        showLoginError(
            "Не вдалося перевірити сесію."
        );

    }

}


/* =========================================================
   ADMIN CHECK
   ========================================================= */

async function checkAdmin(
    userId
) {

    console.log(
        "Checking admin:",
        userId
    );


    const {
        data,
        error
    } =
        await supabaseClient
            .from(
                "admin_users"
            )
            .select(
                "user_id"
            )
            .eq(
                "user_id",
                userId
            )
            .maybeSingle();


    if (error) {

        console.error(
            "ADMIN CHECK ERROR:",
            error
        );

        throw error;

    }


    return !!data;

}


/* =========================================================
   LOGOUT
   ========================================================= */

function setupLogout() {

    const buttons =
        document.querySelectorAll(
            "#logout-button, [data-action='logout']"
        );


    buttons.forEach(
        button => {

            button.addEventListener(
                "click",
                async () => {

                    await supabaseClient
                        .auth
                        .signOut();

                    showLoginPanel();

                }
            );

        }
    );

}


/* =========================================================
   PAGE BUTTONS
   ========================================================= */

function setupPageButtons() {

    const buttons =
        document.querySelectorAll(
            "[data-page]"
        );


    buttons.forEach(
        button => {

            button.addEventListener(
                "click",
                async () => {

                    const page =
                        button.dataset.page;


                    if (
                        !PAGE_NAMES[page]
                    ) {

                        return;

                    }


                    currentPage =
                        page;


                    buttons.forEach(
                        item => {

                            item.classList.toggle(
                                "active",
                                item.dataset.page ===
                                page
                            );

                        }
                    );


                    updatePageTitle();

                    await loadPage(
                        page
                    );

                }
            );

        }
    );

}


function updatePageTitle() {

    const elements =
        document.querySelectorAll(
            "#current-page-title, [data-current-page]"
        );


    elements.forEach(
        element => {

            element.textContent =
                PAGE_NAMES[currentPage];

        }
    );

}


/* =========================================================
   SAVE BUTTON
   ========================================================= */

function setupSaveButton() {

    const button =
        document.querySelector(
            "#save-all, [data-action='save-all']"
        );


    if (!button) {
        return;
    }


    button.addEventListener(
        "click",
        saveAll
    );

}


/* =========================================================
   SHOW / HIDE PANELS
   ========================================================= */

function showLoginPanel() {

    const login =
        document.querySelector(
            "#login-screen"
        );


    const admin =
        document.querySelector(
            "#admin-screen"
        );


    if (login) {

        login.style.display =
            "flex";

    }


    if (admin) {

        admin.style.display =
            "none";

    }

}


function showAdminPanel() {

    const login =
        document.querySelector(
            "#login-screen"
        );


    const admin =
        document.querySelector(
            "#admin-screen"
        );


    if (login) {

        login.style.display =
            "none";

    }


    if (admin) {

        admin.style.display =
            "block";

    }

}


/* =========================================================
   LOGIN UI
   ========================================================= */

function setLoginButton(
    form,
    loading
) {

    const button =
        form.querySelector(
            'button[type="submit"]'
        );


    if (!button) {
        return;
    }


    button.disabled =
        loading;


    if (!button.dataset.originalText) {

        button.dataset.originalText =
            button.textContent;

    }


    button.textContent =
        loading
            ? "Вхід..."
            : button.dataset.originalText;

}


function showLoginError(
    message
) {

    const element =
        getLoginError();


    if (!element) {

        alert(
            message
        );

        return;

    }


    element.textContent =
        message;

    element.style.display =
        "block";

}


function clearLoginError() {

    const element =
        getLoginError();


    if (!element) {
        return;
    }


    element.textContent =
        "";

    element.style.display =
        "none";

}


/* =========================================================
   AUTH ERROR TRANSLATION
   ========================================================= */

function translateAuthError(
    error
) {

    const message =
        String(
            error?.message ||
            ""
        );


    if (
        message.includes(
            "Invalid login credentials"
        )
    ) {

        return "Неправильний email або пароль.";

    }


    if (
        message.includes(
            "Email not confirmed"
        )
    ) {

        return "Email користувача не підтверджений у Supabase.";

    }


    if (
        message.includes(
            "Too many requests"
        )
    ) {

        return "Забагато спроб входу. Спробуйте пізніше.";

    }


    return (
        message ||
        "Помилка авторизації."
    );

}


/* =========================================================
   LOAD CONTENT
   ========================================================= */

async function loadPage(
    page
) {

    const container =
        getContentContainer();


    if (!container) {

        console.error(
            "Не знайдено content-container."
        );

        return;

    }


    container.innerHTML =
        `
        <div class="loading-state">
            Завантаження...
        </div>
        `;


    try {

        const {
            data,
            error
        } =
            await supabaseClient
                .from(
                    "site_content"
                )
                .select(
                    "*"
                )
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


        renderPage(
            container,
            currentItems
        );


    } catch (error) {

        console.error(
            "LOAD PAGE ERROR:",
            error
        );


        container.innerHTML =
            `
            <div class="error-state">
                ${escapeHtml(
                    error.message
                )}
            </div>
            `;

    }

}


/* =========================================================
   CONTENT CONTAINER
   ========================================================= */

function getContentContainer() {

    return (
        document.querySelector(
            "#content-container"
        ) ||
        document.querySelector(
            "[data-content-container]"
        ) ||
        document.querySelector(
            ".content-container"
        )
    );

}


/* =========================================================
   RENDER PAGE
   ========================================================= */

function renderPage(
    container,
    items
) {

    container.innerHTML =
        "";


    if (!items.length) {

        container.innerHTML =
            `
            <div class="empty-state">
                Для цієї сторінки ще немає
                даних у CMS.
            </div>
            `;

        return;

    }


    const sections =
        {};


    items.forEach(
        item => {

            const section =
                item.section ||
                "general";


            if (!sections[section]) {

                sections[section] =
                    [];

            }


            sections[section].push(
                item
            );

        }
    );


    Object.keys(
        sections
    ).forEach(
        section => {

            const card =
                createSection(
                    section,
                    sections[section]
                );


            container.appendChild(
                card
            );

        }
    );

}


/* =========================================================
   SECTION
   ========================================================= */

function createSection(
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
        sectionName(
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

            grid.appendChild(
                createField(
                    item
                )
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
        fieldName(
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
            inputType(
                item.content_type
            );

    }


    input.className =
        "admin-input";


    input.value =
        item.content_value ||
        "";


    input.dataset.id =
        item.id;


    input.dataset.field =
        "content_value";


    wrapper.appendChild(
        input
    );


    return wrapper;

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


    const label =
        document.createElement(
            "label"
        );


    label.textContent =
        fieldName(
            item.content_key
        );


    wrapper.appendChild(
        label
    );


    const path =
        document.createElement(
            "div"
        );


    path.className =
        "image-storage-path";


    path.textContent =
        item.storage_path ||
        "storage_path не заданий";


    wrapper.appendChild(
        path
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


    renderImage(
        preview,
        imageUrl(
            item
        )
    );


    const controls =
        document.createElement(
            "div"
        );


    controls.className =
        "image-controls";


    const input =
        document.createElement(
            "input"
        );


    input.type =
        "file";

    input.accept =
        "image/*";

    input.style.display =
        "none";


    controls.appendChild(
        input
    );


    const replace =
        createActionButton(
            "Замінити фото"
        );


    replace.addEventListener(
        "click",
        () => {

            input.click();

        }
    );


    controls.appendChild(
        replace
    );


    const remove =
        createActionButton(
            "Прибрати"
        );


    remove.addEventListener(
        "click",
        async () => {

            await removeImage(
                item,
                preview,
                wrapper
            );

        }
    );


    controls.appendChild(
        remove
    );


    const restore =
        createActionButton(
            "Відновити"
        );


    restore.addEventListener(
        "click",
        async () => {

            await restoreImage(
                item,
                preview,
                wrapper
            );

        }
    );


    controls.appendChild(
        restore
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


    input.addEventListener(
        "change",
        async event => {

            const file =
                event.target.files?.[0];


            if (!file) {
                return;
            }


            await uploadReplacement(
                item,
                file,
                preview,
                wrapper
            );


            input.value =
                "";

        }
    );


    return wrapper;

}


/* =========================================================
   IMAGE URL
   ========================================================= */

function imageUrl(
    item
) {

    const value =
        item.content_value ||
        item.default_value ||
        item.storage_path ||
        "";


    if (!value) {
        return "";
    }


    if (
        value.startsWith(
            "http://"
        ) ||
        value.startsWith(
            "https://"
        )
    ) {

        return value;

    }


    return (
        SITE_URL +
        "/" +
        value.replace(
            /^\/+/,
            ""
        )
    );

}


/* =========================================================
   RENDER IMAGE
   ========================================================= */

function renderImage(
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


    const img =
        document.createElement(
            "img"
        );


    img.src =
        cacheBust(
            url
        );


    img.alt =
        "Фото";


    img.loading =
        "lazy";


    img.onerror =
        () => {

            container.innerHTML =
                `
                <div class="image-empty">
                    Фото не знайдено
                </div>
                `;

        };


    container.appendChild(
        img
    );

}


/* =========================================================
   UPLOAD REPLACEMENT
   ========================================================= */

async function uploadReplacement(
    item,
    file,
    preview,
    wrapper
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


        /*
        ====================================================
        FIXED PATH
        ====================================================

        НЕ створюємо нове ім'я.

        Якщо:

        storage_path =
        images/about.jpg

        то файл завжди буде:

        site-media/images/about.jpg
        ====================================================
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
                        upsert: true,
                        cacheControl:
                            "3600",
                        contentType:
                            file.type
                    }
                );


        if (uploadError) {

            throw uploadError;

        }


        const {
            data
        } =
            supabaseClient
                .storage
                .from(
                    STORAGE_BUCKET
                )
                .getPublicUrl(
                    item.storage_path
                );


        const publicUrl =
            data.publicUrl;


        const {
            error: dbError
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


        if (dbError) {

            throw dbError;

        }


        item.content_value =
            publicUrl;


        renderImage(
            preview,
            publicUrl
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
            "IMAGE ERROR:",
            error
        );


        status.textContent =
            error.message ||
            "Помилка.";

        status.style.color =
            "#dc3545";


        showMessage(
            error.message ||
            "Помилка завантаження фото."
        );

    }

}


/* =========================================================
   REMOVE IMAGE
   ========================================================= */

async function removeImage(
    item,
    preview,
    wrapper
) {

    if (
        !confirm(
            "Прибрати фото зі сторінки?"
        )
    ) {

        return;

    }


    const status =
        wrapper.querySelector(
            ".image-status"
        );


    try {

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


        renderImage(
            preview,
            ""
        );


        status.textContent =
            "Фото прибрано.";


        showMessage(
            "Фото прибрано зі сторінки."
        );


    } catch (error) {

        console.error(
            error
        );


        status.textContent =
            "Помилка.";

        showMessage(
            "Не вдалося прибрати фото."
        );

    }

}


/* =========================================================
   RESTORE IMAGE
   ========================================================= */

async function restoreImage(
    item,
    preview,
    wrapper
) {

    if (
        !item.default_value
    ) {

        showMessage(
            "Немає default_value для відновлення."
        );

        return;

    }


    if (
        !confirm(
            "Відновити початкове фото?"
        )
    ) {

        return;

    }


    try {

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


        renderImage(
            preview,
            imageUrl(
                item
            )
        );


        showMessage(
            "Початкове фото відновлено."
        );


    } catch (error) {

        console.error(
            error
        );


        showMessage(
            "Не вдалося відновити фото."
        );

    }

}


/* =========================================================
   SAVE ALL
   ========================================================= */

async function saveAll() {

    if (saving) {
        return;
    }


    saving =
        true;


    const button =
        document.querySelector(
            "#save-all, [data-action='save-all']"
        );


    if (button) {

        button.disabled =
            true;

        button.textContent =
            "Збереження...";

    }


    try {

        const fields =
            document.querySelectorAll(
                "[data-id][data-field='content_value']"
            );


        let count =
            0;


        for (
            const field
            of fields
        ) {

            const id =
                Number(
                    field.dataset.id
                );


            const value =
                field.value;


            const item =
                currentItems.find(
                    row =>
                        Number(row.id) ===
                        id
                );


            if (!item) {
                continue;
            }


            if (
                item.content_value ===
                value
            ) {

                continue;

            }


            const {
                error
            } =
                await supabaseClient
                    .from(
                        "site_content"
                    )
                    .update({
                        content_value:
                            value
                    })
                    .eq(
                        "id",
                        id
                    );


            if (error) {

                throw error;

            }


            item.content_value =
                value;


            count++;

        }


        showMessage(
            count
                ? `Збережено: ${count}`
                : "Змін немає."
        );


    } catch (error) {

        console.error(
            "SAVE ERROR:",
            error
        );


        showMessage(
            error.message ||
            "Помилка збереження."
        );


    } finally {

        saving =
            false;


        if (button) {

            button.disabled =
                false;

            button.textContent =
                "Зберегти зміни";

        }

    }

}


/* =========================================================
   VALIDATE IMAGE
   ========================================================= */

function validateImage(
    file
) {

    if (
        !file.type.startsWith(
            "image/"
        )
    ) {

        throw new Error(
            "Можна завантажувати тільки зображення."
        );

    }


    if (
        file.size >
        10 * 1024 * 1024
    ) {

        throw new Error(
            "Максимальний розмір — 10 МБ."
        );

    }

}


/* =========================================================
   HELPERS
   ========================================================= */

function createActionButton(
    text
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
        "admin-button";


    return button;

}


function inputType(
    type
) {

    if (
        type ===
        "email"
    ) {

        return "email";

    }


    if (
        type ===
        "url"
    ) {

        return "url";

    }


    if (
        type ===
        "phone"
    ) {

        return "tel";

    }


    return "text";

}


function sectionName(
    value
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
            "Футер"

    };


    return (
        names[value] ||
        prettify(value)
    );

}


function fieldName(
    value
) {

    const names = {

        title:
            "Заголовок",

        description:
            "Опис",

        heading:
            "Заголовок",

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
            "Телефон",

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
            "Відповідь"

    };


    return (
        names[value] ||
        prettify(value)
    );

}


function prettify(
    value
) {

    return String(
        value || ""
    )
        .replace(
            /_/g,
            " "
        );

}


function cacheBust(
    url
) {

    if (!url) {
        return "";
    }


    return (
        url +
        (
            url.includes("?")
                ? "&"
                : "?"
        ) +
        "v=" +
        Date.now()
    );

}


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
   MESSAGE
   ========================================================= */

function showMessage(
    message
) {

    let box =
        document.getElementById(
            "admin-message"
        );


    if (!box) {

        box =
            document.createElement(
                "div"
            );


        box.id =
            "admin-message";


        box.style.position =
            "fixed";

        box.style.right =
            "20px";

        box.style.bottom =
            "20px";

        box.style.zIndex =
            "99999";

        box.style.padding =
            "14px 20px";

        box.style.borderRadius =
            "10px";

        box.style.background =
            "#1d2b4f";

        box.style.color =
            "#fff";

        box.style.fontFamily =
            "Montserrat, sans-serif";

        document.body.appendChild(
            box
        );

    }


    box.textContent =
        message;


    box.style.display =
        "block";


    clearTimeout(
        box._timer
    );


    box._timer =
        setTimeout(
            () => {

                box.style.display =
                    "none";

            },
            3000
        );

}


/* =========================================================
   FATAL ERROR
   ========================================================= */

function showFatalError(
    message
) {

    const login =
        document.querySelector(
            "#login-screen"
        );


    if (login) {

        login.innerHTML =
            `
            <div style="
                max-width:500px;
                padding:30px;
                background:#fff;
                border-radius:16px;
                font-family:Montserrat,sans-serif;
                color:#1d2b4f;
            ">
                <h2>
                    Помилка CMS
                </h2>

                <p>
                    ${escapeHtml(
                        message
                    )}
                </p>
            </div>
            `;

        return;

    }


    alert(
        message
    );

}
