<?php 
namespace WCFA\classes\com;

class Message
{
	const ATTRIBUTES = array('is_customer_message' => true);

	public function __construct()
	{
		add_action( 'init', array(&$this, 'register_custom_post_type'), 0 );
		add_action( 'wp_ajax_wcfa_delete_single_message', array(&$this, 'ajax_delete_single_message'), 0 );
		add_action('wp_ajax_wcfa_delete_customer_file', array(&$this, 'ajax_delete_customer_file'));
		add_action('before_delete_post', array( &$this,'delete_all_files'), 10);
	}
	function register_custom_post_type() 
	{

		$labels = array(
			'name'                => _x( 'Message', 'Message', 'woocommerce-file-approval' ),
			'singular_name'       => _x( 'Message', 'Message', 'woocommerce-file-approval' ),
			'parent_item_colon'   =>esc_html__( 'Parent Item:', 'woocommerce-file-approval' ),
			'all_items'           =>esc_html__( 'All Messages', 'woocommerce-file-approval' ),
			'add_new_item'        =>esc_html__( 'Add Message', 'woocommerce-file-approval' ),
			'add_new'             =>esc_html__( 'Add Message', 'woocommerce-file-approval' ),
			'new_item'            =>esc_html__( 'New Message', 'woocommerce-file-approval' ),
			'edit_item'           =>esc_html__( 'Edit Message', 'woocommerce-file-approval' ),
			'update_item'         =>esc_html__( 'Update Message', 'woocommerce-file-approval' ),
			'view_item'           =>esc_html__( 'View Message', 'woocommerce-file-approval' ),
			'search_items'        =>esc_html__( 'Search Message', 'woocommerce-file-approval' ),
			'not_found'           =>esc_html__( 'Not found', 'woocommerce-file-approval' ),
			'not_found_in_trash'  =>esc_html__( 'Not found in Trash', 'woocommerce-file-approval' ),
		);
		$args = array(
			'label'               =>esc_html__( 'Message', 'woocommerce-file-approval' ),
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
		register_post_type( 'wcfa_message', $args );
		flush_rewrite_rules();
		
	}
	public function ajax_delete_customer_file()
	{
		$attachment_unique_value = isset($_POST['attachment_unique_value']) ? $_POST['attachment_unique_value'] : null;
		$message_id = isset($_POST['message_id']) ? $_POST['message_id'] : null;
		if(isset($message_id) && isset($attachment_unique_value))
		{
			$this->delete_file($message_id, $attachment_unique_value);
		}
		wp_die();
	}
	public function ajax_delete_single_message()
	{
		$id = filter_input( INPUT_GET, 'id', FILTER_VALIDATE_INT );
		if($id && wp_verify_nonce( wcfa_get_value_if_set($_GET, 'security', ""), 'wcfa_admin_order_page' ))
		{
			$this->delete_message($id);
		}
		wp_die();
	}
	public function create($parent_id, $msg, $is_customer = true, $order = null)
	{
		$name = "";
		$author_id = get_current_user_id();
		if($is_customer && $order)
		{
			$author_id = $order->get_user_id();
		}
		return wp_insert_post(array(
								'post_content' => $msg,
								'post_parent' => $parent_id,
								'post_type' => 'wcfa_message',
								'post_status' => 'publish',
								'post_author' => $author_id,
								'meta_input'    => array(
										'is_customer_message' => $is_customer
									),
								
								));
	}
	public function get_messages($parent_id)
	{
		$result = get_posts( array( 'numberposts' => -1, 
								  'post_parent' => $parent_id, 
								  'post_type'=> 'wcfa_message', 
								  'order' => 'ASC', 
								  'orderby' => 'date', 
								  'suppress_filters' => false ));
								  
		if($result)
		{
			foreach($result as $key => $message)
			{
				$result[$key]->attributes = array();
				foreach(self::ATTRIBUTES as $attibute_name => $is_single)
				{
					$result[$key]->attributes[$attibute_name] = get_post_meta($message->ID, $attibute_name, $is_single);
				}
			}
		}
		
		return $result;
	}
	public function delete_message($msg_id)
	{
		wp_delete_post($msg_id, true);
	}
	//Uploads
	public function get_files($message_id)
	{
		$upoad_dir = wp_upload_dir();
		$attachments = get_post_meta($message_id, 'wcfa_customer_file');
		$result = array();
		
		foreach((array)$attachments as $attachment)
			$result[$attachment] = $upoad_dir['baseurl'].'/'.$attachment;
		
		return $result;
	}
	public function delete_file($message_id, $attachment_unique_value)
	{
		global $wcfa_upload_model;
		
		//Update post meta 
		//wcfa_var_dump($message_id);
		//wcfa_var_dump($attachment_unique_value);
		$result = delete_post_meta($message_id, 'wcfa_customer_file', $attachment_unique_value);
		//wcfa_var_dump($result);
		
		//file delete 
		$upoad_dir = wp_upload_dir();
		$wcfa_upload_model->delete_file($attachment_unique_value);
	}
	public function add_file_path($message_id, $file_path)
	{
		add_post_meta($message_id, 'wcfa_customer_file', $file_path, false);
	}
	public function delete_all_files($message_id)
	{
		global $wcfa_upload_model;
		$message = get_post($message_id);
		if (!isset($message) || $message->post_type != 'wcfa_message')
			return;
		
		$attachments = get_post_meta($message_id, 'wcfa_customer_file');
		
		foreach((array)$attachments as $attachment)
			$wcfa_upload_model->delete_file($attachment); 
	}
}
?>