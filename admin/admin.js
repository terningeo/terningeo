```javascript
/* =========================================================
   TERNINGEO UNIVERSAL ADMIN
   Supabase + site_content + site-media
   ========================================================= */

console.log("TERNINGEO ADMIN: start");

const SUPABASE_URL = "https://lohoxjwfhjudzmpwhcyv.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_LeBJ_X9VLHu05ImQlaTe8g_uH9y19cA";

const STORAGE_BUCKET = "site-media";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);


/* =========================================================
   STATE
   ========================================================= */

let currentPage = "home";
let currentRows = [];
let isInitialized = false;


/* =========================================================
   DOM
   ========================================================= */

const loginSection = document.getElementById("login-section");
const adminSection = document.getElementById("admin-section");

const loginForm = document.getElementById("login-form");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const loginMessage = document.getElementById("login-message");

const logoutButton = document.getElementById("logout-button");

const pageTitle = document.getElementById("page-title");
const contentEditor = document.getElementById("content-editor");
const saveAllButton = document.getElementById("save-all-button");

const globalMessage = document.getElementById("global-message");

const pageButtons = document.querySelectorAll(".page-button");


/* =========================================================
   PAGE NAMES
   ========================================================= */

const PAGE_NAMES = {
    home: "Головна",
    vynos: "Винос меж",
    topo: "Топографія",
    suprovid: "Геодезичний супровід",
    kgz: "Контрольні геодезичні роботи"
};


/* =========================================================
   SECTION NAMES
   ========================================================= */

const SECTION_NAMES = {
    seo: "SEO",
    hero: "Головний екран",
    about: "Про компанію",
    services: "Послуги",
    service_1: "Послуга 1",
    service_2: "Послуга 2",
    service_3: "Послуга 3",
    service_4: "Послуга 4",
    faq: "Часті запитання",
    contact: "Контакти",
    map: "Карта",
    page: "Сторінка",
    content: "Контент"
};


/* =========================================================
   LABELS
   ========================================================= */

const KEY_LABELS = {

    title: "Заголовок",

    description: "Опис",

    heading: "Заголовок",

    text: "Текст",

    text_1: "Текст 1",

    text_2: "Текст 2",

    button_text: "Текст кнопки",

    phone: "Телефон",

    phone_display: "Телефон для відображення",

    email: "Email",

    work_area: "Робоча зона",

    image: "Зображення",

    image_1: "Зображення 1",

    image_2: "Зображення 2",

    question: "Питання",

    answer: "Відповідь",

    areas: "Райони",

    url: "Посилання"
};


/* =========================================================
   HELPERS
   ========================================================= */

function escapeHtml(value) {

    if (value === null || value === undefined) {
        return "";
    }

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


function showLoginMessage(message, type = "error") {

    if (!loginMessage) {
        return;
    }

    loginMessage.textContent = message;

    if (type === "success") {
        loginMessage.style.color = "#0d9b74";
    } else {
        loginMessage.style.color = "#dc3545";
    }
}


let messageTimer = null;

function showMessage(message, type = "success") {

    if (!globalMessage) {
        return;
    }

    globalMessage.textContent = message;

    if (type === "error") {
        globalMessage.style.background = "#dc3545";
    } else {
        globalMessage.style.background = "#0d9b74";
    }

    globalMessage.style.display = "block";

    clearTimeout(messageTimer);

    messageTimer = setTimeout(() => {

        globalMessage.style.display = "none";

    }, 3500);
}


function getSectionName(section) {

    if (SECTION_NAMES[section]) {
        return SECTION_NAMES[section];
    }

    return String(section || "")
        .replace(/_/g, " ")
        .replace(/\b\w/g, char => char.toUpperCase());
}


function getKeyLabel(key) {

    if (KEY_LABELS[key]) {
        return KEY_LABELS[key];
    }

    return String(key || "")
        .replace(/_/g, " ")
        .replace(/\b\w/g, char => char.toUpperCase());
}


function getPageTitle(page) {

    return PAGE_NAMES[page] || page;
}


function getImageUrl(value) {

    if (!value) {
        return "";
    }

    const stringValue = String(value).trim();

    if (
        stringValue.startsWith("http://") ||
        stringValue.startsWith("https://") ||
        stringValue.startsWith("data:")
    ) {
        return stringValue;
    }

    if (stringValue.startsWith("/")) {
        return `https://terningeo.pp.ua${stringValue}`;
    }

    return `https://terningeo.pp.ua/${stringValue}`;
}


