/* =========================================================
   SECURITY AWARENESS HUB
   LOGIN
   ========================================================= */


/* =========================================================
   ELEMENTOS
   ========================================================= */

const loginForm = document.getElementById("loginForm");

const emailInput = document.getElementById("email");

const passwordInput = document.getElementById("password");

const togglePassword =
    document.getElementById("togglePassword");

const loginMessage =
    document.getElementById("loginMessage");

const rememberInput =
    document.getElementById("remember");

const forgotPassword =
    document.getElementById("forgotPassword");


/* =========================================================
   MOSTRAR / OCULTAR CONTRASEÑA
   ========================================================= */

if (togglePassword) {

    togglePassword.addEventListener("click", () => {

        if (passwordInput.type === "password") {

            passwordInput.type = "text";

            togglePassword.textContent = "🙈";

            togglePassword.setAttribute(
                "aria-label",
                "Ocultar contraseña"
            );

        } else {

            passwordInput.type = "password";

            togglePassword.textContent = "👁";

            togglePassword.setAttribute(
                "aria-label",
                "Mostrar contraseña"
            );

        }

    });

}


/* =========================================================
   MENSAJES
   ========================================================= */

function showMessage(message, type) {

    loginMessage.textContent = message;

    loginMessage.className =
        "login-message " + type;

}


function clearMessage() {

    loginMessage.textContent = "";

    loginMessage.className =
        "login-message";

}


/* =========================================================
   VALIDAR CORREO
   ========================================================= */

function validEmail(email) {

    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

}


/* =========================================================
   LOGIN
   ========================================================= */

if (loginForm) {

    loginForm.addEventListener("submit", function (event) {

        event.preventDefault();

        clearMessage();


        const email =
            emailInput.value.trim();

        const password =
            passwordInput.value.trim();


        /* ---------------------------------------------
           VALIDACIONES
           --------------------------------------------- */

        if (!email || !password) {

            showMessage(
                "Por favor completa todos los campos.",
                "error"
            );

            return;

        }


        if (!validEmail(email)) {

            showMessage(
                "Ingresa un correo electrónico válido.",
                "error"
            );

            emailInput.focus();

            return;

        }


        if (password.length < 6) {

            showMessage(
                "La contraseña debe tener mínimo 6 caracteres.",
                "error"
            );

            passwordInput.focus();

            return;

        }


        /* ---------------------------------------------
           DATOS DEL USUARIO
           --------------------------------------------- */

        const user = {

            email: email,

            role: "usuario",

            loginDate: new Date().toISOString()

        };


        /* ---------------------------------------------
           GUARDAR SESIÓN
           --------------------------------------------- */

        if (rememberInput.checked) {

            localStorage.setItem(
                "sah_user",
                JSON.stringify(user)
            );

        } else {

            sessionStorage.setItem(
                "sah_user",
                JSON.stringify(user)
            );

        }


        /* ---------------------------------------------
           MENSAJE
           --------------------------------------------- */

        showMessage(
            "Inicio de sesión correcto. Entrando...",
            "success"
        );


/* ---------------------------------------------
   REDIRECCIÓN

   login.html está dentro de:

   authentication/

   y course.html está dentro de:

   Interface_User/Course/
   --------------------------------------------- */

        setTimeout(() => {

            window.location.href = "../Interface_User/Course/course.html";

        }, 1000);

    });

}


/* =========================================================
   OLVIDÉ MI CONTRASEÑA
   ========================================================= */

if (forgotPassword) {

    forgotPassword.addEventListener("click", function (event) {

        event.preventDefault();

        showMessage(
            "La recuperación de contraseña estará disponible próximamente.",
            "error"
        );

    });

}


/* =========================================================
   COMPROBAR SESIÓN EXISTENTE
   ========================================================= */

function checkExistingSession() {

    const localUser =
        localStorage.getItem("sah_user");

    const sessionUser =
        sessionStorage.getItem("sah_user");


    if (localUser || sessionUser) {

        // No redirigimos automáticamente.
        // Esto permite que el usuario pueda volver
        // a iniciar sesión si lo necesita.

    }

}


checkExistingSession();