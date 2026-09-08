const viewFiles = {
    dashboard: "dashboard.html",
    usuarios: "usuarios.html",
    empresas: "empresas.html",
    courses_admin: "courses.html",
    evaluaciones: "evaluaciones.html",
    asignaciones: "asignaciones.html",
    resultados: "resultados.html",
    reportes: "reportes.html"
};

const viewScripts = {
    usuarios: "js/usuarios.js",
    courses_admin: "js/courses_admin.js",
    evaluaciones: "js/evaluaciones.js",
    empresas: "js/empresas.js"
};

const content = document.getElementById("admin-content");

async function loadScript(path) {
    return new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = `${path}?v=${Date.now()}`;
        script.onload = resolve;
        script.onerror = () => reject(new Error(`No se pudo cargar ${path}`));
        document.body.appendChild(script);
    });
}

async function loadView(viewName) {
    const file = viewFiles[viewName] || viewFiles.dashboard;
    const selectedView = viewFiles[viewName] ? viewName : "dashboard";

    try {
        const response = await fetch(file, { cache: "no-store" });

        if (!response.ok) {
            throw new Error(`La vista ${file} respondió ${response.status}`);
        }

        const html = await response.text();
        const documentFragment = document.createRange().createContextualFragment(html);
        const fragmentScripts = documentFragment.querySelectorAll("script");

        fragmentScripts.forEach(script => script.remove());
        content.replaceChildren(documentFragment);

        document.querySelectorAll(".nav-item").forEach(item => {
            item.classList.toggle("active", item.dataset.view === selectedView);
        });

        if (viewScripts[selectedView]) {
            await loadScript(viewScripts[selectedView]);
        }
    } catch (error) {
        console.error("Error al cargar la vista administrativa:", error);
        content.innerHTML = `
            <section class="admin-view">
                <h2>No se pudo cargar esta sección</h2>
                <p>${error.message}</p>
            </section>
        `;
    }
}

function getViewFromHash() {
    const viewName = window.location.hash.replace("#", "");
    return viewFiles[viewName] ? viewName : "dashboard";
}

document.addEventListener("click", event => {
    const navigationItem = event.target.closest("[data-view]");

    if (!navigationItem) {
        return;
    }

    event.preventDefault();
    const viewName = navigationItem.dataset.view;
    window.location.hash = viewName;
});

document.addEventListener("click", async event => {
    if (!event.target.closest("#logoutButton")) {
        return;
    }

    event.preventDefault();

    try {
        await fetch("../../backend/Api/logout.php", { method: "POST" });
    } catch (error) {
        console.error("Error al cerrar sesión en el servidor:", error);
    }

    localStorage.removeItem("sah_user");
    sessionStorage.removeItem("sah_user");
    window.location.href = "../authentication/login.html";
});

window.addEventListener("hashchange", () => loadView(getViewFromHash()));

loadView(getViewFromHash());