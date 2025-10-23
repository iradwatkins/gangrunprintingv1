<?php 
namespace WCFA\classes\admin;

use Automattic\WooCommerce\Utilities\OrderUtil;
use Automattic\WooCommerce\Internal\DataStores\Orders\CustomOrdersTableController;

class OrderPage
{
	//rplc: woocommerce-file-approval, wcfa, WCFA
	public function __construct()
	{
		add_action( 'add_meta_boxes', array( &$this, 'woocommerce_metaboxes' ));
		add_action( 'woocommerce_process_shop_order_meta', array( &$this, 'save_data' ), 5, 2 );	
	}
	function woocommerce_metaboxes() 
	{
		$screen = wc_get_container()->get( CustomOrdersTableController::class )->custom_orders_table_usage_is_enabled()
		? wc_get_page_screen_id( 'shop-order' )
		: 'shop_order';
		
		add_meta_box( 'woocommerce-file-approval', esc_html__('File approval area', 'woocommerce-file-approval'), array( &$this, 'render_approval_area' ), $screen, 'normal', 'default');
	}
	function render_approval_area($post_or_order_object) 
	{
		global $wcfa_media_model, $wcfa_html_model, $wcfa_order_model, $wcfa_attachment_model, $theorder;
		
		if(!$theorder)
			return;
		
		$order = $theorder;
		$order_id = $theorder->get_id();
		
		wp_enqueue_media();
		wp_register_script( 'wcfa-order-page', WCFA_PLUGIN_PATH.'/js/admin-order-page.js', array('jquery'));
		$js_options = array(
				'security' => wp_create_nonce('wcfa_admin_order_page'),
				'confirm_message' => esc_html__( 'Are you sure?', 'woocommerce-file-approval' ),
				'delete_attachment_confirm_message' => esc_html__( 'This action will delete the attachment and the associated message. Are you sure?', 'woocommerce-file-approval' ),
				'delete_message_confirm_message' => esc_html__( 'This action will delete message and it will not be possible to restore. Are you sure?', 'woocommerce-file-approval' ),
				'select_file_message' => esc_html__( 'In the following list are shown ONLY the media associate to this order. Use the "Upload files" tab to upload new files.', 'woocommerce-file-approval' ),
				'show_msg_area_message' => esc_html__( 'Show messages', 'woocommerce-file-approval' ),
				'hide_msg_area_message' => esc_html__( 'Hide messages', 'woocommerce-file-approval' ),
				'customer_file_delete_confirm_message' => __('Delete file?','woocommerce-file-approval'),
				'order_id' => $order_id
			);
		wp_localize_script( 'wcfa-order-page', 'wcfa', $js_options );
		wp_enqueue_script( 'wcfa-order-page');
		
		wp_enqueue_style('wcfa-order-page', WCFA_PLUGIN_PATH.'/css/admin-order-page.css');
		wp_enqueue_style('wcfa-admin-toggle', WCFA_PLUGIN_PATH.'/css/com-admin-toggle.css');
		wp_enqueue_style('wcfa-tooltip', WCFA_PLUGIN_PATH.'/css/com-tooltip.css');
		$attachments = $wcfa_attachment_model->get_attachments($order_id);
		
		$js_src = includes_url('js/tinymce/') . 'tinymce.min.js';
		wp_enqueue_script( 'wcfa-editor', $js_src);
		?>
		<div id="wcfa-main-container wcfa-clearfix">
			<div id="wcfa-managment-area">
				<p><?php esc_html_e('Once you added an attachment or added a new message, click the "Save" button or the "Update" order button to save the new changes.', 'woocommerce-file-approval'); ?></p>
				<div id="wcfa-attachment-container" >
					<?php foreach($attachments as $attachment)
							$wcfa_html_model->render_order_page_file_data_container($order_id, $attachment); ?>
				</div>
				<div id="wcfa-actions">
					<button type='button' class="wcfa-button-primary button-primary wcfa-selection-button" id="wcfa-media-manager"><?php esc_html_e('Add an new attachment', 'woocommerce-file-approval'); ?></button>
					<img id="wcfa-files-spin-loader" class="wcfa-spin-loader" src="<?php echo WCFA_PLUGIN_PATH ?>/img/spin_icon.gif"></img>
				</div>
			</div>
			<button type='submit' class="wcfa-button-primary button-primary" id="wcfa-save-button"><?php esc_html_e('Save', 'woocommerce-file-approval'); ?></button>
		</div>
		<?php 
	}
	function save_data( $order_id, $post_obj ) 
	{
		global $wcfa_order_model;
		$wcfa_order_model->save_attachments($_POST, $order_id);
	}
}
?>