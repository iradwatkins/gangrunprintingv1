<?php 
namespace WCFA\classes\admin;

class GeneralTextsPage
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
		wp_enqueue_style( 'wcfa-admin-texts-settings', WCFA_PLUGIN_PATH.'/css/admin-texts-settings-page.css');
		
		if(isset($_POST['submit']))
		{
			$wcfa_option_model->save_general_texts($_POST['wcfa_general_texts']);
		}
		$langs =  $wcfa_wpml_model->get_langauges_list();
		$texts = $wcfa_option_model->get_general_texts(); 
		?>
		<div class="wrap white-box">
			<form action="" method="post" >
				<h2 class="wcfa_section_title wcfa_no_margin_top"><?php esc_html_e('Order details page', 'wcfa-woocommerce-file-approval');?></h2>
				
				<h3><?php esc_html_e('Approval area title', 'wcfa-woocommerce-file-approval');?></h3> 
				<label><?php esc_html_e('This text is the title displayed before the approval area', 'wcfa-woocommerce-file-approval');?></label>
				<div class="wcfa_option_group wcfa_max_width">
					<div class="wcfa_settings_row">
							<?php	
								
								$langs =  $wcfa_wpml_model->get_langauges_list();
								foreach($langs as $lang_data): ?>
										<div class="wcfa_editor_container">
											<?php if($lang_data['country_flag_url'] != "none"): ?>
												<img src=<?php esc_attr_e($lang_data['country_flag_url']); ?> /><label class="wcfa_label"> <?php echo ucwords($lang_data['language_code']); ?></label>
											<?php endif; 
											
											$content = wcfa_get_value_if_set($texts , array('order_details_page', 'title', $lang_data['language_code']), esc_html__('Approval area', 'woocommerce-file-approval'));
											?>
											<input type="text" class="wcfa_subject" value="<?php esc_attr_e($content);?>" name="wcfa_general_texts[order_details_page][title][<?php echo $lang_data['language_code']; ?>]" required="requried"></input>
											</div>
								<?php endforeach; ?>
					</div>	
				</div>		
				
				<h3><?php esc_html_e('Approval area description', 'wcfa-woocommerce-file-approval');?></h3> 
				<label><?php esc_html_e('This text is shown at the top of the approval area and can be used to give instructions to the customer on how to approve/reject a file', 'wcfa-woocommerce-file-approval');?></label>
				<div class="wcfa_option_group wcfa_max_width">
					<div class="wcfa_settings_row">
							<?php	
								
								$langs =  $wcfa_wpml_model->get_langauges_list();
								foreach($langs as $lang_data): ?>
										<div class="wcfa_editor_container">
											<?php if($lang_data['country_flag_url'] != "none"): ?>
												<img src=<?php esc_attr_e($lang_data['country_flag_url']); ?> /><label class="wcfa_label"> <?php echo ucwords($lang_data['language_code']); ?></label>
											<?php endif; 
											
											$content = wcfa_get_value_if_set($texts , array('order_details_page', 'description', $lang_data['language_code']), "");
											wp_editor( $content, "wcfa_customer_body_editor_".$lang_data['language_code'], array( 'media_buttons' => false,
																															   'textarea_rows' => 12,
																															   'tinymce' => true,
																															   "wpautop" => true,
																															   'textarea_name'=>"wcfa_general_texts[order_details_page][description][".$lang_data['language_code']."]")); ?>
										</div>
								<?php endforeach; ?>
					</div>	
				</div>		

				<h2 class="wcfa_section_title wcfa_no_margin_top"><?php esc_html_e('Popup', 'wcfa-woocommerce-file-approval');?></h2>
				<h3><?php esc_html_e('Title', 'wcfa-woocommerce-file-approval');?></h3> 
				<label><?php esc_html_e('This is the poup title displayed in every popup', 'wcfa-woocommerce-file-approval');?></label>
				<div class="wcfa_option_group wcfa_max_width">
					<div class="wcfa_settings_row">
							<?php	
								
								$langs =  $wcfa_wpml_model->get_langauges_list();
								foreach($langs as $lang_data): ?>
										<div class="wcfa_option_group">
									<?php if($lang_data['country_flag_url'] != "none"): ?>
										<img src=<?php esc_attr_e($lang_data['country_flag_url']); ?> /><label class="wcfa_label"> <?php echo ucwords($lang_data['language_code']); ?></label>
									<?php endif; 
										$content = wcfa_get_value_if_set($texts , array('popup', 'title', $lang_data['language_code']), esc_html__( 'Notice', 'woocommerce-file-approval' ));
										?>
										<input type="text" class="wcfa_subject" value="<?php esc_attr_e($content);?>" name="wcfa_general_texts[popup][title][<?php echo $lang_data['language_code']; ?>]" required="requried"></input>
								</div>
								<?php endforeach; ?>
					</div>	
				</div>
				<h3><?php esc_html_e('Data has been successfully sent', 'wcfa-woocommerce-file-approval');?></h3> 
				<label><?php esc_html_e('This text is displayed after a file has been approved and/or a message has been successfully sent by the customer', 'wcfa-woocommerce-file-approval');?></label>
				<div class="wcfa_option_group wcfa_max_width">
					<div class="wcfa_settings_row">
							<?php	
								
								$langs =  $wcfa_wpml_model->get_langauges_list();
								foreach($langs as $lang_data): ?>
										<div class="wcfa_option_group">
									<?php if($lang_data['country_flag_url'] != "none"): ?>
										<img src=<?php esc_attr_e($lang_data['country_flag_url']); ?> /><label class="wcfa_label"> <?php echo ucwords($lang_data['language_code']); ?></label>
									<?php endif; 
										$content = wcfa_get_value_if_set($texts , array('popup', 'succesfully_sent_msg', $lang_data['language_code']), esc_html__( 'Thank you, data has been successfully sent!', 'woocommerce-file-approval' ));
										?>
										<input type="text" class="wcfa_msg" value="<?php esc_attr_e($content);?>" name="wcfa_general_texts[popup][succesfully_sent_msg][<?php echo $lang_data['language_code']; ?>]" required="requried"></input>
								</div>
								<?php endforeach; ?>
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