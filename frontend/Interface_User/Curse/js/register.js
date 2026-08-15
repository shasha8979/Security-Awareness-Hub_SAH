/* =====================================================
   SECURITY AWARENESS
   REGISTRO DE USUARIO
===================================================== */

const registerForm = document.getElementById("registerForm");
const message = document.getElementById("message");


registerForm.addEventListener("submit", function (event) {

    event.preventDefault();


    // ================================================
    // OBTENER DATOS
    // ================================================

    const name =
        document.getElementById("name").value.trim();

    const email =
        document.getElementById("email").value.trim().toLowerCase();

    const password =
        document.getElementById("password").value;

    const confirmPassword =
        document.getElementById("confirmPassword").value;

    const role =
        document.getElementById("role").value;


    // ================================================
    // VALIDACIONES
    // ================================================

    if (!name || !email || !password || !confirmPassword || !role) {

        showMessage(
            "Completa todos los campos.",
            "error"
        );

        return;
    }


    if (password.length < 6) {

        showMessage(
            "La contraseña debe tener mínimo 6 caracteres.",
            "error"
        );

        return;
    }


    if (password !== confirmPassword) {

        showMessage(
            "Las contraseñas no coinciden.",
            "error"
        );

        return;
    }


    // ================================================
    // OBTENER USUARIOS EXISTENTES
    // ================================================

    const users =
        JSON.parse(
            localStorage.getItem("sah_users") || "[]"
        );


    // ================================================
    // COMPROBAR CORREO
    // ================================================

    const existingUser =
        users.find(user => user.email === email);


    if (existingUser) {

        showMessage(
            "Este correo ya está registrado.",
            "error"
        );

        return;
    }


    // ================================================
    // CREAR USUARIO
    // ================================================

    const newUser = {

        id: Date.now(),

        name: name,

        email: email,

        password: password,

        role: role,

        createdAt: new Date().toISOString()

    };


    // ================================================
    // GUARDAR
    // ================================================

    users.push(newUser);

    localStorage.setItem(
        "sah_users",
        JSON.stringify(users)
    );


    // ================================================
    // MENSAJE
    // ================================================

    showMessage(
        "Cuenta creada correctamente. Redirigiendo...",
        "success"
    );


    // ================================================
    // IR AL LOGIN
    // ================================================

    setTimeout(() => {

        window.location.href = "login.html";

    }, 1500);

});


/* =====================================================
   MENSAJE
===================================================== */

function showMessage(text, type) {

    message.textContent = text;

    if (type === "error") {

        message.style.color = "#ff6b6b";

    } else {

        message.style.color = "#43e27c";

    }
}