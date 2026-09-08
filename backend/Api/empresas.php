<?php

/* ============================================================
   SECURITY AWARENESS HUB
   API DE EMPRESAS
   empresas.php
   ============================================================ */

session_start();

header("Content-Type: application/json; charset=UTF-8");


/* ============================================================
   RESPUESTA JSON
   ============================================================ */

function respuesta(
    bool $success,
    string $message = "",
    array $data = [],
    int $status = 200
): void {

    http_response_code($status);

    echo json_encode(
        array_merge(
            [
                "success" => $success,
                "message" => $message
            ],
            $data
        ),
        JSON_UNESCAPED_UNICODE
    );

    exit;
}


/* ============================================================
   VERIFICAR SESIÓN DE ADMINISTRADOR
   ============================================================ */

if (
    empty($_SESSION["authenticated"]) ||
    $_SESSION["authenticated"] !== true
) {

    respuesta(
        false,
        "No hay una sesión activa.",
        [],
        401
    );
}


if (
    !isset($_SESSION["rol"]) ||
    $_SESSION["rol"] !== "admin"
) {

    respuesta(
        false,
        "No tienes permisos para administrar empresas.",
        [],
        403
    );
}


/* ============================================================
   CONEXIÓN
   ============================================================ */

require_once __DIR__ . "/../Config/database.php";


try {

    $conn =
        Database::connect();
} catch (Throwable $e) {

    respuesta(
        false,
        "No fue posible conectar con la base de datos.",
        [],
        500
    );
}


/* ============================================================
   MÉTODO HTTP
   ============================================================ */

$method =
    $_SERVER["REQUEST_METHOD"];


/* ============================================================
   DATOS JSON
   ============================================================ */

$input = [];

$rawInput =
    file_get_contents("php://input");


if (
    $rawInput !== false &&
    trim($rawInput) !== ""
) {

    $decoded =
        json_decode(
            $rawInput,
            true
        );


    if (
        json_last_error() === JSON_ERROR_NONE &&
        is_array($decoded)
    ) {

        $input =
            $decoded;
    }
}


/* ============================================================
   GET
   LISTAR / BUSCAR / FILTRAR EMPRESAS
   ============================================================ */

if ($method === "GET") {

    try {

        $search =
            trim(
                $_GET["search"] ?? ""
            );


        $estado =
            trim(
                $_GET["estado"] ?? ""
            );


        $tipo =
            trim(
                $_GET["tipo"] ?? ""
            );


        $sql = "
            SELECT
                id,
                nombre,
                nit,
                correo,
                telefono,
                direccion,
                tipo,
                estado,
                fecha_registro
            FROM empresas
            WHERE 1 = 1
        ";


        $params = [];


        /* ----------------------------------------------------
           BUSCADOR
        ---------------------------------------------------- */

        if ($search !== "") {

            $sql .= "
                AND (
                    nombre LIKE ?
                    OR nit LIKE ?
                    OR correo LIKE ?
                    OR telefono LIKE ?
                )
            ";


            $searchLike =
                "%" . $search . "%";


            $params[] =
                $searchLike;

            $params[] =
                $searchLike;

            $params[] =
                $searchLike;

            $params[] =
                $searchLike;
        }


        /* ----------------------------------------------------
           FILTRO ESTADO
        ---------------------------------------------------- */

        if (
            $estado !== "" &&
            $estado !== "todos"
        ) {

            if (
                $estado !== "activo" &&
                $estado !== "inactivo"
            ) {

                respuesta(
                    false,
                    "Estado inválido.",
                    [],
                    400
                );
            }


            $sql .= "
                AND estado = ?
            ";


            $params[] =
                $estado;
        }


        /* ----------------------------------------------------
           FILTRO TIPO
        ---------------------------------------------------- */

        if (
            $tipo !== "" &&
            $tipo !== "todos"
        ) {

            if (
                $tipo !== "privada" &&
                $tipo !== "publica" &&
                $tipo !== "mixta"
            ) {

                respuesta(
                    false,
                    "Tipo de empresa inválido.",
                    [],
                    400
                );
            }


            $sql .= "
                AND tipo = ?
            ";


            $params[] =
                $tipo;
        }


        $sql .= "
            ORDER BY fecha_registro DESC, id DESC
        ";


        $stmt =
            $conn->prepare(
                $sql
            );


        $stmt->execute(
            $params
        );


        $empresas =
            $stmt->fetchAll();


        respuesta(
            true,
            "Empresas obtenidas correctamente.",
            [
                "empresas" =>
                $empresas
            ]
        );
    } catch (Throwable $e) {

        respuesta(
            false,
            "No fue posible obtener las empresas.",
            [],
            500
        );
    }
}


