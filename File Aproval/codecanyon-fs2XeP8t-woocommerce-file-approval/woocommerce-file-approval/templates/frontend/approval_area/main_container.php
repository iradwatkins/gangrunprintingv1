<?php 
/* 
	Version: 1.3 
*/
if($only_logged_users && !is_user_logged_in()):
?>
	<div id="wcfa-login-container">
	<?php wp_login_form( ); ?>
	</div>
<?php
else:	
$current_order_product = "";	
$area_title = wcfa_get_value_if_set($general_texts , array('order_details_page', 'title', $wcfa_wpml_model->get_current_language()), esc_html__('Approval area', 'woocommerce-file-approval'));
$approval_area_description = wcfa_get_value_if_set($general_texts , array('order_details_page', 'description', $wcfa_wpml_model->get_current_language()), "")
?>
<h2 class="woocommerce-order-details__title wcfa-approval-area-title"><?php echo $area_title; ?></h2>
<div id="wcfa-approval-area-main-container">
<div id="wcfa-approval-area-description"><?php echo $approval_area_description; ?></div>
<?php foreach($attachments as $data):
	if($current_order_product != $data["settings"]["order_product"]):
		$current_order_product = $data["settings"]["order_product"];
		$current_product_name = $wcfa_order_model->get_product_name($order,$current_order_product);
?>
<h3><?php echo $current_product_name; ?></h3>
<?php endif; ?>
<div class="wcfa-single-attachment-container" id="wcfa-single-attachment-container-<?php echo $data["attachment"]->ID; ?>">
	<div id="wcfa-ajax-content-<?php echo $data["attachment"]->ID; ?>">
			<?php 
			
			if(file_exists ( get_theme_file_path()."/woocommerce-file-approval/approval_area/attachment.php" ))
				include get_theme_file_path()."/woocommerce-file-approval/approval_area/attachment.php";
			else	
				include WCFA_PLUGIN_ABS_PATH.'/templates/frontend/approval_area/attachment.php'; ?>
	</div>
</div>
<?php endforeach; //end $dattachments loop ?>
</div>
<?php endif; ?>