<?php 
namespace WCFA\classes\admin;

class PresetAnswersPage
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
		wp_enqueue_style( 'wcfa-admin-preset-answers-settings', WCFA_PLUGIN_PATH.'/css/admin-preset-answers-settings-page.css');
		
		wp_register_script( 'wcfa-admin-preset-answers-settings', WCFA_PLUGIN_PATH.'/js/admin-preset-answers-settings-page.js', array('jquery'));
		$js_options = array(
				'confirm_message' => esc_html__( 'Are you sure? Remember to press the "Save" button in order the changes to take effect.', 'woocommerce-file-approval' ),
			);
		wp_localize_script( 'wcfa-admin-preset-answers-settings', 'wcfa', $js_options );
		wp_enqueue_script( 'wcfa-admin-preset-answers-settings');
		
		if(isset($_POST) && !empty($_POST))
		{
			$wcfa_option_model->save_preset_answers(isset($_POST['wcfa_preset_answers']) ? $_POST['wcfa_preset_answers'] : array() , isset($_POST['add']));
		}
		$langs =  $wcfa_wpml_model->get_langauges_list();
		$texts = $wcfa_option_model->get_preset_answers(); 
		
		$next_id = 0;
		?>
		<div class="wrap white-box">
			<form action="" method="post" >
				<h2 class="wcfa_section_title wcfa_no_margin_top"><?php esc_html_e('Instructions', 'wcfa-woocommerce-file-approval');?></h2>
				<p>
					<?php _e('Here you can define the answers that you can lately use as templates for messages in the admin order page. In the <strong>Existing preset answers</strong> section are listed the ones you have already created. Via the <strong>Add new answer</strong> section you can enter new ones!', 'wcfa-woocommerce-file-approval');?>
				</p>
				<h2 class="wcfa_section_title"><?php esc_html_e('Existing preset answers', 'wcfa-woocommerce-file-approval');?></h2>
				<?php if(!$texts): ?>	
					<h4><?php esc_html_e('No preset texts have been created...yet!', 'wcfa-woocommerce-file-approval');?></h4>
				<?php else: ?>	
					<p>
						<?php _e('Here a list of existing preset answers. You can delete or edit them... and remember to hit the <strong>Save</strong> button in order changes to take effect!', 'wcfa-woocommerce-file-approval');?>
					</p>
					<?php foreach($texts as $id => $preset_text): ?>
					<div class="wcfa_settings_row" id="wcfa_row_<?php echo $id; ?>">						
						<div class="wcfa_action_buttons_container">
							<button class="button-primary wcfa-delete-button wcfa-disable-during-transitions" data-id="<?php echo $id;?>"><span class="dashicons dashicons-trash"></span></button>
						</div>
						<div class="wcfa_option_group wcfa_max_width">
							<label><?php esc_html_e('Name', 'woocommerce-support-ticket-system');?></label>
							<input type="text" class="wcfa_preset_name" value="<?php esc_attr_e($preset_text['name']);?>" name="wcfa_preset_answers[<?php echo $id; ?>][name]"></input>
						</div>
						<div class="wcfa_option_group wcfa_max_width">
							<label><?php esc_html_e('Text', 'woocommerce-support-ticket-system');?></label>
							<div class="wcfa_editor_container">
								<?php
								 $content =  $preset_text['text']; 
								 $next_id  = $id + 1;
								 wp_editor( $content, "wcfa_customer_body_editor_".$id, array( 'media_buttons' => false,
																							   'textarea_rows' => 10,
																							   'tinymce' => true,
																							   "wpautop" => false,
																							   'textarea_name'=>"wcfa_preset_answers[{$id}][text]")); ?>
							</div>
						</div>
					</div>						
				<?php endforeach; ?>
				<p class="submit">
					<input name="edit" type="submit" class="button-primary" value="<?php esc_attr_e('Save', 'wcfa-woocommerce-file-approval'); ?>" />
				</p>
			</form>
			<form action="" method="post" >			
				<?php endif; //end $texts ?>
				<h2 class="wcfa_section_title"><?php esc_html_e('Add new answer', 'wcfa-woocommerce-file-approval');?></h2>
				<div id="wcfa_shortcode_container">
					<label><?php esc_html_e('SHORTCODES', 'woocommerce-support-ticket-system');?></label>
					<p><?php esc_html_e('You can use the following shortcodes:', 'wcfa-woocommerce-file-approval');?></p>
					<label><?php esc_html_e('Order data', 'woocommerce-support-ticket-system');?></label>
					[order_id], [order_total], [order_date], [order_url]
					<br><br>
					<label><?php esc_html_e('Billing data', 'woocommerce-support-ticket-system');?></label>
					[billing_first_name], [billing_last_name], [billing_email], [billing_company], [billing_company], [billing_phone], [billing_country], [billing_state], [billing_city], [billing_post_code], [billing_address_1], [billing_address_2], [formatted_billing_address]
					<br><br>
					<label><?php esc_html_e('Shipping data', 'woocommerce-support-ticket-system');?></label>
					[shipping_first_name], [shipping_last_name], [shipping_company], [shipping_phone], [shipping_country], [shipping_state], [shipping_city], [shipping_post_code], [shipping_address_1], [shipping_address_2], [formatted_shipping_address]
					<br><br>
				</div>
				<div class="wcfa_option_group wcfa_max_width">
					<label><?php esc_html_e('Name', 'woocommerce-support-ticket-system');?></label>
					<input type="text" class="wcfa_preset_name" value="" name="wcfa_preset_answers[<?php echo $next_id; ?>][name]" required></input>
				</div>
				<div class="wcfa_option_group wcfa_max_width">
					<label><?php esc_html_e('Text', 'woocommerce-support-ticket-system');?></label>
					<div class="wcfa_editor_container ">
						<?php
						 wp_editor( "", "wcfa_customer_body_editor_".$next_id, array( 'media_buttons' => false,
																					   'textarea_rows' => 8,
																					   'tinymce' => true,
																					   "wpautop" => true,
																					   'textarea_name'=>"wcfa_preset_answers[{$next_id}][text]")); ?>
					</div>	
				</div>				
				<p class="submit">
					<input name="add" type="submit" class="button-primary" value="<?php esc_attr_e('Add', 'wcfa-woocommerce-file-approval'); ?>" />
				</p>
			</form>			
		</div>
		<?php
	}
}
?>