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
// SHOW LOGIN
// ============================================================

function showLogin(message = "") {

    loginSection.style.display = "block";
    adminSection.style.display = "none";

    loginMessage.textContent = message;
}


// ============================================================
// SHOW ADMIN
// ============================================================

function showAdmin() {

    loginSection.style.display = "none";
    adminSection.style.display = "block";

    loginMessage.textContent = "";
}


// ============================================================
// CHECK ADMIN
// ============================================================

async function checkAdmin() {

    const {
        data: {
            user
        },
        error: userError
    } = await supabaseClient.auth.getUser();


    if (userError || !user) {

        console.error("User error:", userError);

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
// CHECK AUTH
// ============================================================

async function checkAuth() {

    try {

        const {
            data: {
                session
            }
        } = await supabaseClient.auth.getSession();


        if (!session) {

            showLogin();

            return;
        }


        const isAdmin = await checkAdmin();


        if (!isAdmin) {

            await supabaseClient.auth.signOut();

            showLogin(
                "Цей користувач не має прав адміністратора."
            );

            return;
        }


        showAdmin();

        await loadContent();

    } catch (error) {

        console.error("Auth error:", error);

        showLogin(
            "Помилка перевірки авторизації."
        );
    }
}


// ============================================================
// LOGIN
// ============================================================

loginForm.addEventListener(
    "submit",
    async function(event) {

        event.preventDefault();


        loginMessage.textContent =
            "Вхід...";


        const email =
            document.getElementById("email").value.trim();

        const password =
            document.getElementById("password").value;


        const {
            data,
            error
        } = await supabaseClient.auth.signInWithPassword({
            email: email,
            password: password
        });


        if (error) {

            console.error("Login error:", error);

            loginMessage.textContent =
                "Помилка входу: " + error.message;

            return;
        }


        if (!data.session) {

            loginMessage.textContent =
                "Авторизація не створила сесію.";

            return;
        }


        const isAdmin = await checkAdmin();


        if (!isAdmin) {

            await supabaseClient.auth.signOut();

            loginMessage.textContent =
                "Вхід виконано, але користувач не має прав адміністратора.";

            return;
        }


        showAdmin();

        await loadContent();

    }
);


// ============================================================
// LOGOUT
// ============================================================

logoutButton.addEventListener(
    "click",
    async function() {

        await supabaseClient.auth.signOut();

        showLogin();

    }
);


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

        console.error("Content error:", error);

        contentEditor.innerHTML =
            "<p>Помилка завантаження контенту.</p>";

        return;
    }


    if (!data || data.length === 0) {

        contentEditor.innerHTML =
            "<p>Контент для цієї сторінки ще не створено.</p>";

        return;
    }


    renderEditor(data);
}


// ============================================================
// RENDER EDITOR
// ============================================================

function renderEditor(items) {

    contentEditor.innerHTML = "";


    items.forEach(function(item) {

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


        if (item.content_type === "textarea") {

            input =
                document.createElement("textarea");

            input.rows = 6;

        } else {

            input =
                document.createElement("input");

            input.type = "text";
        }


        input.value =
            item.content_value || "";


        wrapper.appendChild(input);


        const button =
            document.createElement("button");

        button.type = "button";

        button.textContent =
            "Зберегти";


        button.addEventListener(
            "click",
            async function() {

                await saveField(
                    item.id,
                    input.value,
                    button
                );

            }
        );


        wrapper.appendChild(button);

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
        text_1: "Текст 1",
        text_2: "Текст 2",
        button_text: "Текст кнопки",
        phone: "Телефон",
        email: "Email",
        faq_question: "Питання FAQ",
        faq_answer: "Відповідь FAQ"

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

        console.error("Save error:", error);

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
// PAGE CHANGE
// ============================================================

pageSelect.addEventListener(
    "change",
    function() {

        loadContent();

    }
);


// ============================================================
// START
// ============================================================

checkAuth();
