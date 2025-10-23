<?php 
/* 
	Version: 1.6
*/
$new_attachement_notification = $wcfa_attachment_model->get_notification($data['attachment']->ID, "admin_attachment"); 
$new_message_notification = $wcfa_attachment_model->get_notification($data['attachment']->ID, "admin_message"); 
$wcfa_attachment_model->set_notification($data['attachment']->ID, "admin_attachment", false); 
$wcfa_attachment_model->set_notification($data['attachment']->ID, "admin_message", false); 
$image_lightbox_attribute = wp_attachment_is_image($data["media"]) ? "data-lightbox=\"".$data['attachment']->ID."\"" : "" ;
$file_download_attribute = wp_attachment_is_image($data["media"]) ? "" : "download" ;
$is_pdf = $wcfa_media_model->is_pdf(get_attached_file($data["media"]));
$approval_toggle_style =  wcfa_get_value_if_set($options, array('fronted', 'order_details', 'approval_button_style'), "slider");
if(!wcfa_get_value_if_set($data, array('settings', 'customer_attachments', 'override_general_options'), false))
{
	$enable_customer_file_attaching =  wcfa_get_value_if_set($options, array('fronted', 'attachments', 'enable'), false);
	$allowed_file_types = wcfa_get_value_if_set($options, array('fronted', 'attachments', 'allowed_types'), "");
	$max_file_size = wcfa_get_value_if_set($options, array('fronted', 'attachments', 'max_file_size'), 5120);
	$num_of_files = wcfa_get_value_if_set($options, array('fronted', 'attachments', 'num_of_files'), "");
}
else 
{
	$enable_customer_file_attaching = wcfa_get_value_if_set($options, array('customer_attachments', 'enable'), false);
	$allowed_file_types = wcfa_get_value_if_set($options, array('customer_attachments', 'allowed_types'), "");
	$max_file_size = wcfa_get_value_if_set($options, array('customer_attachments',  'max_file_size'), 5120);
	$num_of_files = wcfa_get_value_if_set($options, array('customer_attachments',  'num_of_files'), "");
}
$max_file_size = $max_file_size == "" ? 5120 : $max_file_size;
$max_file_size_text = ($max_file_size/1024) < 1 ? floor($max_file_size)."kb" : floor($max_file_size/1024)."MB";
$uploaded_files_box_id = 0;
$can_reply = $wcfa_attachment_model->can_user_reply($data['attachment']->ID);


