<?php
require_once __DIR__ . '/SingletonConexion.php';
class datos{
    static public function productos($id_producto = null){
        try {
            $conn = SingletonConexion::getInstance()->getConnection();

            if (empty($id_producto)) {
                $query = "SELECT p.*, i.nombre AS imagen_nombre,c.nombre AS categoria_nombre,
                IF(i.nombre is not null, CONCAT('img/productos/', p.id, '/', i.nombre), 'img/sinimagen.png') AS imagen_ruta
                FROM productos p LEFT JOIN (SELECT id_producto, MIN(id) AS primera_imagen_id FROM imagenes
                GROUP BY id_producto) primera ON primera.id_producto = p.id
                LEFT JOIN imagenes i ON i.id = primera.primera_imagen_id 
                LEFT JOIN categoria c ON c.id = p.categoria
                ORDER BY p.id DESC";
                $result = mysqli_query($conn, $query);
            }else {
                $query = "SELECT p.*, i.nombre AS imagen_nombre,c.nombre AS categoria_nombre,
                IF(i.nombre is not null, CONCAT('img/productos/', p.id, '/', i.nombre), 'img/sinimagen.png') AS imagen_ruta
                FROM productos p LEFT JOIN (SELECT id_producto, MIN(id) AS primera_imagen_id FROM imagenes
                GROUP BY id_producto) primera ON primera.id_producto = p.id
                LEFT JOIN imagenes i ON i.id = primera.primera_imagen_id 
                LEFT JOIN categoria c ON c.id = p.categoria
                WHERE p.id = $id_producto ORDER BY p.id DESC";
                $result = mysqli_query($conn, $query);
            }
            
            if (!$result) return [];

            return $result->fetch_all(MYSQLI_ASSOC); 
        } catch (\Throwable $th) {
            return [];
        }
    }

    static public function buscar_productos($nombre, $categoria){
        try {
            $conn = SingletonConexion::getInstance()->getConnection();

            $query = "SELECT p.*, i.nombre AS imagen_nombre,c.nombre AS categoria_nombre,
            IF(i.nombre is not null, CONCAT('img/productos/', p.id, '/', i.nombre), 'img/sinimagen.png') AS imagen_ruta
            FROM productos p LEFT JOIN (SELECT id_producto, MIN(id) AS primera_imagen_id FROM imagenes
            GROUP BY id_producto) primera ON primera.id_producto = p.id
            LEFT JOIN imagenes i ON i.id = primera.primera_imagen_id
            LEFT JOIN categoria c ON c.id = p.categoria";

            $conditions = '';
            if (!empty($nombre)) $conditions = "p.nombre LIKE '%$nombre%'";
            if (!empty($categoria)) $conditions = $conditions ? "$conditions AND p.categoria = $categoria" : "p.categoria = $categoria";
            if (!empty($conditions)) $query .= " WHERE " . $conditions;
            
            $query .= " ORDER BY p.id DESC";

            $result = mysqli_query($conn, $query);
            
            if (!$result) return [];

            return $result->fetch_all(MYSQLI_ASSOC); 
        } catch (\Throwable $th) {
            return [];
        }
    }

    static public function imagenes_productos($id_producto){
        try {
            $conn = SingletonConexion::getInstance()->getConnection();
            
            $query = "SELECT id, nombre AS imagen_nombre, CONCAT('img/productos/', id_producto, '/', nombre) AS imagen_ruta FROM imagenes 
            WHERE id_producto = ? ORDER BY id ASC";
            
            $stmt = mysqli_prepare($conn, $query);
            if (!$stmt) return [];

            mysqli_stmt_bind_param($stmt, 'i', $id_producto);
            if (!mysqli_stmt_execute($stmt)) return [];
            
            $result = mysqli_stmt_get_result($stmt);
            return $result ? $result->fetch_all(MYSQLI_ASSOC) : [];
        } catch (\Throwable $th) {
            return [];
        }
    }

    static public function categorias(){
        try {
            $conn = SingletonConexion::getInstance()->getConnection();
            
            $query = "SELECT * FROM categoria ORDER BY nombre ASC";
            
            $result = mysqli_query($conn, $query);
            
            if (!$result) return [];
            
            return $result->fetch_all(MYSQLI_ASSOC); 
        } catch (\Throwable $th) {
            return [];
        }
    }

    static public function cargar_producto($nombre, $descripcion, $categoria, $tag, $precio){
        try {
            $conn = SingletonConexion::getInstance()->getConnection();

            $query = "INSERT INTO productos (nombre, descripcion, categoria, tag, valor, fecha_alta, ultima_mod)
            VALUES (?, ?, ?, ?, ?, NOW(), NOW())";
            $stmt = mysqli_prepare($conn, $query);

            if (!$stmt) return false;
            
            $precio = (float) $precio;
            mysqli_stmt_bind_param($stmt, 'ssssd', $nombre, $descripcion, $categoria, $tag, $precio);

            if (!mysqli_stmt_execute($stmt)) return false;

            return mysqli_insert_id($conn);
        } catch (\Throwable $th) {
            echo $th->getMessage();
            return false;
        }
    }

