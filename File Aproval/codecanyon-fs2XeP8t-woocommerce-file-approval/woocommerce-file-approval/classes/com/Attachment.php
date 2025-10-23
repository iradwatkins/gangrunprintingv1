<?php 
namespace WCFA\classes\com;

class Attachment
{
	const ATTRIBUTES = array('approval_status' => 2, 'approval_date' => "", "media_id" => 0); //0: rejected, 1: approved, 2: waiting
	
	public function __construct()
	{
		add_action( 'init', array(&$this, 'register_custom_post_type'), 0 );
		add_action('before_delete_post', array( &$this,'delete_associated_data'), 10);
		add_action('wp_ajax_wcfa_delete_attachment', array( &$this,'ajax_delete_attachment'), 10);
	}
	function register_custom_post_type() 
	{

		$labels = array(
			'name'                => _x( 'Attachment', 'Attachment', 'woocommerce-file-approval' ),
			'singular_name'       => _x( 'Attachment', 'Attachment', 'woocommerce-file-approval' ),
			'parent_item_colon'   =>esc_html__( 'Parent Item:', 'woocommerce-file-approval' ),
			'all_items'           =>esc_html__( 'All Attachment', 'woocommerce-file-approval' ),
			'add_new_item'        =>esc_html__( 'Add Attachment', 'woocommerce-file-approval' ),
			'add_new'             =>esc_html__( 'Add Attachment', 'woocommerce-file-approval' ),
			'new_item'            =>esc_html__( 'New Attachment', 'woocommerce-file-approval' ),
			'edit_item'           =>esc_html__( 'Edit Attachment', 'woocommerce-file-approval' ),
			'update_item'         =>esc_html__( 'Update Attachment', 'woocommerce-file-approval' ),
			'view_item'           =>esc_html__( 'View Attachment', 'woocommerce-file-approval' ),
			'search_items'        =>esc_html__( 'Search Attachment', 'woocommerce-file-approval' ),
			'not_found'           =>esc_html__( 'Not found', 'woocommerce-file-approval' ),
			'not_found_in_trash'  =>esc_html__( 'Not found in Trash', 'woocommerce-file-approval' ),
		);
		$args = array(
			'label'               =>esc_html__( 'Attachment', 'woocommerce-file-approval' ),
			'description'         =>esc_html__( 'WooCommerce File Approval', 'woocommerce-file-approval' ),
			'labels'              => $labels,
			'supports'            => array('editor' ),
			'taxonomies'          => array(  ),
			'hierarchical'        => false,
			'public'              => true,
			'show_ui'             => true,                                     
			'show_in_menu'        => false,
			'show_in_admin_bar'   => false,
			'show_in_nav_menus'   => false,
			'can_export'          => true,
			'has_archive'         => false,		
			'exclude_from_search' => true,
			'publicly_queryable'  => false,
			'capability_type'     => 'shop_order'
		);
		register_post_type( 'wcfa_attachment', $args );
		flush_rewrite_rules();
		
	}
	function automatic_approve_pending_attachments()
	{
		global $wcfa_option_model, $wcfa_email_model;
		$options = $wcfa_option_model->get_options();
		$automatic_approval_frequency = wcfa_get_value_if_set($options, array('automatic_approval', 'time_span'), "");
		$statuses_to_exclude = wcfa_get_value_if_set($options, array('automatic_approval', 'order_statuses_to_exclude'), array());
		
		if($automatic_approval_frequency == "" || $automatic_approval_frequency < 1)
			return;
			
		//Get ALL order ids with pending attachments
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
						'value'   => '',
						'compare' => '=',
					),
					array(
						'key'     => '_approval_status',
						'compare' => 'NOT EXISTS',
						'value'   => '1',     
					)
			),
			'date_query' => array(
				 'column' => 'post_modified', 
				 'before' => "{$automatic_approval_frequency} hours ago" //returns pending attachments (status has not been changed by the user in the last $automatic_approval_frequency hours)
			)
			
		);		
		$attachments = get_posts( $args );
		if($attachments)
			foreach($attachments as $attachment_data)
			{
				$email_notification_data = array('message' => "", 'approval_status' => 1, 'status_changed' => true, 'automatic_approval' => true, 'new_attachment' => false); //See also Order.php
				
				//Exclusion
				$wc_order = wc_get_order($attachment_data->post_parent);
				if(!$wc_order || in_array("wc-".$wc_order->get_status(), $statuses_to_exclude))
					continue;
				
				$this->set_approval_status($attachment_data->ID, 1);
				$wcfa_email_model->send($wc_order, $attachment_data->ID, $email_notification_data, 'customer');
			}
	}
	public function delete_associated_data($post_id)
	{
		global $wcsts_file_model;
		$obj = get_post($post_id);
		if (!isset($obj) || ($obj->post_type != 'wcfa_attachment' && $obj->post_type != 'shop_order'))
			return;
		
		if($obj->post_type == 'wcfa_attachment' )
		{
			$children = get_posts( array( 'numberposts' => -1, 'post_parent' => $obj->ID, 'post_type'=> 'wcfa_message', 'suppress_filters' => false )); 
			$this->delete_children($children);
		}
		else if($obj->post_type == 'shop_order')
		{
			//media in gallery
			$children = get_posts( array( 'numberposts' => -1, 'post_parent' => $obj->ID, 'post_type'=> 'attachment', 'suppress_filters' => false )); //Can also use the get_children($parent_id);
			$this->delete_children($children);
			
			$children = get_posts( array( 'numberposts' => -1, 'post_parent' => $obj->ID, 'post_type'=> 'wcfa_attachment', 'suppress_filters' => false )); 
			$this->delete_children($children);
		}
	}
	//used to check if all the files have been approved or rejected
	public function order_attachments_have_same_status($status_code, $order_id)
	{
		$result = true;
		
		$attachments = $this->get_attachments($order_id);
		if(!is_array($attachments) || empty($attachments))
			return false;
		
		foreach($attachments as $attachment_data)
		{
			$attachment_id = $attachment_data['attachment']->ID;
			$attachment = $this->get_attachment($attachment_id);
			if($status_code != wcfa_get_value_if_set($attachment, array('attributes','status_code'), 2))
				return false;
		}
		
		return $result;
	}
	public function get_attachments($order_id)
	{
		
		$result = array();
		
		if(!$order_id)
			return $result;
		
		$order_id = is_object($order_id) ? $order_id->get_id() : $order_id;
		
		$attachments = get_posts( array( 'numberposts' => -1, 'post_parent' => $order_id, 'post_type'=> 'wcfa_attachment', 'order' => 'ASC', 'orderby' => 'ID', 'suppress_filters' => false/*,  'meta_key' => 'wcaf_is_active', 'meta_value' => true */ ));
		foreach((array)$attachments as $attachment)
		{
			$result[$attachment->ID] = $this->get_attachment($attachment->ID);	
			if(!isset($result[$attachment->ID]["settings"]["order_product"])) //retrocompability
			{
				$result[$attachment->ID]["settings"] = array("order_product" => "");
			}
				
		}	
		
		//sort by order product 
		usort($result, function($a, $b) 
		{
			return $a["settings"]["order_product"] <=> $b["settings"]["order_product"];
		});

		return $result;
	}
	public function get_attachment($attachment_id)
	{
		global $wcfa_message_model, $wcfa_media_model;
		
		$date_format = get_option( 'date_format' );
		$time_format = get_option( 'time_format' );
		
		$result = array();
		$result['attachment'] = get_post($attachment_id);
		$result['settings'] = $this->get_settings($attachment_id);
		$result['media']  = $this->get_media($attachment_id);
		$result['messages'] = $wcfa_message_model->get_messages($attachment_id);
		$result['attributes'] = array('status' => $this->get_approval_status($attachment_id), 'status_code' => $this->get_approval_status($attachment_id), 'date' => $this->get_approval_date($attachment_id));
		
		//Data formattation
		if($result['attributes']['date'])
		{
			$result['attributes']['date'] = date_i18n($date_format." ".$time_format, strtotime($result['attributes']['date']));
		}
		$result['attributes']['status'] = $this->get_status_name($result['attributes']['status']);
		return $result;
	}
	//0: no, 1: always, 2: only once (after admin revision)
	public function can_user_reply($attachment_id)
	{
		global $wcfa_message_model;
		
		$messages = $wcfa_message_model->get_messages($attachment_id);
		$settings = $this->get_settings($attachment_id);
		$reply_policy = wcfa_get_value_if_set($settings, 'reply_policy', 1);
		$status = $this->get_approval_status($attachment_id);
		$last_interaction = $this->get_last_interaction($attachment_id);
		
		$can_reply = true;
		switch($reply_policy)
		{
			case 1: $can_reply = true; break;
			case 0: $can_reply = false; break;
			case 2: $can_reply = $last_interaction == 'admin'; 
		}
		
		return $can_reply;
	}	
	public function ajax_delete_attachment()
	{
		$id = filter_input( INPUT_GET, 'id', FILTER_VALIDATE_INT );
		if($id)
		{
			$this->delete_attachment($id);
		}
		wp_die();
	}
	public function create($parent_id)
	{
		
		$id = wp_insert_post(array(
								'post_parent' => $parent_id,
								'post_type' => 'wcfa_attachment',
								'post_status' => 'publish'
								));
		return $id;
	}
	
	public function delete_attachment($id)
	{
		//attachment association
		$attachment = $this->get_attachment($id);
		$media_id = $attachment['media'];
		if($media_id)
			wp_delete_attachment($media_id, true);
				
		wp_delete_post($id, true); 
	}
	public function delete_media($id)
	{
		$media_id = get_post_thumbnail_id($id);
	}
	private function delete_children($children)
	{
		foreach($children as $child)
			wp_delete_post($child->ID, true); 
	}	
	public function add_message($attachment_id, $msg, $is_customer = true, $order = null)
	{
		global $wcfa_message_model;
		$this->set_last_interaction($attachment_id, $is_customer ? 'customer' : 'admin');
		return $wcfa_message_model->create($attachment_id, $msg, $is_customer, $order = null);
	}
	
	//setters & getters
	public function set_approval_status($attachment_id, $status = 2)
	{
		global $wpdb;
		if($result = $this->update_meta($attachment_id, "_approval_status", $status))
			$this->set_approval_date($attachment_id, current_time('mysql'));
		
		if(!isset($status) || $status == 2 || $status == "")
		{
			$this->set_last_interaction($attachment_id, 'admin');
			$this->set_approval_date($attachment_id, "");
		}
		else
			$this->set_last_interaction($attachment_id, 'customer');
				
		$args = array(
			'ID' => $attachment_id,
			'edit_date' => current_time('mysql'),
			'' => current_time( 'mysql', 1 )
		);
		
		$wpdb->query("UPDATE $wpdb->posts SET post_modified = '".current_time('mysql')."', post_modified_gmt = '".current_time('mysql', 1)."'  WHERE ID = {$attachment_id}" );
		
		return $result;
	}
	public function delete_all_attachments($order_id)
	{
		global $wcfa_upload_model;
		if(!$order_id)
			return;
		
		$attachments = $this->get_attachments($order_id);
		
		if(is_array($attachments) && !empty($attachments))
			foreach($attachments as $attachment)
			{
				$media_id = $attachment['media'];
				$attachment_id = $attachment['attachment']->ID;
				$this->delete_attachment($attachment_id);
				if($media_id)
					wp_delete_attachment($media_id, true);
			}
	}
	public function get_status_name($status_code)
	{
		$result = "";
		switch($status_code)
		{
			case 2: $result = esc_html__( 'Waiting for user approval', 'woocommerce-file-approval' ); break;
			case 1: $result = esc_html__( 'Approved', 'woocommerce-file-approval' ); break;
			case 0: $result = esc_html__( 'Rejected', 'woocommerce-file-approval' ); break;
		}
		
		return $result;
	}
	public function get_approval_status($attachment_id, $get_name = false) //0: Waiting, 1: Approved, 0: Rejected
	{
		$result = $this->get_meta($attachment_id, "_approval_status", true);
		$result = $result != "" ? $result : 2;
		return $get_name ? $this->get_status_name($result) : $result;
	}
	public function set_approval_date($attachment_id, $date)
	{
		return $this->update_meta($attachment_id, "_approval_date", $date);
	}
	public function get_approval_date($attachment_id)
	{
		return $this->get_meta($attachment_id, "_approval_date", true);
	}
	public function get_creation_date($attachment_obj_or_id, $format_date = true)
	{
		$obj = is_array($attachment_obj_or_id) && isset($attachment_obj_or_id['attachment']) ? $attachment_obj_or_id : $this->get_attachment($attachment_obj_or_id);
		if(!$obj || !$obj['attachment'])
			return "";
		$date = $obj['attachment']->post_date;
		
		$date_format = get_option( 'date_format' );
		$time_format = get_option( 'time_format' );
		
		return $format_date ? date_i18n($date_format." ".$time_format, strtotime($date)) : $date;
	}
	public function set_last_interaction($attachment_id, $value = null)
	{
		$value = !isset($value) ? 'admin' : $value;
		return $this->update_meta($attachment_id, "_last_interaction", $value); //Values: user || admin
	}
	public function get_last_interaction($attachment_id)
	{
		$result = $this->get_meta($attachment_id, "_last_interaction", true);
		return $result ? $result : 'admin';
	}
	public function set_notification($attachment_id, $name, $value = true)
	{
		if(!isset($value))
			return false;
		
		return $this->update_meta($attachment_id, "_notification_".$name, $value);
	}
	public function get_notification($attachment_id, $name)
	{
		$value = $this->get_meta($attachment_id, "_notification_".$name, true);
		return $value ? $value : false;
	}
	public function get_media($attachment_id)
	{
		return $this->get_meta($attachment_id, "_media_id", true);
	}
	public function set_media($attachment_id, $media_id)
	{
		return $this->update_meta($attachment_id, "_media_id", $media_id); 
	}
	function get_settings($attachment_id)
	{
		return $this->get_meta($attachment_id, "_settings", true);
	}
	function save_settings($attachment_id, $settings)
	{
		$this->update_meta($attachment_id, "_settings", $settings);
	}
	private function get_meta($id, $key, $is_single = true)
	{
		return get_post_meta($id, $key, $is_single);
	}
	private function update_meta($post_id, $key, $value)
	{
		return update_post_meta($post_id, $key, $value);
	}
}
?>