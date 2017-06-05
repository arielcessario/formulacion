<?php


ini_set('display_errors', '0');     # don't show any errors...
error_reporting(E_ALL | E_STRICT);  # ...but do log them

require "jwt_helper.php";

// JWT Secret Key
//$secret = base64_encode('');
$secret = '';
// JWT Secret Key Social
$secret_social = '';
// JWT AUD
$serverName = 'serverName';
// false local / true production
$jwt_enabled = true;
// Carpeta de imágenes
$image_path = "../../../images/";
// Nivel de compresión de las imágenes
$compression_level = 20;


require_once 'MysqliDb.php';

/* @name: checkSecurity
 * @param
 * @description: Verifica las credenciales enviadas. En caso de no ser correctas, retorna el error correspondiente.
 */
function checkSecurity()
{
    $requestHeaders = apache_request_headers();
    $authorizationHeader = isset($requestHeaders['Authorization']) ? $requestHeaders['Authorization'] : null;

//    echo print_r(apache_request_headers());


    if ($authorizationHeader == null) {
        header('HTTP/1.0 401 Unauthorized');
        echo "No authorization header sent";
        exit();
    }

    // // validate the token
    $pre_token = str_replace('Bearer ', '', $authorizationHeader);
    $token = str_replace('"', '', $pre_token);
    global $secret;
    global $decoded_token;
    try {
//        $decoded_token = JWT::decode($token, base64_decode(strtr($secret, '-_', '+/')), true);
        $decoded_token = JWT::decode($token, $secret, true);
    } catch (UnexpectedValueException $ex) {
        header('HTTP/1.0 401 Unauthorized');
        echo "Invalid token";
        exit();
    }


    global $serverName;

    // // validate that this token was made for us
    if ($decoded_token->aud != $serverName) {
        header('HTTP/1.0 401 Unauthorized');
        echo "Invalid token";
        exit();
    }

}

/**
 * @description Valida que el rol del usuario sea el correcto
 * @param $requerido
 */
function validateRol($requerido)
{

    global $jwt_enabled;
    if ($jwt_enabled == false) {
        return;
    }

    $requestHeaders = apache_request_headers();

    $authorizationHeader = isset($requestHeaders['Authorization']) ? $requestHeaders['Authorization'] : null;

//    echo print_r(apache_request_headers());


    if ($authorizationHeader == null) {
        header('HTTP/1.0 401 Unauthorized');
        echo "No authorization header sent";
        exit();
    }

    // // validate the token
    $pre_token = str_replace('Bearer ', '', $authorizationHeader);
    $token = str_replace('"', '', $pre_token);
    global $secret;
    global $decoded_token;
    $decoded_token = JWT::decode($token, $secret, true);

    $rol = $decoded_token->data->rol;
    if ($rol > $requerido) {
        header('HTTP/1.0 401 Unauthorized');
        echo "No authorization header sent";
        exit();
    }


}


class Main
{
    public static $db;
    private $permisssions = array(
        'Usuarios' => array('get' => 1,
            'login' => -1,
            'logout' => -1,
            'create' => 0,
            'update' => 0
        ),
        'Productos' => array('getProductos' => -1,
            'getCategorias' => -1,
            'createProducto' => 0,
            'updateProducto' => 0
        ),
        'Cajas' => array(
            'getTotalByCuenta' => 0,
            'getSaldoInicial' => 0,
            'getCajaDiaria' => 0,
            'checkEstado' => 0,
            'cerrarCaja' => 0,
            'abrirCaja' => 0,
            'getSaldoFinalAnterior' => 0,
            'getResultado' => 0,
            'createEncomienda' => 0,
            'updateEncomienda' => 0,
            'getEncomiendas' => 0
        ),
        'Stocks' => array(
            'getStocks' => 0,
            'updateStock' => 0,
            'getPedidos' => 0,
            'createStock' => 0,
            'trasladar' => 0
        ),
        'Reportes' => array(
            'cierreDeCaja' => 0, 'updateStock' => 0
        ),
        'Sucursales' => array(
            'get' => -1, 'updateStock' => 0
        ),
        'Movimientos' => array(
            'save' => 0, 'saveDetalle' => 0, 'deleteAsiento' => 0
        )
    );


    protected function __construct($class, $fnc)
    {
        try {

            if ($this->permisssions[$class][$fnc] > -1) {
                checkSecurity();
                validateRol($this->permisssions[$class][$fnc]);
            }
        } catch (Exception $e) {
            echo 'Caught exception: ', $e->getMessage(), "\n";
        }
        if (!isset($this->db)) {

            $this->db = new MysqliDb ('127.0.0.1', 'root', 'concentrador', 'arielces_bayres');
        }
    }
}
