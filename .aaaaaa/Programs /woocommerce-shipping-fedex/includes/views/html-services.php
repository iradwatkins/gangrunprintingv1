<?php
/**
 * Services field template file.
 *
 * @package WC_Shipping_Fedex
 */

?>
<tr valign="top" id="service_options">
	<th scope="row" class="titledesc"><?php esc_html_e( 'Services', 'woocommerce-shipping-fedex' ); ?></th>
	<td class="forminp">
		<table class="fedex_services widefat">
			<thead>
				<th class="sort">&nbsp;</th>
				<th><?php esc_html_e( 'Service Code', 'woocommerce-shipping-fedex' ); ?></th>
				<th><?php esc_html_e( 'Name', 'woocommerce-shipping-fedex' ); ?></th>
				<th><?php esc_html_e( 'Enabled', 'woocommerce-shipping-fedex' ); ?></th>
				<?php // translators: %s is currency symbol. ?>
				<th><?php printf( esc_html__( 'Price Adjustment (%s)', 'woocommerce-shipping-fedex' ), esc_html( get_woocommerce_currency_symbol() ) ); ?></th>
				<th><?php esc_html_e( 'Price Adjustment (%)', 'woocommerce-shipping-fedex' ); ?></th>
			</thead>
			<tbody>
				<?php
				$sort             = 0;
				$ordered_services = array();

				foreach ( $this->services as $code => $name ) {

					if ( isset( $this->custom_services[ $code ]['order'] ) && is_numeric( $this->custom_services[ $code ]['order'] ) ) {
						$sort = (int) $this->custom_services[ $code ]['order'];
					}

					while ( isset( $ordered_services[ $sort ] ) ) {
						++$sort;
					}

					$ordered_services[ $sort ] = array( $code, $name );

					++$sort;
				}

				ksort( $ordered_services );

				foreach ( $ordered_services as $value ) {
					$code = $value[0];
					$name = $value[1];
					?>
					<tr>
						<td class="sort"><input type="hidden" class="order" name="<?php echo esc_attr( "fedex_service[$code][order]" ); ?>" value="<?php echo esc_attr( isset( $this->custom_services[ $code ]['order'] ) ? $this->custom_services[ $code ]['order'] : '' ); ?>" /></td>
						<td><strong><?php echo esc_html( $code ); ?></strong></td>
						<td><input type="text" name="<?php echo esc_attr( "fedex_service[$code][name]" ); ?>" placeholder="<?php echo esc_attr( $name ); ?>" value="<?php echo esc_attr( isset( $this->custom_services[ $code ]['name'] ) ? $this->custom_services[ $code ]['name'] : '' ); ?>" size="50" /></td>
						<td><input type="checkbox" name="<?php echo esc_attr( "fedex_service[$code][enabled]" ); ?>" <?php checked( ( ! isset( $this->custom_services[ $code ]['enabled'] ) || ! empty( $this->custom_services[ $code ]['enabled'] ) ), true ); ?> /></td>
						<td><input type="text" name="<?php echo esc_attr( "fedex_service[$code][adjustment]" ); ?>" placeholder="N/A" value="<?php echo esc_attr( isset( $this->custom_services[ $code ]['adjustment'] ) ? $this->custom_services[ $code ]['adjustment'] : '' ); ?>" size="4" /></td>
						<td><input type="text" name="<?php echo esc_attr( "fedex_service[$code][adjustment_percent]" ); ?>" placeholder="N/A" value="<?php echo esc_attr( isset( $this->custom_services[ $code ]['adjustment_percent'] ) ? $this->custom_services[ $code ]['adjustment_percent'] : '' ); ?>" size="4" /></td>
					</tr>
					<?php
				}
				?>
			</tbody>
		</table>
	</td>
</tr>
