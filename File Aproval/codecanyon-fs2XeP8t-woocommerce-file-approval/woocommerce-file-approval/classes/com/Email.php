<?php 
namespace WCFA\classes\com;

class Email
{
	public function __construct()
	{
		
	}
	public function send_cumulative_notification($wc_order, $data, $user_type = 'customer')
	{
		global $wcfa_option_model, $wcfa_order_model, $wcfa_shortcode_model;
		$wc_order = isset($wc_order) && is_object($wc_order) ? $wc_order : wc_get_order($wc_order);
		$messages = array();
		$attachments = array();
		$options = $wcfa_option_model->get_options();
		$texts = $wcfa_option_model->get_email_texts(); 
		
		foreach($data as $attachment_id => $email_data)
		{
			$result = $this->send($wc_order, $attachment_id, $email_data, $user_type, true); 
			
			if($result)
			{
				$attachments  = array_merge($attachments, $result['attachments']);
				$messages[] = $result['message'];
			}
		}
		if(empty($messages) && empty($attachments))
			return;
		
		
		$from = "";
		$order_lang = $wcfa_order_model->get_lang($wc_order);
		$recipients = $user_type == 'customer' ? $wc_order->get_billing_email() : wcfa_get_value_if_set($options, array('email', 'recipient'), get_option('woocommerce_email_from_address')); 
		$recipients = $user_type != 'customer' &&  $recipients == "" ?  get_option('woocommerce_email_from_address') : $recipients; 
		$subject = wcfa_get_value_if_set($texts , $user_type == 'customer' ? array($user_type, 'subject', $order_lang) : array($user_type, 'subject'), "");
		$subject = $wcfa_shortcode_model->replace_shortcodes_with_order_data($subject, array(), $wc_order, $user_type);
		$wrapper = wcfa_get_value_if_set($texts , array($user_type, 'cumulative_message_wrapper', $order_lang), "");
		$wrapper = $wcfa_shortcode_model->replace_shortcodes_with_order_data($wrapper, array(), $wc_order, $user_type);
		
		$mail = WC()->mailer();
		$message = implode("<br/><br/>", $messages);
		$message = wcfa_trim_breaks(nl2br(trim($message)));
		$message = str_replace("[messages]", $message, $wrapper );
		$message = $mail->wrap_message(get_bloginfo('name'), stripcslashes($message));
		
		add_filter('wp_mail_from_name',array(&$this, 'wp_mail_from_name'), 99, 1);
		add_filter('wp_mail_from', array(&$this, 'wp_mail_from'));
		if(wcfa_get_value_if_set($options, array('email', 'from_email'), "") != "" )
			$from .= " From: " . wcfa_get_value_if_set($options, array('email', 'from_email'),"") . "\r\n";
		
		if(!$mail->send( $recipients, $subject, $message, "Content-Type: text/html\r\n".$from , $attachments)) 
			wp_mail( $recipients, $subject, $message, "Content-Type: text/html\r\n".$from , $attachments);
		remove_filter('wp_mail_from_name',array(&$this, 'wp_mail_from_name'));
		remove_filter('wp_mail_from',array(&$this, 'wp_mail_from'));
	}
	public function send($wc_order, $attachment_id, $data, $user_type = 'admin', $return_data = false) //values: admin || customer
	{
		//Info -> $data = array('message', 'approval_status', 'status_changed'): contains the message and the approval status (if any)
		
		$wc_order = isset($wc_order) && is_object($wc_order) ? $wc_order : wc_get_order($wc_order);
		if(!$wc_order)
			return false;
		
		if(!$data['new_attachment'] && !$data['status_changed'] && $data['message'] == "")
			return false;
		
		global $wcfa_option_model, $wcfa_order_model, $wcfa_shortcode_model, $wcfa_attachment_model;
		
		$texts = $wcfa_option_model->get_email_texts(); 
		$options = $wcfa_option_model->get_options();
		if(($user_type != 'customer' && wcfa_get_value_if_set($options, array('email', 'disable_admin_notification'), false)) || 
			($user_type == 'customer' && wcfa_get_value_if_set($options, array('email', 'disable_customer_notification'), false)) )
			 return false;
		
		$order_lang = $wcfa_order_model->get_lang($wc_order);
		$recipients = $user_type == 'customer' ? $wc_order->get_billing_email() : wcfa_get_value_if_set($options, array('email', 'recipient'), get_option('woocommerce_email_from_address')); 
		$recipients = $user_type != 'customer' &&  $recipients == "" ?  get_option('woocommerce_email_from_address') : $recipients; 
		$attachment = $wcfa_attachment_model->get_attachment($attachment_id);	
		$recipients_attachment_specific = wcfa_get_value_if_set($attachment, array('settings', 'email_recipients'), "");
		
		if($recipients_attachment_specific != "" && $user_type == 'admin')
		{
			$recipients = $recipients_attachment_specific;
			
		}
		
		$from = "";		
		if(!wcfa_get_value_if_set($data, 'automatic_approval', false))
		{
			$subject = wcfa_get_value_if_set($texts , $user_type == 'customer' ? array($user_type, 'subject', $order_lang) : array($user_type, 'subject'), "");
			$message = wcfa_get_value_if_set($texts , $user_type == 'customer' ? array($user_type, 'body', $order_lang) : array($user_type, 'body'), "");
		}
		else 
		{
			$subject = wcfa_get_value_if_set($texts , array($user_type, 'automatic_approval_subject', $order_lang) , "");
			$message = wcfa_get_value_if_set($texts , array($user_type, 'automatic_approval_body', $order_lang), "");
			$recipients .= ",".$recipients_attachment_specific;
		}
		
		//1. Replace all shortcodes
		$message = $wcfa_shortcode_model->replace_shortcodes_with_order_data($message, $data, $wc_order, $user_type);
		$subject = $wcfa_shortcode_model->replace_shortcodes_with_order_data($subject, $data, $wc_order, $user_type);
		//2. Remove wrappers and eventually the text inside of them (if no message or no status change)
		$message = $wcfa_shortcode_model->strip_wrappers($message, '[if_message]', '[end_message]', $data['message'] == "");
		$message = $wcfa_shortcode_model->strip_wrappers($message, '[if_status_changed]', '[end_status_changed]', !$data['status_changed']);
		$message = $wcfa_shortcode_model->strip_wrappers($message, '[if_new_attachment]', '[end_if_new_attachment]', !$data['new_attachment']);
		
		$subject = $wcfa_shortcode_model->strip_wrappers($subject, '[if_message]', '[end_message]', $data['message'] == "");
		$subject = $wcfa_shortcode_model->strip_wrappers($subject, '[if_status_changed]', '[end_status_changed]', !$data['status_changed']);
		$subject = $wcfa_shortcode_model->strip_wrappers($subject, '[if_new_attachment]', '[end_if_new_attachment]', !$data['new_attachment']);
		//
		
		//attachments management
		$attachments = array();
		if(wcfa_get_value_if_set($options, array('email', 'attach_files_to_notification_email'), false) == 'true' && isset($data['media_id']))
		{
			$attachments = array(get_attached_file($data['media_id']));
		}
		if($return_data)
		{
			return array('message' => $message, 'attachments' => $attachments);
		}
		
		$mail = WC()->mailer();
		$message = wcfa_trim_breaks(nl2br(trim($message)));
		$message = $mail->wrap_message(get_bloginfo('name'), stripcslashes($message));
		
		add_filter('wp_mail_from_name',array(&$this, 'wp_mail_from_name'), 99, 1);
		add_filter('wp_mail_from', array(&$this, 'wp_mail_from'));
		if(wcfa_get_value_if_set($options, array('email', 'from_email'), "") != "" )
			$from .= " From: " . wcfa_get_value_if_set($options, array('email', 'from_email'),"") . "\r\n";
		
		if(!$mail->send( $recipients, $subject, $message, "Content-Type: text/html\r\n".$from , $attachments)) 
			wp_mail( $recipients, $subject, $message, "Content-Type: text/html\r\n".$from , $attachments);
		remove_filter('wp_mail_from_name',array(&$this, 'wp_mail_from_name'));
		remove_filter('wp_mail_from',array(&$this, 'wp_mail_from'));
		
	}
	public function send_reminder()
	{	
		global $wcfa_order_model, $wcfa_option_model, $wcfa_shortcode_model;
		//retrieve order for which the reminder has to be sent 
		$order_ids = $wcfa_order_model->get_orders_with_pending_approval_files();
		$order_statuses_to_exclude = array('cancelled', 'refunded', 'failed');
		$texts = $wcfa_option_model->get_email_texts(); 
		$default_texts = $wcfa_option_model->get_default_email_texts(); 
		$options = $wcfa_option_model->get_options();
		$statuses_to_exclude = wcfa_get_value_if_set($options, array('email', 'order_statuses_to_exclude'), array());
		
		foreach($order_ids as $order_id)
		{
			$wc_order = wc_get_order($order_id);
			if(!$wc_order || in_array($wc_order->get_status(), $order_statuses_to_exclude) || in_array("wc-".$wc_order->get_status(), $statuses_to_exclude))
				continue;
			
			$order_lang = $wcfa_order_model->get_lang($wc_order);
			$from = "";
			$subject = wcfa_get_value_if_set($texts , array('customer', 'reminder_subject', $order_lang), $default_texts['customer']['reminder_subject']);
			$message = wcfa_get_value_if_set($texts , array('customer', 'reminder_body', $order_lang), $default_texts['customer']['reminder_subject']);
			
			//replace all shortcodes
			$message = $wcfa_shortcode_model->replace_shortcodes_with_order_data($message, array(), $wc_order, 'customer');
			$message = wcfa_trim_breaks(nl2br(trim($message)));
			$subject = $wcfa_shortcode_model->replace_shortcodes_with_order_data($subject, array(), $wc_order, 'customer');
			
			//prepare email
			//prepare email
			$mail = WC()->mailer();
			/* Old email method:				
				ob_start();
				$mail->email_header(get_bloginfo('name'), $mail);
				echo stripcslashes($message);
				$mail->email_footer($mail);
				$message =  ob_get_contents();
				ob_end_clean();  
			*/
			$message = $mail->wrap_message(get_bloginfo('name'), stripcslashes($message));
			
			
			
			//send email
			add_filter('wp_mail_from_name',array(&$this, 'wp_mail_from_name'), 99, 1);
			add_filter('wp_mail_from', array(&$this, 'wp_mail_from'));
			if(wcfa_get_value_if_set($options, array('email', 'from_email'), "") != "" )
				$from .= " From: " . wcfa_get_value_if_set($options, array('email', 'from_email'),"") . "\r\n";
			$attachments = array();
			if(!$mail->send( $wc_order->get_billing_email(), $subject, $message, "Content-Type: text/html\r\n".$from , $attachments)) 
				wp_mail( $wc_order->get_billing_email(), $subject, $message, "Content-Type: text/html\r\n".$from , $attachments);
			remove_filter('wp_mail_from_name',array(&$this, 'wp_mail_from_name'));
			remove_filter('wp_mail_from',array(&$this, 'wp_mail_from'));
		}
		
	}
	public function wp_mail_from_name($name) 
	{
		global $wcfa_option_model;
		$options = $wcfa_option_model->get_options();
		return wcfa_get_value_if_set($options, array('email', 'from_name'), get_bloginfo('name'));
	}
	public function wp_mail_from($content_type) 
	{
		global $wcfa_option_model;
		$options = $wcfa_option_model->get_options();
		$server_headers = function_exists('apache_request_headers') ? apache_request_headers() : wcfa_apache_request_headers();
		$domain = isset($server_headers['Host']) ? $server_headers['Host'] : null ;
		if(!isset($domain) && isset($_SERVER['HTTP_HOST']))
			$domain = str_replace("www.", "", $_SERVER['HTTP_HOST'] );
		
		return wcfa_get_value_if_set($options, array('email', 'from_email'), isset($domain) ? 'noprely@'.$domain : $content_type);
	}
}
?>