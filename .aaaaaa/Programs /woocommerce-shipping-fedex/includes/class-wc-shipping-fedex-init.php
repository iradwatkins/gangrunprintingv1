<?php
/**
 * Main plugin class file.
 *
 * @package WC_Shipping_Fedex
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

require_once WC_SHIPPING_FEDEX_ABSPATH . 'includes/trait-util.php';
require_once WC_SHIPPING_FEDEX_ABSPATH . 'includes/class-logger.php';

use WooCommerce\FedEx\Util;

/**
 * Main plugin class.
 */
class WC_Shipping_Fedex_Init {

	use Util;

	/**
	 * Plugin's version.
	 *
	 * @var string
	 * @since 3.4.0
	 */
	public $version;

	/**
	 * Class instance.
	 *
	 * @var object
	 */
	private static $instance;

	/**
	 * Get the class instance.
	 */
	public static function get_instance() {
		if ( null === self::$instance ) {
			self::$instance = new self();
		}

		return self::$instance;
	}

	/**
	 * Initialize the plugin's public actions.
	 */
	public function __construct() {
		$this->version  = WC_SHIPPING_FEDEX_VERSION;
		$fedex_settings = get_option( 'woocommerce_fedex_settings', array() );

		if ( ! class_exists( 'WC_Shipping_Method' ) ) {
			add_action( 'admin_notices', array( $this, 'wc_deactivated' ) );
			return;
		}

		if ( isset( $fedex_settings['api_type'] ) && 'soap' === $fedex_settings['api_type'] && ! class_exists( 'SoapClient' ) ) {
			add_action(
				'admin_notices',
				function () {
					echo '<div class="error"><p>' . esc_html__( 'Your server does not provide SOAP support which is required functionality for communicating with FedEx SOAP Service. SOAP Service is deprecated method for communicating with FedEx API. Please switch to the REST API.', 'woocommerce-shipping-fedex' ) . '</p></div>';
				}
			);
		}

		add_action( 'admin_init', array( $this, 'maybe_install' ), 5 );
		add_action( 'init', array( $this, 'load_textdomain' ) );
		add_action( 'before_woocommerce_init', array( $this, 'declare_hpos_compatibility' ) );
		add_action( 'before_woocommerce_init', array( $this, 'declare_product_editor_compatibility' ) );
		add_filter( 'plugin_action_links_' . plugin_basename( WC_SHIPPING_FEDEX_FILE ), array( $this, 'plugin_links' ) );
		add_action( 'woocommerce_shipping_init', array( $this, 'includes' ) );
		add_filter( 'woocommerce_shipping_methods', array( $this, 'add_method' ) );
		add_action( 'admin_notices', array( $this, 'environment_check' ) );
		add_action( 'admin_notices', array( $this, 'upgrade_notice' ) );
		add_action( 'wp_ajax_fedex_dismiss_upgrade_notice', array( $this, 'dismiss_upgrade_notice' ) );
		add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_admin_scripts' ) );

		if ( isset( $fedex_settings['freight_enabled'] ) && 'yes' === $fedex_settings['freight_enabled'] ) {
			// Make the city field show in the calculator (for freight).
			add_filter( 'woocommerce_shipping_calculator_enable_city', '__return_true' );

			// Add freight class option for shipping classes (for freight).
			if ( is_admin() ) {
				include WC_SHIPPING_FEDEX_ABSPATH . 'includes/class-wc-fedex-freight-mapping.php';
			}
		}

		if ( is_admin() ) {
			include_once WC_SHIPPING_FEDEX_ABSPATH . 'includes/class-wc-shipping-fedex-admin.php';
		}

		include_once WC_SHIPPING_FEDEX_ABSPATH . 'includes/class-product-editor.php';
	}

