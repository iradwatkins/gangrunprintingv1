<?php
/**
 * Plugin Name: WooCommerce FedEx Shipping
 * Plugin URI: https://woocommerce.com/products/fedex-shipping-module/
 * Description: Obtain shipping rates dynamically via the FedEx API for your orders.
 * Version: 4.4.6
 * Author: WooCommerce
 * Author URI: https://woocommerce.com
 * Text Domain: woocommerce-shipping-fedex
 * Requires Plugins: woocommerce
 * Requires PHP: 7.4
 * Requires at least: 6.7
 * Tested up to: 6.8
 * WC requires at least: 10.0
 * WC tested up to: 10.2
 * Copyright: © 2025 WooCommerce
 * License: GNU General Public License v3.0
 * License URI: http://www.gnu.org/licenses/gpl-3.0.html
 *
 * Developers: https://www.fedex.com/wpor/web/jsp/drclinks.jsp?links=wss/index.html
 * Woo: 18620:1a48b598b47a81559baadef15e320f64
 *
 * @package WC_Shipping_Fedex
 */

define( 'WC_SHIPPING_FEDEX_VERSION', '4.4.6' ); // WRCS: DEFINED_VERSION.
define( 'WC_SHIPPING_FEDEX_FILE', __FILE__ );
define( 'WC_SHIPPING_FEDEX_ABSPATH', trailingslashit( __DIR__ ) );
define( 'WC_SHIPPING_FEDEX_API_DIR', WC_SHIPPING_FEDEX_ABSPATH . 'includes/api' );

require_once WC_SHIPPING_FEDEX_ABSPATH . 'includes/class-wc-shipping-fedex-init.php';

add_action( 'plugins_loaded', 'wc_shipping_fedex_init' );

// Subscribe to automated translations.
add_filter( 'woocommerce_translations_updates_for_woocommerce-shipping-fedex', '__return_true' );

/**
 * Initialize plugin.
 */
function wc_shipping_fedex_init() {

	require_once 'vendor/autoload_packages.php';

	WC_Shipping_Fedex_Init::get_instance();
}
