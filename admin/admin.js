```javascript
const SUPABASE_URL = "https://lohoxjwfhjudzmpwhcyv.supabase.co";
const SUPABASE_KEY = "sb_publishable_LeBJ_X9VLHu05ImQlaTe8g_uH9y19cA";

const supabaseClient = supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);


// ============================================================
// ELEMENTS
// ============================================================

const loginSection = document.getElementById("login-section");
const adminSection = document.getElementById("admin-section");

const loginForm = document.getElementById("login-form");
const loginMessage = document.getElementById("login-message");

const logoutButton = document.getElementById("logout-button");

const pageSelect = document.getElementById("page-select");
const pageTitle = document.getElementById("page-title");
const contentEditor = document.getElementById("content-editor");

const globalMessage = document.getElementById("global-message");


// ============================================================
// PAGE NAMES
// ============================================================

const pageNames = {
    home: "Головна сторінка",
    vynos: "Винос в натуру",
    topo: "Топографічна зйомка",
    suprovid: "Геодезичний супровід",
    kgz: "КГЗ"
};


// ============================================================
// AUTH
// ============================================================

async function checkAuth() {

    const {
        data: {
            session
        }
    } = await supabaseClient.auth.getSession();


    if (session) {

        const isAdmin = await checkAdmin();

        if (!isAdmin) {

            await supabaseClient.auth.signOut();

            showLogin();

            loginMessage.textContent =
                "У цього користувача немає прав адміністратора.";

            return;
        }

        showAdmin();

        await loadContent();

    } else {

        showLogin();

    }
}


// ============================================================
// CHECK ADMIN
// ============================================================

async function checkAdmin() {

    const {
        data: {
            user
        }
    } = await supabaseClient.auth.getUser();


    if (!user) {
        return false;
    }


    const {
        data,
        error
    } = await supabaseClient
        .from("admin_users")
        .select("user_id")
        .eq("user_id", user.id)
        .maybeSingle();


    if (error) {

        console.error("Admin check error:", error);

        return false;
    }


    return !!data;
}


// ============================================================
// SHOW LOGIN
// ============================================================

function showLogin() {

    loginSection.style.display = "block";
    adminSection.style.display = "none";

}


// ============================================================
// SHOW ADMIN
// ============================================================

function showAdmin() {

    loginSection.style.display = "none";
    adminSection.style.display = "block";

}


// ============================================================
// LOGIN
// ============================================================

loginForm.addEventListener("submit", async function(event) {

    event.preventDefault();

    loginMessage.textContent = "Вхід...";


    const email =
        document.getElementById("email").value.trim();

    const password =
        document.getElementById("password").value;


    const {
        error
    } = await supabaseClient.auth.signInWithPassword({
        email,
        password
    });


    if (error) {

        loginMessage.textContent =
            "Помилка входу: " + error.message;

        return;
    }


    const isAdmin = await checkAdmin();


    if (!isAdmin) {

        await supabaseClient.auth.signOut();

        loginMessage.textContent =
            "Вхід виконано, але цей користувач не має прав адміністратора.";

        return;
    }


    loginMessage.textContent = "";

    showAdmin();

    await loadContent();

});


// ============================================================
// LOGOUT
// ============================================================

logoutButton.addEventListener("click", async function() {

    await supabaseClient.auth.signOut();

    showLogin();

});


// ============================================================
// LOAD CONTENT
// ============================================================

async function loadContent() {

    const page = pageSelect.value;

    pageTitle.textContent =
        pageNames[page] || "Редагування";


    contentEditor.innerHTML =
        "<p>Завантаження...</p>";


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

        console.error("Load content error:", error);

        contentEditor.innerHTML =
            "<p>Помилка завантаження контенту.</p>";

        return;
    }


    if (!data || data.length === 0) {

        contentEditor.innerHTML = `
            <div class="empty-content">
                <p>Для цієї сторінки контент ще не створено.</p>
            </div>
        `;

        return;
    }


    renderEditor(data);

}


// ============================================================
// RENDER EDITOR
// ============================================================

function renderEditor(items) {

    contentEditor.innerHTML = "";


    items.forEach(item => {

        const wrapper =
            document.createElement("div");

        wrapper.className =
            "content-field";


        const label =
            document.createElement("label");

        label.textContent =
            getFieldLabel(item);


        wrapper.appendChild(label);


        let input;


        // =========================
        // TEXTAREA
        // =========================

        if (
            item.content_type === "textarea"
        ) {

            input =
                document.createElement("textarea");

            input.rows = 5;

        }


        // =========================
        // IMAGE
        // =========================

        else if (
            item.content_type === "image"
        ) {

            input =
                document.createElement("input");

            input.type = "text";

            input.placeholder =
                "URL зображення";

        }


        // =========================
        // URL
        // =========================

        else if (
            item.content_type === "url"
        ) {

            input =
                document.createElement("input");

            input.type = "url";

        }


        // =========================
        // EMAIL
        // =========================

        else if (
            item.content_type === "email"
        ) {

            input =
                document.createElement("input");

            input.type = "email";

        }


        // =========================
        // PHONE
        // =========================

        else if (
            item.content_type === "phone"
        ) {

            input =
                document.createElement("input");

            input.type = "tel";

        }


        // =========================
        // DEFAULT TEXT
        // =========================

        else {

            input =
                document.createElement("input");

            input.type = "text";

        }


        input.value =
            item.content_value || "";


        input.dataset.id =
            item.id;


        input.dataset.key =
            item.content_key;


        input.dataset.page =
            item.page;


        wrapper.appendChild(input);


        // =========================
        // SAVE BUTTON
        // =========================

        const saveButton =
            document.createElement("button");

        saveButton.type =
            "button";

        saveButton.textContent =
            "Зберегти";


        saveButton.className =
            "save-field-button";


        saveButton.addEventListener(
            "click",
            function() {

                saveField(
                    item.id,
                    input.value,
                    saveButton
                );

            }
        );


        wrapper.appendChild(saveButton);


        contentEditor.appendChild(wrapper);

    });

}


// ============================================================
// FIELD LABEL
// ============================================================

function getFieldLabel(item) {

    const labels = {

        title: "Заголовок",

        subtitle: "Підзаголовок",

        description: "Опис",

        heading: "Заголовок",

        text: "Текст",

        image: "Зображення",

        phone: "Телефон",

        email: "Email",

        button: "Кнопка",

        button_text: "Текст кнопки",

        faq_question: "Питання FAQ",

        faq_answer: "Відповідь FAQ",

        seo_title: "SEO Title",

        seo_description: "SEO Description"

    };


    return labels[item.content_key]
        || item.content_key;
}


// ============================================================
// SAVE FIELD
// ============================================================

async function saveField(
    id,
    value,
    button
) {

    button.disabled = true;

    button.textContent =
        "Збереження...";


    const {
        error
    } = await supabaseClient
        .from("site_content")
        .update({
            content_value: value
        })
        .eq("id", id);


    if (error) {

        console.error(
            "Save error:",
            error
        );


        button.textContent =
            "Помилка";


        button.disabled = false;

        return;
    }


    button.textContent =
        "✓ Збережено";


    setTimeout(function() {

        button.textContent =
            "Зберегти";

        button.disabled = false;

    }, 1500);

}


// ============================================================
// CHANGE PAGE
// ============================================================

pageSelect.addEventListener(
    "change",
    async function() {

        globalMessage.textContent = "";

        await loadContent();

    }
);


// ============================================================
// START
// ============================================================

checkAuth();
```