	/**
	 * Environment check function.
	 */
	public function environment_check() {

		$messages = array();

		/**
		 * Allow third party to hide the check store currency debug text.
		 *
		 * @param boolean Flag for hide or display the debug text.
		 *
		 * @since 3.4.30
		 */
		if ( apply_filters( 'woocommerce_shipping_fedex_check_store_currency', true ) && ! in_array( get_woocommerce_currency(), array( 'USD', 'CAD' ), true ) ) {
			$messages[] = esc_html__( 'WooCommerce currency is set to US Dollars or CA Dollars', 'woocommerce-shipping-fedex' );
		}

		// Country check.
		if ( ! in_array( $this->get_base_country(), array( 'US', 'CA' ), true ) ) {
			$messages[] = esc_html__( 'Base country/region is set to United States or Canada', 'woocommerce-shipping-fedex' );
		}

		if ( ! empty( $messages ) ) {
			// translators: %s is messages.
			$prefix    = __( 'FedEx requires that %s', 'woocommerce-shipping-fedex' );
			$separator = __( ' and ', 'woocommerce-shipping-fedex' );

			echo '<div class="error">
				<p>' . esc_html( sprintf( $prefix, implode( $separator, $messages ) ) ) . '</p>
			</div>';
		}
	}

	/**
	 * Enqueue admin scripts.
	 *
	 * @return void
	 * @version 3.4.0
	 * @since   3.4.0
	 */
	public function enqueue_admin_scripts() {

		$screen    = get_current_screen();
		$screen_id = ( $screen instanceof WP_Screen && ! empty( $screen->id ) ) ? $screen->id : '';

		if ( 'woocommerce_page_wc-settings' !== $screen_id ) {
			return;
		}

		// Register scripts.
		wp_register_script( 'fedex-admin-js', plugin_dir_url( WC_SHIPPING_FEDEX_FILE ) . 'assets/js/admin.js', array( 'jquery', 'backbone', 'underscore' ), WC_SHIPPING_FEDEX_VERSION, true );
		wp_enqueue_style( 'fedex-admin', plugin_dir_url( WC_SHIPPING_FEDEX_FILE ) . 'assets/css/admin.css', array(), WC_SHIPPING_FEDEX_VERSION );

		// Enqueue scripts.
		wp_enqueue_script( 'jquery-ui-sortable' );
		wp_enqueue_script( 'fedex-admin-js' );
	}

	/**
	 * Load includes.
	 *
	 * @return void
	 * @version 3.4.0
	 * @since   3.4.0
	 */
	public function includes() {
		include_once WC_SHIPPING_FEDEX_ABSPATH . 'includes/class-wc-fedex-privacy.php';
		include_once WC_SHIPPING_FEDEX_ABSPATH . 'includes/class-wc-shipping-fedex.php';
	}

	/**
	 * Add Fedex shipping method to WC.
	 *
	 * @param mixed $methods Shipping methods.
	 *
	 * @return array
	 */
	public function add_method( $methods ) {
		$methods['fedex'] = 'WC_Shipping_Fedex';

		return $methods;
	}

	/**
	 * Localisation.
	 */
	public function load_textdomain() {
		load_plugin_textdomain( 'woocommerce-shipping-fedex', false, dirname( plugin_basename( WC_SHIPPING_FEDEX_FILE ) ) . '/languages/' );
	}

	/**
	 * Declare High-Performance Order Storage (HPOS) compatibility
	 *
	 * @see https://github.com/woocommerce/woocommerce/wiki/High-Performance-Order-Storage-Upgrade-Recipe-Book#declaring-extension-incompatibility
	 *
	 * @return void
	 */
	public function declare_hpos_compatibility() {
		if ( class_exists( '\Automattic\WooCommerce\Utilities\FeaturesUtil' ) ) {
			\Automattic\WooCommerce\Utilities\FeaturesUtil::declare_compatibility( 'custom_order_tables', 'woocommerce-shipping-fedex/woocommerce-shipping-fedex.php' );
		}
	}


	/**
	 * Declare Product Editor compatibility
	 *
	 * @see https://github.com/woocommerce/woocommerce/blob/trunk/docs/product-editor-development/product-editor.md#declaring-compatibility-with-the-product-editor
	 */
	public function declare_product_editor_compatibility() {
		if ( class_exists( '\Automattic\WooCommerce\Utilities\FeaturesUtil' ) ) {
			\Automattic\WooCommerce\Utilities\FeaturesUtil::declare_compatibility( 'product_block_editor', 'woocommerce-shipping-fedex/woocommerce-shipping-fedex.php' );
		}
	}

