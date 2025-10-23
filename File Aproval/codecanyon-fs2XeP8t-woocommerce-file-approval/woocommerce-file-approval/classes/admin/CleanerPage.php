<?php
namespace WCFA\classes\admin;

class CleanerPage
{
	public function __construct()
	{
		
	}
	public function render_page()
	{
		global $wcfa_order_model;
		
		wp_enqueue_style( 'wcfa-admin-cleaner-page-picker', WCFA_PLUGIN_PATH.'/css/vendor/pickdatetime/classic.css');
		wp_enqueue_style( 'wcfa-admin-cleaner-page-pickerdate', WCFA_PLUGIN_PATH.'/css/vendor/pickdatetime/classic.date.css');
		wp_enqueue_style( 'wcfa-admin-common', WCFA_PLUGIN_PATH.'/css/admin-common.css');
		wp_enqueue_style( 'wcfa-admin-cleaner-page', WCFA_PLUGIN_PATH.'/css/admin-cleaner-page.css');
				
		wp_enqueue_script( 'wcfa-admin-cleaner-page-picker', WCFA_PLUGIN_PATH.'/js/vendor/pickdatetime/picker.js', array('jquery') );
		wp_enqueue_script( 'wcfa-admin-cleaner-page-pickerdate', WCFA_PLUGIN_PATH.'/js/vendor/pickdatetime/picker.date.js', array('jquery') );
		wp_register_script( 'wcfa-admin-cleaner-page', WCFA_PLUGIN_PATH.'/js/admin-cleaner-page.js', array('jquery') );
		$js_options = array(
			'order_statuses_error' => esc_html__( 'Please select at least one order status!', 'woocommerce-file-approval' ),
			'date_error' => esc_html__( 'Date field cannot be empty!', 'woocommerce-file-approval' ),
			'order_detected_msg' => esc_html__( 'Order to process: ', 'woocommerce-file-approval' ),
			'done_msg' => esc_html__( 'Done!', 'woocommerce-file-approval' )
		);
		wp_localize_script( 'wcfa-admin-cleaner-page', 'wcfa', $js_options );
		wp_enqueue_script( 'wcfa-admin-cleaner-page' );
		
		?>
		<?php if ($_SERVER['REQUEST_METHOD'] == 'POST'): ?>
			<div class="notice notice-success is-dismissible">
				 <p><?php esc_html_e('Saved successfully!', 'woocommerce-file-approval'); ?></p>
			</div>
		<?php endif; ?>
		<div class="white-box">
			<h2 class="wcfa_section_title wcfa_no_margin_top"><?php esc_html_e('Cleaner', 'woocommerce-file-approval');?></h3>
					<p><?php esc_html_e("This tool allows you to delete files attachments associated with orders older than a given date and belonging to the chosen statuses.", 'woocommerce-file-approval');?></p>
					
					<div id="wcfa_settings">
						<h3><?php esc_html_e('Order statuses', 'woocommerce-file-approval');?></h3>
						<p><?php esc_html_e("Select which order statuses has to be considered", 'woocommerce-file-approval');?></p>
						<div class="wcfa_option_group">
						<?php $wc_statuses = $wcfa_order_model->get_available_order_statuses(); 
							foreach($wc_statuses as $wc_status_code => $status_name): ?>
							<div class="wcfa_checkbox_container">
								<input type="checkbox" class="wcfa_order_status wcfa_option_checbox_field" checked="checked" value="<?php echo $wc_status_code;?>"><?php echo $status_name; ?></input>
							</div>	
							<?php endforeach;?>
						</div>
						
						<h3><?php esc_html_e('Date', 'woocommerce-file-approval');?></h3>
						<p><?php esc_html_e("Only files associated with orders older than the selected date will be deleted. Selected date will be included.", 'woocommerce-file-approval');?></p>
						<div class="wcfa_option_group">
						<input type="text" id="wcfa_start_date" class="wcfa_date_selector"></input>
						</div>
					</div>
					
					<div id="wcfa_progess_display">
						<h3><?php esc_html_e('Processing', 'woocommerce-file-approval');?></h3>
						<div id="progress-bar-container">
							<div id="progress-bar-background">
								<div id="progress-bar"><div id="percentage-text"></div>
								</div>																
							</div>
							<div id="notice-box"></div>				
						</div>	
					</diV>
					
				<p class="submit">
					<button class="button-primary" id="wcfa_start_process" ><?php esc_attr_e('Start', 'woocommerce-file-approval'); ?></button>
					<button class="button-primary" id="wcfa_reload_process" ><?php esc_attr_e('Clean more', 'woocommerce-file-approval'); ?></button>
				</p>
			<!-- </form>-->		
		</div>
		<?php
	}
}
?>