?>
<h3 class="wcfa-attachment-title"><?php echo wcfa_get_value_if_set($data, array('settings', 'title'), "");?></h3>
<div class="wcfa-file-container <?php if($new_attachement_notification) echo 'wcfa-new-admin-interaction-highlight'; ?>">
		<div class="wcfa-file-preview-container">
			<?php if($is_pdf ): ?>
				<a href="<?php echo get_site_url()."?wcfa_attachment_id=".$data['attachment']->ID."-".$order_id; ?>" target="_blank"><img class="wcfa-preview-image" data-pdf-thumbnail-file="<?php echo get_site_url()."?wcfa_attachment_id=".$data['attachment']->ID."-".$order_id; ?>" data-pdf-thumbnail-width="300"></img></a>
			<?php else: ?>
				<a <?php echo $image_lightbox_attribute; ?> href="<?php echo get_site_url()."?wcfa_attachment_id=".$data['attachment']->ID."-".$order_id; ?>" <?php echo $file_download_attribute; ?>>
					<img class="wcfa-preview-image" src="<?php echo get_site_url()."?wcfa_attachment_id=".$data['attachment']->ID."-".$order_id; ?>"></img>
				</a>
			<?php endif; ?>
			<a href="<?php echo get_site_url()."?wcfa_attachment_id=".$data['attachment']->ID."-".$order_id."&wcfa_preview=false"; ?>" class="button" download><?php esc_html_e('Download','woocommerce-file-approval'); ?></a>
		</div>
		<div class="wcfa-attachment-details-container">
			
			<?php $approval_status = $wcfa_attachment_model->get_approval_status($data['attachment']->ID); ?>
			<div class="wcfa-toggle-container">
				<?php if($approval_toggle_style == 'slider'): 
					//Slider ?>
					<?php if($approval_status == 2): ?>
					<label class="wcfa-switch">
					  <input <?php disabled( $approval_status != 2); ?> <?php checked( $approval_status == 1); ?> data-approval-initial-value="<?php echo $approval_status; ?>" type="checkbox" name="wcfa-attachment['<?php echo $data['attachment']->ID;?>'][has_been_approved]" value="true" class="wcfa-appoval-toggle " id="wcfa-approved-result-<?php echo $data['attachment']->ID;?>" data-id="<?php echo $data['attachment']->ID;?>">
					  <span class="wcfa-slider <?php if($approval_status == 2) echo 'wcfa-idle-slider'; ?>" id="wcfa-slider-<?php echo $data['attachment']->ID;?>" ></span>
					</label>
					<?php else: ?>
					<input type="hidden" value="1" id="wcfa-already-processed-<?php echo $data['attachment']->ID;?>"></input>
					<?php endif;  ?>
					<span class="wcfa-toggle-description wcfa-approved-text <?php if($approval_status == 2 || $approval_status == 0) echo 'wcfa-hidden'; ?>" id="wcfa-approved-text-<?php echo $data['attachment']->ID;?>"><?php esc_html_e( 'Approved', 'woocommerce-file-approval' ); ?></span>
					<span class="wcfa-toggle-description wcfa-rejected-text <?php if($approval_status == 2 || $approval_status == 1) echo 'wcfa-hidden'; ?>" id="wcfa-rejected-text-<?php echo $data['attachment']->ID;?>"><?php esc_html_e( 'Rejected', 'woocommerce-file-approval' ); ?></span>
					<span class="wcfa-toggle-description wcfa-idle-text <?php if($approval_status != 2) echo 'wcfa-hidden'; ?>" id="wcfa-idle-text-<?php echo $data['attachment']->ID;?>"><?php esc_html_e( 'Click here to approve or reject', 'woocommerce-file-approval' ); ?></span>
				<?php 	//Button
						else: ?>
					 <?php if($approval_status == 2): ?>
						<input <?php checked( $approval_status == 1); ?> data-approval-initial-value="<?php echo $approval_status; ?>" type="checkbox" name="wcfa-attachment['<?php echo $data['attachment']->ID;?>'][has_been_approved]"  class="wcfa-hidden" id="wcfa-approved-result-<?php echo $data['attachment']->ID;?>" data-id="<?php echo $data['attachment']->ID;?>">
						<button id="wcfa-approve-button-<?php echo $data['attachment']->ID;?>" class="button wcfa-approve-button" data-approval="approved" data-id="<?php echo $data['attachment']->ID;?>"><?php esc_html_e( 'Approve', 'woocommerce-file-approval' ); ?></a>
						<button id="wcfa-reject-button-<?php echo $data['attachment']->ID;?>" class="button wcfa-reject-button" data-approval="rejected" data-id="<?php echo $data['attachment']->ID;?>"><?php esc_html_e( 'Reject', 'woocommerce-file-approval' ); ?></a>
					 <?php else: ?>
						<input type="hidden" value="1" id="wcfa-already-processed-<?php echo $data['attachment']->ID;?>"></input>
						<span class="wcfa-toggle-description wcfa-approved-text <?php if($approval_status == 2 || $approval_status == 0) echo 'wcfa-hidden'; ?>" id="wcfa-approved-text-<?php echo $data['attachment']->ID;?>"><?php esc_html_e( 'Approved', 'woocommerce-file-approval' ); ?></span>
						<span class="wcfa-toggle-description wcfa-rejected-text <?php if($approval_status == 2 || $approval_status == 1) echo 'wcfa-hidden'; ?>" id="wcfa-rejected-text-<?php echo $data['attachment']->ID;?>"><?php esc_html_e( 'Rejected', 'woocommerce-file-approval' ); ?></span>
						<span class="wcfa-toggle-description wcfa-idle-text <?php if($approval_status != 2) echo 'wcfa-hidden'; ?>" id="wcfa-idle-text-<?php echo $data['attachment']->ID;?>"><?php esc_html_e( 'Click here to approve or reject', 'woocommerce-file-approval' ); ?></span>
					 <?php endif; ?>
				<?php endif; ?>
			</div>			
		</div>
