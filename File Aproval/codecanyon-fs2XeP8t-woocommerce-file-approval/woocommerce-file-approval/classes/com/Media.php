<?php 
namespace WCFA\classes\com;

class Media
{
	public function __construct()
	{
		add_action( 'wp_ajax_wcfa_get_image', array(&$this, 'get_image'));
		add_filter('upload_mimes',  array(&$this, 'upload_mime_types'));
		
		//upload managment
		add_filter( 'plupload_init', array( $this, 'filter_plupload_settings' ) );
		add_filter( 'upload_post_params', array( $this, 'filter_plupload_params' ) );
		add_filter( 'plupload_default_settings', array( $this, 'filter_plupload_settings' ) );
		add_filter( 'plupload_default_params', array( $this, 'filter_plupload_params' ) );
		add_filter( 'upload_size_limit', array( $this, 'filter_upload_size_limit' ));  //used by the upload_size_limit() to determine teh "maximum upload file size" displayed in media ( https://developer.wordpress.org/reference/functions/wp_max_upload_size/ )
		add_action( 'wp_ajax_wcfa_big_file_uploads', array( $this, 'ajax_chunk_receiver' ) ); 
		add_action('init', array( &$this, 'process_secure_download_request' ));
	}
	
	public function process_secure_download_request()
	{
		$special_access = false;
		if(!isset($_GET['wcfa_attachment_id']) && !isset($_GET['wcam_login']))
			return;
		
		if(isset($_GET['wcfa_login']))
		{
			wc_add_notice( esc_html__( 'You have to be logged for that kind of request.', 'woocommerce-file-approval' ), 'notice' );
			return;
		}
		
		$preview = wcfa_get_value_if_set($_GET, 'wcfa_preview', 'true');
		$found = false;
		
		list($file_id, $order_id) =  explode("-", $_GET['wcfa_attachment_id']);
		if(!isset($order_id) || !isset($file_id))
			return;
		
		$wc_order = wc_get_order($order_id);
		if(!$wc_order || ( $wc_order->get_customer_id() && !is_user_logged_in()))
		{
			$can_redirect = apply_filters('wcfa_redirect_unauthorized_media_access', true);
			$special_access = !$can_redirect;
			if($can_redirect)
			{
				wp_redirect(add_query_arg('wcfa_login', 'yes', get_permalink( get_option('woocommerce_myaccount_page_id') )  )); 
				exit; 
			}
		}
		
		//Preview display / File Download
		global $wcfa_attachment_model;
		$attachments = $wcfa_attachment_model->get_attachments($order_id);
		if($special_access || $wc_order->get_customer_id() < 1 || $wc_order->get_customer_id() == get_current_user_id())
			foreach($attachments as $data)
				if($data["attachment"]->ID == $file_id)
				{
					$found = true;
					$file_path = get_attached_file( $data["media"] );
					//Images or PDF
					if(wp_attachment_is_image($data["media"]) || $this->is_pdf($file_path))
					{ 
						list($preview_url, $widht, $height, $was_resized) = wp_get_attachment_image_src($data["media"], 'full', true);
						$parsed_url = parse_url( $preview_url );
						
						
						
						if(empty($parsed_url['path'])) return false;
							$preview_path = get_attached_file( $data["media"]);  //old method: $_SERVER['DOCUMENT_ROOT'].$parsed_url['path'];
						if (!file_exists( $preview_path)) return false;
						
						$this->output_file($this->is_pdf($file_path) ? $file_path : $preview_path);
						
					}
					//Anything else
					else 
					{
						$this->output_file($preview == 'true' ? WCFA_PLUGIN_ABS_PATH.'/img/document.png' : get_attached_file( $data["media"] ));
					}
				}
		
		if(!$found)
			wc_add_notice(esc_html__( 'You are not authorized to view this file.', 'woocommerce-file-approval' ), 'error');
	}
	private function output_file($path)
	{
		$preview_method = 'standard_method'; //ToDo: option to switch preview method;
		
		$size = filesize($path); 
		$fileName = basename($path);
		
		header("Content-length: ".$size);
		header("Content-type: application/octet-stream");
		header("Content-disposition: attachment; filename=".$fileName.";" );
		
		header('Content-Transfer-Encoding: chunked');
		header('Expires: 0');
		header('Cache-Control: must-revalidate, post-check=0, pre-check=0');
		header('Pragma: public');
		header("Content-Type: application/download");
		header('Content-Description: File Transfer');
		header('Content-Type: application/force-download');
		
		if($preview_method == 'standard_method')
			readfile($path);
		
		else
		{
			if ($fd = fopen ($path, "r")) 
			{

				set_time_limit(0);
				ini_set('memory_limit', '1024M');
				ob_clean();
				flush();
				
				while(!feof($fd)) 
				{
					echo fread($fd, 1024);
					flush();
				}   
				ob_end_flush();
			 fclose($fd);
			} 
		}
		exit(); 
	}
	public function get_image() 
	{
		if(isset($_GET['id']) )
		{
			$image = wp_get_attachment_image( filter_input( INPUT_GET, 'id', FILTER_VALIDATE_INT ), 'medium', false, array( 'id' => 'wcfa-preview-image' ) );
			$data = array(
				'image'    => $image,
			);
			wp_send_json_success( $data );
		} 
		else 
		{
			wp_send_json_error();
		}
		wp_die();
	}
	