/* ============================================================
   POST
   CREAR EMPRESA
   ============================================================ */

if ($method === "POST") {

    $nombre =
        trim(
            $input["nombre"] ?? ""
        );


    $nit =
        trim(
            $input["nit"] ?? ""
        );


    $correo =
        strtolower(
            trim(
                $input["correo"] ?? ""
            )
        );


    $telefono =
        trim(
            $input["telefono"] ?? ""
        );


    $direccion =
        trim(
            $input["direccion"] ?? ""
        );


    $tipo =
        trim(
            $input["tipo"] ?? "privada"
        );


    $estado =
        trim(
            $input["estado"] ?? "activo"
        );


    /* --------------------------------------------------------
       VALIDACIONES
    -------------------------------------------------------- */

    if ($nombre === "") {

        respuesta(
            false,
            "El nombre de la empresa es obligatorio.",
            [],
            400
        );
    }


    if (
        mb_strlen($nombre) < 2 ||
        mb_strlen($nombre) > 150
    ) {

        respuesta(
            false,
            "El nombre de la empresa debe tener entre 2 y 150 caracteres.",
            [],
            400
        );
    }


    if ($nit === "") {

        respuesta(
            false,
            "El NIT es obligatorio.",
            [],
            400
        );
    }


    if (
        mb_strlen($nit) > 30
    ) {

        respuesta(
            false,
            "El NIT no puede superar los 30 caracteres.",
            [],
            400
        );
    }


    if ($correo === "") {

        respuesta(
            false,
            "El correo electrónico es obligatorio.",
            [],
            400
        );
    }


    if (
        !filter_var(
            $correo,
            FILTER_VALIDATE_EMAIL
        )
    ) {

        respuesta(
            false,
            "El correo electrónico no es válido.",
            [],
            400
        );
    }


    if (
        $tipo !== "privada" &&
        $tipo !== "publica" &&
        $tipo !== "mixta"
    ) {

        respuesta(
            false,
            "El tipo de empresa no es válido.",
            [],
            400
        );
    }


    if (
        $estado !== "activo" &&
        $estado !== "inactivo"
    ) {

        respuesta(
            false,
            "El estado de la empresa no es válido.",
            [],
            400
        );
    }


    try {

        /* ----------------------------------------------------
           COMPROBAR NIT DUPLICADO
        ---------------------------------------------------- */

        $checkNit =
            $conn->prepare(
                "
                SELECT id
                FROM empresas
                WHERE nit = ?
                LIMIT 1
                "
            );


        $checkNit->execute(
            [$nit]
        );


        if ($checkNit->fetch()) {

            respuesta(
                false,
                "Ya existe una empresa registrada con ese NIT.",
                [],
                409
            );
        }


        /* ----------------------------------------------------
           INSERTAR
        ---------------------------------------------------- */

        $sql = "
            INSERT INTO empresas (
                nombre,
                nit,
                correo,
                telefono,
                direccion,
                tipo,
                estado
            )
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ";


        $stmt =
            $conn->prepare(
                $sql
            );


        $stmt->execute(
            [
                $nombre,
                $nit,
                $correo,
                $telefono !== ""
                    ? $telefono
                    : null,
                $direccion !== ""
                    ? $direccion
                    : null,
                $tipo,
                $estado
            ]
        );


        $id =
            (int)$conn->lastInsertId();


        respuesta(
            true,
            "Empresa creada correctamente.",
            [
                "id" =>
                $id
            ],
            201
        );
    } catch (PDOException $e) {

        if (
            $e->getCode() === "23000"
        ) {

            respuesta(
                false,
                "Ya existe una empresa con ese NIT.",
                [],
                409
            );
        }


        respuesta(
            false,
            "No fue posible crear la empresa.",
            [],
            500
        );
    } catch (Throwable $e) {

        respuesta(
            false,
            "No fue posible crear la empresa.",
            [],
            500
        );
    }
}


