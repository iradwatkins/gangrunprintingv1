<?php 
namespace WCFA\classes\frontend;

class OrderPage
{
	public function __construct()
	{
		add_action( 'init', array( &$this, 'init' ));
		add_action('wp_ajax_wcfa_frontend_save_data', array( &$this,'ajax_save_data'), 10);
		add_action('wp_ajax_nopriv_wcfa_frontend_save_data', array( &$this,'ajax_save_data'), 10);
	}
	public function init()
	{
		global  $wcfa_option_model;
		if( $wcfa_option_model)
		{
			$options = $wcfa_option_model->get_options();
			$position = wcfa_get_value_if_set($options, array('fronted', 'order_details', 'position'), 'woocommerce_order_details_after_order_table');
			add_action( $position , array( &$this, 'render_approval_area' ));
		}
		else
			add_action( 'woocommerce_order_details_after_order_table', array( &$this, 'render_approval_area' ));

		
		add_action( 'wcfa_display_approval_area', array( &$this, 'render_approval_area' ));	
	}
	function render_approval_area($order)
	{
		global $wcfa_attachment_model, $wcfa_user_model, $wcfa_media_model, $wcfa_option_model, $wcfa_wpml_model, $wcfa_shortcode_model, $wcfa_message_model, $wcfa_order_model;
		
		$order_id = $order->get_id();
		$attachments = $wcfa_attachment_model->get_attachments($order_id);
		$options = $wcfa_option_model->get_options();
		$general_texts = $wcfa_option_model->get_general_texts();
		$only_logged_users = wcfa_get_value_if_set($options, array('fronted', 'order_details', 'only_logged_users'), false);
		$disable_lightbox = wcfa_get_value_if_set($options, array('lighbox', 'disable'), false);
		$lang = $wcfa_wpml_model->get_current_language();
		
		if(empty($attachments))
			return;
		
	
		$date_format = get_option( 'date_format' );
		$time_format = get_option( 'time_format' );
		$approval_button_first_status_on_click = wcfa_get_value_if_set($options, array('fronted', 'order_details', 'approval_switcher_initial_click_status'), 'approved');
		
		//Css
		wp_enqueue_style('wcfa-toggle', WCFA_PLUGIN_PATH.'/css/com-toggle.css');
		if(!$disable_lightbox)
			wp_enqueue_style('wcfa-lightbox', WCFA_PLUGIN_PATH.'/css/vendor/lightbox/lightbox.css');
		wp_enqueue_style('wcfa-order-page', WCFA_PLUGIN_PATH.'/css/frontend-order-page.css');
		wp_enqueue_style('wcfa-magnific-popup', WCFA_PLUGIN_PATH.'/css/vendor/magnific-popup/magnific-popup.css');
		wp_enqueue_style('wcfa-uploader', WCFA_PLUGIN_PATH.'/css/vendor/vanquish/uploader.css');
		
		//Javascript
		if(!$disable_lightbox)
			wp_enqueue_script('wcfa-lightbox', WCFA_PLUGIN_PATH.'/js/vendor/lightbox/lightbox-plus-jquery.min.js', array('jquery'));
		wp_enqueue_script('wcfa-pdf', WCFA_PLUGIN_PATH.'/js/vendor/pdf/pdf.js', array('jquery'));
		wp_enqueue_script('wcfa-pdf-2', WCFA_PLUGIN_PATH.'/js/vendor/pdf/pdfThumbnails.js', array('jquery'));
		wp_register_script('wcfa-order-page', WCFA_PLUGIN_PATH.'/js/frontend-order-page.js', array('jquery'));
		wp_register_script('wcfa-uploader-manager', WCFA_PLUGIN_PATH.'/js/vendor/vanquish/upload-manager.js', array('jquery'));
		$js_options = array(
				'security' => wp_create_nonce('wcfa_frontend_order_page'),
				'ajaxurl' =>  admin_url( 'admin-ajax.php' ),
				'order_id' => $order_id,
				'succesfully_sent_message' => wcfa_get_value_if_set($general_texts , array('popup', 'succesfully_sent_msg', $lang), esc_html__( 'Thank you, data has been successfully sent!', 'woocommerce-file-approval' )),
				'empty_warning' => esc_html__( 'The message cannot be empty!', 'woocommerce-file-approval' ),
				'idle_warning' => esc_html__( 'You must approve or reject the attachment!', 'woocommerce-file-approval' ),
				'rejected_warning' => esc_html__( 'You have rejected the file, are you sure to proceed?', 'woocommerce-file-approval' ),
				'approval_button_first_status_on_click' => $approval_button_first_status_on_click,
				'approval_button_style' =>  wcfa_get_value_if_set($options, array('fronted', 'order_details', 'approval_button_style'), "slider"),
				//attachments uploader
				'file_size_error' => __('The file size excedes the size limit of: ','woocommerce-file-approval'),
				'browser_compliant_error' => __('Your browser is not HTML5 compliant ','woocommerce-file-approval'),
				'extension_error' => __('Your are trying to upload files with a not allowed extension','woocommerce-file-approval'),
				'upload_still_in_progress' => __('Please wait, upload still in progress.','woocommerce-file-approval')
			);
			
			
		wp_localize_script( 'wcfa-order-page', 'wcfa', $js_options );
		wp_localize_script( 'wcfa-uploader-manager', 'wcfa', $js_options );
		wp_enqueue_script( 'wcfa-order-page');
		wp_enqueue_script( 'wcfa-uploader-manager');
		wp_enqueue_script('wcfa-magnific-popup', WCFA_PLUGIN_PATH.'/js/vendor/magnific-popup/jquery.magnific-popup.min.js', array('jquery'));
		wp_enqueue_script('wcfa-uploader', WCFA_PLUGIN_PATH.'/js/vendor/vanquish/uploader.js', array('jquery'));
		wp_enqueue_script('wcfa-uploader-manager', WCFA_PLUGIN_PATH.'/js/frontend-upload-manager.js', array('jquery'));
		
		if(file_exists ( get_theme_file_path()."/woocommerce-file-approval/approval_area/popup.php" ))
				include get_theme_file_path()."/woocommerce-file-approval/approval_area/popup.php";
			else	
				include WCFA_PLUGIN_ABS_PATH.'/templates/frontend/approval_area/popup.php';
				
		if(file_exists ( get_theme_file_path()."/woocommerce-file-approval/approval_area/main_container.php" ))
			include get_theme_file_path()."/woocommerce-file-approval/approval_area/main_container.php";
		else
			include WCFA_PLUGIN_ABS_PATH.'/templates/frontend/approval_area/main_container.php';
	}
	function ajax_save_data()
	{
		global $wcfa_attachment_model, $wcfa_user_model, $wcfa_email_model, $wcfa_media_model, $wcfa_wpml_model, $wcfa_option_model, $wcfa_upload_model, $wcfa_message_model;
		$id = wcfa_get_value_if_set($_POST, 'id', ""); 
		$msg = wcfa_get_value_if_set($_POST, 'msg', "");
		$approval_value = wcfa_get_value_if_set($_POST, 'approval_value', "");
		$order_id =  wcfa_get_value_if_set($_POST, 'order_id', "");
		
		$date_format = get_option( 'date_format' );
		$time_format = get_option( 'time_format' );
		$lang = $wcfa_wpml_model->get_current_language();
		$order = wc_get_order($order_id);
		if(!$order)
		{
			esc_html_e( 'Something went wrong: invalid order.', 'woocommerce-file-approval' );
			wp_die();
		}
		$current_user_id = get_current_user_id();
		$order_user_id = $order->get_customer_id();
		
		if($id && $order_id && wp_verify_nonce( wcfa_get_value_if_set($_POST, 'security', ""), 'wcfa_frontend_order_page' ) && ($order_user_id == 0 || $current_user_id == $order_user_id))
		{
			$email_notification_data = $data = array('message' => "", 'approval_status' =>"", 'status_changed' => false, "new_attachment" => false);
			
			if($msg)
			{
				$msg = wp_strip_all_tags($msg);
				$message_id = $wcfa_attachment_model->add_message($id, $msg, true, $order_id);
				$wcfa_attachment_model->set_notification($id, "customer_message", true);
				$email_notification_data['message'] = $msg;
				
				if(isset($_POST['wcfa_files']) && is_numeric($message_id))
					$wcfa_upload_model->save_uploaded_files($_POST['wcfa_files'], $id, $message_id);
			}
			$data = $wcfa_attachment_model->get_attachment($id);
			$approval_status = $wcfa_attachment_model->get_approval_status($id);
			if($approval_status == 2) //2: Waiting, 1: Approved, 0: Rejected
			{
				$email_notification_data['status_changed'] = true;
				$wcfa_attachment_model->set_approval_status($id, $approval_value);
				$wcfa_attachment_model->set_notification($id, "customer_approval_action", true);
			}
			
			//Email notification
			$email_notification_data['approval_status'] = $wcfa_attachment_model->get_approval_status($id, true);
			$wcfa_email_model->send($order_id, $id, $email_notification_data, 'admin');
			
			$options = $wcfa_option_model->get_options();	
			$general_texts = $wcfa_option_model->get_general_texts();
			if(file_exists ( get_theme_file_path()."/woocommerce-file-approval/approval_area/popup.php" ))
				include get_theme_file_path()."/woocommerce-file-approval/approval_area/popup.php";
			else	
				include WCFA_PLUGIN_ABS_PATH.'/templates/frontend/approval_area/popup.php';
				
			if(file_exists ( get_theme_file_path()."/woocommerce-file-approval/approval_area/attachment.php" ))
				include get_theme_file_path()."/woocommerce-file-approval/approval_area/attachment.php";
			else	
				include WCFA_PLUGIN_ABS_PATH.'/templates/frontend/approval_area/attachment.php';
		
			//Order switch 
			$switch_policy = wcfa_get_value_if_set($options, array('order_status_change', 'switch_policy'), 'disabled');
			$order_statuse_to_assign = wcfa_get_value_if_set($options, array('order_status_change', 'order_statuse_to_assign'), "");
			$number_of_files = wcfa_get_value_if_set($options, array('order_status_change', 'number_of_files'), 'at_least_one');
			if($switch_policy != 'disabled' && $order_statuse_to_assign != "")
			{
				$status_to_check = $switch_policy == 'on_approval' ? 1 : 0;
				if($number_of_files == 'at_least_one' && $approval_status == $status_to_check)
				{
					$order->set_status($order_statuse_to_assign);
					$order->save();
				}
				elseif($number_of_files != 'at_least_one' && $wcfa_attachment_model->order_attachments_have_same_status($status_to_check, $order_id))
				{
					$order->set_status($order_statuse_to_assign);
					$order->save();
				}
			}
		}
		else 
		{
			if(!$id)
				esc_html_e( 'Attachment id is not valid', 'woocommerce-file-approval' );
			else if(!$order_id)
				esc_html_e( 'Order id is not valid', 'woocommerce-file-approval' );
			else if(!wp_verify_nonce( wcfa_get_value_if_set($_POST, 'security', ""), 'wcfa_frontend_order_page' ))
				esc_html_e( 'Security token is not valid', 'woocommerce-file-approval' );
			else if($current_user_id != $order_user_id)
				esc_html_e( 'You are not the owner of this order.', 'woocommerce-file-approval' );
		}
		wp_die();
	}
}
?>