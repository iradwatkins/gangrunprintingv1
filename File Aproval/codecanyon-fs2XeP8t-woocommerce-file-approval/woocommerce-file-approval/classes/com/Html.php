<?php
namespace WCFA\classes\com;

class Html
{
	public function __construct()
	{
		add_action( 'wp_ajax_wcfa_render_order_page_file_data_container', array(&$this, 'ajax_render_order_page_file_data_container'));
		add_action( 'wp_ajax_wcfa_update_image_preview_area', array(&$this, 'ajax_update_image_preview_area'));
	}
	public function ajax_render_order_page_file_data_container()
	{
		$data = array('id' => filter_input( INPUT_POST, 'id', FILTER_VALIDATE_INT ),
					  'attachment_id' => time());
		$order_id =  filter_input( INPUT_POST, 'order_id', FILTER_VALIDATE_INT ); 
		ob_start();
		$this->render_order_page_file_data_container($order_id, $data, true);
		$html = ob_get_clean();
		$result = array('html' => $html,
						'attachment_id' => $data['attachment_id']);
		
		echo json_encode($result);
		wp_die();
		
	}
	public function ajax_update_image_preview_area()
	{
		$this->render_image_preview_area(filter_input( INPUT_POST, 'id', FILTER_VALIDATE_INT ), 
										filter_input( INPUT_POST, 'attachment_id', FILTER_VALIDATE_INT ),
										filter_input( INPUT_POST, '$order_id', FILTER_VALIDATE_INT ), 
										true);
		wp_die();
	}
	public function render_image_preview_area($media_id, $attachment_id, $order_id, $edited = false)
	{
		global $wcfa_attachment_model, $wcfa_order_model;
		$attachment = $wcfa_attachment_model->get_attachment($attachment_id);
		$wc_order = wc_get_order( $order_id );
		
		if($edited)
		{
			$attachment['attributes']['date'] = "";
			$attachment['attributes']['status_code'] = 2;
			$attachment['attributes']['status'] = esc_html__( 'Waiting for user approval', 'woocommerce-file-approval' );
		}
		$approval_date = wcfa_get_value_if_set($attachment, array('attributes','date'), "") != "" ? wcfa_get_value_if_set($attachment, array('attributes','date'), "") :  esc_html__( ' Waiting for the user... ', 'woocommerce-file-approval' );
		$order_items = $wcfa_order_model->get_products($wc_order);
		?>
			<div class="wcfa-icon-container"><a href="<?php echo wp_get_attachment_url($media_id); ?>" target="_blank"><?php echo wp_get_attachment_image( $media_id, 'thumbnail', true, array( 'class' => 'wcfa-preview-image' ) );?></a></div>
			<div class="wcfa-file-details">
				<h4 class="wcfa-area-title"><?php esc_html_e( 'Details', 'woocommerce-file-approval' ); ?></h4>
				<span class="wcfa-text-display"><span class="wcfa-text-title"><?php esc_html_e( 'Name', 'woocommerce-file-approval' ); ?></span> <span class="wcfa-text-body"><?php echo basename ( get_attached_file( $media_id ) ); ?></span></span>
				<span class="wcfa-text-display"><span class="wcfa-text-title"><?php esc_html_e( 'Status', 'woocommerce-file-approval' ); ?></span> <span class="wcfa-text-body wcfa-status-text wcfa-status-text-<?php echo wcfa_get_value_if_set($attachment, array('attributes','status_code'), 2);?>"><?php echo wcfa_get_value_if_set($attachment, array('attributes','status'), esc_html__( 'Waiting for user approval', 'woocommerce-file-approval' )); ?></span></span>
				<span class="wcfa-text-display"><span class="wcfa-text-title"><?php esc_html_e( 'Created', 'woocommerce-file-approval' ); ?></span> <span class="wcfa-text-body"><?php echo $wcfa_attachment_model->get_creation_date($attachment); ?></span></span>
				<span class="wcfa-text-display"><span class="wcfa-text-title"><?php esc_html_e( 'Approved / Rejected', 'woocommerce-file-approval' ); ?></span> <span class="wcfa-text-body"><?php echo $approval_date; ?></span></span>
			</div>	
			<div class="wcfa-attachment-settings">
				<h4 class="wcfa-area-title"><?php esc_html_e( 'Settings', 'woocommerce-file-approval' ); ?></h4>
				<input type="hidden" value="<?php echo $edited ? 'true' : 'false'; ?>" name="wcfa-attachment[<?php echo $attachment_id;?>][attachment_edited]"></input>
				<div class="wcfa-settings-column">
					<div class="wcfa-setting-container">
						<label class="wcfa-setting-label"><?php esc_html_e( 'Title', 'woocommerce-file-approval' ); ?></label>
						<input name="wcfa-attachment[<?php echo $attachment_id;?>][settings][title]" type="text" class="wcfa-setting-input" value="<?php echo wcfa_get_value_if_set($attachment, array('settings', 'title'), "");?>"></input>
					</div>
					<div class="wcfa-setting-container">
						<label class="wcfa-setting-label"><?php esc_html_e('Bind to a specific product', 'woocommerce-file-approval');?></label>
						<select name="wcfa-attachment[<?php echo $attachment_id;?>][settings][order_product]" class="wcfa-setting-input">
							<option value=""><?php esc_html_e( 'No', 'woocommerce-file-approval' ); ?></option>
							<?php foreach($order_items as $item_id => $order_product_name): ?>
							<option value="<?php echo $item_id; ?>" <?php selected( wcfa_get_value_if_set($attachment, array('settings', 'order_product'), ""), $item_id ); ?>><?php echo $order_product_name; ?></option>
							<?php endforeach;?>
						</select>
					</div>		
					<div class="wcfa-setting-container">
						<label class="wcfa-setting-label"><?php esc_html_e('Approval message can be left empty', 'woocommerce-file-approval');?></label>
						<select name="wcfa-attachment[<?php echo $attachment_id;?>][settings][leave_message_policy]" class="wcfa-setting-input">
							<option value="1" <?php selected( wcfa_get_value_if_set($attachment, array('settings', 'leave_message_policy'), 1), 1 ); ?>><?php esc_html_e( 'Only if the attachment is approved', 'woocommerce-file-approval' ); ?></option>
							<option value="2" <?php selected( wcfa_get_value_if_set($attachment, array('settings', 'leave_message_policy'), 1), 2 ); ?>><?php esc_html_e( 'Only if the attachment is rejected', 'woocommerce-file-approval' ); ?></option>
							<option value="0" <?php selected( wcfa_get_value_if_set($attachment, array('settings', 'leave_message_policy'), 1), 0 ); ?>><?php esc_html_e( 'Never', 'woocommerce-file-approval' ); ?></option>
							<option value="3" <?php selected( wcfa_get_value_if_set($attachment, array('settings', 'leave_message_policy'), 1), 3 ); ?>><?php esc_html_e( 'Always', 'woocommerce-file-approval' ); ?></option>
						</select>
					</div>										
				</div>
				<div class="wcfa-settings-column">
					<div class="wcfa-setting-container">
						<label class="wcfa-setting-label"><?php esc_html_e( 'Custom notification recipients', 'woocommerce-file-approval' ); ?>
							<span class="dashicons dashicons-info wcfa-tooltip">
								<span class="wcfa-tooltiptext"><?php esc_html_e( 'By default notifications are sent to the admin or to the custom recipients specified on the Settings menu. Use this option to override the previous options.', 'woocommerce-file-approval' ); ?></span>
							</span>
						</label>
						<input name="wcfa-attachment[<?php echo $attachment_id;?>][settings][email_recipients]" type="text" class="wcfa-setting-input" value="<?php echo wcfa_get_value_if_set($attachment, array('settings', 'email_recipients'), "");?>" placeholder="<?php esc_attr_e('admin@domain.com, admin2,@domain.com', 'woocommerce-file-approval');?>"></input>
					</div>
					<div class="wcfa-setting-container">
						<label class="wcfa-setting-label"><?php esc_html_e( 'After the approval / rejection, the customer can post a message', 'woocommerce-file-approval' ); ?>
							<span class="dashicons dashicons-info wcfa-tooltip">
								<span class="wcfa-tooltiptext"><?php esc_html_e( 'The "Only once per admin intraction" allows the customer to post a message only after the shop manager posted a message or edited the attachment.', 'woocommerce-file-approval' ); ?></span>
							</span>
						</label>
						<select name="wcfa-attachment[<?php echo $attachment_id;?>][settings][reply_policy]" class="wcfa-setting-input">
							<option value="1" <?php selected( wcfa_get_value_if_set($attachment, array('settings', 'reply_policy'), 2), 1 ); ?>><?php esc_html_e( 'Always', 'woocommerce-file-approval' ); ?></option>
							<option value="2" <?php selected( wcfa_get_value_if_set($attachment, array('settings', 'reply_policy'), 2), 2 ); ?>><?php esc_html_e( 'Once per admin interaction', 'woocommerce-file-approval' ); ?></option>
							<option value="0" <?php selected( wcfa_get_value_if_set($attachment, array('settings', 'reply_policy'), 2), 0 ); ?>><?php esc_html_e( 'Never', 'woocommerce-file-approval' ); ?></option>
						</select>
					</div>					
				</div>
				<div class="wcfa-settings-column">
					<div class="wcfa-setting-container">
						<label class="wcfa-setting-label"><?php esc_html_e( 'Force status change', 'woocommerce-file-approval' ); ?>
							<span class="dashicons dashicons-info wcfa-tooltip">
								<span class="wcfa-tooltiptext"><?php esc_html_e( 'You can eventually use this option to modify the current approval status', 'woocommerce-file-approval' ); ?></span>
							</span>
						</label>
						<?php 
							 $status_code = wcfa_get_value_if_set($attachment, array('attributes','status_code'), 2);
							?>
						<select name="wcfa-attachment[<?php echo $attachment_id;?>][settings][forced_status_code]" class="wcfa-setting-input">
							<option value="3"><?php esc_html_e( 'Leave as it is', 'woocommerce-file-approval' ); ?></option>
							<option value="2"><?php echo $wcfa_attachment_model->get_status_name(2); ?></option>
							<option value="1"><?php echo $wcfa_attachment_model->get_status_name(1);?></option>
							<option value="0"><?php echo $wcfa_attachment_model->get_status_name(0); ?></option>
						</select>
					</div>
				</div>
				<div class="wcfa-settings-column">
					<div class="wcfa-setting-container ">
						<label class="wcfa-setting-label"><?php esc_html_e("Override customer attachments general options", 'woocommerce-file-approval');?></label>
						<p><?php esc_html_e("Define specific settings ovveriding the general customer attachments options defined in the settings menu.", 'woocommerce-file-approval');?> </p>
						<?php  $selected = wcfa_get_value_if_set($attachment, array('settings', 'customer_attachments', 'override_general_options'), false) ? " checked='checked' " : " ";; ?>
						<label class="switch">
						  <input type="checkbox" class="wcfa_toggle master_option" name="wcfa-attachment[<?php echo $attachment_id;?>][settings][customer_attachments][override_general_options]" data-related-id="override_general_options_<?php echo $attachment_id;?>" value="true" <?php esc_html_e($selected); ?>>
						  <span class="slider"></span>
						</label>		
					</div>
				</div>
				
				<div class="master_related_override_general_options_<?php echo $attachment_id;?> wcfa_master_related">
					<div class="wcfa-settings-column">
						<div class="wcfa-setting-container ">
							<label class="wcfa-setting-label"><?php esc_html_e("Enable file attachments for customer reply messages", 'woocommerce-file-approval');?></label>
							<p><?php esc_html_e("Customer will be able to attach files to the reply messages", 'woocommerce-file-approval');?> </p>
							<?php  $selected = wcfa_get_value_if_set($attachment, array('settings', 'customer_attachments', 'enable'), false) ? " checked='checked' " : " ";; ?>
							<label class="switch">
							  <input type="checkbox" class="wcfa_toggle" name="wcfa-attachment[<?php echo $attachment_id;?>][settings][customer_attachments][enable]" value="true" <?php esc_html_e($selected); ?>>
							  <span class="slider"></span>
							</label>		
						</div>
					</div>
					<div class="wcfa-settings-column">
							<div class="wcfa-setting-container ">
								<label class="wcfa-setting-label"><?php esc_html_e('Number of uploadable files', 'woocommerce-file-approval');?></label>
								<p><?php esc_html_e('Specify the number of files the customer can upload.', 'woocommerce-file-approval');?></p>
								<?php  $value = wcfa_get_value_if_set($attachment, array('settings', 'customer_attachments', 'num_of_files'), 1); ?>
								<input type="number" step="1" min="1" name="wcfa-attachment[<?php echo $attachment_id;?>][settings][customer_attachments][num_of_files]"  value="<?php esc_attr_e($value); ?>"></input>
							</div>
					</div>
					<div class="wcfa-settings-column">
							<div class="wcfa-setting-container ">
								<label class="wcfa-setting-label"><?php esc_html_e('Allowed file types', 'woocommerce-file-approval');?></label>
								<p><?php esc_html_e('Specify which file type(s) are allowed. Leave empty to allow all file types. In the case of multiple file types, specify extension separating value by a comma. Ex.: ".jpg, .pdf, .png".', 'woocommerce-file-approval');?></p>
								<?php  $value = wcfa_get_value_if_set($attachment, array('settings', 'customer_attachments', 'allowed_types'), ""); ?>
								<input type="text" name="wcfa-attachment[<?php echo $attachment_id;?>][settings][customer_attachments][allowed_types]"  value="<?php esc_attr_e($value); ?>" placeholder=".jpg, .pdf, .png"></input>
							</div>
					</div>
					<div class="wcfa-settings-column">
							<div class="wcfa-setting-container ">
								<label class="wcfa-setting-label"><?php esc_html_e('Max file size', 'woocommerce-file-approval');?></label>
								<p><?php esc_html_e('Specify the max size of the uploadable files. Size is expressed in Kb.', 'woocommerce-file-approval');?></p>
								<?php  $value = wcfa_get_value_if_set($attachment, array('settings', 'customer_attachments', 'max_file_size'), 5120); ?>
								<input type="number" step="1" min="1" name="wcfa-attachment[<?php echo $attachment_id;?>][settings][customer_attachments][max_file_size]"  value="<?php esc_attr_e($value); ?>"></input>
							</div>
					</div>
				</div>
			</div>
		<?php 
	}
	public function render_order_page_file_data_container($order_id, $data = null, $is_ajax = false)
	{
		global $wcfa_user_model, $wcfa_option_model, $wcfa_attachment_model, $wcfa_message_model, $wcfa_order_model;
		$customer_messages_num = $admin_messages_num = 0;
		$current_product_name = "";
		if($is_ajax)
		{
			if(!isset($data['id']))
			{
				//To display a text, print something like: esc_html_e( 'Invalid file data', 'woocommerce-file-approval' );
				return;
			}
			
			$attachment_id = $data['attachment_id']; //time();
			$media_id = $data['id'];			
			$messages = array();
			
			$new_approval_action_notification = $new_message_notification = false;
			$auto_collapse_css = false;
			$just_created = true;
		}
		else
		{
			$just_created = false;
			$options = $wcfa_option_model->get_options();
			$attachment_id = $data['attachment']->ID;
			$media_id = $data['media'];
			$messages = $data['messages'];
			foreach($messages as $message)
				if($message->is_customer_message)
					$customer_messages_num++;
				else 
					$admin_messages_num++;
				
			$auto_collapse_css = wcfa_get_value_if_set($options, array('admin', 'order_details', 'auto_collapse'), false) ? ' wcfa-hidden ' : '';
			$new_message_notification = $wcfa_attachment_model->get_notification($attachment_id, "customer_message"); 
			$new_approval_action_notification = $wcfa_attachment_model->get_notification($attachment_id, "customer_approval_action"); 
			$wcfa_attachment_model->set_notification($attachment_id, "customer_message", false); 
			$wcfa_attachment_model->set_notification($attachment_id, "customer_approval_action", false); 
			 
			$current_product_name = $data["settings"]["order_product"] != "" ? " -> ".$wcfa_order_model->get_product_name($order_id,$data["settings"]["order_product"]) : "";
		}
		
		$date_format = get_option( 'date_format' );
		$time_format = get_option( 'time_format' );
		$preset_answers = $wcfa_option_model->get_preset_answers();
		$uploaded_files_box_id = 0;
		
		?>
		<div class="wcfa-media-container wcfa-sub-container <?php if($new_message_notification || $new_approval_action_notification) echo 'wcfa-new-customer-interaction-highlight'; ?>" id="wcfa-<?php echo $attachment_id;?>" >
			<h2 class="wcfa-attachment-title"><?php if(!$is_ajax)
														echo sprintf(esc_html__( 'ID: %s', 'woocommerce-file-approval' ),$attachment_id).$current_product_name; 
												    else esc_html_e( '*New*', 'woocommerce-file-approval' ); ?> 						
				<button class="button-primary wcfa-delete-button wcfa-disable-during-transitions" data-id="<?php echo $attachment_id;?>"><span class="dashicons dashicons-trash"></span></button>
				<button class="button-primary wcfa-edit-button wcfa-disable-during-transitions" data-id="<?php echo $attachment_id;?>"><span class="dashicons dashicons-edit"></span></button>
				<!-- <button class="button-primary wcfa-collapse-expand-button wcfa-disable-during-transitions" data-id="<?php echo $attachment_id;?>"><span class="dashicons dashicons-email"></span></button> -->
			</h2>
			<?php if($is_ajax): ?>
				<input type="hidden" value="true" name="wcfa-attachment[<?php echo $attachment_id;?>][just_created]"></input>
			<?php endif;?>
			<input type="hidden" value="<?php echo $media_id ?>" name="wcfa-attachment[<?php echo $attachment_id;?>][media_id]" id="wcfa-media-id-<?php echo $attachment_id;?>"></input>
			<div class="wcfa-single-file-data-container wcfa-clearfix" id="wcfa-single-file-data-container-<?php echo $attachment_id;?>">
				<?php $this->render_image_preview_area($media_id, $attachment_id, $order_id, false); ?>	
			</div>
			<div class="wcfa-actions-container clearfix">
				<!-- <button class="button-primary wcfa-collapse-expand-button wcfa-float-left wcfa-disable-during-transitions wcfa-has-text <?php echo $auto_collapse_css ? 'collapsed' : 'expanded';?>" data-id="<?php echo $attachment_id;?>"><?php $auto_collapse_css ? esc_html_e( 'Show messages', 'woocommerce-file-approval' ) : esc_html_e( 'Hide messages', 'woocommerce-file-approval' );?></button> -->
				<div class="wcfa-msg-stats" data-id="<?php echo $attachment_id;?> ">
					<span class="dashicons dashicons-buddicons-pm wcfa-msg-icon"></span>
					<span class="wcfa-msg-count noselect"><?php echo sprintf(esc_html__( 'Messages Area | Customer messages: %d | Admin messages: %d', 'woocommerce-file-approval' ), $customer_messages_num, $admin_messages_num); ?></span>
				</div>
			</div>
			<div class="wcfa-messages-container <?php echo $auto_collapse_css; ?>" id="wcfa-messages-container-<?php echo $attachment_id;?>">
				<div class="wcfa-messages-history-container">
					<?php 
					foreach($messages as $message):
						if(!$message->is_customer_message): ?>
							<div class="wcfa-ticket-message-content" id="wcfa-ticket-message-<?php echo $message->ID; ?>">
								<span class="wcfa-admin-message-details wcfa-message-details">
									<strong><?php echo $wcfa_user_model->get_user_name($message->post_author); ?></strong><br/>
									<?php echo date_i18n($date_format." ".$time_format, strtotime($message->post_date)); ?><br/>	
									<span class="dashicons dashicons-trash wcfa-delete-message-button wcfa-delete-admin-message-button" data-id="<?php echo $message->ID; ?>"></span>
								</span>
								<div class="wcfa-admin-message wcfa-message ">
									<p><?php echo wcfa_restore_paragraph_breaks($message->post_content); ?></p>
								</div>
							</div>
						<?php else: ?>
								<div class="wcfa-ticket-message-content" id="wcfa-ticket-message-<?php echo $message->ID; ?>">
									<span class="wcfa-customer-message-details wcfa-message-details">
										<strong><?php esc_html_e('Customer on','woocommerce-support-ticket-system'); ?></strong><br/>
										<?php echo date_i18n($date_format." ".$time_format, strtotime($message->post_date)); ?>
										<span class="dashicons dashicons-trash wcfa-delete-message-button wcfa-delete-customer-message-button" data-id="<?php echo $message->ID; ?>"></span> 
									</span>	
									<div class="wcfa-customer-message wcfa-message">
										<p><?php echo wcfa_restore_paragraph_breaks($message->post_content); ?></p>
										<?php 
												$uploaded_files = $wcfa_message_model->get_files($message->ID);
												if(!empty($uploaded_files)):?>
												<div class="wcfa-customer-files-container">
													<?php $uploaded_files_counter = 0;
													foreach($uploaded_files as $attachment_unique_value => $attachment_url): 
													$uploaded_files_box_id++; ?>
													<div class="wcfa-single-customer-file" id="wcfa-single-customer-file_<?php echo $uploaded_files_box_id; ?>">
														<span class="wcfa-customer-file-title"><?php echo sprintf(__('Attachment %d','woocommerce-file-approval'), ++$uploaded_files_counter); ?>: </span>
														<a class="dashicons dashicons-paperclip" href="<?php echo $attachment_url; ?>" target="_blank" download></a>
														<span data-message-id="<?php echo $message->ID; ?>" data-unique-value="<?php echo $attachment_unique_value; ?>" data-box-id="<?php echo $uploaded_files_box_id; ?>" class="dashicons dashicons-trash wcfa-delete-attachment-button"></span>
													</div>
													<?php endforeach; //uploaded_files ?>
												</div>
											<?php endif; //!empty($uploaded_files) ?>
									</div>							
								</div>
					<?php  endif; //customer message
					endforeach; //messages ?>
				</div>
				<div class="wcfa-post-reply-container">
					<label><?php esc_html_e( 'Load a preset answer:', 'woocommerce-file-approval' ); ?></label>
					<div class="wcfa_preset_answer_container">
						<select class="wcfa_preset_answer_selector" data-id="<?php echo $attachment_id;?>" id="wcfa_preset_answer_select_<?php echo $attachment_id;?>">
							<option value='none' disabled selected><?php esc_html_e( 'Select an answer', 'woocommerce-file-approval' ); ?></option>
							<?php foreach($preset_answers as $id => $answer)
							{
								echo "<option value='{$id}'>{$answer['name']}</option>";
							}
							?>
						</select>
						<div class="wcfa_preset_answer_loader" id="wcfa_preset_answer_loader_<?php echo $attachment_id;?>"><span class="wcfa_spinner spinner"></span></div>
					</div>
					<label><?php esc_html_e( 'Type a message:', 'woocommerce-file-approval' ); ?></label>
					<small><?php esc_html_e( 'When ready, click the "Save" button or the "Update" order button to save the message. You can use HTML code.', 'woocommerce-file-approval' ); ?></small>
					<?php
					wp_editor( "", 'wcfa-reply-message-'.$attachment_id, array(
								'wpautop'       => false,
								'media_buttons' => false,
								'textarea_name' => 'wcfa-attachment['.$attachment_id.'][message]',
								'textarea_rows' => 12,
								'teeny'         => false,
								'tinymce' => true,
								'quicktags' => true
							) );			
					?>
				</div>
			</div>
		</div>
		<?php 
	}
}
?>