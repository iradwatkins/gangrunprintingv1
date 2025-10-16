<?php
/**
 * Box packing field template file.
 *
 * @package WC_Shipping_Fedex
 */

?>

<tr valign="top" id="packing_options">
	<th scope="row" class="titledesc"><?php esc_html_e( 'Box Sizes', 'woocommerce-shipping-fedex' ); ?></th>
	<td class="forminp">
		<table class="fedex_boxes widefat">
			<caption><small class="description"><?php esc_html_e( 'Items will be packed into these boxes depending on item dimensions and volume. Dimensions will be passed to FedEx and used for packing. Items not fitting into boxes will be packed individually.', 'woocommerce-shipping-fedex' ); ?></small></caption>
			<thead>
				<tr>
					<th class="check-column"><input type="checkbox" /></th>
					<th style="width: 20%;"><?php esc_html_e( 'Name', 'woocommerce-shipping-fedex' ); ?></th>
					<th style="width: 220px;"><?php esc_html_e( 'Length (in)', 'woocommerce-shipping-fedex' ); ?></th>
					<th style="width: 220px;"><?php esc_html_e( 'Width (in)', 'woocommerce-shipping-fedex' ); ?></th>
					<th style="width: 220px;"><?php esc_html_e( 'Height (in)', 'woocommerce-shipping-fedex' ); ?></th>
					<th style="width: 220px;"><?php esc_html_e( 'Weight of Box (lbs)', 'woocommerce-shipping-fedex' ); ?></th>
					<th style="width: 220px;"><?php esc_html_e( 'Max Weight (lbs)', 'woocommerce-shipping-fedex' ); ?><?php echo $this->fedex_one_rate ? wc_help_tip( __( 'Maximum weight for [Account Rates / FedEx One Rate]', 'woocommerce-shipping-fedex' ) ) : ''; ?></th>
					<th style="width: 20%;"><?php esc_html_e( 'Packaging type', 'woocommerce-shipping-fedex' ); ?></th>
					<th><?php esc_html_e( 'Enabled', 'woocommerce-shipping-fedex' ); ?></th>
				</tr>
			</thead>
			<tbody id="rates">
				<?php
				if ( $this->default_boxes ) {
					foreach ( $this->default_boxes as $key => $box ) {
						$max_weight_data = '';
						if ( ! empty( $box['one_rate_max_weight'] ) ) {
							$max_weight_data = sprintf( 'data-max-weight="%s" data-one-rate-max-weight="%s"', esc_attr( $box['max_weight'] ), esc_attr( $box['one_rate_max_weight'] ) );
						}

						if ( $this->fedex_one_rate && isset( $box['one_rate_max_weight'] ) ) {
							$box_max_weight = $box['max_weight'] . ' / ' . $box['one_rate_max_weight'];
						} else {
							$box_max_weight = $box['max_weight'];
						}

						?>
						<tr class="default">
							<td class="check-column"></td>
							<td><?php echo esc_html( $box['name'] ); ?></td>
							<td><span class="max-width"><?php echo esc_html( $box['length'] ); ?></span></td>
							<td><span class="max-width"><?php echo esc_html( $box['width'] ); ?></span></td>
							<td><span class="max-width"><?php echo esc_html( $box['height'] ); ?></span></td>
							<td><span class="max-width"><?php echo esc_html( $box['box_weight'] ); ?></span></td>
							<td><span class="max-width"><?php echo esc_html( $box_max_weight ); ?></span></td>
							<td><?php echo esc_html( str_replace( array( ':2', ':3', ':4' ), '', $box['id'] ) ); ?></td>
							<td><input type="checkbox" name="boxes_enabled[<?php echo esc_attr( $box['id'] ); ?>]" <?php checked( ! isset( $this->boxes[ $box['id'] ]['enabled'] ) || true === wc_string_to_bool( $this->boxes[ $box['id'] ]['enabled'] ), true ); ?> /></td>
						</tr>
						<?php
					}
				}
				if ( $this->boxes ) {
					$i = count( $this->default_boxes );
					foreach ( $this->boxes as $key => $box ) {
						if ( ! is_numeric( $key ) ) {
							continue;
						}
						$key = intval( $key );
						?>
						<tr class="custom">
							<td class="check-column"><input type="checkbox"/></td>
							<td><input type="text" size="10" style="width:100% !important;" name="<?php echo esc_attr( "boxes_name[$key]" ); ?>" value="<?php echo isset( $box['name'] ) ? esc_attr( $box['name'] ) : ''; ?>" /></td>
							<td><input class="text-align-right" type="text" size="5" name="<?php echo esc_attr( "boxes_length[$key]" ); ?>" value="<?php echo esc_attr( $box['length'] ); ?>" /></td>
							<td><input class="text-align-right" type="text" size="5" name="<?php echo esc_attr( "boxes_width[$key]" ); ?>" value="<?php echo esc_attr( $box['width'] ); ?>" /></td>
							<td><input class="text-align-right" type="text" size="5" name="<?php echo esc_attr( "boxes_height[$key]" ); ?>" value="<?php echo esc_attr( $box['height'] ); ?>" /></td>
							<td><input class="text-align-right" type="text" size="5" name="<?php echo esc_attr( "boxes_box_weight[$key]" ); ?>" value="<?php echo esc_attr( $box['box_weight'] ); ?>" /></td>
							<td><input class="text-align-right" type="text" size="5" name="<?php echo esc_attr( "boxes_max_weight[$key]" ); ?>" value="<?php echo esc_attr( $box['max_weight'] ); ?>" /></td>
							<td>
								<?php // phpcs:disable ?>
								<select name="<?php echo esc_attr( "boxes_type[$key]" ); ?>">
									<?php
									$box_id  = isset( $box['id'] ) ? $box['id'] : 'YOUR_PACKAGING';
									$box_idx = $key + $i;
									?>
									<optgroup label="Custom">
										<option value="YOUR_PACKAGING:<?php echo esc_attr( $box_idx ); ?>" <?php echo wc_selected( $box_id, array( 'YOUR_PACKAGING', '' ) ); ?>>YOUR_PACKAGING</option>
									</optgroup>
									<optgroup label="FedEx">
										<option value="FEDEX_BOX:<?php echo esc_attr( $box_idx ); ?>" <?php echo wc_selected( $box_id, 'FEDEX_BOX:' . $box_idx ); ?>>FEDEX_BOX</option>
										<option value="FEDEX_10KG_BOX:<?php echo esc_attr( $box_idx ); ?>" <?php echo wc_selected( $box_id, 'FEDEX_10KG_BOX:' . $box_idx ); ?>>FEDEX_10KG_BOX</option>
										<option value="FEDEX_25KG_BOX:<?php echo esc_attr( $box_idx ); ?>" <?php echo wc_selected( $box_id, 'FEDEX_25KG_BOX:' . $box_idx ); ?>>FEDEX_25KG_BOX</option>
									</optgroup>
									<optgroup label="FedEx One Rate">
										<option value="FEDEX_ENVELOPE:<?php echo esc_attr( $box_idx ); ?>" <?php echo wc_selected( $box_id, 'FEDEX_ENVELOPE:' . $box_idx ); ?>>FEDEX_ENVELOPE</option>
										<option value="FEDEX_SMALL_BOX:<?php echo esc_attr( $box_idx ); ?>" <?php echo wc_selected( $box_id, 'FEDEX_SMALL_BOX:' . $box_idx ); ?>>FEDEX_SMALL_BOX</option>
										<option value="FEDEX_MEDIUM_BOX:<?php echo esc_attr( $box_idx ); ?>" <?php echo wc_selected( $box_id, 'FEDEX_MEDIUM_BOX:' . $box_idx ); ?>>FEDEX_MEDIUM_BOX</option>
										<option value="FEDEX_LARGE_BOX:<?php echo esc_attr( $box_idx ); ?>" <?php echo wc_selected( $box_id, 'FEDEX_LARGE_BOX:' . $box_idx ); ?>>FEDEX_LARGE_BOX</option>
										<option value="FEDEX_EXTRA_LARGE_BOX:<?php echo esc_attr( $box_idx ); ?>" <?php echo wc_selected( $box_id, 'FEDEX_EXTRA_LARGE_BOX:' . $box_idx ); ?>>FEDEX_EXTRA_LARGE_BOX</option>
										<option value="FEDEX_PAK:<?php echo esc_attr( $box_idx ); ?>" <?php echo wc_selected( $box_id, 'FEDEX_PAK:' . $box_idx ); ?>>FEDEX_PAK</option>
										<option value="FEDEX_TUBE:<?php echo esc_attr( $box_idx ); ?>" <?php echo wc_selected( $box_id, 'FEDEX_TUBE:' . $box_idx ); ?>>FEDEX_TUBE</option>
									</optgroup>
								</select>
								<?php // phpcs:enable ?>
							</td>
							<td><input type="checkbox" name="<?php echo esc_attr( "boxes_enabled[$key]" ); ?>" <?php checked( $box['enabled'], true ); ?> /></td>
						</tr>
						<?php
					}
				}
				?>
			</tbody>
			<tfoot>
				<tr>
					<th colspan="9">
						<a href="#" class="button plus insert"><?php esc_html_e( 'Add Box', 'woocommerce-shipping-fedex' ); ?></a>
						<a href="#" class="button minus remove"><?php esc_html_e( 'Remove selected box(es)', 'woocommerce-shipping-fedex' ); ?></a>
					</th>
				</tr>
			</tfoot>
		</table>
		<script type="text/javascript">

			jQuery().ready(function(){

				jQuery('#woocommerce_fedex_packing_method').change(function(){

					if ( jQuery(this).val() == 'box_packing' )
						jQuery('#packing_options').show();
					else
						jQuery('#packing_options').hide();

				}).change();

				jQuery('#woocommerce_fedex_freight_enabled').change(function(){

					if ( jQuery(this).is(':checked') ) {

						var $table = jQuery('#woocommerce_fedex_freight_enabled').closest('table');

						$table.find('tr:not(:first)').show();

					} else {

						var $table = jQuery('#woocommerce_fedex_freight_enabled').closest('table');

						$table.find('tr:not(:first)').hide();
					}

				}).change();

				// Adjust box max weight fields when FedEx One Rates are enabled.
				jQuery( '#woocommerce_fedex_fedex_one_rate' ).change( function() {
					if ( jQuery( this ).is( ':checked' ) ) {
						jQuery( '.wc-shipping-fedex-boxes-max-weight' ).each( function() {
							var field = jQuery( this );
							if ( field.data( 'one-rate-max-weight' ) ) {
								field.val( field.data( 'one-rate-max-weight' ) );
							}
						} );
					} else {
						jQuery( '.wc-shipping-fedex-boxes-max-weight' ).each( function() {
							var field = jQuery( this );
							if ( field.data( 'max-weight' ) ) {
								field.val( field.data( 'max-weight' ) );
							}
						} );
					}
				} ).change();

				jQuery('.fedex_boxes .insert').click( function() {
					var $tbody = jQuery('.fedex_boxes').find('tbody');
					var size = $tbody.find('tr').length;
					var code = '<tr class="new">\
							<td class="check-column"><input type="checkbox" /></td>\
							<td><input type="text" style="width:100% !important;" size="10" name="boxes_name[' + size + ']" /></td>\
							<td><input type="text" size="5" name="boxes_length[' + size + ']" /></td>\
							<td><input type="text" size="5" name="boxes_width[' + size + ']" /></td>\
							<td><input type="text" size="5" name="boxes_height[' + size + ']" /></td>\
							<td><input type="text" size="5" name="boxes_box_weight[' + size + ']" /></td>\
							<td><input type="text" size="5" name="boxes_max_weight[' + size + ']" /></td>\
							<td>\
								<select name="boxes_type[' + size + ']">\
								<optgroup label="Custom">\
									<option value="YOUR_PACKAGING">YOUR_PACKAGING</option>\
								</optgroup>\
								<optgroup label="FedEx">\
									<option value="FEDEX_BOX:' + size + '">FEDEX_BOX</option>\
									<option value="FEDEX_10KG_BOX:' + size + '">FEDEX_10KG_BOX</option>\
									<option value="FEDEX_25KG_BOX:' + size + '">FEDEX_25KG_BOX</option>\
								</optgroup>\
								<optgroup label="FedEx One Rate">\
									<option value="FEDEX_ENVELOPE:' + size + '">FEDEX_ENVELOPE</option>\
									<option value="FEDEX_SMALL_BOX:' + size + '">FEDEX_SMALL_BOX</option>\
									<option value="FEDEX_MEDIUM_BOX:' + size + '">FEDEX_MEDIUM_BOX</option>\
									<option value="FEDEX_LARGE_BOX:' + size + '">FEDEX_LARGE_BOX</option>\
									<option value="FEDEX_EXTRA_LARGE_BOX:' + size + '">FEDEX_EXTRA_LARGE_BOX</option>\
									<option value="FEDEX_PAK:' + size + '">FEDEX_PAK</option>\
									<option value="FEDEX_TUBE:' + size + '">FEDEX_TUBE</option>\
								</optgroup>\
								</select>\
							</td>\
							<td><input type="checkbox" name="boxes_enabled[' + size + ']" /></td>\
						</tr>';

					$tbody.append( code );

					return false;
				} );

				jQuery('.fedex_boxes .remove').click(function() {
					var $tbody = jQuery('.fedex_boxes').find('tbody');

					$tbody.find('.check-column input:checked').each(function() {
						jQuery(this).closest('tr').hide().find('input').val('');
					});

					return false;
				});

				// Ordering
				jQuery('.fedex_services tbody').sortable({
					items:'tr',
					cursor:'move',
					axis:'y',
					handle: '.sort',
					scrollSensitivity:40,
					forcePlaceholderSize: true,
					helper: 'clone',
					opacity: 0.65,
					placeholder: 'wc-metabox-sortable-placeholder',
					start:function(event,ui){
						ui.item.css('background-color','#f6f6f6');
					},
					stop:function(event,ui){
						ui.item.removeAttr('style');
						fedex_services_row_indexes();
					}
				});

				function fedex_services_row_indexes() {
					jQuery('.fedex_services tbody tr').each(function(index, el){
						jQuery('input.order', el).val( parseInt( jQuery(el).index('.fedex_services tr') ) );
					});
				};

			});

		</script>
	</td>
</tr>