function getExtension(filename) {

    const parts = String(filename).split(".");

    if (parts.length < 2) {
        return "jpg";
    }

    return parts.pop().toLowerCase().replace(/[^a-z0-9]/g, "");
}


function isImage(row) {

    return row.content_type === "image";
}


function isTextarea(row) {

    return (
        row.content_type === "textarea" ||
        row.content_type === "text"
    );
}


/* =========================================================
   ADMIN CHECK
   ========================================================= */

async function checkAdmin(userId) {

    console.log("Checking admin:", userId);

    const { data, error } = await supabaseClient
        .from("admin_users")
        .select("user_id")
        .eq("user_id", userId)
        .maybeSingle();

    if (error) {

        console.error("ADMIN CHECK ERROR:", error);

        return false;
    }

    return !!data;
}


/* =========================================================
   LOGIN
   ========================================================= */

async function login(event) {

    event.preventDefault();

    if (!emailInput || !passwordInput) {
        return;
    }

    const email = emailInput.value.trim();
    const password = passwordInput.value;

    if (!email || !password) {
        showLoginMessage("Введіть email і пароль.");
        return;
    }

    showLoginMessage("Вхід...", "success");

    console.log("LOGIN:", email);

    const {
        data,
        error
    } = await supabaseClient.auth.signInWithPassword({
        email,
        password
    });

    if (error) {

        console.error("LOGIN ERROR:", error);

        showLoginMessage(
            error.message || "Помилка авторизації."
        );

        return;
    }

    console.log(
        "USER:",
        data?.user?.id
    );

    if (!data?.user) {

        showLoginMessage(
            "Користувача не отримано."
        );

        return;
    }

    const admin = await checkAdmin(data.user.id);

    if (!admin) {

        await supabaseClient.auth.signOut();

        showLoginMessage(
            "У цього користувача немає прав адміністратора."
        );

        return;
    }

    showLoginMessage(
        "Успішний вхід.",
        "success"
    );

    await showAdminPanel();

}


/* =========================================================
   SHOW ADMIN
   ========================================================= */

async function showAdminPanel() {

    if (loginSection) {
        loginSection.style.display = "none";
    }

    if (adminSection) {
        adminSection.style.display = "block";
    }

    isInitialized = true;

    await loadPage(currentPage);
}


/* =========================================================
   LOGOUT
   ========================================================= */

async function logout() {

    const {
        error
    } = await supabaseClient.auth.signOut();

    if (error) {

        console.error(
            "LOGOUT ERROR:",
            error
        );

        showMessage(
            "Не вдалося вийти.",
            "error"
        );

        return;
    }

    if (adminSection) {
        adminSection.style.display = "none";
    }

    if (loginSection) {
        loginSection.style.display = "flex";
    }

    if (loginForm) {
        loginForm.reset();
    }

    showLoginMessage("");

}


/* =========================================================
   RESTORE SESSION
   ========================================================= */

async function restoreSession() {

    const {
        data,
        error
    } = await supabaseClient.auth.getSession();

    if (error) {

        console.error(
            "SESSION ERROR:",
            error
        );

        return;
    }

    const session = data?.session;

    if (!session?.user) {

        console.log(
            "No active session"
        );

        return;
    }

    console.log(
        "Existing session:",
        session.user.email
    );

    const admin = await checkAdmin(
        session.user.id
    );

    if (!admin) {

        console.warn(
            "Existing user is not admin."
        );

        await supabaseClient.auth.signOut();

        return;
    }

    await showAdminPanel();
}


