<?php
require_once __DIR__ .'/../clases/consultas.php';

$json = new StdClass();
$json->error = '';
$json->resp = '';

try {
    if (isset($_POST['cargarProductos']) || isset($_POST['editarProductos'])) {
        $nombre = trim($_POST['nombre'] ?? '');
        $descripcion = trim($_POST['descripcion'] ?? '');
        $categoria = trim($_POST['categoria'] ?? '');
        $tag = trim($_POST['tag'] ?? '');
        $precio = $_POST['precio'] ?? '';
        $imagenes = $_FILES['imagenes'] ?? null;
        if (empty($nombre) || empty($descripcion) || empty($categoria) || $precio === '') {
            $json->error = "Todos los campos son requeridos";
        } else {
            $archivos = [];
            if (isset($imagenes['tmp_name'])) {
                foreach ($imagenes['tmp_name'] as $indice => $temporal) {
                    if ($imagenes['error'][$indice] !== UPLOAD_ERR_OK) {
                        throw new RuntimeException('No se pudo subir una de las imágenes');
                    }
                    if (!in_array(mime_content_type($temporal), ['image/jpeg', 'image/png', 'image/webp'], true)) {
                        throw new RuntimeException('Las imágenes deben ser JPG, PNG o WEBP');
                    }
                    if ($imagenes['size'][$indice] > 5 * 1024 * 1024) {
                        throw new RuntimeException('Cada imagen no puede superar los 5 MB');
                    }
                    $archivos[] = ['tmp_name' => $temporal, 'extension' => strtolower(pathinfo($imagenes['name'][$indice], PATHINFO_EXTENSION))];
                }
            }
            if (isset($_POST['editarProductos'])) {
                $idProducto = (int) ($_POST['id'] ?? 0);
                if (!$idProducto) {
                    throw new RuntimeException('ID de producto inválido');
                }
                $actualizar = datos::actualizar_producto($idProducto, $nombre, $descripcion, $categoria, $tag, $precio);
                if (!$actualizar) {
                    throw new RuntimeException('Error al actualizar el producto');
                }
            } else {
                $idProducto = datos::cargar_producto($nombre, $descripcion, $categoria, $tag, $precio);
                if (!$idProducto) {
                    throw new RuntimeException('Error al cargar el producto');
                }
            }
            
            if (!$idProducto) {
                throw new RuntimeException('Error al cargar el producto');
            }
    
            $directorio = __DIR__ . '/../img/productos/' . $idProducto;
            if (!is_dir($directorio) && !mkdir($directorio, 0755, true)) {
                throw new RuntimeException('No se pudo crear la carpeta del producto');
            }
    
            foreach ($archivos as $archivo) {
                $idImagen = datos::cargar_imagen($idProducto);
                if (!$idImagen) throw new RuntimeException('No se pudo registrar una imagen '.$idProducto);
    
                $nombreArchivo = 'imagen_' . $idImagen . '.' . $archivo['extension'];
                $rutaFisica = $directorio . '/' . $nombreArchivo;
                if (!move_uploaded_file($archivo['tmp_name'], $rutaFisica) || !datos::actualizar_nombre_imagen($idImagen, $nombreArchivo)) {
                    throw new RuntimeException('No se pudo guardar una de las imágenes');
                }
            }
            if (empty($archivos)) {
                $json->resp = 'Producto cargado correctamente, sin imágenes';
            } else {
                $json->resp = 'Producto e imágenes cargados correctamente';
            }
        }
    }else if (isset($_POST['cargarCategoria'])) {
        $nombre = trim($_POST['nombre'] ?? '');
        $idCategoria = datos::cargar_categoria($nombre);
        if (!$idCategoria) {
            throw new RuntimeException('Error al cargar la categoría');
        }
        $json->resp = 'Categoría cargada correctamente';
    }else {
        $json->error = "Solicitud inválida";
    }
} catch (\Throwable $th) {
    $json->error = $th->getMessage();
}
print json_encode($json);exit;
?>