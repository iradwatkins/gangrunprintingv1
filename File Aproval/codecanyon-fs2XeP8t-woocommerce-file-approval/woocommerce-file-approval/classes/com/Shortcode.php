<?php 
namespace WCFA\classes\com;

class Shortcode
{
	public function __construct()
	{
		
	}
	public function replace_shortcodes_with_order_data($message, $attachment_data, $order, $user_type = 'admin')
	{
		global $wcfa_order_model, $wcfa_option_model;
		$order = is_numeric($order) ? wc_get_order($order) : $order;
		if(!is_object($order))
			return $message;
		
		$options = $wcfa_option_model->get_options();
		
		$order_shortcodes = array('[order_id]', '[order_total]', '[order_date]');
		$billing_fields = array('billing_first_name', 'billing_last_name', 'billing_company', 'billing_address_1', 'billing_address_2', 'billing_city', 'billing_state', 'billing_postcode', 'billing_country', 'billing_email', 'billing_phone', 'formatted_billing_address');
		$shipping_fields = array('shipping_first_name', 'shipping_last_name', 'shipping_company', 'shipping_address_1', 'shipping_address_2', 'shipping_city', 'shipping_state', 'shipping_postcode', 'shipping_country', 'formatted_shipping_address');
		$special_fields = array('message', 'approval_status', 'attachment_title');
		$payment_url = $order->get_checkout_payment_url(); //uses the following action: woocommerce_checkout_pay_endpoint
		$order_url =  $wcfa_order_model->get_order_details_page_url($order);
		$order_received_url =  $wcfa_order_model->get_order_details_page_url($order, true);
		$order_admin_url =  $this->get_edit_post_link($order->get_id());
		$automatic_approval_frequency = wcfa_get_value_if_set($options, array('automatic_approval', 'time_span'), "");
		
		foreach($order_shortcodes as $current_shortcode)
			if (strpos($message, $current_shortcode) !== false)
			{
				$original_method_name = $method_name = str_replace(array('[',']'), "", $current_shortcode);
				switch($method_name)
				{
					case 'order_id': $method_name = 'get_order_number'; break;
					case 'order_total': $method_name = 'get_formatted_order_total'; break;
					case 'order_date': $method_name = 'get_date_created'; break;
				}
				$value = $order && is_callable ( array($order , $method_name) ) ? $order->$method_name() : "";
				if($method_name == 'order_id') //Filters
				{
					$value = apply_filters('wcam_get_visual_order_id', $value);
				}
				
				if(is_object($value) && get_class($value) == 'WC_DateTime')
				{
					$value = $value->date_i18n(get_option('date_format')." ".get_option('time_format'));
				}
				$message = str_replace($current_shortcode, $value, $message);
			}
			
		foreach ( $billing_fields as $key) 
		{
			$key_method = str_replace("order_", "", $key);
			if ( is_callable( array( $order, "get_{$key_method}" ) )  ) 
			{
				$method_name = "get_".$key_method;
				$message = str_replace("[{$key}]", $order->$method_name(), $message );

			// Store custom fields prefixed with wither shipping_ or billing_. This is for backwards compatibility with 2.6.x.
			// TODO: Fix conditional to only include shipping/billing address fields in a smarter way without str(i)pos.
			} /* elseif ( ( 0 === stripos( $key, 'billing_' ) || 0 === stripos( $key, 'shipping_' ) )
				&& ! in_array( $key, array( 'shipping_method', 'shipping_total', 'shipping_tax' ) ) ) {
				$order->update_meta_data( '_' . $key, $value );
			} */
		}
		
		foreach ( $shipping_fields as $key ) 
		{
			if ( is_callable( array( $order, "set_{$key}" ) ) && is_callable( array( $order, "get_{$key}" ) ) ) 
			{
				$method_name = "get_".$key;
				$message = str_replace("[{$key}]", $order->$method_name(), $message );
			}
		}
		
		if(!empty($attachment_data))
			foreach ( $special_fields as $key ) 
			{
				switch($key)
				{
					case 'message': 		$message =  str_replace("[{$key}]",$attachment_data['message'], $message ); break;
					case 'approval_status': $message =  str_replace("[{$key}]",$attachment_data['approval_status'], $message ); break;
					case 'attachment_title':$message =  str_replace("[{$key}]",$attachment_data['title'], $message ); break;
				}
			}
			
		//From options 
		$message = str_replace("[automatic_approval_span]", $automatic_approval_frequency, $message );
		//Order URLs
		$message = $user_type != 'admin' ? str_replace("[order_url]", $order_url, $message ) : str_replace("[order_url]", $order_admin_url, $message );
		$message = str_replace("[order_received_url]", $order_received_url, $message ) ;
		
		return $message;
	}
	public static function strip_wrappers($text, $start_wrapper = '[if_message]', $end_wrapper = '[end_message]', $delete_text_inside_wrappers = true)
	{
		
		$start = strpos($text, $start_wrapper);
		$end = strpos($text, $end_wrapper);
		if($start !== false && $end !== false)
		{
			if($delete_text_inside_wrappers)
			{
				$offset = strlen($end_wrapper);
				$offset_second = substr ( $text , ($end + $offset) + 1, 2) == "br" ? 6 : 0; //Removes the <br /> = 6 at beginning
				$result = substr_replace ($text, "", $start, ($end + $offset) - $start + 0 ); //use the $offset_second  to eventually remove the following <br>
				return substr($result,0,1) == "\n" ? "" : $result;
			}
			else
			{
				$result = str_replace(array($start_wrapper, $end_wrapper), "", $text);
				return $result;
			}
		}
		else 
		{
			
		}
		return $text;
	}
	function get_edit_post_link( $id = 0, $context = 'display' ) 
	{
		$post = get_post( $id );
		if ( ! $post ) {
			return;
		}
	 
		if ( 'revision' === $post->post_type ) 
		{
			$action = '';
		} elseif ( 'display' == $context ) {
			$action = '&amp;action=edit';
		} else {
			$action = '&action=edit';
		}
	 
		$post_type_object = get_post_type_object( $post->post_type );
		if ( ! $post_type_object ) {
			return;
		}
	 
		/* if ( ! current_user_can( 'edit_post', $post->ID ) ) {
			return;
		} */
	 
		if ( $post_type_object->_edit_link ) {
			$link = admin_url( sprintf( $post_type_object->_edit_link . $action, $post->ID ) );
		} else {
			$link = '';
		}
	 
		/**
		 * Filters the post edit link.
		 *
		 * @since 2.3.0
		 *
		 * @param string $link    The edit link.
		 * @param int    $post_id Post ID.
		 * @param string $context The link context. If set to 'display' then ampersands
		 *                        are encoded.
		 */
		return apply_filters( 'get_edit_post_link', $link, $post->ID, $context );
	}
}
?>