/* =========================================================
   LOAD PAGE
   ========================================================= */

async function loadPage(page) {

    currentPage = page;

    console.log(
        "Loading page:",
        page
    );

    if (pageTitle) {
        pageTitle.textContent =
            getPageTitle(page);
    }

    if (!contentEditor) {

        console.error(
            "Не знайдено #content-editor."
        );

        return;
    }

    contentEditor.innerHTML = `
        <div style="
            padding:40px;
            text-align:center;
            color:#6b7280;
        ">
            Завантаження...
        </div>
    `;

    updateActivePageButton();

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
        .order("section", {
            ascending: true
        })
        .order("id", {
            ascending: true
        });

    if (error) {

        console.error(
            "LOAD PAGE ERROR:",
            error
        );

        contentEditor.innerHTML = `
            <div style="
                padding:30px;
                color:#dc3545;
                background:#fff;
                border-radius:15px;
            ">
                <strong>Помилка завантаження.</strong><br><br>
                ${escapeHtml(error.message)}
            </div>
        `;

        return;
    }

    currentRows = data || [];

    console.log(
        "Loaded rows:",
        currentRows.length
    );

    renderPage(currentRows);
}


/* =========================================================
   ACTIVE PAGE BUTTON
   ========================================================= */

function updateActivePageButton() {

    pageButtons.forEach(button => {

        const buttonPage =
            button.dataset.page;

        button.classList.toggle(
            "active",
            buttonPage === currentPage
        );

    });
}


/* =========================================================
   RENDER PAGE
   ========================================================= */

function renderPage(rows) {

    if (!contentEditor) {
        return;
    }

    if (!rows.length) {

        contentEditor.innerHTML = `
            <div style="
                background:#fff;
                padding:35px;
                border-radius:18px;
                color:#6b7280;
            ">
                Для сторінки
                <strong>${escapeHtml(currentPage)}</strong>
                ще немає записів у site_content.
            </div>
        `;

        return;
    }

    const sections = {};

    rows.forEach(row => {

        const section =
            row.section || "content";

        if (!sections[section]) {
            sections[section] = [];
        }

        sections[section].push(row);

    });


    const sectionNames =
        Object.keys(sections);


    let html = "";


    sectionNames.forEach(
        (section, sectionIndex) => {

            const sectionRows =
                sections[section];


            html += `
                <section
                    class="cms-section"
                    data-section="${escapeHtml(section)}"
                >

                    <div class="cms-section-header">

                        <div class="number">
                            ${sectionIndex + 1}
                        </div>

                        <h3>
                            ${escapeHtml(
                                getSectionName(section)
                            )}
                        </h3>

                    </div>

                    <div class="cms-section-body">

                        <div class="fields-grid">
            `;


            sectionRows.forEach(row => {

                html += renderField(row);

            });


            html += `
                        </div>

                    </div>

                </section>
            `;

        }
    );


    contentEditor.innerHTML = html;

    bindDynamicEvents();
}


/* =========================================================
   RENDER FIELD
   ========================================================= */

function renderField(row) {

    const id =
        `cms-field-${row.id}`;

    const label =
        getKeyLabel(row.content_key);

    const value =
        row.content_value || "";


    if (isImage(row)) {

        return renderImageField(
            row,
            id,
            label
        );

    }


    const fullWidth =
        row.content_type === "textarea" ||
        row.content_key === "description" ||
        row.content_key === "answer" ||
        row.content_key === "text" ||
        row.content_key === "text_1" ||
        row.content_key === "text_2";


    return `
        <div
            class="cms-field ${fullWidth ? "full" : ""}"
            data-row-id="${row.id}"
        >

            <label for="${id}">
                ${escapeHtml(label)}
            </label>

            ${
                isTextarea(row)

                ? `
                    <textarea
                        id="${id}"
                        data-row-id="${row.id}"
                        data-field-type="content"
                    >${escapeHtml(value)}</textarea>
                `

                : `
                    <input
                        id="${id}"
                        type="${getInputType(row.content_type)}"
                        value="${escapeHtml(value)}"
                        data-row-id="${row.id}"
                        data-field-type="content"
                    >
                `
            }

        </div>
    `;
}