	/**
	 * Plugin page links.
	 *
	 * @param array $links Plugin action links.
	 *
	 * @return array Plugin action links.
	 * @version 3.4.9
	 */
	public function plugin_links( $links ) {
		$plugin_links = array(
			'<a href="' . admin_url( 'admin.php?page=wc-settings&tab=shipping&section=fedex' ) . '">' . __( 'Settings', 'woocommerce-shipping-fedex' ) . '</a>',
			'<a href="https://support.woocommerce.com/">' . __( 'Support', 'woocommerce-shipping-fedex' ) . '</a>',
			'<a href="https://docs.woocommerce.com/document/fedex/">' . __( 'Docs', 'woocommerce-shipping-fedex' ) . '</a>',
		);

		return array_merge( $plugin_links, $links );
	}

	/**
	 * WooCommerce not installed notice.
	 */
	public function wc_deactivated() {
		/* translators: %s: WooCommerce link */
		echo '<div class="error"><p>' . sprintf( esc_html__( 'WooCommerce FedEx Shipping requires %s to be installed and active.', 'woocommerce-shipping-fedex' ), '<a href="https://woocommerce.com" target="_blank">WooCommerce</a>' ) . '</p></div>';
	}

	/**
	 * See if we need to install any upgrades
	 * and call the install.
	 *
	 * @return bool
	 * @version 3.4.0
	 * @since   3.4.0
	 */
	public function maybe_install() {
		// Only need to do this for versions less than 3.4.0 to migrate
		// settings to shipping zone instance.
		if ( ! defined( 'DOING_AJAX' ) && ! defined( 'IFRAME_REQUEST' ) && version_compare( get_option( 'wc_fedex_version' ), '3.4.0', '<' ) ) {

			$this->install();
		}

		return true;
	}

	/**
	 * Update/migration script.
	 *
	 * @since   3.4.0
	 * @version 3.4.0
	 */
	public function install() {
		// Get all saved settings and cache it.
		$fedex_settings = get_option( 'woocommerce_fedex_settings', false );

		// Settings exists.
		if ( $fedex_settings ) {
			global $wpdb;

			// Unset un-needed settings.
			unset( $fedex_settings['enabled'] );
			unset( $fedex_settings['availability'] );
			unset( $fedex_settings['countries'] );

			// Add it to the "rest of the world" zone when no fedex.
			if ( ! $this->is_zone_has_fedex( 0 ) ) {
				$wpdb->query( $wpdb->prepare( "INSERT INTO {$wpdb->prefix}woocommerce_shipping_zone_methods ( zone_id, method_id, method_order, is_enabled ) VALUES ( %d, %s, %d, %d )", 0, 'fedex', 1, 1 ) );
				// Add settings to the newly created instance to options table.
				$instance = $wpdb->insert_id;
				add_option( 'woocommerce_fedex_' . $instance . '_settings', $fedex_settings );
			}

			update_option( 'woocommerce_fedex_show_upgrade_notice', 'yes' );
		}

		update_option( 'wc_fedex_version', $this->version );
	}

	/**
	 * Show the user a notice for plugin updates.
	 *
	 * @since 3.4.0
	 */
	public function upgrade_notice() {
		$show_notice = get_option( 'woocommerce_fedex_show_upgrade_notice' );

		if ( 'yes' !== $show_notice ) {
			return;
		}

		$query_args      = array(
			'page' => 'wc-settings',
			'tab'  => 'shipping',
		);
		$zones_admin_url = add_query_arg( $query_args, get_admin_url() . 'admin.php' );
		?>
		<div class="notice notice-success is-dismissible wc-fedex-notice">
			<p>
				<?php
				/* translators: %1$s: Shipping zones link start, %2$s: Link end */
				printf( esc_html__( 'FedEx now supports shipping zones. The zone settings were added to a new FedEx method on the "Rest of the World" Zone. See the zones %1$shere%2$s ', 'woocommerce-shipping-fedex' ), '<a href="' . esc_url( $zones_admin_url ) . '">', '</a>' );
				?>
			</p>
		</div>

		<script type="application/javascript">
			jQuery( '.notice.wc-fedex-notice' ).on( 'click', '.notice-dismiss', function() {
				wp.ajax.post( 'fedex_dismiss_upgrade_notice' );
			} );
		</script>
		<?php
	}

	/**
	 * Turn of the dismissible upgrade notice.
	 *
	 * @since 3.4.0
	 */
	public function dismiss_upgrade_notice() {
		update_option( 'woocommerce_fedex_show_upgrade_notice', 'no' );
	}
}
