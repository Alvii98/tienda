<?php
require_once __DIR__ .'/../clases/consultas.php';

$json = new StdClass();
$json->error = '';
$json->resp = '';

$id = trim($_POST['id'] ?? '');
try {
    if (empty($id)) {
        $json->error = "ID del producto es requerido";
    } else {
        $json->resp = datos::productos($id);
    }
} catch (\Throwable $th) {
    $json->error = $th->getMessage();
}
print json_encode($json);exit;
?>