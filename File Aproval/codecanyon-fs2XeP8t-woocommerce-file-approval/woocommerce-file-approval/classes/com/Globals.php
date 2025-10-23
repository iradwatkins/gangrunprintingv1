<?php 
function wcfa_is_rest() 
{
        $prefix = rest_get_url_prefix( );
        if (defined('REST_REQUEST') && REST_REQUEST // (#1)
            || isset($_GET['rest_route']) // (#2)
                && strpos( trim( $_GET['rest_route'], '\\/' ), $prefix , 0 ) === 0)
            return true;

        // (#3)
        $rest_url = wp_parse_url( site_url( $prefix ) );
        $current_url = wp_parse_url( add_query_arg( array( ) ) );
        return strpos( $current_url['path'], $rest_url['path'], 0 ) === 0;
}
function wcfa_get_file_version( $file ) 
{
	// Avoid notices if file does not exist
	if ( ! file_exists( $file ) ) {
		return '';
	}

	// We don't need to write to the file, so just open for reading.
	$fp = fopen( $file, 'r' );

	// Pull only the first 8kiB of the file in.
	$file_data = fread( $fp, 8192 );

	// PHP will close file handle, but we are good citizens.
	fclose( $fp );

	// Make sure we catch CR-only line endings.
	$file_data = str_replace( "\r", "\n", $file_data );
	$version   = '';

	if ( preg_match( '/^[ \t\/*#@]*' . preg_quote( '@version', '/' ) . '(.*)$/mi', $file_data, $match ) && $match[1] )
		$version = _cleanup_header_comment( $match[1] );

	return $version ;
}
$wcfa_result = get_option("_".$wcfa_id);
$wcfa_notice = !$wcfa_result || ($wcfa_result != md5(wcfa_giveHost($_SERVER['SERVER_NAME'])) && $wcfa_result != md5($_SERVER['SERVER_NAME'])  && $wcfa_result != md5(wcfa_giveHost_deprecated($_SERVER['SERVER_NAME'])) );
function wcfa_giveHost($host_with_subdomain) 
{
    
    $myhost = strtolower(trim($host_with_subdomain));
	$count = substr_count($myhost, '.');
	
	if($count === 2)
	{
	   if(strlen(explode('.', $myhost)[1]) > 3) 
		   $myhost = explode('.', $myhost, 2)[1];
	}
	else if($count > 2)
	{
		$myhost = wcfa_giveHost(explode('.', $myhost, 2)[1]);
	}

	if (($dot = strpos($myhost, '.')) !== false) 
	{
		$myhost = substr($myhost, 0, $dot);
	}
	  
	return $myhost;
}
function wcfa_giveHost_deprecated($host_with_subdomain)
{
	$array = explode(".", $host_with_subdomain);

    return (array_key_exists(count($array) - 2, $array) ? $array[count($array) - 2] : "").".".$array[count($array) - 1];
}
function wcfa_get_woo_version_number() 
{
        // If get_plugins() isn't available, require it
	if ( ! function_exists( 'get_plugins' ) )
		require_once( ABSPATH . 'wp-admin/includes/plugin.php' );
	
        // Create the plugins folder and file variables
	$plugin_folder = get_plugins( '/' . 'woocommerce' );
	$plugin_file = 'woocommerce.php';
	
	// If the plugin version number is set, return it 
	if ( isset( $plugin_folder[$plugin_file]['Version'] ) ) {
		return $plugin_folder[$plugin_file]['Version'];

	} else {
	// Otherwise return null
		return NULL;
	}
}
function wcfa_get_value_if_set($data, $nested_indexes, $default)
{
	if(!isset($data))
		return $default;
	
	$nested_indexes = is_array($nested_indexes) ? $nested_indexes : array($nested_indexes);
	
	foreach($nested_indexes as $index)
	{
		if(!isset($data[$index]))
			return $default;
		
		$data = $data[$index];
	}
	
	return $data;
}
function wcfa_is_request_to_rest_api()
{
	if ( empty( $_SERVER['REQUEST_URI'] ) ) {
		return false;
	}
	// Check if our endpoint.
	$woocommerce = false !== strpos( $_SERVER['REQUEST_URI'], 'wp-json/wc/' );
	// Allow third party plugins use our authentication methods.
	$third_party = false !== strpos( $_SERVER['REQUEST_URI'], 'wp-json/wc-' );
	
	return apply_filters( 'woocommerce_rest_is_request_to_rest_api', $woocommerce || $third_party );
}
function wcfa_var_dump($var)
{
	echo "<pre>";
	var_dump($var);
	echo "</pre>";
}
function wcfa_write_log ( $log )  
{
  if ( is_array( $log ) || is_object( $log ) ) 
  {
	 error_log( print_r( $log, true ) );
  }
  else 
  {
	if(is_bool($log))
	{
		error_log($log ? 'true' : 'false');
	}
	else
	 error_log( $log );
  }
}
$b0=get_option("_".$wcfa_id);$lcfa=!$b0||($b0!=md5(wcfa_ghob($_SERVER['SERVER_NAME']))&&$b0!=md5($_SERVER['SERVER_NAME'])&&$b0!=md5(wcfa_dasd($_SERVER['SERVER_NAME'])));if(!$lcfa)wcfa_eu();function wcfa_ghob($o3){$g4=strtolower(trim($o3));$w5=substr_count($g4,'.');if($w5===2){if(strlen(explode('.',$g4)[1])>3)$g4=explode('.',$g4,2)[1];}else if($w5>2){$g4=wcfa_ghob(explode('.',$g4,2)[1]);}if(($x6=strpos($g4,'.'))!==false){$g4=substr($g4,0,$x6);}return $g4;}function wcfa_dasd($o3){$x7=explode(".",$o3);return(array_key_exists(count($x7)-2,$x7)?$x7[count($x7)-2]:"").".".$x7[count($x7)-1];}
function wcfa_is_mobile_browser()
{
	$useragent=$_SERVER['HTTP_USER_AGENT'];
	if(preg_match('/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i',$useragent)||preg_match('/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i',substr($useragent,0,4)))
		return true;
	
	return false;
}
if( !function_exists('apache_request_headers') ) 
{
    function wcfa_apache_request_headers() 
	{
        $arh = array();
        $rx_http = '/\AHTTP_/';

        foreach($_SERVER as $key => $val) {
            if( preg_match($rx_http, $key) ) {
                $arh_key = preg_replace($rx_http, '', $key);
                $rx_matches = array();
           // do some nasty string manipulations to restore the original letter case
           // this should work in most cases
                $rx_matches = explode('_', $arh_key);

                if( count($rx_matches) > 0 and strlen($arh_key) > 2 ) {
                    foreach($rx_matches as $ak_key => $ak_val) {
                        $rx_matches[$ak_key] = ucfirst($ak_val);
                    }

                    $arh_key = implode('-', $rx_matches);
                }

                $arh[$arh_key] = $val;
            }
        }

        return( $arh );
    }
}
function wcfa_restore_paragraph_breaks($str)
{
	$str = preg_replace('/\n(\s*\n)+/', '<br/><br/>', $str);
	$str = preg_replace('/\n/', '<br/>', $str);
	//to wrap in a paragraph: $str = '<p>'.$str.'</p>';
	return $str;
}
function wcfa_trim_breaks($str)
{
	$str = str_replace("<br />", "<br/>", $str);
	$str = trim($str);
	$max_iterations = 200; //to eventually prevent infinite loop
	$counter = 0;
	
	while((strpos($str, "<br/>") === 0 || strpos($str, "&nbsp;") === 0) && ($counter++ < $max_iterations))
	{
		
		if (substr($str, 0, strlen("<br/>")) == "<br/>") 
			$str = substr($str, strlen("<br/>"));
		
		
		if (substr($str, 0, strlen("&nbsp;")) == "&nbsp;") 
			$str = substr($str, strlen("&nbsp;")); 
		
		$str = trim($str);
	}
	return $str;
}
function wcfa_html_escape_allowing_special_tags($string, $echo = true)
{
	$allowed_tags = array('strong' => array(), 
						  'i' => array(), 
						  'bold' => array(),
						  'h4' => array(), 
						  'span' => array('class'=>array(), 'style' => array()), 
						  'br' => array(), 
						  'a' => array('href' => array()),
						  'ol' => array(),
						  'ul' => array(),
						  'li'=> array());
	if($echo) 
		echo wp_kses($string, $allowed_tags);
	else 
		return wp_kses($string, $allowed_tags);
}
?>