/* =========================================================
   INPUT TYPE
   ========================================================= */

function getInputType(type) {

    switch (type) {

        case "email":
            return "email";

        case "phone":
            return "tel";

        case "url":
            return "url";

        default:
            return "text";
    }
}


/* =========================================================
   IMAGE FIELD
   ========================================================= */

function renderImageField(
    row,
    id,
    label
) {

    const imageUrl =
        getImageUrl(row.content_value);

    const hasImage =
        !!row.content_value;


    return `
        <div
            class="cms-field full"
            data-row-id="${row.id}"
        >

            <label>
                ${escapeHtml(label)}
            </label>

            <div class="image-editor">

                <div
                    class="image-preview"
                    id="preview-${row.id}"
                >

                    ${
                        hasImage

                        ? `
                            <img
                                src="${escapeHtml(imageUrl)}"
                                alt=""
                                loading="lazy"
                            >
                        `

                        : `
                            <span class="image-empty">
                                Зображення відсутнє
                            </span>
                        `
                    }

                </div>


                <div
                    style="
                        margin-bottom:12px;
                        font-size:12px;
                        color:#6b7280;
                        word-break:break-all;
                    "
                >
                    ${
                        row.storage_path
                            ? `Файл: ${escapeHtml(row.storage_path)}`
                            : "Шлях до файлу не заданий"
                    }
                </div>


                <div class="image-actions">

                    <button
                        type="button"
                        class="image-button"
                        data-image-upload="${row.id}"
                    >
                        Замінити фото
                    </button>


                    ${
                        hasImage

                        ? `
                            <button
                                type="button"
                                class="image-button danger"
                                data-image-remove="${row.id}"
                            >
                                Прибрати
                            </button>
                        `

                        : ""
                    }

                    <input
                        type="file"
                        accept="image/*"
                        class="image-file"
                        id="file-${row.id}"
                        data-image-file="${row.id}"
                    >

                </div>

            </div>

        </div>
    `;
}


/* =========================================================
   DYNAMIC EVENTS
   ========================================================= */

function bindDynamicEvents() {

    const uploadButtons =
        document.querySelectorAll(
            "[data-image-upload]"
        );

    uploadButtons.forEach(button => {

        button.addEventListener(
            "click",
            () => {

                const id =
                    button.dataset.imageUpload;

                const input =
                    document.querySelector(
                        `[data-image-file="${id}"]`
                    );

                if (input) {
                    input.click();
                }

            }
        );

    });


    const fileInputs =
        document.querySelectorAll(
            "[data-image-file]"
        );

    fileInputs.forEach(input => {

        input.addEventListener(
            "change",
            async () => {

                const rowId =
                    Number(
                        input.dataset.imageFile
                    );

                const file =
                    input.files?.[0];

                if (!file) {
                    return;
                }

                await uploadImage(
                    rowId,
                    file
                );

            }
        );

    });


    const removeButtons =
        document.querySelectorAll(
            "[data-image-remove]"
        );

    removeButtons.forEach(button => {

        button.addEventListener(
            "click",
            async () => {

                const rowId =
                    Number(
                        button.dataset.imageRemove
                    );

                await removeImage(
                    rowId
                );

            }
        );

    });


    const contentInputs =
        document.querySelectorAll(
            "[data-field-type='content']"
        );

    contentInputs.forEach(input => {

        input.addEventListener(
            "input",
            () => {

                const rowId =
                    Number(
                        input.dataset.rowId
                    );

                const row =
                    currentRows.find(
                        item =>
                            Number(item.id) === rowId
                    );

                if (!row) {
                    return;
                }

                row.content_value =
                    input.value;

            }
        );

    });

}


