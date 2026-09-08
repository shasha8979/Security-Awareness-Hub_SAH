/* ============================================================
   SECURITY AWARENESS HUB
   GESTIÓN DE EMPRESAS
   empresas.js
   ============================================================ */

function inicializarEmpresas() {

    /* ========================================================
       CONFIGURACIÓN
    ======================================================== */

    /*
       Este endpoint será conectado cuando creemos
       empresas.php y la tabla empresas en MySQL.
    */

    const API_URL = "../../backend/Api/empresas.php";


    /* ========================================================
       ELEMENTOS DEL DOM
    ======================================================== */

    const tablaBody =
        document.getElementById("empresasTableBody");

    const totalEmpresas =
        document.getElementById("totalEmpresas");

    const empresasActivas =
        document.getElementById("empresasActivas");

    const empresasInactivas =
        document.getElementById("empresasInactivas");

    const contadorEmpresas =
        document.getElementById("contadorEmpresas");

    const empresasMostradas =
        document.getElementById("empresasMostradas");

    const buscarEmpresa =
        document.getElementById("buscarEmpresa");

    const filtroEstadoEmpresa =
        document.getElementById("filtroEstadoEmpresa");

    const filtroTipoEmpresa =
        document.getElementById("filtroTipoEmpresa");

    const btnNuevaEmpresa =
        document.getElementById("btnNuevaEmpresa");

    const empresaModal =
        document.getElementById("empresaModal");

    const cerrarEmpresaModal =
        document.getElementById("cerrarEmpresaModal");

    const cancelarEmpresa =
        document.getElementById("cancelarEmpresa");

    const formEmpresa =
        document.getElementById("formEmpresa");

    const empresaId =
        document.getElementById("empresaId");

    const empresaNombre =
        document.getElementById("empresaNombre");

    const empresaNit =
        document.getElementById("empresaNit");

    const empresaCorreo =
        document.getElementById("empresaCorreo");

    const empresaTelefono =
        document.getElementById("empresaTelefono");

    const empresaDireccion =
        document.getElementById("empresaDireccion");

    const empresaTipo =
        document.getElementById("empresaTipo");

    const empresaEstado =
        document.getElementById("empresaEstado");

    const empresaFormMessage =
        document.getElementById("empresaFormMessage");

    const modalEmpresaTitulo =
        document.getElementById("modalEmpresaTitulo");

    const guardarEmpresa =
        document.getElementById("guardarEmpresa");

    const paginaAnteriorEmpresa =
        document.getElementById("paginaAnteriorEmpresa");

    const paginaActualEmpresa =
        document.getElementById("paginaActualEmpresa");

    const paginaSiguienteEmpresa =
        document.getElementById("paginaSiguienteEmpresa");


    /* ========================================================
       VALIDAR ELEMENTOS
    ======================================================== */

    if (
        !tablaBody ||
        !totalEmpresas ||
        !empresasActivas ||
        !empresasInactivas ||
        !contadorEmpresas ||
        !empresasMostradas ||
        !buscarEmpresa ||
        !filtroEstadoEmpresa ||
        !filtroTipoEmpresa ||
        !btnNuevaEmpresa ||
        !empresaModal ||
        !cerrarEmpresaModal ||
        !cancelarEmpresa ||
        !formEmpresa ||
        !empresaId ||
        !empresaNombre ||
        !empresaNit ||
        !empresaCorreo ||
        !empresaTelefono ||
        !empresaDireccion ||
        !empresaTipo ||
        !empresaEstado ||
        !empresaFormMessage ||
        !modalEmpresaTitulo ||
        !guardarEmpresa ||
        !paginaAnteriorEmpresa ||
        !paginaActualEmpresa ||
        !paginaSiguienteEmpresa
    ) {

        console.error(
            "empresas.js: No se encontraron todos los elementos necesarios."
        );

        return;
    }


    /* ========================================================
       ESTADO
    ======================================================== */

    let empresas = [];

    let empresasFiltradas = [];

    let pagina = 1;

    const empresasPorPagina = 8;

    let temporizadorBusqueda = null;


    /* ========================================================
       OBTENER JSON
    ======================================================== */

    async function obtenerRespuestaJSON(response) {

        const texto = await response.text();

        try {

            return JSON.parse(texto);

        } catch (error) {

            console.error(
                "Respuesta del servidor:",
                texto
            );

            throw new Error(
                "El servidor no devolvió una respuesta JSON válida."
            );
        }
    }


    /* ========================================================
       ESCAPAR HTML
    ======================================================== */

    function escapeHTML(valor) {

        if (
            valor === null ||
            valor === undefined
        ) {

            return "";
        }

        return String(valor)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }


    /* ========================================================
       FORMATEAR TIPO
    ======================================================== */

    function formatearTipo(tipo) {

        const tipos = {

            privada: "Privada",

            publica: "Pública",

            mixta: "Mixta"
        };

        return tipos[tipo] ||
            tipo ||
            "Sin tipo";
    }


    /* ========================================================
       FORMATEAR ESTADO
    ======================================================== */

    function formatearEstado(estado) {

        return estado === "activo"
            ? "Activa"
            : "Inactiva";
    }


    /* ========================================================
       FORMATEAR FECHA
    ======================================================== */

    function formatearFecha(fecha) {

        if (!fecha) {

            return "Sin fecha";
        }

        const fechaObj =
            new Date(
                String(fecha)
                    .replace(" ", "T")
            );

        if (
            Number.isNaN(
                fechaObj.getTime()
            )
        ) {

            return String(fecha);
        }

        return fechaObj.toLocaleDateString(
            "es-CO",
            {
                day: "2-digit",
                month: "2-digit",
                year: "numeric"
            }
        );
    }


    /* ========================================================
       MOSTRAR CARGANDO
    ======================================================== */

    function mostrarCargando() {

        tablaBody.innerHTML = `
            <tr>
                <td
                    colspan="7"
                    class="loading-users">

                    Cargando empresas...

                </td>
            </tr>
        `;

        contadorEmpresas.textContent =
            "Cargando...";

        empresasMostradas.textContent =
            "Cargando empresas...";
    }


    /* ========================================================
       CARGAR EMPRESAS
    ======================================================== */

    async function cargarEmpresas() {

        mostrarCargando();

        try {

            const params =
                new URLSearchParams();

            const search =
                buscarEmpresa.value.trim();

            const estado =
                filtroEstadoEmpresa.value;

            const tipo =
                filtroTipoEmpresa.value;


            if (search !== "") {

                params.append(
                    "search",
                    search
                );
            }


            if (estado !== "todos") {

                params.append(
                    "estado",
                    estado
                );
            }


            if (tipo !== "todos") {

                params.append(
                    "tipo",
                    tipo
                );
            }


            const url =
                params.toString()
                    ? `${API_URL}?${params.toString()}`
                    : API_URL;


            const response =
                await fetch(
                    url,
                    {
                        method: "GET",

                        credentials:
                            "same-origin",

                        headers: {
                            "Accept":
                                "application/json"
                        }
                    }
                );


            const data =
                await obtenerRespuestaJSON(
                    response
                );


            if (
                !response.ok ||
                !data.success
            ) {

                throw new Error(
                    data.message ||
                    "No fue posible cargar las empresas."
                );
            }


            empresas =
                Array.isArray(data.empresas)
                    ? data.empresas
                    : [];


            pagina = 1;


            actualizarIndicadores();

            aplicarPaginacion();


        } catch (error) {

            console.error(
                "Error al cargar empresas:",
                error
            );


            tablaBody.innerHTML = `
                <tr>
                    <td
                        colspan="7"
                        class="users-error">

                        ${escapeHTML(
                            error.message
                        )}

                    </td>
                </tr>
            `;


            contadorEmpresas.textContent =
                "Error";


            empresasMostradas.textContent =
                "No se pudieron cargar las empresas.";
        }
    }


    /* ========================================================
       INDICADORES
    ======================================================== */

    function actualizarIndicadores() {

        const total =
            empresas.length;


        const activas =
            empresas.filter(
                empresa =>
                    empresa.estado === "activo"
            ).length;


        const inactivas =
            empresas.filter(
                empresa =>
                    empresa.estado === "inactivo"
            ).length;


        totalEmpresas.textContent =
            total;


        empresasActivas.textContent =
            activas;


        empresasInactivas.textContent =
            inactivas;


        contadorEmpresas.textContent =
            `${total} ${
                total === 1
                    ? "empresa"
                    : "empresas"
            }`;
    }


    /* ========================================================
       PAGINACIÓN
    ======================================================== */

    function aplicarPaginacion() {

        empresasFiltradas =
            [...empresas];


        const total =
            empresasFiltradas.length;


        const totalPaginas =
            Math.max(
                1,
                Math.ceil(
                    total /
                    empresasPorPagina
                )
            );


        if (
            pagina >
            totalPaginas
        ) {

            pagina =
                totalPaginas;
        }


        const inicio =
            (pagina - 1) *
            empresasPorPagina;


        const fin =
            inicio +
            empresasPorPagina;


        const empresasPagina =
            empresasFiltradas.slice(
                inicio,
                fin
            );


        renderizarEmpresas(
            empresasPagina
        );


        actualizarFooter(
            total,
            empresasPagina.length,
            inicio
        );


        actualizarBotonesPaginacion(
            totalPaginas
        );
    }


    /* ========================================================
       RENDERIZAR EMPRESAS
    ======================================================== */

    function renderizarEmpresas(lista) {

        if (!lista.length) {

            tablaBody.innerHTML = `
                <tr>
                    <td
                        colspan="7">

                        <div class="empty-state">

                            <div class="empty-icon">
                                ▣
                            </div>

                            <h3>
                                No hay empresas registradas
                            </h3>

                            <p>
                                No existen empresas que coincidan
                                con los filtros seleccionados.
                            </p>

                            <button
                                type="button"
                                class="admin-button"
                                id="btnNuevaEmpresaVacio">

                                + Nueva empresa

                            </button>

                        </div>

                    </td>
                </tr>
            `;

            const btnVacio =
                document.getElementById(
                    "btnNuevaEmpresaVacio"
                );

            if (btnVacio) {

                btnVacio.addEventListener(
                    "click",
                    abrirModalNuevaEmpresa
                );
            }

            return;
        }


        tablaBody.innerHTML =
            lista.map(empresa => {

                const estado =
                    empresa.estado ||
                    "activo";


                return `
                    <tr>

                        <!-- EMPRESA -->

                        <td>

                            <div class="user-cell">

                                <div class="user-avatar">
                                    ▣
                                </div>

                                <div class="user-info">

                                    <strong>
                                        ${escapeHTML(
                                            empresa.nombre
                                        )}
                                    </strong>

                                </div>

                            </div>

                        </td>


                        <!-- NIT -->

                        <td>
                            ${escapeHTML(
                                empresa.nit
                            )}
                        </td>


                        <!-- CORREO -->

                        <td>
                            ${escapeHTML(
                                empresa.correo
                            )}
                        </td>


                        <!-- TELÉFONO -->

                        <td>
                            ${escapeHTML(
                                empresa.telefono ||
                                "Sin teléfono"
                            )}
                        </td>


                        <!-- ESTADO -->

                        <td>

                            <span
                                class="status-badge ${
                                    estado === "activo"
                                        ? "status-active"
                                        : "status-inactive"
                                }">

                                ${escapeHTML(
                                    formatearEstado(
                                        estado
                                    )
                                )}

                            </span>

                        </td>


                        <!-- FECHA -->

                        <td>

                            ${escapeHTML(
                                formatearFecha(
                                    empresa.fecha_registro ||
                                    empresa.fecha_creacion
                                )
                            )}

                        </td>


                        <!-- ACCIONES -->

                        <td>

                            <div class="table-actions">

                                <button
                                    type="button"
                                    class="table-action edit"
                                    data-action="editar"
                                    data-id="${Number(
                                        empresa.id
                                    )}"
                                    title="Editar empresa"
                                    aria-label="Editar empresa">

                                    ✎

                                </button>


                                <button
                                    type="button"
                                    class="table-action toggle"
                                    data-action="estado"
                                    data-id="${Number(
                                        empresa.id
                                    )}"
                                    title="${
                                        estado === "activo"
                                            ? "Desactivar empresa"
                                            : "Activar empresa"
                                    }"
                                    aria-label="${
                                        estado === "activo"
                                            ? "Desactivar empresa"
                                            : "Activar empresa"
                                    }">

                                    ${
                                        estado === "activo"
                                            ? "◉"
                                            : "○"
                                    }

                                </button>


                                <button
                                    type="button"
                                    class="table-action delete"
                                    data-action="eliminar"
                                    data-id="${Number(
                                        empresa.id
                                    )}"
                                    title="Eliminar empresa"
                                    aria-label="Eliminar empresa">

                                    ×

                                </button>

                            </div>

                        </td>

                    </tr>
                `;

            }).join("");
    }


    /* ========================================================
       FOOTER
    ======================================================== */

    function actualizarFooter(
        total,
        cantidadPagina,
        inicio
    ) {

        if (total === 0) {

            empresasMostradas.textContent =
                "No hay empresas para mostrar.";

            return;
        }


        const desde =
            inicio + 1;


        const hasta =
            inicio +
            cantidadPagina;


        empresasMostradas.textContent =
            `Mostrando ${desde}-${hasta} de ${total} empresas`;
    }


    /* ========================================================
       BOTONES DE PAGINACIÓN
    ======================================================== */

    function actualizarBotonesPaginacion(
        totalPaginas
    ) {

        paginaActualEmpresa.textContent =
            pagina;


        paginaAnteriorEmpresa.disabled =
            pagina <= 1;


        paginaSiguienteEmpresa.disabled =
            pagina >= totalPaginas;
    }


    /* ========================================================
       ABRIR MODAL NUEVA EMPRESA
    ======================================================== */

    function abrirModalNuevaEmpresa() {

        formEmpresa.reset();


        empresaId.value =
            "";


        empresaTipo.value =
            "privada";


        empresaEstado.value =
            "activo";


        modalEmpresaTitulo.textContent =
            "Nueva empresa";


        guardarEmpresa.textContent =
            "Crear empresa";


        limpiarMensajeFormulario();


        empresaModal.hidden =
            false;


        document.body.classList.add(
            "modal-open"
        );


        setTimeout(() => {

            empresaNombre.focus();

        }, 100);
    }


    /* ========================================================
       ABRIR MODAL EDITAR
    ======================================================== */

    function abrirModalEditarEmpresa(
        empresa
    ) {

        empresaId.value =
            empresa.id;


        empresaNombre.value =
            empresa.nombre || "";


        empresaNit.value =
            empresa.nit || "";


        empresaCorreo.value =
            empresa.correo || "";


        empresaTelefono.value =
            empresa.telefono || "";


        empresaDireccion.value =
            empresa.direccion || "";


        empresaTipo.value =
            empresa.tipo || "privada";


        empresaEstado.value =
            empresa.estado || "activo";


        modalEmpresaTitulo.textContent =
            "Editar empresa";


        guardarEmpresa.textContent =
            "Guardar cambios";


        limpiarMensajeFormulario();


        empresaModal.hidden =
            false;


        document.body.classList.add(
            "modal-open"
        );


        setTimeout(() => {

            empresaNombre.focus();

        }, 100);
    }


    /* ========================================================
       CERRAR MODAL
    ======================================================== */

    function cerrarModalEmpresa() {

        empresaModal.hidden =
            true;


        document.body.classList.remove(
            "modal-open"
        );


        limpiarMensajeFormulario();
    }


    /* ========================================================
       MENSAJES
    ======================================================== */

    function mostrarMensajeFormulario(
        mensaje,
        tipo
    ) {

        empresaFormMessage.textContent =
            mensaje;


        empresaFormMessage.className =
            `user-form-message ${tipo}`;
    }


    function limpiarMensajeFormulario() {

        empresaFormMessage.textContent =
            "";


        empresaFormMessage.className =
            "user-form-message";
    }


    /* ========================================================
       BLOQUEAR FORMULARIO
    ======================================================== */

    function bloquearFormulario(
        bloquear
    ) {

        const controles =
            formEmpresa.querySelectorAll(
                "input, textarea, select, button"
            );


        controles.forEach(control => {

            control.disabled =
                bloquear;

        });


        if (!bloquear) {

            guardarEmpresa.disabled =
                false;
        }
    }


    /* ========================================================
       CREAR EMPRESA
    ======================================================== */

    async function crearEmpresa(
        datos
    ) {

        bloquearFormulario(true);


        try {

            const response =
                await fetch(
                    API_URL,
                    {
                        method: "POST",

                        credentials:
                            "same-origin",

                        headers: {
                            "Content-Type":
                                "application/json",

                            "Accept":
                                "application/json"
                        },

                        body:
                            JSON.stringify(
                                datos
                            )
                    }
                );


            const data =
                await obtenerRespuestaJSON(
                    response
                );


            if (
                !response.ok ||
                !data.success
            ) {

                throw new Error(
                    data.message ||
                    "No fue posible crear la empresa."
                );
            }


            mostrarMensajeFormulario(
                data.message ||
                "Empresa creada correctamente.",
                "success"
            );


            await cargarEmpresas();


            setTimeout(() => {

                cerrarModalEmpresa();

            }, 700);


        } catch (error) {

            console.error(
                "Error al crear empresa:",
                error
            );


            mostrarMensajeFormulario(
                error.message,
                "error"
            );


        } finally {

            bloquearFormulario(false);
        }
    }


    /* ========================================================
       EDITAR EMPRESA
    ======================================================== */

    async function editarEmpresa(
        id,
        datos
    ) {

        bloquearFormulario(true);


        try {

            const response =
                await fetch(
                    API_URL,
                    {
                        method: "PUT",

                        credentials:
                            "same-origin",

                        headers: {
                            "Content-Type":
                                "application/json",

                            "Accept":
                                "application/json"
                        },

                        body:
                            JSON.stringify({
                                id,
                                ...datos
                            })
                    }
                );


            const data =
                await obtenerRespuestaJSON(
                    response
                );


            if (
                !response.ok ||
                !data.success
            ) {

                throw new Error(
                    data.message ||
                    "No fue posible actualizar la empresa."
                );
            }


            mostrarMensajeFormulario(
                data.message ||
                "Empresa actualizada correctamente.",
                "success"
            );


            await cargarEmpresas();


            setTimeout(() => {

                cerrarModalEmpresa();

            }, 700);


        } catch (error) {

            console.error(
                "Error al actualizar empresa:",
                error
            );


            mostrarMensajeFormulario(
                error.message,
                "error"
            );


        } finally {

            bloquearFormulario(false);
        }
    }


    /* ========================================================
       CAMBIAR ESTADO
    ======================================================== */

    async function cambiarEstado(
        empresa
    ) {

        const nuevoEstado =
            empresa.estado === "activo"
                ? "inactivo"
                : "activo";


        const accion =
            nuevoEstado === "activo"
                ? "activar"
                : "desactivar";


        const confirmado =
            confirm(
                `¿Deseas ${accion} la empresa "${empresa.nombre}"?`
            );


        if (!confirmado) {

            return;
        }


        try {

            const response =
                await fetch(
                    API_URL,
                    {
                        method: "PATCH",

                        credentials:
                            "same-origin",

                        headers: {
                            "Content-Type":
                                "application/json",

                            "Accept":
                                "application/json"
                        },

                        body:
                            JSON.stringify({
                                id:
                                    Number(
                                        empresa.id
                                    ),

                                estado:
                                    nuevoEstado
                            })
                    }
                );


            const data =
                await obtenerRespuestaJSON(
                    response
                );


            if (
                !response.ok ||
                !data.success
            ) {

                throw new Error(
                    data.message ||
                    "No fue posible cambiar el estado."
                );
            }


            await cargarEmpresas();


        } catch (error) {

            console.error(
                "Error al cambiar estado:",
                error
            );


            alert(
                error.message
            );
        }
    }


    /* ========================================================
       ELIMINAR EMPRESA
    ======================================================== */

    async function eliminarEmpresa(
        empresa
    ) {

        const confirmado =
            confirm(
                `¿Estás seguro de eliminar la empresa "${empresa.nombre}"?\n\nEsta acción no se puede deshacer.`
            );


        if (!confirmado) {

            return;
        }


        try {

            const response =
                await fetch(
                    API_URL,
                    {
                        method: "DELETE",

                        credentials:
                            "same-origin",

                        headers: {
                            "Content-Type":
                                "application/json",

                            "Accept":
                                "application/json"
                        },

                        body:
                            JSON.stringify({
                                id:
                                    Number(
                                        empresa.id
                                    )
                            })
                    }
                );


            const data =
                await obtenerRespuestaJSON(
                    response
                );


            if (
                !response.ok ||
                !data.success
            ) {

                throw new Error(
                    data.message ||
                    "No fue posible eliminar la empresa."
                );
            }


            await cargarEmpresas();


        } catch (error) {

            console.error(
                "Error al eliminar empresa:",
                error
            );


            alert(
                error.message
            );
        }
    }


    /* ========================================================
       EVENTOS DE TABLA
    ======================================================== */

    tablaBody.addEventListener(
        "click",
        event => {

            const button =
                event.target.closest(
                    "button[data-action]"
                );


            if (!button) {

                return;
            }


            const id =
                Number(
                    button.dataset.id
                );


            const empresa =
                empresas.find(
                    item =>
                        Number(item.id) === id
                );


            if (!empresa) {

                return;
            }


            const action =
                button.dataset.action;


            if (
                action === "editar"
            ) {

                abrirModalEditarEmpresa(
                    empresa
                );
            }


            if (
                action === "estado"
            ) {

                cambiarEstado(
                    empresa
                );
            }


            if (
                action === "eliminar"
            ) {

                eliminarEmpresa(
                    empresa
                );
            }
        }
    );


    /* ========================================================
       NUEVA EMPRESA
    ======================================================== */

    btnNuevaEmpresa.addEventListener(
        "click",
        abrirModalNuevaEmpresa
    );


    /* ========================================================
       CERRAR MODAL
    ======================================================== */

    cerrarEmpresaModal.addEventListener(
        "click",
        cerrarModalEmpresa
    );


    cancelarEmpresa.addEventListener(
        "click",
        cerrarModalEmpresa
    );


    const modalOverlay =
        empresaModal.querySelector(
            ".user-modal-overlay"
        );


    if (modalOverlay) {

        modalOverlay.addEventListener(
            "click",
            cerrarModalEmpresa
        );
    }


    /* ========================================================
       FORMULARIO
    ======================================================== */

    formEmpresa.addEventListener(
        "submit",
        async event => {

            event.preventDefault();


            limpiarMensajeFormulario();


            const id =
                empresaId.value.trim();


            const datos = {

                nombre:
                    empresaNombre.value.trim(),

                nit:
                    empresaNit.value.trim(),

                correo:
                    empresaCorreo.value.trim(),

                telefono:
                    empresaTelefono.value.trim(),

                direccion:
                    empresaDireccion.value.trim(),

                tipo:
                    empresaTipo.value,

                estado:
                    empresaEstado.value
            };


            /* ================================================
               VALIDACIONES
            ================================================= */

            if (
                !datos.nombre
            ) {

                mostrarMensajeFormulario(
                    "El nombre de la empresa es obligatorio.",
                    "error"
                );

                empresaNombre.focus();

                return;
            }


            if (
                datos.nombre.length < 2
            ) {

                mostrarMensajeFormulario(
                    "El nombre de la empresa debe tener al menos 2 caracteres.",
                    "error"
                );

                empresaNombre.focus();

                return;
            }


            if (
                !datos.nit
            ) {

                mostrarMensajeFormulario(
                    "El NIT de la empresa es obligatorio.",
                    "error"
                );

                empresaNit.focus();

                return;
            }


            if (
                !datos.correo
            ) {

                mostrarMensajeFormulario(
                    "El correo electrónico es obligatorio.",
                    "error"
                );

                empresaCorreo.focus();

                return;
            }


            const correoValido =
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


            if (
                !correoValido.test(
                    datos.correo
                )
            ) {

                mostrarMensajeFormulario(
                    "Ingresa un correo electrónico válido.",
                    "error"
                );

                empresaCorreo.focus();

                return;
            }


            if (
                !datos.tipo
            ) {

                mostrarMensajeFormulario(
                    "Selecciona el tipo de empresa.",
                    "error"
                );

                empresaTipo.focus();

                return;
            }


            if (
                !datos.estado
            ) {

                mostrarMensajeFormulario(
                    "Selecciona el estado de la empresa.",
                    "error"
                );

                empresaEstado.focus();

                return;
            }


            /* ================================================
               GUARDAR
            ================================================= */

            if (id) {

                await editarEmpresa(
                    Number(id),
                    datos
                );

            } else {

                await crearEmpresa(
                    datos
                );
            }

        }
    );


    /* ========================================================
       BUSCADOR
    ======================================================== */

    buscarEmpresa.addEventListener(
        "input",
        () => {

            clearTimeout(
                temporizadorBusqueda
            );


            temporizadorBusqueda =
                setTimeout(
                    () => {

                        cargarEmpresas();

                    },
                    350
                );
        }
    );


    /* ========================================================
       FILTRO ESTADO
    ======================================================== */

    filtroEstadoEmpresa.addEventListener(
        "change",
        cargarEmpresas
    );


    /* ========================================================
       FILTRO TIPO
    ======================================================== */

    filtroTipoEmpresa.addEventListener(
        "change",
        cargarEmpresas
    );


    /* ========================================================
       PÁGINA ANTERIOR
    ======================================================== */

    paginaAnteriorEmpresa.addEventListener(
        "click",
        () => {

            if (pagina > 1) {

                pagina--;

                aplicarPaginacion();
            }
        }
    );


    /* ========================================================
       PÁGINA SIGUIENTE
    ======================================================== */

    paginaSiguienteEmpresa.addEventListener(
        "click",
        () => {

            const totalPaginas =
                Math.max(
                    1,
                    Math.ceil(
                        empresasFiltradas.length /
                        empresasPorPagina
                    )
                );


            if (
                pagina <
                totalPaginas
            ) {

                pagina++;

                aplicarPaginacion();
            }
        }
    );


    /* ========================================================
       ESCAPE
    ======================================================== */

    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Escape" &&
                !empresaModal.hidden
            ) {

                cerrarModalEmpresa();
            }
        }
    );


    /* ========================================================
       INICIO
    ======================================================== */

    cargarEmpresas();

}


/* ============================================================
   INICIALIZACIÓN
   COMPATIBLE CON CARGA DINÁMICA DEL PANEL
============================================================ */

if (document.readyState === "loading") {

    document.addEventListener(
        "DOMContentLoaded",
        inicializarEmpresas
    );

} else {

    inicializarEmpresas();

}