	public function upload_mime_types($mime_types)
	{
		/* Uncomment to remove JS and CSS upload restriction to Media library 
			Text: $mime_types['js'] = 'text/plain';
			CSS: $mime_types['css'] = 'application/octet-stream';
		*/
		return $mime_types;
	}	
	

	public function filter_plupload_settings( $plupload_settings ) {

		$wcfa_chunk_size = intval( get_option( 'wcfa_chunk_size', 512 ) ); //ToDo: can be set as parameter
		if ( $wcfa_chunk_size < 1 ) {
			$wcfa_chunk_size = 512;
		}
		$wcfa_max_retries = intval( get_option( 'wcfa_max_retries', 5 ) ); //ToDo: can be set as parameter
		if ( $wcfa_max_retries < 1 ) {
			$wcfa_max_retries = 5;
		}
		$plupload_settings['url'] = admin_url( 'admin-ajax.php' );
		$plupload_settings['filters']['max_file_size'] = $this->filter_upload_size_limit('') . 'b';
		$plupload_settings['chunk_size'] = $wcfa_chunk_size . 'kb';
		$plupload_settings['max_retries'] = $wcfa_max_retries;
		return $plupload_settings;

	}

	public function filter_plupload_params( $plupload_params ) {

		$plupload_params['action'] = 'wcfa_big_file_uploads';
		return $plupload_params;

	}

	/**
	 * Return max upload size.
	 * 
	 * Free space of temp directory.
	 * 
	 * @since 1.0.0
	 * 
	 * @return float $bytes Free disk space in bytes.
	 */
	public function filter_upload_size_limit( $unused ) 
	{

		$wcfa_max_upload_size = intval( get_option( 'wcfa_max_upload_size', 0 ) ) * 1048576; //ToDo: can be set as parameter
		if ( $wcfa_max_upload_size < 0 ) {
			$wcfa_max_upload_size = 0;
		}

		if ( $wcfa_max_upload_size > 0 ) {
			return $wcfa_max_upload_size;
		} 

		//not used
		/*
		$bytes = disk_free_space( sys_get_temp_dir() );
		if ( $bytes === false ) 
		{
			// Original from wp_max_upload_size() function
			//$u_bytes = wp_convert_hr_to_bytes( ini_get( 'upload_max_filesize' ) );
			//$p_bytes = wp_convert_hr_to_bytes( ini_get( 'post_max_size' ) );
			//$bytes = min( $u_bytes, $p_bytes ); 
			
			
			
			//$bytes = 0;
			$bytes = 1073741824; //Forced to 1GB
		}*/
		return 1073741824; //Forced to 1GB

	}

	public function get_mime_content_type( $filename ) {

		if ( function_exists( 'mime_content_type' ) ) {
			return mime_content_type( $filename );
		}

		if ( function_exists( 'finfo_open' ) ) {
			$finfo = finfo_open( FILEINFO_MIME );
			$mimetype = finfo_file( $finfo, $filename );
			finfo_close( $finfo );
			return $mimetype;
		} else {
			ob_start();
			system( 'file -i -b ' . $filename );
			$output = ob_get_clean();
			$output = explode( '; ', $output );
			if ( is_array( $output ) ) {
				$output = $output[0];
			}
			return $output;
		}

	}


