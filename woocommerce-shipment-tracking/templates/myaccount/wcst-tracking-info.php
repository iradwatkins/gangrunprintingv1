<?php
/**
 * View Order Email template.
 * Shows tracking numbers view order page.
 *
 * @package WC_Shipment_Tracking
 * @version 1.6.4
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( isset( $tracking_items ) && is_array( $tracking_items ) && count( $tracking_items ) > 0 ) : ?>

	<h2>
		<?php
		/**
		 * Filter to change the content title of the email.
		 *
		 * @param string $content_title Content title.
		 *
		 * @since 1.3.7
		 */
		echo esc_html( apply_filters( 'woocommerce_shipment_tracking_my_orders_title', __( 'Tracking Information', 'woocommerce-shipment-tracking' ) ) );
		?>
	</h2>

	<table class="shop_table shop_table_responsive my_account_tracking">
		<thead>
			<tr>
				<th class="tracking-provider"><span class="nobr"><?php esc_html_e( 'Provider', 'woocommerce-shipment-tracking' ); ?></span></th>
				<th class="tracking-number"><span class="nobr"><?php esc_html_e( 'Tracking Number', 'woocommerce-shipment-tracking' ); ?></span></th>
				<th class="date-shipped"><span class="nobr"><?php esc_html_e( 'Date', 'woocommerce-shipment-tracking' ); ?></span></th>
				<th class="order-actions">&nbsp;</th>
			</tr>
		</thead>
		<tbody>
		<?php
		foreach ( $tracking_items as $tracking_item ) {
			$date_shipped = array(
				'datetime_attr' => $tracking_item['formatted_date_shipped_ymd'],
				'title_attr'    => $tracking_item['formatted_date_shipped_wc'],
				'text'          => $tracking_item['formatted_date_shipped_i18n'],
			);
			?>
				<tr class="tracking">
					<td class="tracking-provider" data-title="<?php esc_html_e( 'Provider', 'woocommerce-shipment-tracking' ); ?>">
						<?php echo esc_html( $tracking_item['formatted_tracking_provider'] ); ?>
					</td>
					<td class="tracking-number" data-title="<?php esc_html_e( 'Tracking Number', 'woocommerce-shipment-tracking' ); ?>">
						<?php echo esc_html( $tracking_item['tracking_number'] ); ?>
					</td>
					<td class="date-shipped" data-title="<?php esc_html_e( 'Date', 'woocommerce-shipment-tracking' ); ?>" style="text-align:left; white-space:nowrap;">
						<time datetime="<?php echo esc_attr( $date_shipped ['datetime_attr'] ); ?>" title="<?php echo esc_attr( $date_shipped ['title_attr'] ); ?>"><?php echo esc_html( $date_shipped['text'] ); ?></time>
					</td>
					<td class="order-actions" style="text-align: center;">
							<?php if ( '' !== $tracking_item['formatted_tracking_link'] ) { ?>
							<a href="<?php echo esc_url( $tracking_item['formatted_tracking_link'] ); ?>" target="_blank" class="button"><?php esc_html_e( 'Track', 'woocommerce-shipment-tracking' ); ?></a>
							<?php } ?>
					</td>
				</tr>
				<?php
		}
		?>
		</tbody>
	</table>

	<?php
endif;
