<?php
require_once __DIR__.'/libs/smarty3.php';
require_once __DIR__.'/clases/consultas.php';

$page = trim($_GET['page'] ?? 'inicio', '/');
$smarty->assign('PAGE', $page);
$smarty->assign('HEADER', $smarty->fetch('partials/header.html'));
$smarty->assign('FOOTER', $smarty->fetch('partials/footer.html'));
switch($page){
    case 'inicio':
        $smarty->assign('CATEGORIAS', datos::categorias());
        $smarty->assign('PRODUCTOS', datos::productos());
        $smarty->display('index.html');
        break;
    case 'productos':
        $smarty->assign('PRODUCTOS', datos::productos());
        $smarty->assign('CATEGORIAS', datos::categorias());
        $smarty->assign('PRODUCTO_EDITAR', '');
        $smarty->assign('MENSAJE', $_GET['ok'] ?? '');
        $smarty->display('productos.html');
        break;
    case 'carrito':
        $smarty->display('index.html');
        break;
    case 'contacto':
        $smarty->display('index.html');
        break;
    default:
        header("HTTP/1.0 404 Not Found");
        echo "Página no encontrada";
}