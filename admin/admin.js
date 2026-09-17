const SUPABASE_URL = "https://lohoxjwfhjudzmpwhcyv.supabase.co";
const SUPABASE_KEY = "sb_publishable_LeBJ_X9VLHu05ImQlaTe8g_uH9y19cA";

const supabaseClient = supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);


// ===============================
// ЕЛЕМЕНТИ
// ===============================

const loginSection = document.getElementById("login-section");
const adminSection = document.getElementById("admin-section");

const loginForm = document.getElementById("login-form");
const loginMessage = document.getElementById("login-message");

const logoutButton = document.getElementById("logout-button");

const homeTitle = document.getElementById("home-title");
const homeSubtitle = document.getElementById("home-subtitle");
const homeDescription = document.getElementById("home-description");

const saveHomeButton = document.getElementById("save-home");
const saveMessage = document.getElementById("save-message");


// ===============================
// ПЕРЕВІРКА АВТОРИЗАЦІЇ
// ===============================

async function checkAuth() {

    const {
        data: {
            session
        }
    } = await supabaseClient.auth.getSession();

    if (session) {

        showAdmin();

        await loadContent();

    } else {

        showLogin();

    }
}


// ===============================
// ПОКАЗАТИ LOGIN
// ===============================

function showLogin() {

    loginSection.style.display = "block";
    adminSection.style.display = "none";

}


// ===============================
// ПОКАЗАТИ ADMIN
// ===============================

function showAdmin() {

    loginSection.style.display = "none";
    adminSection.style.display = "block";

}


// ===============================
// LOGIN
// ===============================

loginForm.addEventListener("submit", async function(event) {

    event.preventDefault();

    loginMessage.textContent = "Вхід...";

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;


    const {
        data,
        error
    } = await supabaseClient.auth.signInWithPassword({
        email: email,
        password: password
    });


    if (error) {

        loginMessage.textContent =
            "Помилка входу: " + error.message;

        return;

    }


    loginMessage.textContent = "";

    showAdmin();

    await loadContent();

});


// ===============================
// LOGOUT
// ===============================

logoutButton.addEventListener("click", async function() {

    await supabaseClient.auth.signOut();

    showLogin();

});


// ===============================
// ЗАВАНТАЖЕННЯ КОНТЕНТУ
// ===============================

async function loadContent() {

    const {
        data,
        error
    } = await supabaseClient
        .from("site_content")
        .select("*");


    if (error) {

        console.error(error);

        return;

    }


    data.forEach(item => {

        if (item.content_key === "title") {

            homeTitle.value = item.content_value;

        }

        if (item.content_key === "subtitle") {

            homeSubtitle.value = item.content_value;

        }

        if (item.content_key === "description") {

            homeDescription.value = item.content_value;

        }

    });

}


// ===============================
// ЗБЕРЕЖЕННЯ
// ===============================

saveHomeButton.addEventListener("click", async function() {

    saveMessage.textContent = "Збереження...";


    const updates = [

        {
            key: "title",
            value: homeTitle.value
        },

        {
            key: "subtitle",
            value: homeSubtitle.value
        },

        {
            key: "description",
            value: homeDescription.value
        }

    ];


    for (const item of updates) {

        const {
            error
        } = await supabaseClient
            .from("site_content")
            .update({
                content_value: item.value,
                updated_at: new Date().toISOString()
            })
            .eq("content_key", item.key);


        if (error) {

            console.error(error);

            saveMessage.textContent =
                "Помилка збереження";

            return;

        }

    }


    saveMessage.textContent =
        "✓ Зміни збережено";

});


// ===============================
// СТАРТ
// ===============================

checkAuth();