/* ============================================================
   PUT
   EDITAR EMPRESA
   ============================================================ */

if ($method === "PUT") {

    $id =
        (int)(
            $input["id"] ?? 0
        );


    $nombre =
        trim(
            $input["nombre"] ?? ""
        );


    $nit =
        trim(
            $input["nit"] ?? ""
        );


    $correo =
        strtolower(
            trim(
                $input["correo"] ?? ""
            )
        );


    $telefono =
        trim(
            $input["telefono"] ?? ""
        );


    $direccion =
        trim(
            $input["direccion"] ?? ""
        );


    $tipo =
        trim(
            $input["tipo"] ?? "privada"
        );


    $estado =
        trim(
            $input["estado"] ?? "activo"
        );


    /* --------------------------------------------------------
       VALIDACIONES
    -------------------------------------------------------- */

    if ($id <= 0) {

        respuesta(
            false,
            "ID de empresa inválido.",
            [],
            400
        );
    }


    if ($nombre === "") {

        respuesta(
            false,
            "El nombre de la empresa es obligatorio.",
            [],
            400
        );
    }


    if ($nit === "") {

        respuesta(
            false,
            "El NIT es obligatorio.",
            [],
            400
        );
    }


    if (
        !filter_var(
            $correo,
            FILTER_VALIDATE_EMAIL
        )
    ) {

        respuesta(
            false,
            "El correo electrónico no es válido.",
            [],
            400
        );
    }


    if (
        $tipo !== "privada" &&
        $tipo !== "publica" &&
        $tipo !== "mixta"
    ) {

        respuesta(
            false,
            "El tipo de empresa no es válido.",
            [],
            400
        );
    }


    if (
        $estado !== "activo" &&
        $estado !== "inactivo"
    ) {

        respuesta(
            false,
            "El estado de la empresa no es válido.",
            [],
            400
        );
    }


    try {

        /* ----------------------------------------------------
           COMPROBAR EMPRESA
        ---------------------------------------------------- */

        $check =
            $conn->prepare(
                "
                SELECT id
                FROM empresas
                WHERE id = ?
                LIMIT 1
                "
            );


        $check->execute(
            [$id]
        );


        if (!$check->fetch()) {

            respuesta(
                false,
                "La empresa no existe.",
                [],
                404
            );
        }


        /* ----------------------------------------------------
           COMPROBAR NIT DUPLICADO
        ---------------------------------------------------- */

        $duplicate =
            $conn->prepare(
                "
                SELECT id
                FROM empresas
                WHERE nit = ?
                AND id <> ?
                LIMIT 1
                "
            );


        $duplicate->execute(
            [
                $nit,
                $id
            ]
        );


        if ($duplicate->fetch()) {

            respuesta(
                false,
                "Ya existe otra empresa registrada con ese NIT.",
                [],
                409
            );
        }


        /* ----------------------------------------------------
           ACTUALIZAR
        ---------------------------------------------------- */

        $sql = "
            UPDATE empresas
            SET
                nombre = ?,
                nit = ?,
                correo = ?,
                telefono = ?,
                direccion = ?,
                tipo = ?,
                estado = ?
            WHERE id = ?
        ";


        $stmt =
            $conn->prepare(
                $sql
            );


        $stmt->execute(
            [
                $nombre,
                $nit,
                $correo,
                $telefono !== ""
                    ? $telefono
                    : null,
                $direccion !== ""
                    ? $direccion
                    : null,
                $tipo,
                $estado,
                $id
            ]
        );


        respuesta(
            true,
            "Empresa actualizada correctamente."
        );
    } catch (Throwable $e) {

        respuesta(
            false,
            "No fue posible actualizar la empresa.",
            [],
            500
        );
    }
}


