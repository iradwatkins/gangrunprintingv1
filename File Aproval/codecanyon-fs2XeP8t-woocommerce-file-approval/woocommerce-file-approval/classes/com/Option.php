<?php 
namespace WCFA\classes\com;

class Option
{
	//rplc: woocommerce-file-approval, wcfa, WCFA
	
	var $options_cache;
	var $general_text_cache;
	var $preset_answers_cache;
	var $email_text_cache;
	public function __construct()
	{
		add_action( 'wp_ajax_wcfa_get_preset_answer', array(&$this, 'ajax_get_preset_answer'), 0 );
	}
	public function ajax_get_preset_answer()
	{
		$id = filter_input( INPUT_POST, 'id', FILTER_VALIDATE_INT );
		$answers = $this->get_preset_answers();
		if(wp_verify_nonce( wcfa_get_value_if_set($_POST, 'security', ""), 'wcfa_admin_order_page' ))
			foreach($answers as $index => $answer)
				if($id == $index)
					echo $answer['text'];
		wp_die();
	}
	public function save_options($data)
	{
		$this->options_cache = null;
		
		//Remove slashes from text options 
		if(wcfa_get_value_if_set($data, array('email', 'from_name'), false) != "")
			$data['email']['from_name'] = stripcslashes($data['email']['from_name']);
		
		update_option('wcfa_options', $data);
	}
	public function save_preset_answers($data, $add_data = false) 
	{
		if(isset($data))
			$data = $this->escape_text($data);
		
		$this->preset_answers_cache = null;
		if(!isset($data) || empty($data))
			delete_option('wcfa_preset_answers');
		if(!$add_data)
			update_option('wcfa_preset_answers', $data);
		else 
		{
			$options = get_option('wcfa_preset_answers');
			$options = $options ? $options : array();
			update_option('wcfa_preset_answers', array_merge($options, $data));
		}
	}
	public function save_general_texts($data) 
	{
		if(isset($data))
			$data = $this->escape_text($data);
		
		$this->general_text_cache = null;
		update_option('wcfa_general_texts', $data);
	}
	public function save_email_texts($data) 
	{
		if(isset($data))
			$data = $this->escape_text($data);
		
		$this->email_text_cache = null;
		update_option('wcfa_email_texts', $data);
	}
	private function escape_text($data)
	{
		foreach($data as $index => $content)
		{
			if(is_string($content))
				$data[$index] = stripcslashes($content);
			else if(is_array($content))
				$data[$index] = $this->escape_text($content);
		}
		return $data;
	}
	
