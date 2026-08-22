document.addEventListener("DOMContentLoaded", () => {

    const content = document.getElementById("admin-content");
    const navItems = document.querySelectorAll(".nav-item[data-view]");

    // =========================================
    // CARGAR UNA VISTA
    // =========================================

    async function loadView(view, activeItem = null) {

        if (!content || !view) {
            return;
        }

        try {

            const response = await fetch(`${view}.html`);

            if (!response.ok) {
                throw new Error(
                    `No se pudo cargar ${view}.html`
                );
            }

            const html = await response.text();

            // Insertar contenido
            content.innerHTML = html;

            // Quitar activo de todos
            navItems.forEach(nav => {
                nav.classList.remove("active");
            });

            // Activar el seleccionado
            if (activeItem) {
                activeItem.classList.add("active");
            }

        } catch (error) {

            console.error(error);

            content.innerHTML = `
                <div class="dashboard-heading">

                    <span class="section-label">
                        ERROR
                    </span>

                    <h2>
                        No se pudo cargar la sección
                    </h2>

                    <p>
                        No fue posible cargar ${view}.html.
                    </p>

                </div>
            `;
        }
    }


    // =========================================
    // NAVEGACIÓN
    // =========================================

    navItems.forEach(item => {

        item.addEventListener("click", async (event) => {

            event.preventDefault();

            const view = item.dataset.view;

            await loadView(view, item);

        });

    });


    // =========================================
    // VISTA INICIAL
    // =========================================

    const initialView = document.querySelector(
        '.nav-item[data-view="dashboard"]'
    );

    if (initialView) {

        loadView(
            "dashboard",
            initialView
        );

    }

});