    static public function actualizar_producto($id_producto, $nombre, $descripcion, $categoria, $tag, $precio){
        try {
            $conn = SingletonConexion::getInstance()->getConnection();

            $query = "UPDATE productos SET nombre = ?, descripcion = ?, categoria = ?, tag = ?, valor = ?, ultima_mod = NOW() WHERE id = ?";
            $stmt = mysqli_prepare($conn, $query);

            if (!$stmt) return false;
            
            $precio = (float) $precio;
            mysqli_stmt_bind_param($stmt, 'ssssdi', $nombre, $descripcion, $categoria, $tag, $precio, $id_producto);

            if (!mysqli_stmt_execute($stmt)) return false;

            return mysqli_affected_rows($conn);
        } catch (\Throwable $th) {
            echo $th->getMessage();
            return false;
        }
    }

    static public function cargar_categoria($nombre){
        try {
            $conn = SingletonConexion::getInstance()->getConnection();

            $query = "INSERT INTO categoria (nombre) VALUES (?)";
            $stmt = mysqli_prepare($conn, $query);

            if (!$stmt) return false;
            
            mysqli_stmt_bind_param($stmt, 's', $nombre);

            if (!mysqli_stmt_execute($stmt)) return false;

            return mysqli_insert_id($conn);
        } catch (\Throwable $th) {
            echo $th->getMessage();
            return false;
        }
    }

    static public function cargar_imagen($id_producto){
        try {
            $conn = SingletonConexion::getInstance()->getConnection();

            $query = "INSERT INTO imagenes (id_producto, nombre) VALUES (?, '')";
            $stmt = mysqli_prepare($conn, $query);

            if (!$stmt) return false;
            
            mysqli_stmt_bind_param($stmt, 'i', $id_producto);

            if (!mysqli_stmt_execute($stmt)) return false;

            return mysqli_insert_id($conn);
        } catch (\Throwable $th) {
            echo $th->getMessage();
            return false;
        }
    }

    static public function actualizar_nombre_imagen($id_imagen, $nombre){
        $conn = SingletonConexion::getInstance()->getConnection();
        $stmt = mysqli_prepare($conn, "UPDATE imagenes SET nombre = ? WHERE id = ?");
        if (!$stmt) return false;

        mysqli_stmt_bind_param($stmt, 'si', $nombre, $id_imagen);
        return mysqli_stmt_execute($stmt);
    }

    static public function eliminar_producto($id_producto, $esCategoria = false, $esImagen = false){
        try {
            $conn = SingletonConexion::getInstance()->getConnection();

            $carpetaProductos = __DIR__ . '/../img/productos';
            $carpetaProducto = null;

            if ($esImagen) {
                $consultaImagen = mysqli_prepare($conn, "SELECT id_producto, nombre FROM imagenes WHERE id = ?");
                if (!$consultaImagen) return false;

                mysqli_stmt_bind_param($consultaImagen, 'i', $id_producto);
                if (!mysqli_stmt_execute($consultaImagen)) return false;

                $imagen = mysqli_stmt_get_result($consultaImagen)->fetch_assoc();
                if (!$imagen) return false;

                $carpetaProducto = $carpetaProductos . DIRECTORY_SEPARATOR . (int) $imagen['id_producto'];
                if (!empty($imagen['nombre'])) {
                    $rutaArchivo = $carpetaProducto . DIRECTORY_SEPARATOR . basename($imagen['nombre']);
                    if (is_file($rutaArchivo)) {
                        unlink($rutaArchivo);
                    }
                }
                $query = "DELETE FROM imagenes WHERE id = ?";
            } elseif ($esCategoria) {
                $query = "DELETE FROM categoria WHERE id = ?";
            } else {
                $carpetaProducto = $carpetaProductos . DIRECTORY_SEPARATOR . (int) $id_producto;
                if (is_dir($carpetaProducto)) {
                    $archivos = scandir($carpetaProducto);
                    if ($archivos !== false) {
                        foreach ($archivos as $archivo) {
                            if ($archivo === '.' || $archivo === '..') continue;
                            $rutaArchivo = $carpetaProducto . DIRECTORY_SEPARATOR . $archivo;
                            if (is_file($rutaArchivo)) unlink($rutaArchivo);
                        }
                        rmdir($carpetaProducto);
                    }
                }
                $stmt = mysqli_prepare($conn, "DELETE FROM imagenes WHERE id_producto = ?");
                if (!$stmt) return false;

                mysqli_stmt_bind_param($stmt, 'i', $id_producto);
                if (!mysqli_stmt_execute($stmt)) return false;
                $query = "DELETE FROM productos WHERE id = ?";
            }

            $stmt = mysqli_prepare($conn, $query);

            if (!$stmt) return false;
            
            mysqli_stmt_bind_param($stmt, 'i', $id_producto);

            if (!mysqli_stmt_execute($stmt)) return false;

            $filasAfectadas = mysqli_affected_rows($conn);

            return $filasAfectadas;
        } catch (\Throwable $th) {
            echo $th->getMessage();
            return false;
        }
    }    
}