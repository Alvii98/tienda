<?php
require_once __DIR__ .'/../clases/consultas.php';

$json = new StdClass();
$json->error = '';
$json->resp = '';

$id = trim($_POST['id'] ?? '');
try {
    if (isset($_POST['eliminarProducto'])) {
        if (empty($id)) {
            $json->error = "ID del producto es requerido";
        } else {
            if (datos::eliminar_producto($id)) {
                $json->resp = 'Producto eliminado correctamente';
            } else {    
                $json->error = 'Error al eliminar el producto';
            }
        }
    }elseif (isset($_POST['eliminarImagen'])) {
        if (empty($id)) {
            $json->error = "ID de la imagen es requerido";
        } else {
            if (datos::eliminar_producto($id, false, true)) {
                $json->resp = 'Imagen eliminada correctamente';
            } else {    
                $json->error = 'Error al eliminar la imagen';
            }
        }
    }elseif (isset($_POST['eliminarCategoria'])) {
        if (empty($id)) {
            $json->error = "ID de la categoría es requerido";
        } else {
            if (datos::eliminar_producto($id, true)) {
                $json->resp = 'Categoría eliminada correctamente';
            } else {
                $json->error = 'Error al eliminar la categoría';
            }
        }
    }else {
        $json->error = "Solicitud inválida";
    }

} catch (\Throwable $th) {
    $json->error = $th->getMessage();
}
print json_encode($json);exit;
?>