	public function get_options($option_name = null, $default_value = null)
	{
		$result = null;
		
		$options = isset($this->options_cache ) ? $this->options_cache  : get_option('wcfa_options');
		$this->options_cache = $options;
		if($option_name != null)
		{
			$result = wcfa_get_value_if_set($options, $option_name ,$default_value);
		}
		else 
			$result = $options;
		
		return $result;
	}
	public function get_default_email_texts()
	{
		$allowed_tags = array('br' => array(), 'p' => array(), 'strong' => array(), 'i' => array(), 'a' => array());
		$texts = array();
		$texts['admin']['subject'] = wp_kses(__('Order #[order_id] has been updated!', 'woocommerce-file-approval'), $allowed_tags);
		$texts['admin']['body'] = __('[if_status_changed]The file has been: [approval_status][end_status_changed]<br/>[if_message]<br/>The customer says:<br/><i>[message]</i><br/>[end_message]<br/><br/>Go on the <a href="[order_url]">order page</a> for more details!', 'woocommerce-file-approval');
			
		$texts['customer']['subject'] = wp_kses(__('Order #[order_id] has been updated!', 'woocommerce-file-approval'), $allowed_tags);
		$texts['customer']['body'] = __('[if_status_changed]You got a new attachment![end_status_changed]<br/>[if_message]<br/>The staff says:<br/><i>[message]</i><br/>[end_message]<br/><br/>Go on the <a href="[order_url]">order page</a> for more details!', 'woocommerce-file-approval');
		$texts['customer']['cumulative_message_wrapper'] = __('Hello [billing_first_name],<br/>[messages]<br/><br/>Go on the <a href="[order_url]">order page</a> for more details!', 'woocommerce-file-approval');
			
		$texts['customer']['reminder_subject'] = wp_kses(__('Order #[order_id] has some files that require your attention!', 'woocommerce-file-approval'), $allowed_tags);
		$texts['customer']['reminder_body'] = __('Some files still need to be approved!<br/><br/>Please visit the <a href="[order_url]">#[order_id] order page</a> for more details!', 'woocommerce-file-approval');
		
		$texts['customer']['automatic_approval_subject'] = wp_kses(__('Order #[order_id] - The file has been approved', 'woocommerce-file-approval'), $allowed_tags);
		$texts['customer']['automatic_approval_body'] = __('Since no action has been taken in the last [automatic_approval_span] hours, the file has been automatically approved!<br/><br/>Please visit the <a href="[order_url]">order page</a> for more details!', 'woocommerce-file-approval');
			
		return $texts;
	}
	public function get_default_general_texts()
	{
		$allowed_tags = array('br' => array(), 'p' => array(), 'strong' => array(), 'i' => array(), 'a' => array());
		$texts = array();
		$texts['order_details_page']['description']	= "";
		$texts['popup']['title']	= esc_html__( 'Notice', 'woocommerce-file-approval' );
		$texts['popup']['succesfully_sent_msg']	= esc_html__( 'Thank you, data has been successfully sent!', 'woocommerce-file-approval' );
		
		return $texts;
	}
	public function get_email_texts($option_name = null, $default_value = null)
	{
		global  $wcfa_wpml_model;
		$result = null;
		
		//To delete the option: delete_option('wcfa_text_options');
		$options = isset($this->email_text_cache) ? $this->email_text_cache : $options = get_option('wcfa_email_texts');
		$this->email_text_cache = $options;
		
		//default values 
		$is_first_run = $options == false || !isset($options) || empty($options);
		$options = $is_first_run ? array() : $options;
		$langs =  $wcfa_wpml_model->get_langauges_list();
		$defaults = $this->get_default_email_texts();
		if($is_first_run)
		{
			// -- Email message
			$options['email'] = array('admin' => array('subject' => array(), 'body'=> array()),
									  'customer' => array('subject' => array(), 'body'=> array(), 
									  'reminder_subject' => array(), 'reminder_body'=> array()),
									  'automatic_approval_subject' => array(), 'automatic_approval_body'=> array()
									  );
			foreach($langs as $lang_data)
			{					
				$options['admin']['subject'] = $defaults['admin']['subject'];
				$options['admin']['body'] = $defaults['admin']['body'];
				
				$options['customer']['subject'][$lang_data['language_code']] =  $defaults['customer']['subject'];
				$options['customer']['body'][$lang_data['language_code']] = $defaults['customer']['body'];
				$options['customer']['cumulative_message_wrapper'][$lang_data['language_code']] = $defaults['customer']['cumulative_message_wrapper'];
				
				$options['customer']['reminder_subject'][$lang_data['language_code']] =  $defaults['customer']['reminder_subject'];
				$options['customer']['reminder_body'][$lang_data['language_code']] = $defaults['customer']['reminder_body'];
				
				$options['customer']['automatic_approval_subject'][$lang_data['language_code']] =  $defaults['customer']['automatic_approval_subject'];
				$options['customer']['automatic_approval_body'][$lang_data['language_code']] = $defaults['customer']['automatic_approval_body'];
				
			}	
		}
		//-- new options
		if(!isset($options['customer']['cumulative_message_wrapper']))
			foreach($langs as $lang_data)
				$options['customer']['cumulative_message_wrapper'][$lang_data['language_code']] = $defaults['customer']['cumulative_message_wrapper'];
		//end default values
		
		//load values
		if($option_name != null)
		{
			$result = wcfa_get_value_if_set($options, $option_name ,$default_value);
		}
		else 
			$result = $options;
		
		return $result;
	} 
	public function get_general_texts($option_name = null, $default_value = null)
	{
		global  $wcfa_wpml_model;
		$result = null;
		
		//To delete the option: delete_option('wcfa_general_texts');
		$options = isset($this->general_text_cache) ? $this->general_text_cache : $options = get_option('wcfa_general_texts');
		$this->general_text_cache = $options;
		
		//default values 
		$is_first_run = $options == false || !isset($options) || empty($options);
		$options = $is_first_run ? array() : $options;
		if($is_first_run)
		{
			$langs =  $wcfa_wpml_model->get_langauges_list();
			$defaults = $this->get_default_general_texts();
					
			// -- Order details page
			$options['order_details_page'] = array('description' => array());
			foreach($langs as $lang_data)
			{					
				$options['order_details_page']['description'][$lang_data['language_code']] =  $defaults['order_details_page']['description'];
				$options['popup']['succesfully_sent_msg'][$lang_data['language_code']] =  $defaults['popup']['succesfully_sent_msg'];
				$options['popup']['title'][$lang_data['language_code']] =  $defaults['popup']['title'];
				
			}
		}
		//end default values
		
		//load values
		if($option_name != null)
		{
			$result = wcfa_get_value_if_set($options, $option_name ,$default_value);
		}
		else 
			$result = $options;
		
		return $result;
	}
	public function get_preset_answers($option_name = null, $default_value = null)
	{
		global  $wcfa_wpml_model;
		
		//Tp delete the option: delete_option('wcfa_preset_answers');
		//delete_option('wcfa_preset_answers');
		$options = isset($this->preset_answers_cache) ? $this->preset_answers_cache : $options = get_option('wcfa_preset_answers');
		$this->preset_answers_cache = $options;
		
		//load values
		if($option_name != null)
		{
			$result = wcfa_get_value_if_set($options, $option_name ,$default_value);
		}
		else 
			$result = $options;
		
		return $result ? $result : array();
	}
}
?>