/* =========================================================
   UPLOAD IMAGE
   ========================================================= */

async function uploadImage(
    rowId,
    file
) {

    const row =
        currentRows.find(
            item =>
                Number(item.id) === rowId
        );

    if (!row) {

        showMessage(
            "Запис зображення не знайдений.",
            "error"
        );

        return;
    }


    if (!row.storage_path) {

        showMessage(
            "Для цього зображення не заданий storage_path.",
            "error"
        );

        console.error(
            "IMAGE HAS NO storage_path:",
            row
        );

        return;
    }


    if (!file.type.startsWith("image/")) {

        showMessage(
            "Можна завантажувати тільки зображення.",
            "error"
        );

        return;
    }


    const maxSize =
        15 * 1024 * 1024;


    if (file.size > maxSize) {

        showMessage(
            "Файл завеликий. Максимум 15 МБ.",
            "error"
        );

        return;
    }


    console.log(
        "Uploading image:",
        file.name,
        "→",
        row.storage_path
    );


    showMessage(
        "Завантаження зображення..."
    );


    /*
       ВАЖЛИВО:
       storage_path НЕ змінюємо.

       Наприклад:

       images/about.jpg

       залишається

       images/about.jpg
    */

    const storagePath =
        row.storage_path;


    const {
        error: uploadError
    } = await supabaseClient.storage
        .from(STORAGE_BUCKET)
        .upload(
            storagePath,
            file,
            {
                cacheControl: "3600",
                upsert: true,
                contentType: file.type
            }
        );


    if (uploadError) {

        console.error(
            "IMAGE UPLOAD ERROR:",
            uploadError
        );

        showMessage(
            "Помилка завантаження: " +
            uploadError.message,
            "error"
        );

        return;
    }


    const {
        data: publicData
    } = supabaseClient.storage
        .from(STORAGE_BUCKET)
        .getPublicUrl(storagePath);


    const publicUrl =
        publicData?.publicUrl;


    if (!publicUrl) {

        showMessage(
            "Не вдалося отримати URL зображення.",
            "error"
        );

        return;
    }


    /*
       Записуємо новий URL
       у site_content.
    */

    const {
        error: updateError
    } = await supabaseClient
        .from("site_content")
        .update({
            content_value: publicUrl
        })
        .eq("id", row.id);


    if (updateError) {

        console.error(
            "IMAGE DB UPDATE ERROR:",
            updateError
        );

        showMessage(
            "Фото завантажено, але URL не записано в БД.",
            "error"
        );

        return;
    }


    row.content_value =
        publicUrl;


    updateImagePreview(
        row.id,
        publicUrl
    );


    showMessage(
        "Зображення успішно замінено."
    );

}


/* =========================================================
   IMAGE PREVIEW
   ========================================================= */

function updateImagePreview(
    rowId,
    url
) {

    const preview =
        document.getElementById(
            `preview-${rowId}`
        );

    if (!preview) {
        return;
    }


    if (!url) {

        preview.innerHTML = `
            <span class="image-empty">
                Зображення відсутнє
            </span>
        `;

        return;
    }


    preview.innerHTML = `
        <img
            src="${escapeHtml(
                getImageUrl(url)
            )}"
            alt=""
        >
    `;
}


/* =========================================================
   REMOVE IMAGE
   ========================================================= */

