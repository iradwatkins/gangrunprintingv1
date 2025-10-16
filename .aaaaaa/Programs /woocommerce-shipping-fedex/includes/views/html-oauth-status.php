<?php
/**
 * OAuth field template file.
 *
 * @package WC_Shipping_Fedex
 */

if ( empty( $field_key ) || empty( $data ) ) {
	return;
}
?>
<tr valign="top" id="fedex_oauth_status">
	<th scope="row" class="titledesc">
		<label for="<?php echo esc_attr( $field_key ); ?>"><?php echo wp_kses_post( $data['title'] ); ?><?php echo $this->get_tooltip_html( $data ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?></label>
	</th>
	<td class="forminp">
		<div <?php echo $this->get_custom_attribute_html( $data ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>>
			<?php if ( $this->fedex_oauth->is_authenticated() ) : ?>
				<p style="color: #00a32a;"><?php esc_html_e( 'Authenticated', 'woocommerce-shipping-fedex' ); ?></p>
			<?php else : ?>
				<p style="color: #d63638;"><?php esc_html_e( 'Not Authenticated.', 'woocommerce-shipping-fedex' ); ?></p>
				<p><?php esc_html_e( 'Enter your FedEx Client ID and FedEx Client Secret and click "Save changes".', 'woocommerce-shipping-fedex' ); ?></p>
			<?php endif; ?>
		</div>
	</td>
</tr>

