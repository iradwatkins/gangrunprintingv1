<!-- Popup  -->
<a id="wcfa-show-popup-button" style="display:none;" href="#wcfa-alert-popup"></a> 
<div id="wcfa-alert-popup" class="mfp-hide" style="display:none;">
	<h4 id="wcfa-alert-popup-title"><?php echo wcfa_get_value_if_set($general_texts , array('popup', 'title', $lang), esc_html__( 'Notice', 'woocommerce-file-approval' )) ?></h4>
	<div id="wcfa-alert-popup-content"></div>
	<button class="button" id="wcfa-close-popup-alert" class="mfp-close"><?php _e('OK', 'woocommerce-file-approval'); ?></button>
</div>
<!-- End popup -->