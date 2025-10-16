<?php
/**
 * Product editor handler class.
 *
 * @package WC_Shipping_Fedex
 */

namespace WooCommerce\FedEx;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

use Automattic\WooCommerce\Admin\BlockTemplates\BlockInterface;

/**
 * Product editor handler.
 */
class Product_Editor {

	/**
	 * Class constructor.
	 */
	public function __construct() {
		add_action( 'woocommerce_block_template_area_product-form_after_add_block_product-shipping-dimensions', array( $this, 'add_shipping_blocks' ) );
		add_action( 'woocommerce_block_template_area_product-form_after_add_block_product-variation-shipping-dimensions', array( $this, 'add_shipping_blocks' ) );
	}

	/**
	 * Add custom blocks to the product editor shipping section.
	 *
	 * @param BlockInterface $shipping_dimensions_block The shipping dimensions block.
	 */
	public function add_shipping_blocks( BlockInterface $shipping_dimensions_block ) {
		if ( ! method_exists( $shipping_dimensions_block, 'get_parent' ) ) {
			return;
		}

		$parent = $shipping_dimensions_block->get_parent();

		// Add lift service delivery checkbox.
		$parent->add_block(
			array(
				'id'         => 'fedex-liftgate-delivery',
				'blockName'  => 'woocommerce/product-checkbox-field',
				'attributes' => array(
					'title'          => __( 'Additional FedEx Services', 'woocommerce-shipping-fedex' ),
					'label'          => __( 'FedEx Liftgate Delivery', 'woocommerce-shipping-fedex' ),
					'property'       => 'meta_data._shipping-fedex-liftgate-delivery',
					'tooltip'        => __( 'Add lift service at delivery', 'woocommerce-shipping-fedex' ),
					'checkedValue'   => 'yes',
					'uncheckedValue' => '',
				),
			)
		);

		// Add lift service pickup checkbox.
		$parent->add_block(
			array(
				'id'         => 'fedex-liftgate-pickup',
				'blockName'  => 'woocommerce/product-checkbox-field',
				'attributes' => array(
					'label'          => __( 'FedEx Liftgate Pickup', 'woocommerce-shipping-fedex' ),
					'property'       => 'meta_data._shipping-fedex-liftgate-pickup',
					'tooltip'        => __( 'Add lift service at pickup', 'woocommerce-shipping-fedex' ),
					'checkedValue'   => 'yes',
					'uncheckedValue' => '',
				),
			)
		);
	}
}

new Product_Editor();
