<?php 
namespace WCFA\classes\admin;

class SettingsPage
{
	public function __construct()
	{
		
	}
	
	//rplc: woocommerce-file-approval, wcfa, WCFA
	public function render_page()
	{
		
		global $wcfa_option_model, $wcfa_order_model;
		
		//Assets
		wp_enqueue_style( 'wcfa-admin-common', WCFA_PLUGIN_PATH.'/css/admin-common.css');
		wp_enqueue_style( 'wcfa-admin-toggle', WCFA_PLUGIN_PATH.'/css/com-admin-toggle.css');
		wp_enqueue_style( 'wcfa-admin-settings-page', WCFA_PLUGIN_PATH.'/css/admin-settings-page.css');
		
		wp_enqueue_script( 'wcfa-admin-settings-page', WCFA_PLUGIN_PATH.'/js/admin-settings-page.js', array('jquery'));
		
		//Save
		if(isset($_POST['wcfa_options']))
		{
			$new_options = $_POST['wcfa_options'];
			$old_options = $wcfa_option_model->get_options();
			//Schedule managment update
			$new_update_frequency = wcfa_get_value_if_set($new_options, array('email','remider_interval'), "never");
			$old_update_frequency = wcfa_get_value_if_set($old_options, array('email','remider_interval'), "never");
			if($new_update_frequency != $old_update_frequency)
				wp_clear_scheduled_hook( 'wcfa_cron_tick' );
			
			$wcfa_option_model->save_options($new_options);
		}
		
		//Load
		$options = $wcfa_option_model->get_options();
		$allowed_tags = array('br' => array(), 'p' => array(), 'strong' => array());
		$order_statuses = wc_get_order_statuses();
		
		?>
		<?php if ($_SERVER['REQUEST_METHOD'] == 'POST'): ?>
			<div class="notice notice-success is-dismissible">
				 <p><?php esc_html_e('Saved successfully!', 'woocommerce-file-approval'); ?></p>
			</div>
		<?php endif; ?>
		<div class="wrap white-box">
			<!-- <form action="options.php" method="post" > -->
				<form action="" method="post" >
				<h2 class="wcfa_section_title wcfa_no_margin_top"><?php esc_html_e('General', 'woocommerce-file-approval');?></h2>
						
				<h3><?php esc_html_e('Admin area', 'woocommerce-file-approval');?></h3>
				
				<h4><?php esc_html_e('Order details & Orders list page', 'woocommerce-file-approval');?></h4>
				<div class="wcfa_option_group wcfa_half">
					<label class="wcfa_input_label"><?php esc_html_e('Auto collapse attachments area in the Order details page', 'woocommerce-file-approval');?></label>
					<p><?php esc_html_e("The attachments area will be already collapsed hiding the messages thread.", 'woocommerce-file-approval');?> </p>
					<?php  $selected = wcfa_get_value_if_set($options, array('admin', 'order_details', 'auto_collapse'), false) ? " checked='checked' " : " "; ?>
					<label class="switch">
					  <input type="checkbox" class="wcfa_toggle" name="wcfa_options[admin][order_details][auto_collapse]" value="true" <?php esc_html_e($selected); ?>>
					  <span class="slider"></span>
					</label>						
				</div>
				<div class="wcfa_option_group wcfa_half">
					<label class="wcfa_input_label"><?php esc_html_e('Hide Attachments column content in the Orders list page', 'woocommerce-file-approval');?></label>
					<p><?php esc_html_e("The attachment column will be hidden by default. A 'Details' button will be displayed instead that will display the content of the column if clicked.", 'woocommerce-file-approval');?> </p>
					<?php  $selected = wcfa_get_value_if_set($options, array('admin', 'orders_list', 'hide_attachments_column_content'), false) ? " checked='checked' " : " "; ?>
					<label class="switch">
					  <input type="checkbox" class="wcfa_toggle" name="wcfa_options[admin][orders_list][hide_attachments_column_content]" value="true" <?php esc_html_e($selected); ?>>
					  <span class="slider"></span>
					</label>						
				</div>
					

				<h3><?php esc_html_e('Frontend area', 'woocommerce-file-approval');?></h3>
				<h4><?php esc_html_e('Order details page', 'woocommerce-file-approval');?></h4>
				<?php  $selected = wcfa_get_value_if_set($options, array('fronted', 'order_details', 'position'), 'woocommerce_order_details_after_order_table'); ?>
				<div class="wcfa_option_group wcfa_half">
					<label><?php esc_html_e('Attachments area position', 'woocommerce-file-approval');?></label>
					<p><?php esc_html_e("The attachments area can be rendered before or after the order items table.", 'woocommerce-file-approval');?> </p>
					<select name="wcfa_options[fronted][order_details][position]" >	
						<option value="woocommerce_order_details_after_order_table" <?php  selected($selected, 'woocommerce_order_details_after_order_table'); ?>><?php esc_html_e('After order items table', 'woocommerce-file-approval');?></option>
						<option value="woocommerce_order_details_before_order_table" <?php  selected($selected, 'woocommerce_order_details_before_order_table'); ?>><?php esc_html_e('Before order items table', 'woocommerce-file-approval');?></option>
					</select>
				</div>
				<div class="wcfa_option_group wcfa_half">
					<label class="wcfa_input_label"><?php esc_html_e('Only logged users can access the approval area on the Thank you page.', 'woocommerce-file-approval');?></label>
					<p><?php esc_html_e("Only logged will be able to access the approval area displayed in the Thank you page and the My Account -> Orders -> Order details page. This option will restrict the access to the Thank you page file approval area.", 'woocommerce-file-approval');?> </p>
					<?php  $selected = wcfa_get_value_if_set($options, array('fronted', 'order_details', 'only_logged_users'), false) ? " checked='checked' " : " "; ?>
					<label class="switch">
					  <input type="checkbox" class="wcfa_toggle" name="wcfa_options[fronted][order_details][only_logged_users]" value="true" <?php esc_html_e($selected); ?>>
					  <span class="slider"></span>
					</label>						
				</div>
				
				<div class="wcfa_option_group wcfa_half">
					<label class="wcfa_input_label"><?php esc_html_e('Aproval controller style', 'woocommerce-file-approval');?></label>
					<p><?php esc_html_e("Select which controller has to be used to allow customer the approval of the files.", 'woocommerce-file-approval');?> </p>
					<?php  $value = wcfa_get_value_if_set($options, array('fronted', 'order_details', 'approval_button_style'), "slider"); ?>
						<select name="wcfa_options[fronted][order_details][approval_button_style]">
							<option value="slider"  <?php  selected($value, 'slider'); ?>><?php esc_html_e('Slider', 'woocommerce-file-approval');?></option>
							<option value="buttons" <?php  selected($value, 'buttons'); ?>><?php esc_html_e('Buttons', 'woocommerce-file-approval');?></option>
							
						</select>					
				</div>
				
				<div class="wcfa_option_group wcfa_half">
					<?php  $selected = wcfa_get_value_if_set($options, array('fronted', 'order_details', 'approval_switcher_initial_click_status'), 'approved'); ?>
					<label><?php esc_html_e('Slider: first click action.', 'woocommerce-file-approval');?></label>
					<p><?php esc_html_e("In case you slected the Slider as controller, select which is the status assign to the file when first clicking the slider.", 'woocommerce-file-approval');?> </p>
					<select name="wcfa_options[fronted][order_details][approval_switcher_initial_click_status]" >	
						<option value="approved" <?php  selected($selected, 'approved'); ?>><?php esc_html_e('Approved', 'woocommerce-file-approval');?></option>
						<option value="rejected" <?php  selected($selected, 'rejected'); ?>><?php esc_html_e('Rejected', 'woocommerce-file-approval');?></option>
					</select>
				</div>
				
				<h4><?php esc_html_e('File attachments for customer reply messages', 'woocommerce-file-approval');?></h4>
				<p><?php esc_html_e("This option can eventually be overridden in the admin order page for each specific file attachment created.", 'woocommerce-file-approval');?> </p>
				<div class="wcfa_option_group">
					<label><?php esc_html_e("Enable file attachments for customer reply messages", 'woocommerce-file-approval');?></label>
					<p><?php esc_html_e("Customer will be able to attach files to the reply messages", 'woocommerce-file-approval');?> </p>
					<?php  $selected = wcfa_get_value_if_set($options, array('fronted', 'attachments', 'enable'), false) ? " checked='checked' " : " ";; ?>
					<label class="switch">
					  <input type="checkbox" class="wcfa_toggle master_option" name="wcfa_options[fronted][attachments][enable]" data-related-id="attachments" value="true" <?php esc_html_e($selected); ?>>
					  <span class="slider"></span>
					</label>						
				</div>
				<div class="master_related_attachments wcfa_master_related">
						<div class="wcfa_option_group wcfa_one_third">
							<label class="wcfa_input_label"><?php esc_html_e('Number of uploadable files', 'woocommerce-file-approval');?></label>
							<p><?php esc_html_e('Specify the number of files the customer can upload.', 'woocommerce-file-approval');?></p>
							<?php  $value = wcfa_get_value_if_set($options, array('fronted', 'attachments', 'num_of_files'), 1); ?>
							<input type="number" step="1" min="1" name="wcfa_options[fronted][attachments][num_of_files]"  value="<?php esc_attr_e($value); ?>"></input>
						</div>
						<div class="wcfa_option_group wcfa_one_third">
							<label class="wcfa_input_label"><?php esc_html_e('Allowed file types', 'woocommerce-file-approval');?></label>
							<p><?php esc_html_e('Specify which file type(s) are allowed. Leave empty to allow all file types. In the case of multiple file types, specify extension separating value by a comma. Ex.: ".jpg, .pdf, .png".', 'woocommerce-file-approval');?></p>
							<?php  $value = wcfa_get_value_if_set($options, array('fronted', 'attachments', 'allowed_types'), ""); ?>
							<input type="text" name="wcfa_options[fronted][attachments][allowed_types]"  value="<?php esc_attr_e($value); ?>" placeholder=".jpg, .pdf, .png"></input>
						</div>
						<div class="wcfa_option_group wcfa_one_third">
							<label class="wcfa_input_label"><?php esc_html_e('Max file size', 'woocommerce-file-approval');?></label>
							<p><?php esc_html_e('Specify the max size of the uploadable files. Size is expressed in Kb.', 'woocommerce-file-approval');?></p>
							<?php  $value = wcfa_get_value_if_set($options, array('fronted', 'attachments', 'max_file_size'), 5120); ?>
							<input type="number" step="1" min="1" name="wcfa_options[fronted][attachments][max_file_size]"  value="<?php esc_attr_e($value); ?>"></input>
						</div>
				</div>
					
					
					
				<h3><?php esc_html_e('Automatic approval', 'woocommerce-file-approval');?></h3>
				<div class="wcfa_option_group wcfa_half">
					<label><?php esc_html_e('Time span (hours)', 'woocommerce-file-approval');?></label>
					<p><?php echo wp_kses(__("If the user doens't take any action after a file has been attached to the order, the attachment can be automatically approved by the system. Select the time span (expressed in <strong>hours</strong>) after which the attachment will be approved.<br/><br/><strong>Note:</strong> leave empty or set to 0 to disable this option.", 'woocommerce-file-approval'), $allowed_tags);?> </p>
					<input type="number" step="1" min="0" name="wcfa_options[automatic_approval][time_span]" value="<?php esc_attr_e(wcfa_get_value_if_set($options, array('automatic_approval', 'time_span'), "")); ?>"></input>
				</div>
				<div class="wcfa_option_group wcfa_half">
					<label><?php esc_html_e('Order statuses to exclude', 'woocommerce-file-approval');?></label>
					<p><?php echo wp_kses(__("The orders marked with the selected statuses will not be considered", 'woocommerce-file-approval'), $allowed_tags);?> </p>
					<?php  
						$statuses_to_exclude = wcfa_get_value_if_set($options, array('automatic_approval', 'order_statuses_to_exclude'), array());
						foreach($order_statuses as $status_slug => $status_name): ?>
						<div class="wcfa_checkbox_container">
							<input type="checkbox" name="wcfa_options[automatic_approval][order_statuses_to_exclude][]" value="<?php echo $status_slug; ?>" <?php checked(in_array($status_slug, $statuses_to_exclude)); ?>><span class="wcfa_checkbox_label"><?php echo $status_name; ?></span>
						</div>
					<?php endforeach; ?>
				</div>
				
				<h3><?php esc_html_e('Order status change', 'woocommerce-file-approval');?></h3>
				<div class="wcfa_option_group wcfa_one_third">
					<?php  $selected = wcfa_get_value_if_set($options, array('order_status_change', 'switch_policy'), 'disabled'); ?>
					<label><?php esc_html_e('Order status change policy', 'woocommerce-file-approval');?></label>
					<p><?php esc_html_e("In case of file approval or rejection, the order can be switched to the selected status", 'woocommerce-file-approval');?> </p>
					<select name="wcfa_options[order_status_change][switch_policy]" >	
						<option value="disabled" <?php  selected($selected, 'disabled'); ?>><?php esc_html_e('Disable this feature', 'woocommerce-file-approval');?></option>
						<option value="on_approval" <?php  selected($selected, 'on_approval'); ?>><?php esc_html_e('On approval', 'woocommerce-file-approval');?></option>
						<option value="on_rejection" <?php  selected($selected, 'on_rejection'); ?>><?php esc_html_e('On rejection', 'woocommerce-file-approval');?></option>
					</select>
				</div>
				<div class="wcfa_option_group wcfa_one_third">
					<label><?php esc_html_e('Order status', 'woocommerce-file-approval');?></label>
					<p><?php echo wp_kses(__("Selet which status has to be assigned to the order. If none is selected, the option will not be applied.", 'woocommerce-file-approval'), $allowed_tags);?> </p>
					<?php  
						$order_statuse_to_assign = wcfa_get_value_if_set($options, array('order_status_change', 'order_statuse_to_assign'), "");
						foreach($order_statuses as $status_slug => $status_name): ?>
						<div class="wcfa_checkbox_container">
							<input type="checkbox" class="wcfa_order_status_change_status_selector" name="wcfa_options[order_status_change][order_statuse_to_assign]" value="<?php echo $status_slug; ?>" <?php checked($status_slug == $order_statuse_to_assign); ?>><span class="wcfa_checkbox_label"><?php echo $status_name; ?></span>
						</div>
					<?php endforeach; ?>
				</div>
				<div class="wcfa_option_group wcfa_one_third">
					<?php  $selected = wcfa_get_value_if_set($options, array('order_status_change', 'number_of_files'), 'at_least_one'); ?>
					<label><?php esc_html_e('Number of files threashold', 'woocommerce-file-approval');?></label>
					<p><?php esc_html_e("Select if the order status has to be switched if at least one or all files have been approved/rejected", 'woocommerce-file-approval');?> </p>
					<select name="wcfa_options[order_status_change][number_of_files]" >	
						<option value="at_least_one" <?php  selected($selected, 'at_least_one'); ?>><?php esc_html_e('At least one', 'woocommerce-file-approval');?></option>
						<option value="all" <?php  selected($selected, 'all'); ?>><?php esc_html_e('All', 'woocommerce-file-approval');?></option>
					</select>
				</div>
				
				
				<h2 class="wcfa_section_title"><?php esc_html_e('Email notification', 'woocommerce-file-approval');?></h2>
				<h3><?php esc_html_e('Admin', 'woocommerce-file-approval');?></h3>
				<div class="wcfa_option_group wcfa_one_third">
					<label class="wcfa_input_label"><?php esc_html_e('Disable admin notifications', 'woocommerce-file-approval');?></label>
					<p><?php esc_html_e("Disable email notification sent to the admin after a message has been posted by the user or after an attachment has been approved/rejected.", 'woocommerce-file-approval');?> </p>
					<?php  $selected = wcfa_get_value_if_set($options, array('email', 'disable_admin_notification'), false) ? " checked='checked' " : " "; ?>
					<label class="switch">
					  <input type="checkbox" class="wcfa_toggle" name="wcfa_options[email][disable_admin_notification]" value="true" <?php esc_html_e($selected); ?>>
					  <span class="slider"></span>
					</label>						
				</div>
				<div class="wcfa_option_group wcfa_one_third">
					<label class="wcfa_input_label"><?php esc_html_e('Disable customer notifications', 'woocommerce-file-approval');?></label>
					<p><?php esc_html_e("Disable email notification sent to the customer after a message has been posted by the admin or after an new attachment has created.", 'woocommerce-file-approval');?> </p>
					<?php  $selected = wcfa_get_value_if_set($options, array('email', 'disable_customer_notification'), false) ? " checked='checked' " : " "; ?>
					<label class="switch">
					  <input type="checkbox" class="wcfa_toggle" name="wcfa_options[email][disable_customer_notification]" value="true" <?php esc_html_e($selected); ?>>
					  <span class="slider"></span>
					</label>						
				</div>
				<div class="wcfa_option_group wcfa_one_third">
					<label><?php esc_html_e('Default recipient override', 'woocommerce-file-approval');?></label>
					<p><?php esc_html_e("By default notifications are sent to the admin email address set through the WooCommerce -> Settings -> Email area. Using this option you can define custom recipients. You can also define multiple recipients, for example: admin@domain.com, admin2,@domain.com.", 'woocommerce-file-approval');?> </p>
					<input type="text" placeholder="<?php esc_attr_e('Example of multiple recipients: admin@domain.com, admin2,@domain.com', 'woocommerce-file-approval');?>" class="wcfa-text-input" name="wcfa_options[email][recipient]" value="<?php esc_attr_e(wcfa_get_value_if_set($options, array('email', 'recipient'), "")); ?>">	
				</div>
				<div class="wcfa_option_group wcfa_half">
					<label><?php esc_html_e('"From" name', 'woocommerce-file-approval');?></label>
					<p><?php echo sprintf(esc_html__("If left empty, the From name used in the email will be the site name: %s.", 'woocommerce-file-approval'), get_bloginfo('name'));?> </p>
					<input type="text" placeholder="<?php echo get_bloginfo('name'); ?>" class="wcfa-text-input" name="wcfa_options[email][from_name]" value="<?php esc_attr_e(wcfa_get_value_if_set($options, array('email', 'from_name'), "")); ?>">	
				</div>
				<div class="wcfa_option_group wcfa_half">
					<label><?php esc_html_e('"From" email address', 'woocommerce-file-approval');?></label>
					<p><?php echo sprintf(wp_kses(__("If left empty, it will be used a generic noreply address.<br><br><strong>NOTE:</strong> some installation <strong>doesn't allow</strong> to modify the from email address for security reasons, so this option might be ineffective.", 'woocommerce-file-approval'), array('strong'=> array(), 'br'=>array())), get_bloginfo('name'));?> </p>
					<input type="text" placeholder="noreply@yourdomain.com" class="wcfa-text-input" name="wcfa_options[email][from_email]" value="<?php esc_attr_e(wcfa_get_value_if_set($options, array('email', 'from_email'), "")); ?>">	
				</div>
				<h3><?php esc_html_e('Customer', 'woocommerce-file-approval');?></h3>
				<h4><?php esc_html_e('Unapproved files reminder', 'woocommerce-file-approval');?></h4>
				<div class="wcfa_option_group wcfa_half">				
						<label class="wcfa_input_label"><?php esc_html_e('Frequency', 'woocommerce-file-approval');?></label>
						<p><?php echo sprintf(wp_kses(__("Frequency at which by the plugin sends reminder. The text of the notification email can be customized through the Text menu.", 'woocommerce-file-approval'), array('strong'=> array(), 'br'=>array())), get_bloginfo('name'));?> </p>
						<?php  $value = wcfa_get_value_if_set($options, array('email','frequency'), "never"); ?>
						<select name="wcfa_options[email][frequency]">
							<option value="never"  <?php  selected($value, 'never'); ?>><?php esc_html_e('Never', 'woocommerce-file-approval');?></option>
							<option value="twicedaily" <?php  selected($value, 'twicedaily'); ?>><?php esc_html_e('Every 12 hours', 'woocommerce-file-approval');?></option>
							<option value="daily" <?php  selected($value, 'daily'); ?>><?php esc_html_e('Every 24 hours', 'woocommerce-file-approval');?></option>
							<option value="weekly" <?php  selected($value, 'weekly'); ?>><?php esc_html_e('Every 7 Days', 'woocommerce-file-approval');?></option>
						</select>
				</div>
				<div class="wcfa_option_group wcfa_half">				
						<label class="wcfa_input_label"><?php esc_html_e('Time span', 'woocommerce-file-approval');?></label>
						<p><?php echo sprintf(wp_kses(__("Select the time span the plugin has to consider. ", 'woocommerce-file-approval'), array('strong'=> array(), 'br'=>array())), get_bloginfo('name'));?> </p>
						<?php  $value = wcfa_get_value_if_set($options, array('email','time_span'), "never"); ?>
						<select name="wcfa_options[email][time_span]">
							<option value="twicedaily" <?php  selected($value, 'twicedaily'); ?>><?php esc_html_e('12 hours', 'woocommerce-file-approval');?></option>
							<option value="daily" <?php  selected($value, 'daily'); ?>><?php esc_html_e('24 hours', 'woocommerce-file-approval');?></option>
							<option value="wcfa_3_days" <?php  selected($value, 'wcfa_3_days'); ?>><?php esc_html_e('3 Days', 'woocommerce-file-approval');?></option>
							<option value="weekly" <?php  selected($value, 'weekly'); ?>><?php esc_html_e('7 Days', 'woocommerce-file-approval');?></option>
						</select>
						<h5><?php esc_html_e('Example', 'woocommerce-file-approval');?></h5>
						<p>
						<?php _e("Selecting 12 hours option, the reminder will be sent for orders that have at least one file waiting for the approval for 12 hours from its creation (when the admin created the attachment)", 'woocommerce-file-approval')?>
						</p>
				</div>
				<div class="wcfa_option_group wcfa_half">
					<label><?php esc_html_e('Order statuses to exclude', 'woocommerce-file-approval');?></label>
					<p><?php echo wp_kses(__("The orders marked with the selected statuses will not be considered", 'woocommerce-file-approval'), $allowed_tags);?> </p>
					<?php  
						$statuses_to_exclude = wcfa_get_value_if_set($options, array('email', 'order_statuses_to_exclude'), array());
						foreach($order_statuses as $status_slug => $status_name): ?>
						<div class="wcfa_checkbox_container">
							<input type="checkbox" name="wcfa_options[email][order_statuses_to_exclude][]" value="<?php echo $status_slug; ?>" <?php checked(in_array($status_slug, $statuses_to_exclude)); ?>><span class="wcfa_checkbox_label"><?php echo $status_name; ?></span>
						</div>
					<?php endforeach; ?>
				</div>
				
				<div class="wcfa_option_group wcfa_one_third">
					<label><?php esc_html_e('Attach files to notification', 'woocommerce-file-approval');?></label>
					<p><?php echo wp_kses(__("Files will be attached to the notification email sent to the customer", 'woocommerce-file-approval'), $allowed_tags);?> </p>
					<label class="switch">
					  <input type="checkbox" class="wcfa_toggle" name="wcfa_options[email][attach_files_to_notification_email]" value="true" <?php checked(wcfa_get_value_if_set($options, array('email', 'attach_files_to_notification_email'), false), "true"); ?>>
					  <span class="slider"></span>
					</label>		
				</div>
				<h4><?php esc_html_e('New attachments notification', 'woocommerce-file-approval');?></h4>
				<div class="wcfa_option_group wcfa_half">				
						<label class="wcfa_input_label"><?php esc_html_e('Cumulative notification', 'woocommerce-file-approval');?></label>
						<p><?php echo sprintf(wp_kses(__("By default, if multiple files are attached to an order, the plugin will send one notification for each file. Enabling this option, the plugin will send a notification for all files.", 'woocommerce-file-approval'), array('strong'=> array(), 'br'=>array())), get_bloginfo('name'));?> </p>
						<label class="switch">
					  <input type="checkbox" class="wcfa_toggle" name="wcfa_options[email][enable_customer_cumulative_notification]" value="true" <?php checked(wcfa_get_value_if_set($options, array('email', 'enable_customer_cumulative_notification'), false), "true"); ?>>
					  <span class="slider"></span>
					</label>		
				</div>
				
				<h3><?php esc_html_e('Image preview - lightbox', 'woocommerce-file-approval');?></h3>
				<div class="wcfa_option_group wcfa_half">				
						<label class="wcfa_input_label"><?php esc_html_e('Disable lightbox preview', 'woocommerce-file-approval');?></label>
						<p><?php echo sprintf(wp_kses(__("Some themes (for example Flatsome) are including a lightbox library that might interfere with the one included by the plugin. If you are experiencing any visual issue, disable the lightbox preview embedded in this plugin through this option.", 'woocommerce-file-approval'), array('strong'=> array(), 'br'=>array())), get_bloginfo('name'));?> </p>
						<?php  $selected = wcfa_get_value_if_set($options, array('lighbox', 'disable'), false) ? " checked='checked' " : " "; ?>
						<label class="switch">
						  <input type="checkbox" class="wcfa_toggle" name="wcfa_options[lighbox][disable]" value="true" <?php esc_html_e($selected); ?>>
						  <span class="slider"></span>
						</label>	
					</div>				
				<p class="submit">
					<input name="Submit" type="submit" class="button-primary" value="<?php esc_attr_e('Save', 'woocommerce-file-approval'); ?>" />
				</p>		
				
			</form>			
		</div>
		<?php 
	}
}
?>