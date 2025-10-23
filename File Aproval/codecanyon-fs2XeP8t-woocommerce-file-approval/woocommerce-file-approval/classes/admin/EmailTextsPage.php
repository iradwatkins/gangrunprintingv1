<?php 
namespace WCFA\classes\admin;

class EmailTextsPage
{
	public function __construct()
	{
		
	}
	//rplc: wcfa-woocommerce-file-approval, wcfa, WCFA
	public function render_page()
	{
		global $wcfa_order_model, $wcfa_option_model, $wcfa_wpml_model;
		
		//Assets
		wp_enqueue_style( 'wcfa-admin-common', WCFA_PLUGIN_PATH.'/css/admin-common.css');
		wp_enqueue_style( 'wcfa-admin-email-settings', WCFA_PLUGIN_PATH.'/css/admin-email-settings-page.css');
		
		if(isset($_POST['submit']))
		{
			$wcfa_option_model->save_email_texts($_POST['wcfa_email_texts']);
		}
		$langs =  $wcfa_wpml_model->get_langauges_list();
		$texts = $wcfa_option_model->get_email_texts(); 
		
		?>
		<div class="wrap white-box">
				<form action="" method="post" >
					<h2 class="wcfa_section_title wcfa_no_margin_top"><?php esc_html_e('Customer - New file notification', 'wcfa-woocommerce-file-approval');?></h2>
						
					<h3><?php esc_html_e('Subject', 'wcfa-woocommerce-file-approval');?></h3> 
					<label><?php esc_html_e('You can use optionally use the [order_id] shortcode. ', 'wcfa-woocommerce-file-approval');?></label>
					
					<?php foreach($langs as $lang_data): ?>
								<div class="wcfa_option_group">
									<?php if($lang_data['country_flag_url'] != "none"): ?>
										<img src=<?php esc_attr_e($lang_data['country_flag_url']); ?> /><label class="wcfa_label"> <?php echo ucwords($lang_data['language_code']); ?></label>
									<?php endif; 
									$content = wcfa_get_value_if_set($texts , array('customer', 'subject', $lang_data['language_code']), "");
									?>
									<input type="text" class="wcfa_subject" value="<?php esc_attr_e($content);?>" name="wcfa_email_texts[customer][subject][<?php echo $lang_data['language_code']; ?>]"></input>
								</div>
						<?php endforeach; ?>
					
					
					<h3><a id="messages"></a><?php esc_html_e('Message', 'wcfa-woocommerce-file-approval');?></h3>
					<div class="wcfa_option_group">
						<div id="wcfa_shortcode_container">
							<label><?php esc_html_e('SHORTCODES', 'wcfa-woocommerce-file-approval');?></label>
							<p><?php esc_html_e('You can use the following shortcodes:', 'wcfa-woocommerce-file-approval');?></p>
							<label><?php esc_html_e('Order data', 'wcfa-woocommerce-file-approval');?></label>
							[order_id], [order_total], [order_date], [order_url], [order_received_url]
							<br><br>
							<label><?php esc_html_e('Billing data', 'wcfa-woocommerce-file-approval');?></label>
							[billing_first_name], [billing_last_name], [billing_email], [billing_company], [billing_company], [billing_phone], [billing_country], [billing_state], [billing_city], [billing_post_code], [billing_address_1], [billing_address_2], [formatted_billing_address]
							<br><br>
							<label><?php esc_html_e('Shipping data', 'wcfa-woocommerce-file-approval');?></label>
							[shipping_first_name], [shipping_last_name], [shipping_company], [shipping_phone], [shipping_country], [shipping_state], [shipping_city], [shipping_post_code], [shipping_address_1], [shipping_address_2], [formatted_shipping_address]
							<br><br>
							<label><?php esc_html_e('Approval data', 'wcfa-woocommerce-file-approval');?></label>
							[message], [approval_status]
							<label><?php esc_html_e('Sttachment data', 'wcfa-woocommerce-file-approval');?></label>
							[attachment_title]
							<br><br>
							<br><br><br><br>
							<label><?php esc_html_e('CONDITIONAL WRAPPERS', 'wcfa-woocommerce-file-approval');?></label>
							<p><?php esc_html_e('You can use the following special wrappers to show texts only if an attachment has been edited/added or if a new message has been posted by the admin:', 'wcfa-woocommerce-file-approval');?></p>
							<label><?php esc_html_e('New files message', 'wcfa-woocommerce-file-approval');?></label>
							[if_message] [end_message]
							<br><br>
							<label><?php esc_html_e('New attachment', 'wcfa-woocommerce-file-approval');?></label>
							<p><?php esc_html_e("You can use the following shortcode only when a new attachment is added to the Order. Editing an existing attachment won't trigger the shortcode.", 'wcfa-woocommerce-file-approval');?></p>
							[if_new_attachment] [end_if_new_attachment]
							<br><br>
							<label><?php esc_html_e('Files edited by admin message', 'wcfa-woocommerce-file-approval');?></label>
							[if_status_changed] [end_status_changed]
							<br><br>
							</div>
						<div class="wcfa_settings_row">
						<?php	
							
							$langs =  $wcfa_wpml_model->get_langauges_list();
							foreach($langs as $lang_data): ?>
									<div class="wcfa_editor_container">
										<?php if($lang_data['country_flag_url'] != "none"): ?>
											<img src=<?php esc_attr_e($lang_data['country_flag_url']); ?> /><label class="wcfa_label"> <?php echo ucwords($lang_data['language_code']); ?></label>
										<?php endif; 
										
										 $content = wcfa_get_value_if_set($texts , array('customer', 'body', $lang_data['language_code']), "");
										 wp_editor( $content, "wcfa_customer_body_editor_".$lang_data['language_code'], array( 'media_buttons' => false,
																														   'textarea_rows' => 8,
																														   'tinymce' => true,
																														   "wpautop" => true,
																														   'textarea_name'=>"wcfa_email_texts[customer][body][".$lang_data['language_code']."]")); ?>
									</div>
							<?php endforeach; ?>
						</div>	
					</div>
					<h3><a id="messages"></a><?php esc_html_e('Cumulative Message - Wrapper', 'wcfa-woocommerce-file-approval');?></h3>
					<div class="wcfa_option_group">
					<label><?php esc_html_e('INFO', 'wcfa-woocommerce-file-approval');?></label>
					<p><?php esc_html_e("Instead of sending a notification for each created file, you can send one notification for all. To enable the 'Settings menu -> Email notification -> Customer -> New attachments notification -> Cumulative notification' option", 'wcfa-woocommerce-file-approval');?></p>
					<br><br>
					<label><?php esc_html_e('SHORTCODES', 'wcfa-woocommerce-file-approval');?></label>
					<p><?php wcfa_html_escape_allowing_special_tags(__("You can use the same shortcodes defined in the previous Message area plus the special <strong>[messages]</strong> shortcode that will render a Message for each file. The body for each Message is the one defined in the previous Message area.", 'wcfa-woocommerce-file-approval'));?></p>
					<br><br>
					<div class="wcfa_settings_row">
						<?php	
							
							$langs =  $wcfa_wpml_model->get_langauges_list();
							foreach($langs as $lang_data): ?>
									<div class="wcfa_editor_container">
										<?php if($lang_data['country_flag_url'] != "none"): ?>
											<img src=<?php esc_attr_e($lang_data['country_flag_url']); ?> /><label class="wcfa_label"> <?php echo ucwords($lang_data['language_code']); ?></label>
										<?php endif; 
										
										 $content = wcfa_get_value_if_set($texts , array('customer', 'cumulative_message_wrapper', $lang_data['language_code']), "");
										 wp_editor( $content, "wcfa_customer_cumulative_message_wrapper_editor_".$lang_data['language_code'], array( 'media_buttons' => false,
																														   'textarea_rows' => 8,
																														   'tinymce' => true,
																														   "wpautop" => true,
																														   'textarea_name'=>"wcfa_email_texts[customer][cumulative_message_wrapper][".$lang_data['language_code']."]")); ?>
									</div>
							<?php endforeach; ?>
						</div>	
					
					</div>
					
					<h2 class="wcfa_section_title wcfa_no_margin_top"><?php esc_html_e('Customer - Reminder for file that still needs to be approved', 'wcfa-woocommerce-file-approval');?></h2>
					<h3><?php esc_html_e('Subject', 'wcfa-woocommerce-file-approval');?></h3> 
					<label><?php esc_html_e('You can use optionally use the [order_id] shortcode. ', 'wcfa-woocommerce-file-approval');?></label>
					<br><br>
					<?php foreach($langs as $lang_data): ?>
								<div class="wcfa_option_group">
									<?php if($lang_data['country_flag_url'] != "none"): ?>
										<img src=<?php esc_attr_e($lang_data['country_flag_url']); ?> /><label class="wcfa_label"> <?php echo ucwords($lang_data['language_code']); ?></label>
									<?php endif; 
									$content = wcfa_get_value_if_set($texts , array('customer', 'reminder_subject', $lang_data['language_code']), "");
									?>
									<input type="text" class="wcfa_subject" value="<?php esc_attr_e($content);?>" name="wcfa_email_texts[customer][reminder_subject][<?php echo $lang_data['language_code']; ?>]"></input>
								</div>
					<?php endforeach; ?>
					
					
					<h3><a id="messages"></a><?php esc_html_e('Message', 'wcfa-woocommerce-file-approval');?></h3>
					<div class="wcfa_option_group">
						<div id="wcfa_shortcode_container">
							<label><?php esc_html_e('SHORTCODES', 'wcfa-woocommerce-file-approval');?></label>
							<p><?php esc_html_e('You can use the following shortcodes:', 'wcfa-woocommerce-file-approval');?></p>
							<label><?php esc_html_e('Order data', 'wcfa-woocommerce-file-approval');?></label>
							[order_id], [order_total], [order_date], [order_url]
							<br><br>
							<label><?php esc_html_e('Billing data', 'wcfa-woocommerce-file-approval');?></label>
							[billing_first_name], [billing_last_name], [billing_email], [billing_company], [billing_company], [billing_phone], [billing_country], [billing_state], [billing_city], [billing_post_code], [billing_address_1], [billing_address_2], [formatted_billing_address]
							<br><br>
							<label><?php esc_html_e('Shipping data', 'wcfa-woocommerce-file-approval');?></label>
							[shipping_first_name], [shipping_last_name], [shipping_company], [shipping_phone], [shipping_country], [shipping_state], [shipping_city], [shipping_post_code], [shipping_address_1], [shipping_address_2], [formatted_shipping_address]
							<br><br>
						</div>
						<div class="wcfa_settings_row">
						<?php	
							
							$langs =  $wcfa_wpml_model->get_langauges_list();
							foreach($langs as $lang_data): ?>
									<div class="wcfa_editor_container">
										<?php if($lang_data['country_flag_url'] != "none"): ?>
											<img src=<?php esc_attr_e($lang_data['country_flag_url']); ?> /><label class="wcfa_label"> <?php echo ucwords($lang_data['language_code']); ?></label>
										<?php endif; 
										
										 $content = wcfa_get_value_if_set($texts , array('customer', 'reminder_body', $lang_data['language_code']), "");
										 wp_editor( $content, "wcfa_customer_reminder_body_editor_".$lang_data['language_code'], array( 'media_buttons' => false,
																														   'textarea_rows' => 8,
																														   'tinymce' => true,
																														   "wpautop" => true,
																														   'textarea_name'=>"wcfa_email_texts[customer][reminder_body][".$lang_data['language_code']."]")); ?>
									</div>
							<?php endforeach; ?>
						</div>
					</div>
					
					<h2 class="wcfa_section_title wcfa_no_margin_top"><?php esc_html_e('Customer & Admin - Automatic file approval notification', 'wcfa-woocommerce-file-approval');?></h2>
					<p><?php esc_html_e('If the special "Automatic approval" option has been enabled through the Settings menu, this notification will be sent to the customer once a file has been automatically approved. ', 'wcfa-woocommerce-file-approval');?></p>
					<h3><?php esc_html_e('Subject', 'wcfa-woocommerce-file-approval');?></h3> 
					<label><?php esc_html_e('You can use optionally use the [order_id] shortcode. ', 'wcfa-woocommerce-file-approval');?></label>
					
					<?php foreach($langs as $lang_data): ?>
								<div class="wcfa_option_group">
									<?php if($lang_data['country_flag_url'] != "none"): ?>
										<img src=<?php esc_attr_e($lang_data['country_flag_url']); ?> /><label class="wcfa_label"> <?php echo ucwords($lang_data['language_code']); ?></label>
									<?php endif; 
									$content = wcfa_get_value_if_set($texts , array('customer', 'automatic_approval_subject', $lang_data['language_code']), "");
									?>
									<input type="text" class="wcfa_subject" value="<?php esc_attr_e($content);?>" name="wcfa_email_texts[customer][automatic_approval_subject][<?php echo $lang_data['language_code']; ?>]"></input>
								</div>
						<?php endforeach; ?>
					
					
					<h3><a id="messages"></a><?php esc_html_e('Message', 'wcfa-woocommerce-file-approval');?></h3>
					<div class="wcfa_option_group">
						<div id="wcfa_shortcode_container">
							<label><?php esc_html_e('SHORTCODES', 'wcfa-woocommerce-file-approval');?></label>
							<p><?php esc_html_e('You can use the following shortcodes:', 'wcfa-woocommerce-file-approval');?></p>
							<label><?php esc_html_e('Order data', 'wcfa-woocommerce-file-approval');?></label>
							[order_id], [order_total], [order_date], [order_url]
							<br><br>
							<label><?php esc_html_e('Billing data', 'wcfa-woocommerce-file-approval');?></label>
							[billing_first_name], [billing_last_name], [billing_email], [billing_company], [billing_company], [billing_phone], [billing_country], [billing_state], [billing_city], [billing_post_code], [billing_address_1], [billing_address_2], [formatted_billing_address]
							<br><br>
							<label><?php esc_html_e('Shipping data', 'wcfa-woocommerce-file-approval');?></label>
							[shipping_first_name], [shipping_last_name], [shipping_company], [shipping_phone], [shipping_country], [shipping_state], [shipping_city], [shipping_post_code], [shipping_address_1], [shipping_address_2], [formatted_shipping_address]
							<br><br>
							<label><?php esc_html_e('Approval time span', 'wcfa-woocommerce-file-approval');?></label>
							[automatic_approval_span] 
							<br><br>
						</div>
						<div class="wcfa_settings_row">
						<?php	
							
							$langs =  $wcfa_wpml_model->get_langauges_list();
							foreach($langs as $lang_data): ?>
									<div class="wcfa_editor_container">
										<?php if($lang_data['country_flag_url'] != "none"): ?>
											<img src=<?php esc_attr_e($lang_data['country_flag_url']); ?> /><label class="wcfa_label"> <?php echo ucwords($lang_data['language_code']); ?></label>
										<?php endif; 
										
										 $content = wcfa_get_value_if_set($texts , array('customer', 'automatic_approval_body', $lang_data['language_code']), "");
										 wp_editor( $content, "wcfa_customer_automatic_approval_body_editor_".$lang_data['language_code'], array( 'media_buttons' => false,
																														   'textarea_rows' => 8,
																														   'tinymce' => true,
																														   "wpautop" => true,
																														   'textarea_name'=>"wcfa_email_texts[customer][automatic_approval_body][".$lang_data['language_code']."]")); ?>
									</div>
							<?php endforeach; ?>
						</div>
					</div>
					
					<h2 class="wcfa_section_title wcfa_no_margin_top"><?php esc_html_e('Admin - Notification for file modified by the customer', 'wcfa-woocommerce-file-approval');?></h2>
					<h3><?php esc_html_e('Subject', 'wcfa-woocommerce-file-approval');?></h3> 
					<label><?php esc_html_e('You can use optionally use the [order_id] shortcode. ', 'wcfa-woocommerce-file-approval');?></label>
					<div class="wcfa_option_group">
						<div class="wcfa_editor_container">
							<?php $content = wcfa_get_value_if_set($texts , array('admin', 'subject'), "");?>
							<input type="text" class="wcfa_subject" value="<?php esc_attr_e($content);?>" name="wcfa_email_texts[admin][subject]"></input>
						</div>
					</div>	
					
					<h3><?php esc_html_e('Message', 'wcfa-woocommerce-file-approval');?></h3> 
					<div class="wcfa_option_group">
						<div id="wcfa_shortcode_container">
						<label><?php esc_html_e('SHORTCODES', 'wcfa-woocommerce-file-approval');?></label>
						<p><?php esc_html_e('You can use the following shortcodes:', 'wcfa-woocommerce-file-approval');?></p>
						<label><?php esc_html_e('Order data', 'wcfa-woocommerce-file-approval');?></label>
							[order_id], [order_total], [order_date], [order_url]
							<br><br>
							<label><?php esc_html_e('Billing data', 'wcfa-woocommerce-file-approval');?></label>
							[billing_first_name], [billing_last_name], [billing_email], [billing_company], [billing_company], [billing_phone], [billing_country], [billing_state], [billing_city], [billing_post_code], [billing_address_1], [billing_address_2], [formatted_billing_address]
							<br><br>
							<label><?php esc_html_e('Shipping data', 'wcfa-woocommerce-file-approval');?></label>
							[shipping_first_name], [shipping_last_name], [shipping_company], [shipping_phone], [shipping_country], [shipping_state], [shipping_city], [shipping_post_code], [shipping_address_1], [shipping_address_2], [formatted_shipping_address]
							<br><br>
							<label><?php esc_html_e('Approval data', 'wcfa-woocommerce-file-approval');?></label>
							[message], [approval_status]
							<br><br><br><br>
							<label><?php esc_html_e('SPECIAL WRAPPERS', 'wcfa-woocommerce-file-approval');?></label>
							<p><?php esc_html_e('You can use the following special wrappers to show texts only if an attachment has been approved/rejected or if a new message has been posted by the customer:', 'wcfa-woocommerce-file-approval');?></p>
							<label><?php esc_html_e('New message by the user', 'wcfa-woocommerce-file-approval');?></label>
							[if_message] [end_message]
							<br><br>
							<label><?php esc_html_e('Files approved/rejected by the user', 'wcfa-woocommerce-file-approval');?></label>
							[if_status_changed] [end_status_changed]
							<br><br>
						</div>
						<div class="wcfa_settings_row">
							<?php $content = wcfa_get_value_if_set($texts , array('admin', 'body'), "");
							wp_editor( $content, "wcfa_admin_body_editor", array( 'media_buttons' => false,
																				   'textarea_rows' => 18,
																				   "wpautop" => true,
																				   'textarea_name'=>"wcfa_email_texts[admin][body]")); ?>
							
						</div>	
					</div>
					<p class="submit">
						<input name="submit" type="submit" class="button-primary" value="<?php esc_attr_e('Save', 'wcfa-woocommerce-file-approval'); ?>" />
					</p>
			</form>			
		</div>
		<?php 
	}
}
?>