/* ============================================================
   PATCH
   ACTIVAR / DESACTIVAR
   ============================================================ */

if ($method === "PATCH") {

    $id =
        (int)(
            $input["id"] ?? 0
        );


    $estado =
        trim(
            $input["estado"] ?? ""
        );


    if ($id <= 0) {

        respuesta(
            false,
            "ID de empresa inválido.",
            [],
            400
        );
    }


    if (
        $estado !== "activo" &&
        $estado !== "inactivo"
    ) {

        respuesta(
            false,
            "Estado inválido.",
            [],
            400
        );
    }


    try {

        /* ----------------------------------------------------
           COMPROBAR EXISTENCIA
        ---------------------------------------------------- */

        $check =
            $conn->prepare(
                "
                SELECT id
                FROM empresas
                WHERE id = ?
                LIMIT 1
                "
            );


        $check->execute(
            [$id]
        );


        if (!$check->fetch()) {

            respuesta(
                false,
                "La empresa no existe.",
                [],
                404
            );
        }


        /* ----------------------------------------------------
           ACTUALIZAR ESTADO
        ---------------------------------------------------- */

        $stmt =
            $conn->prepare(
                "
                UPDATE empresas
                SET estado = ?
                WHERE id = ?
                "
            );


        $stmt->execute(
            [
                $estado,
                $id
            ]
        );


        respuesta(
            true,
            $estado === "activo"
                ? "Empresa activada correctamente."
                : "Empresa desactivada correctamente."
        );
    } catch (Throwable $e) {

        respuesta(
            false,
            "No fue posible cambiar el estado de la empresa.",
            [],
            500
        );
    }
}


/* ============================================================
   DELETE
   ELIMINAR EMPRESA
   ============================================================ */

if ($method === "DELETE") {

    $id =
        (int)(
            $input["id"] ?? 0
        );


    if ($id <= 0) {

        respuesta(
            false,
            "ID de empresa inválido.",
            [],
            400
        );
    }


    try {

        /* ----------------------------------------------------
           COMPROBAR EXISTENCIA
        ---------------------------------------------------- */

        $check =
            $conn->prepare(
                "
                SELECT id
                FROM empresas
                WHERE id = ?
                LIMIT 1
                "
            );


        $check->execute(
            [$id]
        );


        if (!$check->fetch()) {

            respuesta(
                false,
                "La empresa no existe.",
                [],
                404
            );
        }


        /* ----------------------------------------------------
           ELIMINAR
        ---------------------------------------------------- */

        $stmt =
            $conn->prepare(
                "
                DELETE FROM empresas
                WHERE id = ?
                "
            );


        $stmt->execute(
            [$id]
        );


        respuesta(
            true,
            "Empresa eliminada correctamente."
        );
    } catch (PDOException $e) {

        /* ----------------------------------------------------
           ERROR DE CLAVE FORÁNEA
        ---------------------------------------------------- */

        if (
            $e->getCode() === "23000"
        ) {

            respuesta(
                false,
                "No se puede eliminar la empresa porque tiene registros relacionados. Se recomienda desactivarla.",
                [],
                409
            );
        }


        respuesta(
            false,
            "No fue posible eliminar la empresa.",
            [],
            500
        );
    } catch (Throwable $e) {

        respuesta(
            false,
            "No fue posible eliminar la empresa.",
            [],
            500
        );
    }
}


/* ============================================================
   MÉTODO NO PERMITIDO
   ============================================================ */

respuesta(
    false,
    "Método HTTP no permitido.",
    [],
    405
);