async function removeImage(rowId) {

    const row =
        currentRows.find(
            item =>
                Number(item.id) === rowId
        );

    if (!row) {
        return;
    }


    const confirmed =
        window.confirm(
            "Прибрати це зображення з сайту?"
        );


    if (!confirmed) {
        return;
    }


    /*
       ФІЗИЧНО ФАЙЛ НЕ ВИДАЛЯЄМО.

       storage_path залишається.

       content_value очищається.

       Це дозволяє пізніше знову завантажити
       фото в той самий фізичний шлях.
    */

    const {
        error
    } = await supabaseClient
        .from("site_content")
        .update({
            content_value: ""
        })
        .eq("id", row.id);


    if (error) {

        console.error(
            "REMOVE IMAGE ERROR:",
            error
        );

        showMessage(
            "Не вдалося прибрати зображення.",
            "error"
        );

        return;
    }


    row.content_value = "";


    updateImagePreview(
        row.id,
        ""
    );


    showMessage(
        "Зображення прибрано."
    );


    await loadPage(
        currentPage
    );

}


/* =========================================================
   SAVE ALL
   ========================================================= */

async function saveAll() {

    if (!currentRows.length) {

        showMessage(
            "Немає даних для збереження.",
            "error"
        );

        return;
    }


    if (saveAllButton) {

        saveAllButton.disabled = true;

        saveAllButton.textContent =
            "Збереження...";

    }


    try {

        for (const row of currentRows) {

            /*
               Актуальне значення беремо
               безпосередньо з DOM.
            */

            const input =
                document.querySelector(
                    `[data-row-id="${row.id}"][data-field-type="content"]`
                );


            let value =
                row.content_value || "";


            if (input) {
                value = input.value;
            }


            const {
                error
            } = await supabaseClient
                .from("site_content")
                .update({
                    content_value: value
                })
                .eq("id", row.id);


            if (error) {

                throw new Error(
                    `Помилка "${row.content_key}": ${error.message}`
                );

            }


            row.content_value =
                value;

        }


        showMessage(
            "Усі зміни збережено."
        );


    } catch (error) {

        console.error(
            "SAVE ALL ERROR:",
            error
        );

        showMessage(
            error.message ||
            "Помилка збереження.",
            "error"
        );

    } finally {

        if (saveAllButton) {

            saveAllButton.disabled = false;

            saveAllButton.textContent =
                "Зберегти зміни";

        }

    }

}


/* =========================================================
   PAGE BUTTONS
   ========================================================= */

pageButtons.forEach(button => {

    button.addEventListener(
        "click",
        async () => {

            const page =
                button.dataset.page;

            if (!page) {
                return;
            }

            await loadPage(page);

        }
    );

});


/* =========================================================
   LOGIN FORM
   ========================================================= */

if (loginForm) {

    loginForm.addEventListener(
        "submit",
        login
    );

}


/* =========================================================
   LOGOUT
   ========================================================= */

if (logoutButton) {

    logoutButton.addEventListener(
        "click",
        logout
    );

}


/* =========================================================
   SAVE
   ========================================================= */

if (saveAllButton) {

    saveAllButton.addEventListener(
        "click",
        saveAll
    );

}


/* =========================================================
   AUTH STATE
   ========================================================= */

supabaseClient.auth.onAuthStateChange(
    async (event, session) => {

        console.log(
            "AUTH EVENT:",
            event
        );


        if (
            event === "SIGNED_OUT"
        ) {

            if (adminSection) {
                adminSection.style.display =
                    "none";
            }

            if (loginSection) {
                loginSection.style.display =
                    "flex";
            }

            return;
        }


        if (
            event === "SIGNED_IN" &&
            session?.user
        ) {

            /*
               Не запускаємо повторну
               ініціалізацію, якщо вона
               вже виконана.
            */

            if (!isInitialized) {

                const admin =
                    await checkAdmin(
                        session.user.id
                    );

                if (admin) {
                    await showAdminPanel();
                }

            }

        }

    }
);


/* =========================================================
   START
   ========================================================= */

restoreSession();


console.log(
    "TERNINGEO ADMIN: ready"
);
```
