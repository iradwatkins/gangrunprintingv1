<?php 
namespace WCFA\classes\admin;

class OrdersListPage
{
	public function __construct()
	{
		//HPOS 
		add_action( 'woocommerce_shop_order_list_table_custom_column', array($this, 'add_info_to_column'),10, 2 ); 
		add_filter( 'woocommerce_shop_order_list_table_columns', array($this, 'add_new_column'), 15 ); 
		//
		add_action( 'manage_edit-shop_order_columns', array( &$this, 'add_new_column'), 20, 1 );						 //Same for HPOS
		add_action( 'manage_shop_order_posts_custom_column', array( &$this, 'add_info_to_column'), 10,2);				 //Same for HPOS
	}
	//Order list columns
	function add_new_column($columns)
	{

		wp_enqueue_style('wcfa-orders-list', WCFA_PLUGIN_PATH.'/css/admin-orders-list-page.css');
		wp_enqueue_script('wcfa-orders-list', WCFA_PLUGIN_PATH.'/js/admin-orders-list-page.js', array('jquery'));
	
		$columns["wcfa_attachment_info"] = __('Attachments', 'woocommerce-file-approval');
		
		return $columns;			
	}
	//Order list columns
	function add_info_to_column($column, $order_id_or_object)
	{ 
		global $wcfa_attachment_model, $wcfa_option_model;
		
		$options = $wcfa_option_model->get_options();
		$order_id = is_object($order_id_or_object) ? $order_id_or_object->get_id() : $order_id_or_object;
		$hide = wcfa_get_value_if_set($options, array('admin', 'orders_list', 'hide_attachments_column_content'), false) == "true";
		switch ( $column ) 
		{
			case "wcfa_attachment_info" : 
				
				$attachments = $wcfa_attachment_model->get_attachments($order_id);
				
				if(count($attachments) == 0): ?>
						<span class="wcfa-text-display"><span class="wcfa-text-title"><?php esc_html_e('-', 'woocommerce-file-approval'); ?></span> 
				<?php else: ?>
				
				<?php if($hide): ?>
				<button class="button wcfa-button-details" data-id="<?php echo $order_id; ?>"><?php esc_html_e('Details', 'woocommerce-file-approval'); ?></button>
				<?php endif;?>
				<div class="wcfa-attachment-container <?php echo $hide ? "wcfa-hide" : ""; ?>" id="wcfa-container-<?php echo $order_id;?>">
				<?php	foreach($attachments as $attachment):
						$media_id = $attachment['media'];
						$attachment_id = $attachment['attachment']->ID;
						$title = wcfa_get_value_if_set($attachment, array('settings', 'title'), "")
					?>
						<span class="wcfa-text-display"><span class="wcfa-text-title"><?php echo $title; ?></span> 
						<span class="wcfa-text-body wcfa-status-text wcfa-status-text-<?php echo wcfa_get_value_if_set($attachment, array('attributes','status_code'), 2);?>"><?php echo wcfa_get_value_if_set($attachment, array('attributes','status'), esc_html__( 'Waiting for user approval', 'woocommerce-file-approval' )); ?></span></span>
			<?php endforeach; ?>
				</div>
			<?php endif; 
			break; 
			
			
		}
			
	}
}
?>