<?php 
namespace WCFA\classes\com;

class Order
{
	public function __construct()
	{
		add_action('wp_ajax_wcfa_get_order_ids_by_date', array(&$this, 'ajax_get_order_ids_by_date'));
		add_action('wp_ajax_wcfa_delete_order_attachments', array(&$this, 'ajax_delete_order_attachments'));
	}
	public function ajax_delete_order_attachments()
	{
		global $wcfa_attachment_model;
		if(isset($_POST['order_ids']))
		{
			$ids = explode(",", $_POST['order_ids']);
			if(!empty($ids))
				foreach($ids as $order_id)
					$wcfa_attachment_model->delete_all_attachments($order_id);
		}
		wp_die();
	}
	public function ajax_get_order_ids_by_date()
	{
		if(isset($_POST['order_statuses']) && isset($_POST['start_date']))
		{
			$result = $this->get_order_ids_by_date($_POST['start_date'], explode(",",$_POST['order_statuses']));
			echo json_encode($result);
		}
		wp_die();
	}
	public function get_order_ids_by_date($date, $statuses)
	{
		
		$args = array(
			'status' => $statuses,
			'date_created' => '<=' . $date,
			'return' => 'ids',
			'limit' => -1
		);
		$orders = wc_get_orders( $args );
		
		return $orders;
	}
	public function get_products($obj_or_id)
	{
		$products = array();
		$wc_order = is_object($obj_or_id) ? $obj_or_id : wc_get_order($obj_or_id);
		if(!$wc_order)
			return array();
		$items = $wc_order->get_items();
		
		foreach($items as $id => $item)
		{
			if(!is_a($item,'WC_Order_Item_Product'))
				continue;
			
			$products[$id] = $item->get_name();
		}
		return $products;
	}
	public function get_product_name($obj_or_id, $order_product_id)
	{
		$products = array();
		$wc_order = is_object($obj_or_id) ? $obj_or_id : wc_get_order($obj_or_id);
		$item = $wc_order->get_item($order_product_id);
		
		return $item->get_name();
	}
	public function get_available_order_statuses($remove_internal_prefix = true)
	{
		$statuses = wc_get_order_statuses();
		$result = array();
		if($remove_internal_prefix)
		{
			foreach((array)$statuses as $code => $name)
			{
				$result[str_replace("wc-", "", $code)] = $name;
			}
		}
		else 
			$result = $statuses;
		
		return  $result;
	}
	public function save_attachments($posted_data, $order_id)
	{
		global $wcfa_message_model, $wcfa_attachment_model, $wcfa_email_model, $wcfa_shortcode_model, $wcfa_option_model;
		
		$options = $wcfa_option_model->get_options();
		
		$data = wcfa_get_value_if_set($posted_data, 'wcfa-attachment', array());
		$wc_order = wc_get_order($order_id);
		$enable_customer_cumulative_notification = wcfa_get_value_if_set($options, array('email', 'enable_customer_cumulative_notification'), false) == "true";
		if($data)
		{
			$email_cumulative_notification_data = array();
			
			krsort($data);
			foreach($data as $attachment_id => $attachment)
			{
				$email_notification_data = $data = array('message' => "", 'title'=> wcfa_get_value_if_set($attachment, array('settings', 'title'), ""), 'approval_status' =>"", 'status_changed' => false, 'automatic_approval' => false, 'new_attachment' => false); //See also Attachment.php
				
				if(wcfa_get_value_if_set($attachment, 'just_created', "false") == 'true')
				{
					$attachment_id = $wcfa_attachment_model->create($order_id);
					if($attachment_id)
					{
						$wcfa_attachment_model->set_notification($attachment_id, "admin_attachment", true);
						$email_notification_data['new_attachment'] = true;
						
					}
				}
				if(!$attachment_id)
					continue;
				else if(wcfa_get_value_if_set($attachment, 'attachment_edited', "false") == 'true')
				{
					//reset the approval status
					$wcfa_attachment_model->set_approval_status($attachment_id, 2);
					$wcfa_attachment_model->set_notification($attachment_id, "admin_attachment", true);
					$email_notification_data['status_changed'] = true;
				}
				$wcfa_attachment_model->set_media($attachment_id, $attachment['media_id']);
				$email_notification_data['media_id'] = $attachment['media_id'];
				
				if(($msg = wcfa_get_value_if_set($attachment, 'message', "")) != "")
				{
					$msg = $wcfa_shortcode_model->replace_shortcodes_with_order_data($msg, array(), $wc_order, 'user');
					$wcfa_attachment_model->add_message($attachment_id, $msg, false);
					$wcfa_attachment_model->set_notification($attachment_id, "admin_message", true);
					$email_notification_data['message'] = $msg;
				}
				if(($status_code = wcfa_get_value_if_set($attachment, array('settings', 'forced_status_code'), 3)) != 3)
				{
					$wcfa_attachment_model->set_approval_status($attachment_id, $status_code);
				}
				
				if(($settings = wcfa_get_value_if_set($attachment, 'settings', "")) != "")
				{
					$wcfa_attachment_model->save_settings($attachment_id, $settings);
				}
				
				//Email notification
				$email_notification_data['approval_status'] = $wcfa_attachment_model->get_approval_status($attachment_id, true);
				if(!$enable_customer_cumulative_notification)
				{
					$wcfa_email_model->send($order_id, $attachment_id, $email_notification_data, 'customer');
				}
				else
				{
					$email_cumulative_notification_data[$attachment_id] = $email_notification_data;
				}
			}
			if($enable_customer_cumulative_notification)
			{
				$wcfa_email_model->send_cumulative_notification($order_id, $email_cumulative_notification_data);
			}
		}
	}
	function get_orders_with_pending_approval_files()
	{
		global $wcfa_option_model;
		$options = $wcfa_option_model->get_options();
		$time_span = wcfa_get_value_if_set($options, array('email','time_span'), "never"); //values: twicedaily, daily, weekly
		
		if($time_span == "never")
			return array();
		
		
		switch($time_span)
		{
			case "twicedaily": $time_span = DAY_IN_SECONDS/2;  $time_string = "-12 hours"; break;
			case "weekly": $time_span = WEEK_IN_SECONDS;  $time_string = "-7 days"; break;
			case "daily": $time_span = DAY_IN_SECONDS; $time_string = "-1 day"; break; 
			case "wcfa_3_days": $time_span = DAY_IN_SECONDS*3;  $time_string = "-3 days";break; 
			default: $time_span = DAY_IN_SECONDS; $time_string = "-1 day"; //DAY_IN_SECONDS WordPress constant-> 24h
		}
		
		//attachment with "waiting for approval" statu retrieval
		$args = array(
		  'numberposts' => -1,
		  'post_type' => 'wcfa_attachment', 
			'meta_query' => array(
					'relation' => 'OR',
					array(
						'key'     => '_approval_status',
						'value'   => 2,
						'compare' => '=',
					),
					array(
						'key'     => '_approval_status',
						'compare' => 'NOT EXISTS',
						'value'   => '1',     
					)
			),
			'fields' => 'id=>parent',
			 'date_query' => array(
								'before' => current_time(date('Y-m-d H:i:s', strtotime($time_string)))
							)
		);		
		$attachments = get_posts( $args );
		$result = array();
		//retrieve associated order
		/* This was used to perform the search 
			using order date. You can uncomment to perform this further filter.
			if($attachments)
			{
				$result = wc_get_orders(
					array(
						'limit' => -1,
						'return' => 'ids',
						'post__in' => $attachments,
						'date_created' => '<' . ( current_time('timestamp') - $time_span ) 
						)	
				);
			}		 
		*/
		
		if($attachments)
			foreach($attachments as $attachment_id => $order_id)
				$result[$order_id] = $order_id;
		
		return $result;
	}	
	