</div>
<div class="wcfa-messages-container">
	<div class="wcfa-messages-history-container">
		<?php 
		end($data["messages"]);   
		$last_element_key = key($data["messages"]);
		reset($data["messages"]);
		foreach($data["messages"] as $key => $message):
			if(!$message->is_customer_message): ?>
				<div class="wcfa-ticket-message-content" id="wcfa-ticket-message-<?php echo $message->ID; ?>">
					<span class="wcfa-admin-message-details wcfa-message-details">
						<strong><?php esc_html_e('Staff on','woocommerce-file-approval'); ?></strong><br/>
						<?php echo date_i18n($date_format." ".$time_format, strtotime($message->post_date)); ?>
					</span>
					<div class="wcfa-admin-message wcfa-message <?php if($new_message_notification && $key == $last_element_key) echo 'wcfa-new-admin-message-highlight'; ?>">
						<p><?php echo wcfa_restore_paragraph_breaks($message->post_content); ?></p>
					</div>
				</div>
			<?php else: ?>
					<div class="wcfa-ticket-message-content" id="wcfa-ticket-message-<?php echo $message->ID; ?>">
						<span class="wcfa-customer-message-details wcfa-message-details">
							<strong><?php esc_html_e('You on','woocommerce-file-approval'); ?></strong><br/>
							<?php echo date_i18n($date_format." ".$time_format, strtotime($message->post_date)); ?> 
						</span>	
						<div class="wcfa-customer-message wcfa-message ">
							<p><?php echo wcfa_restore_paragraph_breaks($message->post_content); ?></p>
							<!-- File uploaded by the user -->
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
								</div>
								<?php endforeach; //uploaded_files ?>
							</div>
						<?php endif; //!empty($uploaded_files) ?>
						</div>							
					</div>
		<?php  endif; //customer message
		endforeach; //messages ?>
	</div>
	<?php if($can_reply): ?>
	<div class="wcfa-post-reply-container">
		<input type="hidden" id="wcfa-leave-blank-message-<?php echo $data['attachment']->ID; ?>" value="<?php echo wcfa_get_value_if_set($data, array('settings', 'leave_message_policy'), 1); ?>"></input>
		<label class="wcfa-label"><?php esc_html_e( 'Type a message:', 'woocommerce-file-approval' ); ?></label>
		<?php
		wp_editor( "", 'wcfa-reply-message-'.$data['attachment']->ID, array(
					'wpautop'       => true,
					'media_buttons' => false,
					'textarea_name' => 'wcfa-attachment['.$data['attachment']->ID.'][message]',
					'textarea_rows' => 10,
					'teeny'         => false,
					'editor_class' => 'wcfa-disable-during-transition',
					'dfw' => false,
					'tinymce' => false,
					'quicktags' => false
				) );			
		?>
			<!-- Upload area -->
			<?php if($enable_customer_file_attaching): ?>
				<span class="wcfa_attachments_label"><?php _e('Attachment(s)','woocommerce-file-approval'); ?> <?php if($max_file_size > 0) echo sprintf(__('(Max size: %s)','woocommerce-file-approval'), $max_file_size_text); ?></span>
				<?php for($i = 0; $i<$num_of_files; $i++):
					 $item_id = $data['attachment']->ID;
					 $current_file_id = $item_id."_".$i;
					 ?>
					 <div class="wcfa_input_attachment_container">
						 <input type="file" <?php if($allowed_file_types != '') echo 'accept="'.$allowed_file_types.'"';?>
							   data-max-size="<?php echo $max_file_size; //is already expressed in kb (otherwise it should be multiplied for *1024) ?>"
							   class="wcfa_attachment_input wcfa_new_message_attachment wcfa_new_message_attachment_group_<?php echo $item_id;?>" 
							   data-clear-button="<?php echo  $current_file_id;?>"
							   data-id="<?php echo  $current_file_id;?>"
							   data-upload-button-id = "#wcfa_file_upload_button_<?php echo  $current_file_id; ?>"
							   data-delete-button-id = "#wcfa_file_tmp_delete_button_<?php echo  $current_file_id; ?>"
							   id="wcfa_input_file_<?php echo  $current_file_id;?>" 
							   data-hide-index="<?php echo $i;?>"
							   data-main-container=".wcfa_new_message_container" >
						 </input>
						<input type="hidden" class="wcfa_file_metadata_<?php echo  $item_id; ?>" id="wcfa-filename-<?php echo $current_file_id; ?>" name="wcfa_files[<?php echo  $current_file_id; ?>][file_name]" value=""></input>
						<input type="hidden" class="wcfa_file_metadata_<?php echo  $item_id; ?>" id="wcfa-filenameprefix-<?php echo  $current_file_id; ?>" name="wcfa_files[<?php echo  $current_file_id; ?>][file_name_tmp_prefix]" value=""></input>
						<input type="hidden" class="wcfa_file_metadata_<?php echo  $item_id; ?>" id="wcfa-complete-name-<?php echo  $current_file_id; ?>" name="wcfa_files[<?php echo  $current_file_id; ?>][file_complete_name]" value=""></input>
						<!-- File name display after upload -->
						<div class="wcfa_file_name_display_after_upload" id="wcfa-filename-display-<?php echo $current_file_id;?>"></div>
						<!-- Upload button -->
						<button class="button wcfa_file_upload_button"  
								id="wcfa_file_upload_button_<?php echo  $current_file_id; ?>"
							   data-id="<?php echo  $current_file_id; ?>"  
							   data-upload-field-id="#wcfa_input_file_<?php echo  $current_file_id; ?>"><?php _e('Upload', 'woocommerce-file-approval') ?></button>
						<button class="button wcfa_file_tmp_delete_button"  
								id="wcfa_file_tmp_delete_button_<?php echo  $current_file_id; ?>"
							   data-id="<?php echo  $current_file_id; ?>"  
							   data-file-to-delete=""><?php _e('Delete', 'woocommerce-file-approval') ?> </button>
						<!-- Upload progress managment -->
						<div id="wcfa_upload_progress_status_container_<?php echo  $current_file_id; ?>" class="wcfa_upload_progress_status_container">
							<div class="wcfa_upload_progressbar" id="wcfa_upload_progressbar_<?php echo  $current_file_id; ?>"></div >
							<div class="wcfa_upload_progressbar_percent" id="wcfa_upload_progressbar_percent_<?php echo  $current_file_id; ?>">0%</div>
						</div>
					  </div>
			    <!-- End upload area -->
				<?php endfor; ?>
			<?php endif; ?>
										
	</div>
	<?php endif; ?>
	
	
	<?php if($can_reply): ?>
	<button class="button wcfa-save-button wcfa-disable-during-transition" data-id="<?php echo $data["attachment"]->ID; ?>"><?php esc_html_e('Submit', 'woocommerce-file-approval'); ?></button>
	<?php endif; ?>
</div>