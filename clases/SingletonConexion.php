<?php
require_once __DIR__ . '/definiciones.php';
class SingletonConexion
{
    private static $instance = null;
    private $conn = null;

    public function __construct()
    {
        if(_HOST_ == 'estudio6.site' || _HOST_ == 'estudio6.com.ar'){
            $this->conn = mysqli_connect(_SERVER_, _DB_USER_, _DB_PASS_, _DB_NAME_);
        }else{
            $this->conn = mysqli_connect('localhost', 'root', '', 'tienda');
        }
    }

    public static function getInstance()
    {
        if (!self::$instance) {
            self::$instance = new SingletonConexion;
        }
        return self::$instance;
    }
    public function getConnection()
    {
        return $this->conn;
    }
}
?>