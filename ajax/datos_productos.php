<?php
require_once __DIR__ .'/../clases/consultas.php';

$json = new StdClass();
$json->error = '';
$json->resp = '';
$json->categorias = '';
try {
    if (isset($_POST['datosProductos'])) {
        $json->resp = datos::productos();
        $json->categorias = datos::categorias();
    }elseif (isset($_POST['imagenesProducto'])) {
        $idProducto = (int) ($_POST['id'] ?? 0);
        $json->resp = datos::imagenes_productos($idProducto);
    }elseif (isset($_POST['editarProducto'])) {
        $idProducto = (int) ($_POST['id'] ?? 0);
        $json->imagenes = datos::imagenes_productos($idProducto);
        $json->resp = datos::productos($idProducto);
    }elseif (isset($_POST['buscarProductos'])) {
        $nombre = empty($_POST['nombre']) ? '' : $_POST['nombre'];
        $categoria = empty($_POST['categoria']) ? '' : $_POST['categoria'];
        $json->resp = datos::buscar_productos($nombre, $categoria);
    }else {
        $json->error = "Solicitud inválida";
    }
} catch (\Throwable $th) {
    $json->error = $th->getMessage();
}
print json_encode($json);exit;
?>