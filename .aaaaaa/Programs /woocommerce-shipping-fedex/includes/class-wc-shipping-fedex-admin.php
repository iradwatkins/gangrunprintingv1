<?php
/**
 * Admin handler class.
 *
 * @package WC_Shipping_Fedex
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Admin handler.
 */
class WC_Shipping_Fedex_Admin {

	const META_KEY_LIFTGATE_DELIVERY = '_shipping-fedex-liftgate-delivery';
	const META_KEY_LIFTGATE_PICKUP   = '_shipping-fedex-liftgate-pickup';

	/**
	 * WC_Shipping_Fedex_Admin constructor.
	 */
	public function __construct() {
		add_action( 'woocommerce_product_options_dimensions', array( $this, 'product_options' ) );
		add_action( 'woocommerce_process_product_meta', array( $this, 'process_product_meta' ) );
		add_action( 'woocommerce_variation_options_dimensions', array( $this, 'variation_options' ), 10, 3 );
		add_action( 'woocommerce_save_product_variation', array( $this, 'process_product_variation_meta' ), 10, 2 );
	}

	/**
	 * Add options to Shipping panel.
	 *
	 * @return void
	 */
	public function product_options() {
		woocommerce_wp_checkbox(
			array(
				'id'          => self::META_KEY_LIFTGATE_DELIVERY,
				'label'       => __( 'FedEx Liftgate Delivery', 'woocommerce-shipping-fedex' ),
				'description' => __( 'Add lift service at delivery', 'woocommerce-shipping-fedex' ),
				'desc_tip'    => true,
			)
		);

		woocommerce_wp_checkbox(
			array(
				'id'          => self::META_KEY_LIFTGATE_PICKUP,
				'label'       => __( 'FedEx Liftgate Pickup', 'woocommerce-shipping-fedex' ),
				'description' => __( 'Add lift service at pickup', 'woocommerce-shipping-fedex' ),
				'desc_tip'    => true,
			)
		);
	}

	/**
	 * Add options to variation.
	 *
	 * @param int     $loop           Number.
	 * @param array   $variation_data Variation data.
	 * @param WP_Post $variation      WP_Post object.
	 *
	 * @return void
	 */
	public function variation_options( $loop, array $variation_data, WP_Post $variation ) {
		$product = wc_get_product( $variation->ID );

		woocommerce_wp_checkbox(
			array(
				'id'            => 'variable_' . self::META_KEY_LIFTGATE_DELIVERY . $loop,
				'name'          => 'variable_' . self::META_KEY_LIFTGATE_DELIVERY . '[' . $loop . ']',
				'label'         => '&nbsp;' . __( 'FedEx Liftgate Delivery', 'woocommerce-shipping-fedex' ),
				'description'   => __( 'Add lift service at delivery', 'woocommerce-shipping-fedex' ),
				'desc_tip'      => true,
				'wrapper_class' => 'form-row form-row-full hide_if_variation_virtual',
				'value'         => $product->get_meta( self::META_KEY_LIFTGATE_DELIVERY, true ),
			)
		);

		woocommerce_wp_checkbox(
			array(
				'id'            => 'variable_' . self::META_KEY_LIFTGATE_PICKUP . $loop,
				'name'          => 'variable_' . self::META_KEY_LIFTGATE_PICKUP . '[' . $loop . ']',
				'label'         => '&nbsp;' . __( 'FedEx Liftgate Pickup', 'woocommerce-shipping-fedex' ),
				'description'   => __( 'Add lift service at pickup', 'woocommerce-shipping-fedex' ),
				'desc_tip'      => true,
				'wrapper_class' => 'form-row form-row-full hide_if_variation_virtual',
				'value'         => $product->get_meta( self::META_KEY_LIFTGATE_PICKUP, true ),
			)
		);
	}

	/**
	 * Save custom fields
	 *
	 * @param int $post_id WP Post ID.
	 *
	 * @return void
	 */
	public function process_product_meta( $post_id ) {
		if ( ! empty( $_POST ) ) {
			check_admin_referer( 'woocommerce_save_data', 'woocommerce_meta_nonce' );
		}

		// phpcs:ignore WordPress.WP.Capabilities.Unknown --- it's capabilities from WooCommerce
		if ( ! empty( $_POST ) && ! current_user_can( 'edit_products' ) ) {
			wp_die( -1, 403 );
		}

		$product = wc_get_product( $post_id );

		if ( ! empty( $_POST[ self::META_KEY_LIFTGATE_DELIVERY ] ) ) {
			$product->add_meta_data( self::META_KEY_LIFTGATE_DELIVERY, 'yes', true );
		} else {
			$product->delete_meta_data( self::META_KEY_LIFTGATE_DELIVERY );
		}

		if ( ! empty( $_POST[ self::META_KEY_LIFTGATE_PICKUP ] ) ) {
			$product->add_meta_data( self::META_KEY_LIFTGATE_PICKUP, 'yes', true );
		} else {
			$product->delete_meta_data( self::META_KEY_LIFTGATE_PICKUP );
		}

		$product->save_meta_data();
	}

	/**
	 * Save custom fields
	 *
	 * @param int $post_id WP Post ID.
	 * @param int $loop Number.
	 *
	 * @return void
	 */
	public function process_product_variation_meta( $post_id, $loop ) {

		check_ajax_referer( 'save-variations', 'security' );

		// Check permissions again and make sure we have what we need.
		// phpcs:ignore WordPress.WP.Capabilities.Unknown --- it's capabilities from WooCommerce
		if ( ! current_user_can( 'edit_products' ) || empty( $_POST ) || empty( $_POST['product_id'] ) ) {
			wp_die( -1 );
		}

		$product = wc_get_product( $post_id );

		if ( ! empty( $_POST[ 'variable_' . self::META_KEY_LIFTGATE_DELIVERY ][ $loop ] ) ) {
			$product->add_meta_data( self::META_KEY_LIFTGATE_DELIVERY, 'yes', true );
		} else {
			$product->delete_meta_data( self::META_KEY_LIFTGATE_DELIVERY );
		}

		if ( ! empty( $_POST[ 'variable_' . self::META_KEY_LIFTGATE_PICKUP ][ $loop ] ) ) {
			$product->add_meta_data( self::META_KEY_LIFTGATE_PICKUP, 'yes', true );
		} else {
			$product->delete_meta_data( self::META_KEY_LIFTGATE_PICKUP );
		}

		$product->save_meta_data();
	}
}

new WC_Shipping_Fedex_Admin();