	public function ajax_chunk_receiver() 
	{
		//refers to: https://developer.wordpress.org/reference/functions/wp_plupload_default_settings/
		if ( empty( $_FILES ) || $_FILES['async-upload']['error'] || !wp_verify_nonce( wcfa_get_value_if_set($_POST, '_wpnonce', ""), 'media-form') ) 
		{
			die();
		}

		if ( ! is_user_logged_in() || ! current_user_can( 'upload_files' ) ) {
			die();
		}
		check_admin_referer( 'media-form' );

		/** Check and get file chunks. */
		$chunk = isset( $_REQUEST['chunk']) ? intval( $_REQUEST['chunk'] ) : 0;
		$chunks = isset( $_REQUEST['chunks']) ? intval( $_REQUEST['chunks'] ) : 0;

		/** Get file name and path + name. */
		$fileName = isset( $_REQUEST['name'] ) ? $_REQUEST['name'] : $_FILES['async-upload']['name'];
		$filePath = dirname( $_FILES['async-upload']['tmp_name'] ) . '/' . md5( $fileName );

		$wcfa_max_upload_size = intval( get_option( 'wcfa_max_upload_size', 0 ) * 1048576 );
		if ( $wcfa_max_upload_size < 0 ) {
			$wcfa_max_upload_size = 0;
		}

		if ( $wcfa_max_upload_size > 0 && file_exists( "{$filePath}.part" ) && filesize( "{$filePath}.part" ) + filesize( $_FILES['async-upload']['tmp_name'] ) > $wcfa_max_upload_size ) {

			if ( ! $chunks || $chunk == $chunks - 1 ) {
				@unlink( "{$filePath}.part" );

				if ( ! isset( $_REQUEST['short'] ) || ! isset( $_REQUEST['type'] ) ) {

					echo wp_json_encode( array(
						'success' => false,
						'data'    => array(
							'message'  =>esc_html__( 'The file size has exceeded the maximum file size setting.', 'woocommerce-file-approval' ),
							'filename' => $_FILES['async-upload']['name'],
						)
					) );
					wp_die();

				} else {

					echo '<div class="error-div error">
					<a class="dismiss" href="#" onclick="jQuery(this).parents(\'div.media-item\').slideUp(200, function(){jQuery(this).remove();});">' .esc_html__( 'Dismiss' ) . '</a>
					<strong>' . sprintf(esc_html__( '&#8220;%s&#8221; has failed to upload.' ), esc_html( $_FILES['async-upload']['name'] ) ) . '<br />' .esc_html__( 'The file size has exceeded the maximum file size setting.', 'woocommerce-file-approval' ) . '</strong><br />' .
					esc_html( $id->get_error_message() ) . '</div>';

				}

			}

			die();

		}

		$out = @fopen( "{$filePath}.part", $chunk == 0 ? 'wb' : 'ab' );
		if ( $out ) 
		{

			$in = @fopen( $_FILES['async-upload']['tmp_name'], 'rb' );

			if ( $in ) 
			{
				while ( $buff = fread( $in, 4096 ) ) 
				{
					fwrite( $out, $buff );
				}
			} else {
				@fclose( $out );
				@unlink( "{$filePath}.part" );
				die();
			}

			@fclose( $in );
			@fclose( $out );

			@unlink( $_FILES['async-upload']['tmp_name'] );

		} else {
			die();
		}

		if ( ! $chunks || $chunk == $chunks - 1 ) 
		{
			rename( "{$filePath}.part", $_FILES['async-upload']['tmp_name'] );
			$_FILES['async-upload']['name'] = $fileName;
			$_FILES['async-upload']['size'] = filesize( $_FILES['async-upload']['tmp_name'] );
			$_FILES['async-upload']['type'] = $this->get_mime_content_type( $_FILES['async-upload']['tmp_name'] );
			header( 'Content-Type: text/html; charset=' . get_option( 'blog_charset' ) );

			if ( ! isset( $_REQUEST['short'] ) || ! isset( $_REQUEST['type'] ) ) {

				send_nosniff_header();
				nocache_headers();
				wp_ajax_upload_attachment();
				die( '0' );

			} else {

				$post_id = 0;
				if ( isset( $_REQUEST['post_id'] ) ) {
					$post_id = absint( $_REQUEST['post_id'] );
					if ( ! get_post( $post_id ) || ! current_user_can( 'edit_post', $post_id ) )
						$post_id = 0;
				}

				$id = media_handle_upload( 'async-upload', $post_id );
				if ( is_wp_error( $id ) ) 
				{
					echo '<div class="error-div error">
					<a class="dismiss" href="#" onclick="jQuery(this).parents(\'div.media-item\').slideUp(200, function(){jQuery(this).remove();});">' .esc_html__( 'Dismiss' ) . '</a>
					<strong>' . sprintf(esc_html__( '&#8220;%s&#8221; has failed to upload.' ), esc_html( $_FILES['async-upload']['name'] ) ) . '</strong><br />' .
					esc_html( $id->get_error_message() ) . '</div>';
					exit;
				}

				if ( isset( $_REQUEST['short'] ) && $_REQUEST['short'] ) 
				{
					echo $id;
				} 
				elseif ( isset( $_REQUEST['type'] ) ) 
				{
					
					$type = $_REQUEST['type'];
					echo apply_filters( "async_upload_{$type}", $id );
					
				}

			}

		}

		die();

	}
	public function is_pdf($file_name)
	{
		if(strpos(strtolower($file_name), '.pdf'))
		   return true;
		   
		return false;
	}
}
?>