	function get_order_details_page_url($order, $return_order_received_url = false)
	{
		/* Enable to send the "order received URL even to logged users."
		global $wcfa_option_model;
		$options = $wcfa_option_model->get_options();
		$only_logged_users = wcfa_get_value_if_set($options, array('fronted', 'order_details', 'only_logged_users'), false); */
		
		$order_url = $order->get_customer_id() && !$return_order_received_url ? $order->get_view_order_url(): 
																				$order->get_checkout_order_received_url( ); 
												 
		$order_url = apply_filters('wcfa_get_order_details_page_url', $order_url, $order);
		return $order_url;
	}
	public function get_meta($order_id_or_object, $key, $single = true)
	{
		$order = is_numeric($order_id_or_object) ? wc_get_order($order_id_or_object) : $order_id_or_object;
		
		return !isset($order) || is_bool($order) ? array() : $order->get_meta($key, $single);
	}
	public function add_meta($order_id_or_object, $key, $value, $unique = false)
	{
		$order = is_numeric($order_id_or_object) ? wc_get_order($order_id_or_object) : $order_id_or_object;
		$order->add_meta_data($key, $value, $unique);
		$order->save();
	}
	public function delete_meta($order_id_or_object, $key)
	{
		$order = is_numeric($order_id_or_object) ? wc_get_order($order_id_or_object) : $order_id_or_object;
		$order->delete_meta_data($key);
		$order->save();
	}
	public function update_meta($order_id_or_object, $key, $value)
	{
		$order = is_numeric($order_id_or_object) ? wc_get_order($order_id_or_object) : $order_id_or_object;
		$order->update_meta_data($key, $value);
		$order->save();
	}
	public function get_lang($order)
	{
		global $wcfa_wpml_model;
		
		$wc_order = is_object($order) ? $order : wc_get_order($order);
		$default = $wcfa_wpml_model->get_current_language(); //exameple en;

		if(!isset($order) || $order == false)
			return $default;
		
		$result = $wc_order->get_meta('wpml_language');
		$result = !$result || !is_string($result) || $result == "" ? $default : $result;
		
		return strtolower($result);
	}
}
?>