<?php
/**
 * Fedex shipping method class file.
 *
 * @package WC_Shipping_Fedex
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

require_once WC_SHIPPING_FEDEX_API_DIR . '/rest/class-fedex-oauth.php';
require_once WC_SHIPPING_FEDEX_API_DIR . '/rest/class-fedex-rest-api.php';
require_once WC_SHIPPING_FEDEX_API_DIR . '/legacy/class-fedex-legacy-api.php';

use WooCommerce\FedEx\FedEx_Legacy_API;
use WooCommerce\FedEx\FedEx_OAuth;
use WooCommerce\FedEx\FedEx_REST_API;
use WooCommerce\FedEx\Util;
use WooCommerce\FedEx\Logger;
use WooCommerce\BoxPacker\WC_Boxpack;
/**
 * WC_Shipping_Fedex class.
 *
 * @extends WC_Shipping_Method
 */
class WC_Shipping_Fedex extends WC_Shipping_Method {

	use Util;

	/**
	 * Pre-defined Fedex boxes.
	 *
	 * @var array
	 */
	private $default_boxes;

	/**
	 * Rates found.
	 *
	 * @var array
	 */
	private $found_rates;

	/**
	 * Pre-defined services.
	 *
	 * @var array
	 */
	private $services;

	/**
	 * FedEx API type.
	 *
	 * This determines whether to use XML API or REST API.
	 *
	 * @var string
	 */
	public $api_type;
	/**
	 * FedEx API client ID.
	 *
	 * @var string
	 */
	private $api_key = '';
	/**
	 * FedEx API client secret.
	 *
	 * @var string
	 */
	private $api_pass = '';
	/**
	 * FedEx OAuth instance.
	 *
	 * @var string
	 */
	private $client_id = '';
	/**
	 * FedEx API client secret.
	 *
	 * @var string
	 */
	private $client_secret = '';
	/**
	 * FedEx Account Number
	 *
	 * @var string
	 */
	private $account_number;

	/**
	 * FedEx Account Meter
	 *
	 * @var string
	 */
	private $meter_number;
	/**
	 * FedEx OAuth instance.
	 *
	 * @var \WooCommerce\FedEx\FedEx_OAuth
	 */
	private $fedex_oauth;
	/**
	 * FedEx API instance.
	 *
	 * @var \WooCommerce\FedEx\Abstract_FedEx_API
	 */
	private $fedex_api;

	/**
	 * Is production key.
	 *
	 * @var bool
	 */
	private $production;

	/**
	 * Is Shipper Address Residential.
	 *
	 * @var bool
	 */
	private $residential;

	/**
	 * Request Type.
	 *
	 * @var string
	 */
	private $request_type;

	/**
	 * Shipper postal code.
	 *
	 * @var string
	 */
	private $origin;

	/**
	 * User set variable.
	 *
	 * @var string
	 */
	public $title;

	/**
	 * Debug on/off.
	 *
	 * @var bool
	 */
	public $debug;

	/**
	 * API mode test|production.
	 *
	 * @var string
	 */
	public $api_mode;

	/**
	 * Packing method.
	 *
	 * @var string
	 */
	private $packing_method;

	/**
	 * Box dimensions.
	 *
	 * @var array
	 */
	private $boxes;

	/**
	 * Request Type.
	 *
	 * @var array
	 */
	private $custom_services;

	/**
	 * Check if freight is enabled.
	 *
	 * @var bool
	 */
	private $freight_enabled;

	/**
	 * List of FedEx Ground services.
	 *
	 * @var array
	 */
	private $ground_services;

	/**
	 * List of FedEx SmartPost services.
	 *
	 * @var array
	 */
	private $smartpost_services;

	/**
	 * List of FedEx Fright services.
	 *
	 * @var array
	 */
	private $freight_services;

	/**
	 * Check if fedex one rate.
	 *
	 * @var bool
	 */
	private $fedex_one_rate;

	/**
	 * Freight class.
	 *
	 * @var string
	 */
	private $freight_class;

	/**
	 * Freight number, if not found uses account number as default.
	 *
	 * @var string
	 */
	private $freight_number;

	/**
	 * Billing street address for freight.
	 *
	 * @var string
	 */
	private $freight_billing_street;

	/**
	 * Additional billing street details.
	 *
	 * @var string
	 */
	private $freight_billing_street_2;

	/**
	 * City name associated with billing address for freight.
	 *
	 * @var string
	 */
	private $freight_billing_city;

	/**
	 * State or province associated with billing address for freight.
	 *
	 * @var string
	 */
	private $freight_billing_state;

	/**
	 * Postal or ZIP code associated with billing address for freight.
	 *
	 * @var string
	 */
	private $freight_billing_postcode;

	/**
	 *  Country of billing address for freight.
	 *
	 * @var string
	 */
	private $freight_billing_country;

	/**
	 * Street address of shipper in a freight shipment.
	 *
	 * @var string
	 */
	private $freight_shipper_street;

	/**
	 * Additional shipper street details.
	 *
	 * @var string
	 */
	private $freight_shipper_street_2;

	/**
	 * City.of shipper in a freight shipment
	 *
	 * @var string
	 */
	private $freight_shipper_city;

	/**
	 * State or province of freight shipper.
	 *
	 * @var string
	 */
	private $freight_shipper_state;

	/**
	 * Postal or ZIP code of freight shipper.
	 *
	 * @var string
	 */
	private $freight_shipper_postcode;

	/**
	 * Country of shipper for freight.
	 *
	 * @var string
	 */
	private $freight_shipper_country;

	/**
	 * Origin country code.
	 *
	 * @var string
	 */
	private $origin_country;

	/**
	 * .
	 *
	 * @var string
	 */
	private $smartpost_hub;

	/**
	 * If insured.
	 *
	 * @var bool
	 */
	private $insure_contents;

	/**
	 * Represents the option for offering rates.
	 *
	 * @var string
	 */
	private $offer_rates;

	/**
	 * Contains package IDs eligible for FedEx One Rate shipping.
	 *
	 * @var array
	 */
	private $fedex_one_rate_package_ids;

	/**
	 * Is shipper residential.
	 *
	 * @var bool
	 */
	private $freight_shipper_residential;

	/**
	 * .
	 *
	 * @var bool
	 */
	private $package;

	/**
	 * Sets the box packer library to use.
	 *
	 * @var string
	 */
	public $box_packer_library;

	/**
	 * Class constructor.
	 *
	 * @param int $instance_id Shipping instance ID.
	 */
	public function __construct( $instance_id = 0 ) {
		$this->id                 = 'fedex';
		$this->instance_id        = absint( $instance_id );
		$this->method_title       = __( 'FedEx', 'woocommerce-shipping-fedex' );
		$this->method_description = __( 'The FedEx extension obtains rates dynamically from the FedEx API during cart/checkout.', 'woocommerce-shipping-fedex' );

		$this->default_boxes = include WC_SHIPPING_FEDEX_ABSPATH . 'includes/data/data-box-sizes.php';
		$this->services      = include WC_SHIPPING_FEDEX_ABSPATH . 'includes/data/data-service-codes.php';
		$this->supports      = array(
			'shipping-zones',
			'instance-settings',
			'settings',
		);

		$this->init_form_fields();

		$this->set_settings();

		add_action( 'woocommerce_update_options_shipping_' . $this->id, array( $this, 'process_admin_options' ) );
		$this->add_debug_script();

		add_filter( 'option_woocommerce_shipping_debug_mode', array( $this, 'maybe_bypass_shipping_cache' ) );
	}

	/**
	 * Bypass shipping rates cache.
	 *
	 * @param bool $value woocommerce_shipping_debug_mode value.
	 *
	 * @return string
	 */
	public function maybe_bypass_shipping_cache( $value ) {
		static $cache;
		// phpcs:disable PHPCompatibility.FunctionUse.ArgumentFunctionsReportCurrentValue.NeedsInspection
		if (
			'yes' === $value
			|| true === $cache
			|| ! $this->is_cart_or_shipping()
			|| ! (
				isset( WC()->cart )
				&& WC()->cart->get_customer()->get_shipping_postcode()
			)
		) {
			return $value;
		}

		$backtrace = debug_backtrace(); // phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_debug_backtrace

		if (
			! (
				( isset( $backtrace[4] ) && 'calculate_shipping_for_package' === $backtrace[4]['function'] && 'WC_Shipping' === $backtrace[4]['class'] )
			)
		) {
			return $value;
		}
		// phpcs:enable PHPCompatibility.FunctionUse.ArgumentFunctionsReportCurrentValue.NeedsInspection
		if ( isset( $backtrace[4]['args'] ) && isset( $backtrace[4]['args'][0] ) && isset( $backtrace[4]['args'][0]['ship_via'] ) && is_array( $backtrace[4]['args'][0]['ship_via'] ) ) {
			foreach ( $backtrace[4]['args'][0]['ship_via'] as $ship_via ) {
				if ( 'per_product' === $ship_via ) {
					return $value;
				}
			}
		}

		$package     = $backtrace[4]['args'][0];
		$package_key = $backtrace[4]['args'][1];

		$rates_group     = array( 'FREIGHT', 'GROUND', 'INTERNATIONAL', 'SMART_POST' );
		$service_enabled = array();
		$enabled         = false;

		if ( ! isset( $package['contents'] ) || ! is_array( $package['contents'] ) ) {
			return $value;
		}

		$stored_rates = WC()->session->get( 'shipping_for_package_' . $package_key );
		$has_rates    = false;
		$rates        = array();
		if ( ! isset( $stored_rates['rates'] ) || ! is_array( $stored_rates['rates'] ) ) {
			return $value;
		}

		/**
		 * Loop the stored rates to add `$rates` array.
		 *
		 * @var WC_Shipping_Rate $rate
		 */
		foreach ( $stored_rates['rates'] as $rate ) {
			if ( ! $rate instanceof WC_Shipping_Rate || 'fedex' !== $rate->get_method_id() ) {
				continue;
			}
			$has_rates         = true;
			$this->instance_id = $rate->get_instance_id();

			$rates[ $this->instance_id ]['services'] = $this->get_option( 'services', array() );
			$rates[ $this->instance_id ]['rate'][]   = $rate->get_id();
		}

		if ( ! $has_rates && $this->validate_products( $package ) ) {
			return 'yes';
		}

		foreach ( $rates as $zone_id => $zone ) {

			foreach ( $rates_group as $group ) {
				foreach ( $zone['services'] as $service_name => $service ) {
					if ( false === $service['enabled'] ) {
						continue;
					}

					if ( false !== strpos( $service_name, $group ) ) {
						$service_enabled[ $group ] = true;
					}
				}
			}
		}

		foreach ( $service_enabled as $service_key => $is_enabled ) {
			foreach ( $stored_rates['rates'] as $rate ) {
				if ( false !== strpos( $rate->get_id(), $service_key ) ) {
					unset( $service_enabled[ $service_key ] );
				}
			}
		}

		if ( ! empty( $service_enabled ) || empty( $stored_rates['rates'] ) ) {
			$enabled = true;
		}

		return $enabled ? 'yes' : $value;
	}

	/**
	 * Check if the shipping method can be available for current package.
	 *
	 * @param array $package Cart package.
	 *
	 * @return bool
	 */
	public function is_available( $package ) {
		if ( empty( $package['destination']['country'] ) ) {
			return false;
		}

		if ( ! $this->validate_products( $package ) ) {
			return false;
		}

		/**
		 * Filter to allow third party disable/enable the shipping method availability.
		 *
		 * @param boolean Flag for the availability.
		 * @param array Cart package.
		 *
		 * @since 3.4.0
		 */
		return apply_filters(
			// phpcs:ignore WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedHooknameFound
			'woocommerce_shipping_' . $this->id . '_is_available',
			true,
			$package
		);
	}

	/**
	 * Initialize settings
	 *
	 * @return void
	 * @since   3.4.0
	 * @version 3.4.0
	 */
	private function set_settings() {
		// Define user set variables.
		$this->title = $this->get_option( 'title', $this->method_title );

		/**
		 * Allow third party to modify the origin postal code.
		 *
		 * @param string Base postal code.
		 *
		 * @since 3.3.5
		 */
		$this->origin = apply_filters( 'woocommerce_fedex_origin_postal_code', str_replace( ' ', '', strtoupper( $this->get_option( 'origin' ) ) ) );

		/**
		 * Allow third party to modify the origin country code.
		 *
		 * @param string Base country code.
		 *
		 * @since 3.3.5
		 */
		$this->origin_country = apply_filters( 'woocommerce_fedex_origin_country_code', $this->get_base_country() );
		$this->tax_status     = $this->get_option( 'tax_status' );
		$this->account_number = $this->get_option( 'account_number' );
		$this->meter_number   = $this->get_option( 'meter_number' );
		$this->smartpost_hub  = $this->get_option( 'smartpost_hub' );
		$this->production     = 'yes' === $this->get_option( 'production' );
		$this->debug          = 'yes' === $this->get_option( 'debug' );
		$this->api_mode       = $this->is_production() ? 'production' : 'test';

		/**
		 * Filter to disable/enable insure contents.
		 *
		 * @param boolean
		 *
		 * @since 3.4.33
		 */
		$this->insure_contents            = apply_filters( 'woocommerce_fedex_insure_contents', 'yes' === $this->get_option( 'insure_contents' ), $this );
		$this->request_type               = $this->get_option( 'request_type', 'LIST' );
		$this->packing_method             = $this->get_option( 'packing_method', 'per_item' );
		$this->boxes                      = $this->get_option( 'boxes', array() );
		$this->custom_services            = $this->get_option( 'services', array() );
		$this->offer_rates                = $this->get_option( 'offer_rates', 'all' );
		$this->residential                = 'yes' === $this->get_option( 'residential' );
		$this->freight_enabled            = 'yes' === $this->get_option( 'freight_enabled' );
		$this->ground_services            = include WC_SHIPPING_FEDEX_ABSPATH . 'includes/data/data-ground-services.php';
		$this->smartpost_services         = include WC_SHIPPING_FEDEX_ABSPATH . 'includes/data/data-smartpost-services.php';
		$this->freight_services           = include WC_SHIPPING_FEDEX_ABSPATH . 'includes/data/data-freight-services.php';
		$this->fedex_one_rate             = 'yes' === $this->get_option( 'fedex_one_rate', 'no' ) && 'US' === $this->origin_country;
		$this->fedex_one_rate_package_ids = array(
			'FEDEX_SMALL_BOX',
			'FEDEX_MEDIUM_BOX',
			'FEDEX_LARGE_BOX',
			'FEDEX_EXTRA_LARGE_BOX',
			'FEDEX_PAK',
			'FEDEX_ENVELOPE',
			'FEDEX_TUBE',
		);
		$this->box_packer_library         = $this->get_option( 'box_packer_library', $this->get_default_box_packer_library() );
		if ( $this->freight_enabled ) {
			$this->freight_class               = str_replace( array( 'CLASS_', '.' ), array( '', '_' ), $this->get_option( 'freight_class' ) );
			$this->freight_number              = $this->get_option( 'freight_number', $this->account_number );
			$this->freight_billing_street      = $this->get_option( 'freight_billing_street' );
			$this->freight_billing_street_2    = $this->get_option( 'freight_billing_street_2' );
			$this->freight_billing_city        = $this->get_option( 'freight_billing_city' );
			$this->freight_billing_state       = $this->get_option( 'freight_billing_state' );
			$this->freight_billing_postcode    = $this->get_option( 'freight_billing_postcode' );
			$this->freight_billing_country     = $this->get_option( 'freight_billing_country' );
			$this->freight_shipper_street      = $this->get_option( 'freight_shipper_street' );
			$this->freight_shipper_street_2    = $this->get_option( 'freight_shipper_street_2' );
			$this->freight_shipper_city        = $this->get_option( 'freight_shipper_city' );
			$this->freight_shipper_state       = $this->get_option( 'freight_shipper_state' );
			$this->freight_shipper_postcode    = $this->get_option( 'freight_shipper_postcode' );
			$this->freight_shipper_country     = $this->get_option( 'freight_shipper_country' );
			$this->freight_shipper_residential = 'yes' === $this->get_option( 'freight_shipper_residential' );
		}

		// API settings.
		$this->api_type      = $this->get_option( 'api_type', $this->get_default_api_type() );
		$this->api_key       = $this->get_option( 'api_key' );
		$this->api_pass      = $this->get_option( 'api_pass' );
		$this->client_id     = $this->get_option( 'client_id', '' );
		$this->client_secret = $this->get_option( 'client_secret', '' );

		// Initialize API class objects.
		$this->fedex_oauth = new FedEx_OAuth( $this );
		$this->maybe_disable_soap();
		$this->fedex_api = 'rest' === $this->api_type ? new FedEx_REST_API( $this ) : new FedEx_Legacy_API( $this );

		// Insure contents requires matching currency to country.
		switch ( $this->origin_country ) {
			case 'US':
				if ( 'USD' !== get_woocommerce_currency() ) {
					$this->insure_contents = false;
				}
				break;
			case 'CA':
				if ( 'CAD' !== get_woocommerce_currency() ) {
					$this->insure_contents = false;
				}
				break;
		}
	}

	/**
	 * Process settings on save
	 *
	 * @return void
	 * @version 3.4.0
	 * @since   3.4.0
	 */
	public function process_admin_options() {
		add_filter( 'woocommerce_shipping_' . $this->id . '_option', array( $this, 'get_updated_option' ), 10, 2 );

		parent::process_admin_options();

		$this->set_settings();
	}

	/**
	 * Get option value from $_POST.
	 *
	 * @param mixed  $value Option value.
	 * @param string $key  Option key.
	 *
	 * @return mixed
	 * @since 4.4.0
	 */
	public function get_updated_option( $value, $key ) {
		// Nonce already checked by WooCommerce.
		// phpcs:disable WordPress.Security.NonceVerification.Missing
		if ( isset( $_POST[ $this->plugin_id . $this->id . '_' . $key ] ) ) {
			$value = wc_clean( wp_unslash( $_POST[ $this->plugin_id . $this->id . '_' . $key ] ) );

			if ( isset( $this->form_fields[ $key ]['type'] ) && 'checkbox' === $this->form_fields[ $key ]['type'] ) {
				$value = wc_bool_to_string( $value );
			}
		}
		// phpcs:enable WordPress.Security.NonceVerification.Missing
		return $value;
	}

	/**
	 * Output a message or error
	 *
	 * @param string $message Notification message.
	 * @param string $type Notification type (success, notice, error).
	 * @param bool   $is_user_notification Flag allowing to show notification for customer even if debug mode is not activated.
	 */
	public function notify( $message, $type = 'notice', $is_user_notification = false ) {
		static $messages;

		// Prevent duplicated notices when notice is already in session.
		$notices = WC()->session->get( 'wc_notices' );
		if ( isset( $notices[ $type ] ) && is_array( $notices[ $type ] ) ) {
			foreach ( $notices[ $type ] as $notice ) {
				if ( isset( $notice['notice'] ) ) {
					$messages[ md5( $notice['notice'] ) ] = true;
				}
			}
		}

		$index = md5( $message );
		if (
			// Prevent showing duplicated notifications.
			isset( $messages[ $index ] ) ||
			// Prevent showing duplicated notifications when product is removed or restored to cart.
			did_action( 'woocommerce_cart_item_removed' ) ||
			did_action( 'woocommerce_cart_item_restored' ) ||
			did_action( 'woocommerce_after_cart_item_quantity_update' )
		) {
			return;
		} else {
			$messages[ $index ] = true;
		}

		if ( $this->debug || $is_user_notification ) {
			wc_add_notice( $message, $type );
		}
	}

	/**
	 * Add debug information in the cart/checkout page using JS.
	 */
	private function add_debug_script() {
		static $enqueue_js = false;

		if ( $this->debug && ! $enqueue_js && $this->is_cart_or_shipping() ) {
			wc_enqueue_js(
				"jQuery(document.body).on('click', 'a.debug_reveal', function(e){
					e.preventDefault();
					jQuery(this).closest('div').find('.debug_info').slideToggle();
					if (jQuery(this).text() == 'Show') {
						jQuery(this).text('Hide')
					} else {
						jQuery(this).text('Show');
					}
				});
				jQuery('pre.debug_info').hide();
				jQuery(document.body).on( 'updated_wc_div wc_update_cart updated_checkout added_to_cart removed_from_cart wc_update_cart', function() {
					jQuery('pre.debug_info').hide();
				});
				"
			);
			$enqueue_js = true;
		}
	}

	/**
	 * Get the default API type.
	 *
	 * If the user has not selected an API type, and there are existing instances,
	 * default to SOAP.
	 *
	 * If there are no existing instances, default to REST.
	 *
	 * @return string
	 */
	private function get_default_api_type() {
		return ! empty( $this->get_option( 'api_key' ) ) ? 'soap' : 'rest';
	}

	/**
	 * Initiate setting fields.
	 */
	public function init_form_fields() {
		$this->instance_form_fields = include WC_SHIPPING_FEDEX_ABSPATH . 'includes/data/data-settings.php';

		if (
			'US' !== $this->get_base_country()
			&& isset( $this->instance_form_fields['fedex_one_rate'] )
			&& is_array( $this->instance_form_fields['fedex_one_rate'] )
		) {
			$this->instance_form_fields['fedex_one_rate']['custom_attributes']['disabled'] = 'disabled';
			$this->instance_form_fields['fedex_one_rate']['desc_tip']                      = false;
			$this->instance_form_fields['fedex_one_rate']['description']                   = sprintf(
				// translators: %1$s - line break markup, %2$s - store origin country.
				__( 'FedEx One Rate is only available for shipments with an origin within the United States.%1$sYour store origin country: %2$s', 'woocommerce-shipping-fedex' ),
				'<br>',
				'<b>' . ( isset( WC()->countries->get_countries()[ $this->get_base_country() ] )
				? WC()->countries->get_countries()[ $this->get_base_country() ]
				: $this->get_base_country() ) . '</b>'
			);
		}

		$freight_classes = include WC_SHIPPING_FEDEX_ABSPATH . 'includes/data/data-freight-classes.php';

		$this->form_fields = array(
			'api'                         => array(
				'title'       => __( 'API Settings', 'woocommerce-shipping-fedex' ),
				'type'        => 'title',
				'description' => __( 'Your API access details are obtained from the FedEx website. After you <a href="https://www.fedex.com/register/#/contact" target="_blank">create a FedEx account</a>, follow the <a href="https://woocommerce.com/document/fedex/#h-api-debug" target="_blank">instructions for obtaining test and production keys</a>.', 'woocommerce-shipping-fedex' ),
			),
			'api_type'                    => array(
				'title'       => __( 'API Type', 'woocommerce-shipping-fedex' ),
				'type'        => 'select',
				'css'         => 'width: 250px;',
				'description' => __( 'Select whether to use the legacy SOAP API or the new REST API.', 'woocommerce-shipping-fedex' ),
				'desc_tip'    => true,
				'class'       => 'chosen_select',
				'default'     => $this->get_default_api_type(),
				'options'     => array(
					'rest' => __( 'REST', 'woocommerce-shipping-fedex' ),
					'soap' => __( 'SOAP (legacy)', 'woocommerce-shipping-fedex' ),
				),
			),
			'account_number'              => array(
				'title'       => __( 'Shipping Account Number', 'woocommerce-shipping-fedex' ),
				'type'        => 'text',
				'desc_tip'    => true,
				'description' => __( 'Can be obtained under account management in your FedEx profile when using the SOAP API or in your FedEx Project settings when using the REST API.', 'woocommerce-shipping-fedex' ),
				'default'     => '',
			),
			'meter_number'                => array(
				'title'             => __( 'Meter Number', 'woocommerce-shipping-fedex' ),
				'type'              => 'text',
				'description'       => __( 'Obtained from FedEx after creating a legacy test or production key.', 'woocommerce-shipping-fedex' ),
				'desc_tip'          => true,
				'default'           => '',
				'custom_attributes' => array( 'data-fedex_api_type' => 'soap' ),
			),
			'client_id'                   => array(
				'title'             => __( 'REST API Key', 'woocommerce-shipping-fedex' ),
				'type'              => 'text',
				'description'       => __( 'Obtained from FedEx after creating a Project in the FedEx Developer Portal.', 'woocommerce-shipping-fedex' ),
				'default'           => '',
				'desc_tip'          => true,
				'custom_attributes' => array( 'data-fedex_api_type' => 'rest' ),
			),
			'client_secret'               => array(
				'title'             => __( 'REST API Secret', 'woocommerce-shipping-fedex' ),
				'type'              => 'password',
				'description'       => __( 'Obtained from FedEx after creating a Project in the FedEx Developer Portal.', 'woocommerce-shipping-fedex' ),
				'default'           => '',
				'desc_tip'          => true,
				'custom_attributes' => array( 'data-fedex_api_type' => 'rest' ),
			),
			'api_key'                     => array(
				'title'             => __( 'Web Services Key', 'woocommerce-shipping-fedex' ),
				'type'              => 'text',
				'description'       => __( 'Obtained from FedEx after creating a legacy test or production key.', 'woocommerce-shipping-fedex' ),
				'desc_tip'          => true,
				'default'           => '',
				'custom_attributes' => array(
					'autocomplete'        => 'off',
					'data-fedex_api_type' => 'soap',
				),
			),
			'api_pass'                    => array(
				'title'             => __( 'Web Services Password', 'woocommerce-shipping-fedex' ),
				'type'              => 'password',
				'description'       => __( 'Web Services password related with Shipping Account Number. Obtained from FedEx after creating a legacy test or production key.', 'woocommerce-shipping-fedex' ),
				'desc_tip'          => true,
				'default'           => '',
				'custom_attributes' => array(
					'autocomplete'        => 'off',
					'data-fedex_api_type' => 'soap',
				),
			),
			'oauth_status'                => array(
				'title'             => __( 'REST API Status', 'woocommerce-shipping-fedex' ),
				'type'              => 'oauth_status',
				'description'       => __( 'Displays the current FedEx REST API authorization status.', 'woocommerce-shipping-fedex' ),
				'desc_tip'          => true,
				'custom_attributes' => array( 'data-fedex_api_type' => 'rest' ),
			),
			'production'                  => array(
				'title'       => __( 'Production Key', 'woocommerce-shipping-fedex' ),
				'label'       => __( 'This is a production key', 'woocommerce-shipping-fedex' ),
				'type'        => 'checkbox',
				'default'     => 'no',
				'desc_tip'    => true,
				'description' => __( 'If this is a production API key and not a developer key, check this box.', 'woocommerce-shipping-fedex' ),
			),
			'box_packer_library'          => array(
				'title'       => __( 'Box Packer Library', 'woocommerce-shipping-fedex' ),
				'type'        => 'select',
				'default'     => '',
				'class'       => 'box_packer_library',
				'options'     => array(
					'original' => __( 'Speed Packer', 'woocommerce-shipping-fedex' ),
					'dvdoug'   => __( 'Accurate Packer', 'woocommerce-shipping-fedex' ),
				),
				'description' => __( 'Speed Packer packs items by volume, Accurate Packer check each dimension allowing more accurate packing but might be slow when you sell items in large quantities.', 'woocommerce-shipping-fedex' ),
			),
			'freight'                     => array(
				'title'       => __( 'LTL Freight', 'woocommerce-shipping-fedex' ),
				'type'        => 'title',
				'description' => __( 'If your account supports Freight, we need some additional details to get LTL rates. Note: These rates require the customers CITY so won\'t display until checkout.', 'woocommerce-shipping-fedex' ),
			),
			'freight_enabled'             => array(
				'title'   => __( 'Enable', 'woocommerce-shipping-fedex' ),
				'label'   => __( 'Enable Freight', 'woocommerce-shipping-fedex' ),
				'type'    => 'checkbox',
				'default' => 'no',
			),
			'freight_number'              => array(
				'title'       => __( 'Freight Account Number', 'woocommerce-shipping-fedex' ),
				'type'        => 'text',
				'description' => '',
				'default'     => '',
				'placeholder' => __( 'Defaults to your main account number', 'woocommerce-shipping-fedex' ),
			),
			'freight_billing_street'      => array(
				'title'   => __( 'Billing Street Address', 'woocommerce-shipping-fedex' ),
				'type'    => 'text',
				'default' => '',
			),
			'freight_billing_street_2'    => array(
				'title'   => __( 'Billing Street Address', 'woocommerce-shipping-fedex' ),
				'type'    => 'text',
				'default' => '',
			),
			'freight_billing_city'        => array(
				'title'   => __( 'Billing City', 'woocommerce-shipping-fedex' ),
				'type'    => 'text',
				'default' => '',
			),
			'freight_billing_state'       => array(
				'title'   => __( 'Billing State Code', 'woocommerce-shipping-fedex' ),
				'type'    => 'text',
				'default' => '',
			),
			'freight_billing_postcode'    => array(
				'title'   => __( 'Billing ZIP / Postcode', 'woocommerce-shipping-fedex' ),
				'type'    => 'text',
				'default' => '',
			),
			'freight_billing_country'     => array(
				'title'   => __( 'Billing Country Code', 'woocommerce-shipping-fedex' ),
				'type'    => 'text',
				'default' => '',
			),
			'freight_shipper_street'      => array(
				'title'   => __( 'Shipper Street Address', 'woocommerce-shipping-fedex' ),
				'type'    => 'text',
				'default' => '',
			),
			'freight_shipper_street_2'    => array(
				'title'   => __( 'Shipper Street Address 2', 'woocommerce-shipping-fedex' ),
				'type'    => 'text',
				'default' => '',
			),
			'freight_shipper_city'        => array(
				'title'   => __( 'Shipper City', 'woocommerce-shipping-fedex' ),
				'type'    => 'text',
				'default' => '',
			),
			'freight_shipper_state'       => array(
				'title'   => __( 'Shipper State Code', 'woocommerce-shipping-fedex' ),
				'type'    => 'text',
				'default' => '',
			),
			'freight_shipper_postcode'    => array(
				'title'   => __( 'Shipper ZIP / Postcode', 'woocommerce-shipping-fedex' ),
				'type'    => 'text',
				'default' => '',
			),
			'freight_shipper_country'     => array(
				'title'   => __( 'Shipper Country Code', 'woocommerce-shipping-fedex' ),
				'type'    => 'text',
				'default' => '',
			),
			'freight_shipper_residential' => array(
				'title'       => __( 'Residential', 'woocommerce-shipping-fedex' ),
				'label'       => __( 'Shipper Address is Residential?', 'woocommerce-shipping-fedex' ),
				'type'        => 'checkbox',
				'default'     => 'no',
				'desc_tip'    => true,
				'description' => __( 'Applied only to Freight shipments.', 'woocommerce-shipping-fedex' ),
			),
			'freight_class'               => array(
				'title'       => __( 'Default Freight Class', 'woocommerce-shipping-fedex' ),
				// translators: %s is a link to set the shipping class.
				'description' => sprintf( __( 'This is the default freight class for shipments. This can be overridden using <a href="%s">shipping classes</a>', 'woocommerce-shipping-fedex' ), $shipping_class_link ),
				'type'        => 'select',
				'default'     => '50',
				'options'     => $freight_classes,
			),
			'debug'                       => array(
				'title'       => __( 'Debug Mode', 'woocommerce-shipping-fedex' ),
				'label'       => __( 'Enable debug mode', 'woocommerce-shipping-fedex' ),
				'type'        => 'checkbox',
				'default'     => 'no',
				'desc_tip'    => true,
				'description' => __( 'Enable debug mode to show debugging information on the cart/checkout.', 'woocommerce-shipping-fedex' ),
			),
		);
	}

	/**
	 * Check if SOAP retired notification should be shown and should SOAP option be disabled.
	 *
	 * @return void
	 */
	private function maybe_disable_soap() {
		if ( 'soap' === $this->api_type() && $this->api_key && $this->api_pass ) {
			$this->show_soap_deprecated_notification();
		} else {
			$this->api_type = 'rest';
		}
		// phpcs:disable WordPress.Security.NonceVerification.Recommended --- security handled by WooCommerce
		if (
			! ( isset( $_GET['page'] ) && 'wc-settings' === $_GET['page'] ) &&
			! ( isset( $_GET['section'] ) && 'fedex' === $_GET['section'] )
		) {
			return;
		}
		// phpcs:enable WordPress.Security.NonceVerification.Recommended
		if ( $this->should_disable_soap() ) {
			wp_dequeue_script( 'fedex-admin-js' );
			$this->form_fields['api_type']['type']     = 'hidden';
			$this->form_fields['meter_number']['type'] = 'hidden';
			$this->form_fields['api_key']['type']      = 'hidden';
			$this->form_fields['api_pass']['type']     = 'hidden';
		}
	}

	/**
	 * Show admin notification.
	 *
	 * @return void
	 */
	private function show_soap_deprecated_notification() {
		static $has_shown_notification = false;

		if ( $has_shown_notification ) {
			return;
		}

		add_action(
			'admin_notices',
			function () {
				echo '<div class="error notice"><p>' .
				sprintf(
					// translators: %1$s a link opening tag, %2$s link closing tag.
					esc_html__( 'NOTICE! Effective May 15, 2024, the FedEx SOAP API will be deprecated. Immediate action is required to transition to the REST API for uninterrupted service. To learn how to setup FedEx APIs integration, please visit %1$sWoo FedEx Shipping Method documentation%2$s.', 'woocommerce-shipping-fedex' ),
					'<a href="https://woocommerce.com/document/fedex/#h-api-debug" target="_blank">',
					'</a>'
				) . '</p></div>';
			}
		);

		$has_shown_notification = true;
	}

	/**
	 * Check if SOAP option should be disabled.
	 *
	 * @return bool
	 */
	private function should_disable_soap() {
		if ( ! $this->api_key || ! $this->api_pass ) {
			if ( 'soap' === $this->api_type ) {
				$this->update_option( 'api_type', 'rest' );
			}
			return true;
		}

		if ( $this->client_id && $this->client_secret && $this->fedex_oauth->is_authenticated() && $this->is_production() ) {
			return true;
		}

		return false;
	}

	/**
	 * HTML for oauth_status option.
	 *
	 * @param string $key  Option key.
	 * @param array  $data Option data.
	 *
	 * @return string HTML for oauth_status option.
	 */
	public function generate_oauth_status_html( $key, $data ) {

		$field_key = $this->get_field_key( $key );
		$defaults  = array(
			'title'             => '',
			'disabled'          => false,
			'class'             => '',
			'css'               => '',
			'placeholder'       => '',
			'desc_tip'          => false,
			'description'       => '',
			'custom_attributes' => array(),
		);

		$data = wp_parse_args( $data, $defaults );

		ob_start();
		include 'views/html-oauth-status.php';

		return ob_get_clean();
	}

	/**
	 * Generate HTML for service fields.
	 */
	public function generate_services_html() {
		ob_start();
		include 'views/html-services.php';

		return ob_get_clean();
	}

	/**
	 * Generate HTML for box packing fields.
	 */
	public function generate_box_packing_html() {
		ob_start();
		include 'views/html-box-packing.php';

		return ob_get_clean();
	}

	/**
	 * Validate the box packing field.
	 *
	 * @param mixed $key Field key.
	 */
	public function validate_box_packing_field( $key ) {

		if ( ! isset( $_POST['_wpnonce'] ) || ! wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['_wpnonce'] ) ), 'woocommerce-settings' ) ) {
			return;
		}

		// These $_POST globals are validated and type cast in the loop below.
		$boxes_name       = isset( $_POST['boxes_name'] ) ? wc_clean( wp_unslash( $_POST['boxes_name'] ) ) : array();
		$boxes_length     = isset( $_POST['boxes_length'] ) ? wc_clean( wp_unslash( $_POST['boxes_length'] ) ) : array();
		$boxes_width      = isset( $_POST['boxes_width'] ) ? wc_clean( wp_unslash( $_POST['boxes_width'] ) ) : array();
		$boxes_height     = isset( $_POST['boxes_height'] ) ? wc_clean( wp_unslash( $_POST['boxes_height'] ) ) : array();
		$boxes_box_weight = isset( $_POST['boxes_box_weight'] ) ? wc_clean( wp_unslash( $_POST['boxes_box_weight'] ) ) : array();
		$boxes_max_weight = isset( $_POST['boxes_max_weight'] ) ? wc_clean( wp_unslash( $_POST['boxes_max_weight'] ) ) : array();
		$boxes_type       = isset( $_POST['boxes_type'] ) ? wc_clean( wp_unslash( $_POST['boxes_type'] ) ) : array();
		$boxes_enabled    = isset( $_POST['boxes_enabled'] ) ? wc_clean( wp_unslash( $_POST['boxes_enabled'] ) ) : array();
		$boxes            = array();

		if ( ! empty( $boxes_length ) && count( $boxes_length ) > 0 ) {
			$max_boxes_length = max( array_keys( $boxes_length ) );
			for ( $i = 0; $i <= $max_boxes_length; $i++ ) {

				if ( ! isset( $boxes_length[ $i ] ) ) {
					continue;
				}

				if ( $boxes_length[ $i ] && $boxes_width[ $i ] && $boxes_height[ $i ] ) {

					$boxes[] = array(
						'id'         => $boxes_type[ $i ],
						'name'       => wc_clean( $boxes_name[ $i ] ),
						'length'     => floatval( $boxes_length[ $i ] ),
						'width'      => floatval( $boxes_width[ $i ] ),
						'height'     => floatval( $boxes_height[ $i ] ),
						'box_weight' => floatval( $boxes_box_weight[ $i ] ),
						'max_weight' => floatval( $boxes_max_weight[ $i ] ),
						'enabled'    => isset( $boxes_enabled[ $i ] ) ? true : false,
					);
				}
			}
		}
		foreach ( $this->default_boxes as $box ) {
			$boxes[ $box['id'] ] = array(
				'enabled' => isset( $boxes_enabled[ $box['id'] ] ) ? true : false,
			);
		}

		return $boxes;
	}

	/**
	 * Validate service field.
	 *
	 * @param mixed $key Field key.
	 */
	public function validate_services_field( $key ) {
		if ( ! isset( $_POST['_wpnonce'] ) || ! wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['_wpnonce'] ) ), 'woocommerce-settings' ) ) {
			return;
		}

		$services        = array();
		$posted_services = isset( $_POST['fedex_service'] ) ? wp_unslash( $_POST['fedex_service'] ) : array(); // phpcs:ignore WordPress.Security.ValidatedSanitizedInput.InputNotSanitized, this $_POST variable is validated in the loop below.

		foreach ( $posted_services as $code => $settings ) {
			$services[ $code ] = array(
				'name'               => wc_clean( $settings['name'] ),
				'order'              => wc_clean( $settings['order'] ),
				'enabled'            => isset( $settings['enabled'] ) ? true : false,
				'adjustment'         => wc_clean( $settings['adjustment'] ),
				'adjustment_percent' => str_replace( '%', '', wc_clean( $settings['adjustment_percent'] ) ),
			);
		}

		return $services;
	}

	/**
	 * Get packages.
	 *
	 * Divide the WC package into packages/parcels suitable for a FEDEX quote.
	 *
	 * @param array $package Package to ship.
	 *
	 * @return array Package to ship.
	 */
	public function get_fedex_packages( $package ) {
		switch ( $this->packing_method ) {
			case 'box_packing':
				return $this->box_shipping( $package );
			case 'per_item':
			default:
				return $this->per_item_shipping( $package );
		}
	}

	/**
	 * Get the freight class.
	 *
	 * @param int $shipping_class_id Shipping class ID.
	 *
	 * @return string
	 */
	public function get_freight_class( $shipping_class_id ) {
		$class = get_term_meta( $shipping_class_id, 'fedex_freight_class', true );
		return $class ? $class : $this->freight_class;
	}

	/**
	 * If the box packer library option is not yet set and there are existing
	 * FedEx shipping method instances, we can assume that this is not a
	 * new/fresh installation of the FedEx plugin,
	 * so we should default to 'original'
	 *
	 * If the box packer library option is not set and there are no
	 * FedEx shipping method instances, then this is likely a new
	 * installation of the FedEx plugin,
	 * so we should default to 'dvdoug'
	 *
	 * @return string
	 */
	public function get_default_box_packer_library(): string {
		if (
			empty( $this->get_option( 'box_packer_library' ) )
			&& $this->instances_exist()
		) {
			return 'original';
		} else {
			return 'dvdoug';
		}
	}

	/**
	 * Pack items individually.
	 *
	 * @param mixed $package Package to ship.
	 *
	 * @return array
	 */
	private function per_item_shipping( $package ) {
		$to_ship  = array();
		$group_id = 1;

		// Get weight of order.
		foreach ( $package['contents'] as $values ) {
			if ( ! $values['data']->needs_shipping() ) {
				continue;
			}

			if ( ! $values['data']->get_weight() ) {
				return array();
			}

			$group = array(
				'GroupNumber'       => $group_id,
				'GroupPackageCount' => $values['quantity'],
				'Weight'            => array(
					'Value' => (float) max( 0.5, round( wc_get_weight( $values['data']->get_weight(), 'lbs' ), 2 ) ),
					'Units' => 'LB',
				),
				'packed_products'   => array( $values['data'] ),
			);

			if ( $values['data']->get_length() && $values['data']->get_height() && $values['data']->get_width() ) {

				$dimensions = array( $values['data']->get_length(), $values['data']->get_width(), $values['data']->get_height() );

				sort( $dimensions );

				$group['Dimensions'] = array(
					'Length' => max( 1, round( wc_get_dimension( $dimensions[2], 'in' ), 2 ) ),
					'Width'  => max( 1, round( wc_get_dimension( $dimensions[1], 'in' ), 2 ) ),
					'Height' => max( 1, round( wc_get_dimension( $dimensions[0], 'in' ), 2 ) ),
					'Units'  => 'IN',
				);
			}

			$group['InsuredValue'] = array(
				'Amount'   => round( $values['data']->get_price() ),
				'Currency' => get_woocommerce_currency(),
			);

			$to_ship[] = $group;

			++$group_id;
		}

		return $to_ship;
	}

	/**
	 * Pack into boxes with weights and dimensions.
	 *
	 * @param mixed $package Package to ship.
	 *
	 * @return array
	 */
	private function box_shipping( $package ) {
		/**
		 * Allowing third party to disable preferred packages.
		 *
		 * @param boolean
		 *
		 * @since 3.4.25
		 */
		$boxpack = (
			new WC_Boxpack(
				'in',
				'lbs',
				$this->box_packer_library,
				/**
				 * Allow to modify prefer_packets flag [true|false].
				 *
				 * @since 4.1.0
				 */
				array( 'prefer_packets' => apply_filters( 'woocommerce_fedex_prefer_packets', true ) )
			)
		)->get_packer();

		// Merge default boxes.
		foreach ( $this->default_boxes as $key => $box ) {
			$box['enabled'] = isset( $this->boxes[ $box['id'] ]['enabled'] ) ? $this->boxes[ $box['id'] ]['enabled'] : true;
			$this->boxes[]  = $box;
		}

		// Check if we are shipping US outbound.
		$us_outbound = 'US' === $this->origin_country && 'US' !== $package['destination']['country'];

		// Define boxes.
		foreach ( $this->boxes as $key => $box ) {
			if ( ! is_numeric( $key ) ) {
				continue;
			}

			// Allow 10kg or 25kg box only in international shipments.
			if (
				! $us_outbound
				&& in_array( $box['id'], array( 'FEDEX_10KG_BOX', 'FEDEX_25KG_BOX' ), true )
			) {
				continue;
			}

			if ( ! $box['enabled'] ) {
				continue;
			}

			$box_id = isset( $box['id'] ) ? current( explode( ':', $box['id'] ) ) : '';

			if ( $this->fedex_one_rate && ! empty( $box['one_rate_max_weight'] ) ) {
				$box['max_weight'] = $box['one_rate_max_weight'];
			} elseif ( $us_outbound && in_array( $box_id, array( 'FEDEX_SMALL_BOX', 'FEDEX_MEDIUM_BOX', 'FEDEX_LARGE_BOX', 'FEDEX_EXTRA_LARGE_BOX' ), true ) ) {
				// US outbound shipping allows max_weight of 40 lbs.
				$box['max_weight'] = 40;
			}

			$newbox = $boxpack->add_box( $box['length'], $box['width'], $box['height'], $box['box_weight'] );

			$newbox->set_max_weight( $box['max_weight'] );

			$newbox->set_id( $box_id );

			if ( ! empty( $box['type'] ) ) {
				$newbox->set_type( $box['type'] );
			}
		}

		// Add items.
		foreach ( $package['contents'] as $values ) {
			if ( ! $values['data']->needs_shipping() ) {
				continue;
			}

			if ( ! $values['data']->get_length() || ! $values['data']->get_height() || ! $values['data']->get_width() || ! $values['data']->get_weight() ) {
				Logger::debug( 'Product: "' . $values['data']->get_name() . '" #' . $values['data']->get_id() . ' has no dimensions or weight and cannot be packed. Aborting.' );
				$this->notify( 'Product: "' . $values['data']->get_name() . '" #' . $values['data']->get_id() . ' has no dimensions or weight and cannot be packed. Aborting FedEx shipping rate calculation.' );
				return array();
			}

			$dimensions = array( $values['data']->get_length(), $values['data']->get_height(), $values['data']->get_width() );

			$boxpack->add_item(
				wc_get_dimension( $dimensions[2], 'in' ),
				wc_get_dimension( $dimensions[1], 'in' ),
				wc_get_dimension( $dimensions[0], 'in' ),
				wc_get_weight( $values['data']->get_weight(), 'lbs' ),
				$values['data']->get_price(),
				array(
					'data' => $values['data'],
				),
				$values['quantity']
			);
		}

		// Pack it.
		$boxpack->pack();
		$packages         = $boxpack->get_packages();
		$to_ship          = array();
		$group_id         = 1;
		$grouped_packages = array();
		Logger::debug( '------ BOX PACKER ------' );
		foreach ( $packages as $package ) {
			$dimensions = array( $package->length, $package->width, $package->height );

			sort( $dimensions );

			$group = array(
				'GroupPackageCount' => 1,
				'Weight'            => array(
					'Value' => (float) max( 0.5, round( $package->weight, 2 ) ),
					'Units' => 'LB',
				),
				'Dimensions'        => array(
					'Length' => max( 1, round( $dimensions[2], 2 ) ),
					'Width'  => max( 1, round( $dimensions[1], 2 ) ),
					'Height' => max( 1, round( $dimensions[0], 2 ) ),
					'Units'  => 'IN',
				),
				'InsuredValue'      => array(
					'Amount'   => round( $package->value ),
					'Currency' => get_woocommerce_currency(),
				),
				'packed_products'   => array(),
				'package_id'        => $package->id,
			);

			if ( $this->freight_enabled && $this->is_freight_service_enabled() ) {
				$highest_freight_class = '';

				if ( ! empty( $package->packed ) && is_array( $package->packed ) ) {

					/**
					 * WooCommerce Order Item Product.
					 *
					 * @var WC_Order_Item_Product $item
					 */
					foreach ( $package->packed as $item ) {
						$shipping_class_id = $item->get_meta( 'data' )->get_shipping_class_id();
						if ( $shipping_class_id ) {
							$freight_class = $this->get_freight_class( $shipping_class_id );

							if ( $freight_class > $highest_freight_class ) {
								$highest_freight_class = $freight_class;
							}
						}
					}
				}

				$group['freight_class'] = $highest_freight_class ? $highest_freight_class : '';
			}

			$group_key = md5( wp_json_encode( $group ) );

			if ( ! empty( $package->packed ) && is_array( $package->packed ) ) {
				foreach ( $package->packed as $packed ) {
					$group['packed_products'][] = $packed->get_meta( 'data' );
				}
			}

			if ( isset( $grouped_packages[ $group_key ]['count'] ) ) {
				++$grouped_packages[ $group_key ]['count'];
			} else {
				$grouped_packages[ $group_key ]['data']    = $group;
				$grouped_packages[ $group_key ]['package'] = $package;
				$grouped_packages[ $group_key ]['count']   = 1;
			}
		}

		foreach ( $grouped_packages as $key => $package ) {
			Logger::debug( 'BOX PACKER: Package #' . $group_id . ' ' . $package['package']->id . ' - ' . $package['package']->length . 'x' . $package['package']->width . 'x' . $package['package']->height . ', weight: ' . (float) max( 0.5, round( $package['package']->weight, 2 ) ) . ' lbs | GroupPackageCount: ' . $package['count'] );
			$this->notify( '<b>BOX PACKER:</b> Package #' . $group_id . ' ' . $package['package']->id . ' - ' . $package['package']->length . 'x' . $package['package']->width . 'x' . $package['package']->height . ', weight: ' . (float) max( 0.5, round( $package['package']->weight, 2 ) ) . ' lbs | GroupPackageCount: ' . $package['count'] );
			$package['data']['GroupNumber']       = $group_id;
			$package['data']['GroupPackageCount'] = $package['count'];
			$to_ship[]                            = $package['data'];
			++$group_id;
		}

		return $to_ship;
	}

	/**
	 * Package count validation when calculate shipping.
	 *
	 * @param array $fedex_package FedEx package.
	 *
	 * @return bool.
	 */
	public function package_count_validation( $fedex_package ) {
		// Make sure the package is array.
		if ( ! is_array( $fedex_package ) ) {
			return false;
		}

		// Make sure the package is not empty.
		if ( empty( $fedex_package ) ) {
			return false;
		}

		// Get all package count information.
		$group_pkg_counts = array_column( $fedex_package, 'GroupPackageCount' );

		// Filtered the package count information that has more than 9999.
		$filtered_pkg_counts = array_filter(
			$group_pkg_counts,
			function ( $count ) {
				return ( 9999 < $count );
			}
		);

		// If not empty, it indicates that some of the FedEx package has more than 9999 items.
		// We add a notice for this and return false.
		if ( ! empty( $filtered_pkg_counts ) ) {
			wc_add_notice( esc_html__( 'Your items has exceeded the FedEx limit of 9999. Please decrease the quantity of your cart.', 'woocommerce-shipping-fedex' ), 'error' );

			return false;
		}

		return true;
	}

	/**
	 * Make API call to see if address is residential and update residential property.
	 *
	 * @param array $package Cart package.
	 *
	 * @return void
	 */
	public function residential_address_validation( $package ) {
		$residential = $this->residential;

		// First check if destination is populated. If not return true for residential.
		if ( empty( $package['destination']['address'] ) || empty( $package['destination']['postcode'] ) ) {
			/**
			 * Allow third party to modify the residential value.
			 *
			 * @param boolean Whether it's residential or not.
			 * @param array Cart package.
			 *
			 * @since 3.2.0
			 */
			$this->residential = apply_filters( 'woocommerce_fedex_address_type', 'yes' === $this->get_option( 'residential' ), $package );

			return;
		}

		$request = array();

		$request['RequestTimestamp']    = wp_date( 'c' );
		$request['Options']             = array(
			'CheckResidentialStatus'      => 1,
			'MaximumNumberOfMatches'      => 1,
			'StreetAccuracy'              => 'LOOSE',
			'DirectionalAccuracy'         => 'LOOSE',
			'CompanyNameAccuracy'         => 'LOOSE',
			'ConvertToUpperCase'          => 1,
			'RecognizeAlternateCityNames' => 1,
			'ReturnParsedElements'        => 1,
		);
		$request['AddressesToValidate'] = array(
			0 => array(
				'AddressId' => 'WTC',
				'Address'   => array(
					'StreetLines'         => array(
						$package['destination']['address'],
						$package['destination']['address_2'],
					),
					'City'                => $package['destination']['city'],
					'StateOrProvinceCode' => $package['destination']['state'],
					'PostalCode'          => $this->get_shipping_postcode( $package ),
					'CountryCode'         => $package['destination']['country'],
				),
			),
		);

		$residential = $this->fedex_api->residential_address_validation( $request );

		/**
		 * Allow third party to modify the residential value.
		 *
		 * @param boolean Whether it's residential or not.
		 * @param array Cart package.
		 *
		 * @since 3.2.0
		 */
		$this->residential = apply_filters( 'woocommerce_fedex_address_type', $residential, $package );

		if ( false === $this->residential ) {
			$this->notify( __( 'Business Address', 'woocommerce-shipping-fedex' ) );
		}
	}

	/**
	 * Add Special Service to API request.
	 *
	 * @param array  $request FedEx API request.
	 * @param string $service Service name.
	 *
	 * @return array
	 * @since   3.4.43
	 *
	 * @version 3.4.43
	 */
	private function add_special_service( $request, $service ) {

		if ( ! $service ) {
			return $request;
		}

		// If SpecialServiceTypes is set as sting convert it to array so it can handle multiple services.
		if ( isset( $request['RequestedShipment']['SpecialServicesRequested']['SpecialServiceTypes'] ) && is_string( $request['RequestedShipment']['SpecialServicesRequested']['SpecialServiceTypes'] ) ) {
			$request['RequestedShipment']['SpecialServicesRequested']['SpecialServiceTypes'][] = $request['RequestedShipment']['SpecialServicesRequested']['SpecialServiceTypes'];
		}

		// Add special service to request if not already added.
		if ( ! isset( $request['RequestedShipment']['SpecialServicesRequested']['SpecialServiceTypes'] ) || ! in_array( $service, $request['RequestedShipment']['SpecialServicesRequested']['SpecialServiceTypes'], true ) ) {
			$request['RequestedShipment']['SpecialServicesRequested']['SpecialServiceTypes'][] = $service;
		}

		return $request;
	}

	/**
	 * MAybe add FedEx Liftgate service.
	 *
	 * @param array $package shipping package.
	 * @param array $request FedEx request.
	 *
	 * @return array
	 * @since   3.4.43
	 *
	 * @version 3.4.43
	 */
	private function maybe_add_liftgate_service( $package, $request ) {

		if ( ! isset( $package['contents'] ) && ! is_array( $package['contents'] ) ) {
			return $request;
		}

		foreach ( $package['contents'] as $item ) {

			if ( ! isset( $item['data'] ) || ! is_a( $item['data'], 'WC_Product' ) ) {
				continue;
			}

			/** WooCommerce Product.
			 *
			 * @var WC_Product $product
			 */
			$product = $item['data'];
			if ( 'variation' === $product->get_type() ) {
				$parent            = wc_get_product( $product->get_parent_id() );
				$liftgate_delivery = $product->get_meta( '_shipping-fedex-liftgate-delivery', true ) ? $product->get_meta( '_shipping-fedex-liftgate-delivery', true ) : $parent->get_meta( '_shipping-fedex-liftgate-delivery', true );
				$liftgate_pickup   = $product->get_meta( '_shipping-fedex-liftgate-pickup', true ) ? $product->get_meta( '_shipping-fedex-liftgate-pickup', true ) : $parent->get_meta( '_shipping-fedex-liftgate-pickup', true );
			} else {
				$liftgate_delivery = $product->get_meta( '_shipping-fedex-liftgate-delivery', true );
				$liftgate_pickup   = $product->get_meta( '_shipping-fedex-liftgate-pickup', true );
			}
			if ( $liftgate_delivery ) {
				$request = $this->add_special_service( $request, 'LIFTGATE_DELIVERY' );
			}

			if ( $liftgate_pickup ) {
				$request = $this->add_special_service( $request, 'LIFTGATE_PICKUP' );
			}
		}

		return $request;
	}

	/**
	 * Get Fedex API request.
	 *
	 * @param mixed  $package Cart package.
	 * @param string $request_type Request type.
	 *
	 * @return array
	 * @version 3.4.9
	 */
	private function get_fedex_api_request( $package, $request_type ) {

		// Prepare Shipping Request for FedEx.
		$request = $this->fedex_api->get_fedex_api_request( $request_type );

		$request['RequestedShipment']['PreferredCurrency'] = get_woocommerce_currency();

		$request['RequestedShipment']['ShipTimestamp'] = wp_date( 'c', strtotime( '+1 Weekday' ) );
		$request['RequestedShipment']['PackagingType'] = 'YOUR_PACKAGING';
		$request['RequestedShipment']['Shipper']       = array(
			'Address' => array(
				'PostalCode'  => $this->origin,
				'CountryCode' => $this->origin_country,
			),
		);

		$request['RequestedShipment']['ShippingChargesPayment'] = array(
			'PaymentType' => 'SENDER',
			'Payor'       => array(
				'ResponsibleParty' => array(
					'AccountNumber' => $this->account_number,
					'CountryCode'   => $this->origin_country,
				),
			),
		);

		// Special case for Virgin Islands.
		if ( 'VI' === $package['destination']['state'] ) {
			$package['destination']['country'] = 'VI';
		}

		$request = $this->maybe_add_liftgate_service( $package, $request );

		// Remove space and asterisk in postal code for compatibility with Apple Pay and Google Pay.
		$postal_repl_char                          = array( ' ', '*' );
		$request['RequestedShipment']['Recipient'] = array(
			'Address' => array(
				'StreetLines'         => array( $package['destination']['address'], $package['destination']['address_2'] ),
				'Residential'         => $this->residential,
				'PostalCode'          => str_replace( $postal_repl_char, '', strtoupper( $this->get_shipping_postcode( $package ) ) ),
				'City'                => strtoupper( $package['destination']['city'] ),
				'StateOrProvinceCode' => 2 === strlen( $package['destination']['state'] ) ? strtoupper( $package['destination']['state'] ) : '',
				'CountryCode'         => $package['destination']['country'],
			),
		);

		/**
		 * Allow third party to modify the API request.
		 *
		 * @param array API request.
		 *
		 * @since 3.4.9
		 */
		return apply_filters( 'woocommerce_fedex_api_request', $request );
	}

	/**
	 * Get Fedex request.
	 *
	 * @param array  $fedex_packages Array of packages to ship.
	 * @param array  $package        array the package passed from WooCommerce.
	 * @param string $request_type   Used if making a certain type of request i.e. freight, smartpost.
	 *
	 * @return array
	 */
	private function get_fedex_requests( $fedex_packages, $package, $request_type = '' ) {

		if ( empty( $fedex_packages ) ) {
			return array();
		}

		$requests = array();

		// All requests for this package get this data.
		$package_request = $this->get_fedex_api_request( $package, $request_type );

		foreach ( $fedex_packages as $package_type => $packages ) {

			// Fedex Supports a Max of 99 per request.
			$parcel_chunks = $this->get_chunks( $packages, $request_type );

			foreach ( $parcel_chunks as $parcels ) {
				$request        = $package_request;
				$total_value    = 0;
				$total_packages = 0;
				$total_weight   = 0;
				$commodities    = array();
				$freight_class  = '';

				// Store parcels as line items.
				$request['RequestedShipment']['RequestedPackageLineItems'] = array();

				foreach ( $parcels as $key => $parcel ) {
					$parcel_request  = $parcel;
					$total_value    += $parcel['InsuredValue']['Amount'] * $parcel['GroupPackageCount'];
					$total_packages += $parcel['GroupPackageCount'];
					$parcel_packages = $parcel['GroupPackageCount'];
					$total_weight   += $parcel['Weight']['Value'] * $parcel_packages;

					// Get the highest freight class for shipment.
					if ( 'freight' === $request_type && isset( $parcel['freight_class'] ) && $parcel['freight_class'] > $freight_class ) {
						$freight_class = $parcel['freight_class'];
					}

					// Work out the commodities for CA shipments.
					if ( 'freight' !== $request_type && $parcel_request['packed_products'] ) {
						foreach ( $parcel_request['packed_products'] as $product ) {
							if ( isset( $commodities[ $product->get_id() ] ) ) {
								++$commodities[ $product->get_id() ]['Quantity'];
								$commodities[ $product->get_id() ]['CustomsValue']['Amount'] += round( $product->get_price() );
								continue;
							}
							$country                           = get_post_meta( $product->get_id(), 'CountryOfManufacture', true );
							$commodities[ $product->get_id() ] = array(
								'Name'                 => sanitize_title( $product->get_title() ),
								'NumberOfPieces'       => 1,
								'Description'          => '',
								'CountryOfManufacture' => ( $country ) ? $country : $this->origin_country,
								'Weight'               => array(
									'Units' => 'LB',
									'Value' => (float) max( 0.5, round( wc_get_weight( $product->get_weight(), 'lbs' ), 2 ) ),
								),
								'Quantity'             => $parcel['GroupPackageCount'],
								'UnitPrice'            => array(
									'Amount'   => round( $product->get_price() ),
									'Currency' => get_woocommerce_currency(),
								),
								'CustomsValue'         => array(
									'Amount'   => $parcel['InsuredValue']['Amount'] * $parcel['GroupPackageCount'],
									'Currency' => get_woocommerce_currency(),
								),
							);
						}
					}

					// Is this valid for a ONE rate? Smart post does not support it.
					if ( $this->fedex_one_rate && 'default' === $request_type && in_array( $parcel_request['package_id'], $this->fedex_one_rate_package_ids, true ) && 'US' === $package['destination']['country'] && 'US' === $this->origin_country ) {
						$request = $this->add_special_service( $request, 'FEDEX_ONE_RATE' );
					}

					// Remove temp elements.
					unset( $parcel_request['freight_class'] );
					unset( $parcel_request['packed_products'] );
					unset( $parcel_request['package_id'] );

					if ( ! $this->insure_contents || 'smartpost' === $request_type || in_array( $package_type, array( 'FEDEX_ENVELOPE', 'FEDEX_PAK' ), true ) ) {
						unset( $parcel_request['InsuredValue'] );
					}

					$parcel_request = array_merge( array( 'SequenceNumber' => $key + 1 ), $parcel_request );
					if ( 'freight' !== $request_type ) {
						$request['RequestedShipment']['RequestedPackageLineItems'][] = $parcel_request;
					}
				}

				$request['RequestedShipment']['PackagingType'] = $package_type;

				// Add number of packages.
				$request['RequestedShipment']['PackageCount'] = $total_packages;

				// Add total weight.
				if ( 'rest' === $this->api_type ) {
					$request['RequestedShipment']['TotalWeight'] = $total_weight;
				}

				// Ground elements.
				if (
					'ground' === $request_type
					&& isset( $request['RequestedShipment']['PackagingType'] )
					// TODO: Verify decision do all SpecialServiceTypes exclude Ground shipping.
					&& ! isset( $request['RequestedShipment']['SpecialServicesRequested']['SpecialServiceTypes'] )
				) {
					if ( 'US' === $package['destination']['country'] && $this->residential ) {
						$request['RequestedShipment']['ServiceType'] = 'GROUND_HOME_DELIVERY';
					} else {
						$request['RequestedShipment']['ServiceType'] = 'FEDEX_GROUND';
					}
				} elseif ( 'ground' === $request_type ) {
					return false;
				}

				// SmartPost elements.
				if ( 'smartpost' === $request_type ) {
					if ( ! $this->smartpost_hub ) {
						Logger::warning( 'Fedex Ground Economy rate can\'t be obtained. Fedex Ground Economy Hub is not set. Go to shipping zone settings and select Ground Economy Hub.' );
						$this->notify( __( 'Fedex Ground Economy rate can\'t be obtained. Fedex Ground Economy Hub is not set. Go to shipping zone settings and select Ground Economy Hub.', 'woocommerce-shipping-fedex' ) );
						return false;
					}

					// Smart post does not support insurance, but is insured up to $100
					// TODO: Verify decision why we bail from returning smartpost rates when they might be not fully insured.
					if ( $this->insure_contents && round( $total_value ) > 100 ) {
						Logger::warning( 'Fedex Ground Economy rate can\'t be obtained. Insurance is enabled and total cart value exceeds $100 (maximum allowed value).' );
						$this->notify( __( 'Fedex Ground Economy rate can\'t be obtained. Insurance is enabled and total cart value exceeds $100 (maximum allowed value).', 'woocommerce-shipping-fedex' ) );
						return false;
					}

					if ( $total_weight > 70 ) {
						Logger::warning( 'Fedex Ground Economy rate can\'t be obtained. Package total weight exceeds 70 LBS.' );
						$this->notify( __( 'Fedex Ground Economy rate can\'t be obtained. Package total weight exceeds 70 LBS.', 'woocommerce-shipping-fedex' ) );
						return false;
					}

					$total_weight = 0;
					foreach ( $request['RequestedShipment']['RequestedPackageLineItems'] as $key => $item ) {
						if ( $item['Weight']['Value'] < 1 ) {
							$request['RequestedShipment']['RequestedPackageLineItems'][ $key ]['Weight']['Value'] = 1;
						}
						$total_weight += $request['RequestedShipment']['RequestedPackageLineItems'][ $key ]['Weight']['Value'] * $request['RequestedShipment']['RequestedPackageLineItems'][ $key ]['GroupPackageCount'];
					}

					$request['RequestedShipment']['TotalWeight'] = $total_weight;

					$request['RequestedShipment']['SmartPostDetail'] = array(
						'Indicia'              => 'PARCEL_SELECT',
						'HubId'                => $this->smartpost_hub,
						'AncillaryEndorsement' => 'ADDRESS_CORRECTION',
						'SpecialServices'      => '',
					);
					$request['RequestedShipment']['ServiceType']     = 'SMART_POST';
				}

				// Add insurance elements.
				if (
					'soap' === $this->api_type
					&& 'smartpost' !== $request_type
					&& $this->insure_contents
					&& ! in_array( $request['RequestedShipment']['PackagingType'], array( 'FEDEX_ENVELOPE', 'FEDEX_PAK' ), true )
				) {
					$request['RequestedShipment']['TotalInsuredValue'] = array(
						'Amount'   => round( $total_value ),
						'Currency' => get_woocommerce_currency(),
					);
				}

				// Freight elements.
				if ( 'freight' === $request_type ) {
					$request['RequestedShipment']['RequestedPackageLineItems'] = array(
						'AssociatedFreightLineItems' => array(
							'Id' => $key + 1,
						),
						'GroupNumber'                => $key + 1,
						'GroupPackageCount'          => $parcel['GroupPackageCount'],
						'SequenceNumber'             => $key + 1,
						'PhysicalPackaging'          => 'SKID',
						'Weight'                     => array(
							'Units' => 'LB',
							'Value' => round( $total_weight, 2 ),
						),
					);

					$request['RequestedShipment']['Shipper']               = array(
						'Address' => array(
							'StreetLines'         => array( strtoupper( $this->freight_shipper_street ), strtoupper( $this->freight_shipper_street_2 ) ),
							'City'                => strtoupper( $this->freight_shipper_city ),
							'StateOrProvinceCode' => strtoupper( $this->freight_shipper_state ),
							'PostalCode'          => strtoupper( $this->freight_shipper_postcode ),
							'CountryCode'         => strtoupper( $this->freight_shipper_country ),
							'Residential'         => $this->freight_shipper_residential,
						),
					);
					$request['RequestedShipment']['FreightShipmentDetail'] = array(
						'FedExFreightAccountNumber' => strtoupper( $this->freight_number ),
						'FedExFreightBillingContactAndAddress' => array(
							'Address' => array(
								'StreetLines'         => array( strtoupper( $this->freight_billing_street ), strtoupper( $this->freight_billing_street_2 ) ),
								'City'                => strtoupper( $this->freight_billing_city ),
								'StateOrProvinceCode' => strtoupper( $this->freight_billing_state ),
								'PostalCode'          => strtoupper( $this->freight_billing_postcode ),
								'CountryCode'         => strtoupper( $this->freight_billing_country ),
							),
						),
						'Role'                      => 'SHIPPER',
					);
					if ( 'soap' === $this->api_type ) {
						$request['CarrierCodes'] = 'FXFR';
						$request['PaymentType']  = 'PREPAID';
					}

					// Format freight class.
					$freight_class = $freight_class ? $freight_class : $this->freight_class;
					$freight_class = $freight_class < 100 ? '0' . $freight_class : $freight_class;
					$freight_class = 'CLASS_' . str_replace( '.', '_', $freight_class );

					$request['RequestedShipment']['FreightShipmentDetail']['LineItems'] = array(
						'Id'             => $key + 1,
						'SequenceNumber' => $key + 1,
						'FreightClass'   => $freight_class,
						'Packaging'      => 'SKID',
						'Weight'         => array(
							'Units' => 'LB',
							'Value' => round( $total_weight, 2 ),
						),
					);

					if ( 'rest' === $this->api_type ) {
						$request['RequestedShipment']['FreightShipmentDetail']['totalHandlingUnits']         = $total_packages;
						$request['RequestedShipment']['FreightShipmentDetail']['LineItems']['handlingUnits'] = $parcel_packages;
						$request['RequestedShipment']['FreightShipmentDetail']['LineItems']['pieces']        = $parcel_packages;
					}

					$request['RequestedShipment']['ShippingChargesPayment'] = array(
						'PaymentType' => 'SENDER',
						'Payor'       => array(
							'ResponsibleParty' => array(
								'AccountNumber' => strtoupper( $this->freight_number ),
							),
						),
					);

					if ( 'soap' === $this->api_type ) {
						$request['RequestedShipment']['ShippingChargesPayment']['Payor']['ResponsibleParty']['CountryCode'] = $this->origin_country;
					}
				}

				// Canada broker fees elements.
				if (
					'freight' !== $request_type
					&& ( 'CA' === $package['destination']['country'] || 'US' === $package['destination']['country'] )
					&& $this->get_base_country() !== $package['destination']['country']
				) {
					$request['RequestedShipment']['CustomsClearanceDetail']['DutiesPayment'] = array(
						'PaymentType' => 'SENDER',
						'Payor'       => array(
							'ResponsibleParty' => array(
								'AccountNumber' => strtoupper( $this->account_number ),
								'CountryCode'   => $this->origin_country,
							),
						),
					);
					$request['RequestedShipment']['CustomsClearanceDetail']['Commodities']   = array_values( $commodities );
				}

				$requests[] = $request;
			}
		}

		return $requests;
	}

	/**
	 * Undocumented function
	 *
	 * @param  array  $requests     Requests.
	 * @param  string $request_type Shipping service type.
	 *
	 * @return array
	 * @since 4.4.0
	 */
	private function get_chunks( $requests, $request_type ) {
		$max_packages_in_chunk = 'smartpost' === $request_type ? 1 : 99;

		return array_chunk( $requests, $max_packages_in_chunk );
	}

	/**
	 * Calculate shipping cost.
	 *
	 * @param mixed $package Package to ship.
	 *
	 * @version 3.4.9
	 *
	 * @since   1.0.0
	 */
	public function calculate_shipping( $package = array() ) {
		// Perform shipping calculations only when on cart or shipping screen.
		if ( ! $this->is_cart_or_shipping() || ! $this->get_shipping_postcode( $package ) ) {
			return;
		}

		$package_key = md5( wp_json_encode( $package['contents'] ) . wp_json_encode( $package['destination'] ) . $this->instance_id );

		static $found_rates = null;

		if ( isset( $found_rates[ $package_key ] ) ) {
			$this->found_rates = $found_rates[ $package_key ];
			$this->add_found_rates();
			return;
		}

		// Clear rates.
		$this->found_rates = array();
		$this->package     = $package;

		Logger::debug( '=====================  NEW CALCULATION =====================' );
		Logger::debug(
			sprintf(
				'PACKAGE ID: %1$s, TIME: %2$s',
				$package_key,
				wp_date( 'c' )
			)
		);

		// Debugging.
		$this->notify( __( 'FEDEX debug mode is on - to hide these messages, turn debug mode off in the settings.', 'woocommerce-shipping-fedex' ) );

		// See if address is residential.
		$this->residential_address_validation( $package );

		// Get packages.
		$fedex_packages = $this->get_fedex_packages( $package );

		// Check the cart before calculating the shipping.
		if ( true !== $this->package_count_validation( $fedex_packages ) ) {
			return;
		}

		Logger::debug( '------ DEFAULT REQUEST ------' );
		$fedex_grouped_packages['default'] = $this->get_fedex_packages_grouped_by_type( $fedex_packages, 'default' );
		$fedex_requests['default']         = $this->get_fedex_requests( $fedex_grouped_packages['default'], $package, 'default' );
		$this->run_package_request( $fedex_requests['default'], 'default' );

		// Ground package request. Making sure that the international ground package request doesn't run again after being added on `default` fedex request above.
		if (
			(
				! $this->residential
				&& ! empty( $this->custom_services['FEDEX_GROUND']['enabled'] )
				&& (
					! isset( $this->found_rates['default'][ $this->get_rate_id( 'FEDEX_GROUND' ) ] )
					|| count( $fedex_requests['default'] ) !== $this->found_rates['default'][ $this->get_rate_id( 'FEDEX_GROUND' ) ]['packages']
				)
			)
			|| (
				$this->residential
				&& ! empty( $this->custom_services['GROUND_HOME_DELIVERY']['enabled'] )
				&& (
					! isset( $this->found_rates['default'][ $this->get_rate_id( 'GROUND_HOME_DELIVERY' ) ] )
					|| count( $fedex_requests['default'] ) !== $this->found_rates['default'][ $this->get_rate_id( 'GROUND_HOME_DELIVERY' ) ]['packages']
				)
			)
			|| (
				! empty( $this->custom_services['INTERNATIONAL_GROUND']['enabled'] )
				&& (
					! isset( $this->found_rates['default'][ $this->get_rate_id( 'INTERNATIONAL_GROUND' ) ] )
					|| count( $fedex_requests['default'] ) !== $this->found_rates['default'][ $this->get_rate_id( 'INTERNATIONAL_GROUND' ) ]['packages']
				)
			)
		) {
			Logger::debug( '------ GROUND REQUEST ------' );

			/*
			* Group the packages by type (FEDEX_PAK, FEDEX_MEDIUM_BOX, etc.) so we
			* can send a separate request per package type. This is necessary
			* for FEDEX_ONE_RATE service requests.
			*/
			$fedex_grouped_packages['ground'] = $this->get_fedex_packages_grouped_by_type( $fedex_packages, 'ground' );
			$fedex_requests['ground']         = $this->get_fedex_requests( $fedex_grouped_packages['ground'], $package, 'ground' );
			$this->run_package_request( $fedex_requests['ground'], 'ground' );
		}

		// SmartPost package request.
		if (
			! empty( $this->custom_services['SMART_POST']['enabled'] )
			&& ! empty( $this->smartpost_hub )
			&& (
				! isset( $this->found_rates['default'][ $this->get_rate_id( 'SMART_POST' ) ] )
				|| count( $fedex_requests['default'] ) !== $this->found_rates['default'][ $this->get_rate_id( 'SMART_POST' ) ]['packages']
			)
			&& 'US' === $package['destination']['country']
		) {
			Logger::debug( '------ SMARTPOST REQUEST ------' );
			$fedex_grouped_packages['smartpost'] = $this->get_fedex_packages_grouped_by_type( $fedex_packages, 'smartpost' );
			$fedex_requests['smartpost']         = $this->get_fedex_requests( $fedex_grouped_packages['smartpost'], $package, 'smartpost' );
			$this->run_package_request( $fedex_requests['smartpost'], 'smartpost' );
		}

		// Freight package request.
		if ( $this->freight_enabled && $this->is_freight_service_enabled() ) {
			Logger::debug( '------ FREIGHT REQUEST ------' );
			$fedex_grouped_packages['freight'] = $this->get_fedex_packages_grouped_by_type( $fedex_packages, 'freight' );
			$fedex_requests['freight']         = $this->get_fedex_requests( $fedex_grouped_packages['freight'], $package, 'freight' );
			$this->run_package_request( $fedex_requests['freight'], 'freight' );
		}

		// Ensure rates were found for all packages.
		if ( $this->found_rates ) {

			foreach ( $this->found_rates as $rate_type => $rates ) {
				$packages_to_quote_count = count( $fedex_requests[ $rate_type ] );
				foreach ( $rates as $key => $value ) {
					if ( $value['packages'] < $packages_to_quote_count ) {
						unset( $this->found_rates[ $rate_type ][ $key ] );
					} else {
						$meta_data = array();
						if ( isset( $value['meta_data'] ) ) {
							$meta_data = $value['meta_data'];
						}

						foreach ( $fedex_packages as $fedex_package ) {
							$meta_data[ 'Package ' . $fedex_package['GroupNumber'] ] = $this->get_rate_meta_data(
								array(
									'length' => isset( $fedex_package['Dimensions'] ) ? $fedex_package['Dimensions']['Length'] : 0,
									'width'  => isset( $fedex_package['Dimensions'] ) ? $fedex_package['Dimensions']['Width'] : 0,
									'height' => isset( $fedex_package['Dimensions'] ) ? $fedex_package['Dimensions']['Height'] : 0,
									'weight' => isset( $fedex_package['Weight'] ) ? $fedex_package['Weight']['Value'] : 0,
									'qty'    => isset( $fedex_package['GroupPackageCount'] ) ? $fedex_package['GroupPackageCount'] : 0,
								)
							);
						}

						$this->found_rates[ $rate_type ][ $key ]['meta_data'] = $meta_data;
					}
				}
			}
		}

		$found_rates[ $package_key ] = $this->found_rates;
		$this->add_found_rates();
	}

	/**
	 * Check if is cart or checkout screen.
	 *
	 * @return bool
	 */
	private function is_cart_or_shipping() {

		$referer = isset( $_SERVER['HTTP_REFERER'] ) ? sanitize_text_field( wp_unslash( $_SERVER['HTTP_REFERER'] ) ) : false;

		// Perform shipping calculations only on cart or checkout.
		return (
			is_cart() ||
			is_checkout() ||
			(
				// WooCommerce Blocks Cart & WooCommerce Blocks Checkout compatibility.
				$referer &&
				(
					get_permalink( wc_get_page_id( 'cart' ) ) === $referer ||
					get_permalink( wc_get_page_id( 'checkout' ) ) === $referer
				)
			)
		);
	}

	/**
	 * Run product validation process on cart or checkout screen.
	 *
	 * @return void
	 */
	public function maybe_validate_products() {
		static $packages;

		if ( ! WC()->cart instanceof WC_Cart || ! $this->is_cart_or_shipping() ) {
			return;
		}

		if ( null === $packages ) {
			$packages = WC()->cart->get_shipping_packages();
		}

		if ( empty( $packages ) ) {
			return;
		}

		foreach ( $packages as $package ) {
			$this->validate_products( $package, true );
		}
	}

	/**
	 * Check if product has dimensions and weight. Display notification errors and modify woocommerce_cart_no_shipping_available_html.
	 *
	 * @param  array $package Shipping package.
	 *
	 * @return bool
	 */
	private function validate_products( $package ) {
		static $valid  = null;
		static $errors = null;

		if (
			! $this->is_cart_or_shipping()
			|| ! (
				isset( WC()->cart )
				&& $this->get_shipping_postcode( $package )
			)
			|| (
				isset( WC()->session )
				&& 0 < min( WC()->session->get( 'shipping_method_counts', array( 0 ) ) )
			)
			|| ! isset( $package['contents'] )
			|| ! is_array( $package['contents'] )
		) {
			return true;
		}

		if ( null !== $valid ) {

			if ( false === $valid ) {
				$this->cant_calculate_shipping_rates_notification_init( $errors, $package );
			}

			return $valid;
		}

		$errors     = array();
		$log_errors = array();

		foreach ( $package['contents'] as $item_id => $values ) {

			$item_name = is_callable( array( $values['data'], 'get_name' ) ) ? $values['data']->get_name() : $item_id;
			if ( ! $values['data']->needs_shipping() ) {
				Logger::debug( 'Product "' . $item_name . '" is virtual. Skipping.' );
				/* translators: %s: Product name. */
				$this->notify( sprintf( __( 'Product "%s" is virtual. Skipping.', 'woocommerce-shipping-fedex' ), $item_name ), 'notice' );
				continue;
			}

			$product_has = array(
				'dimensions' => ( $values['data']->get_length() && $values['data']->get_height() && $values['data']->get_width() ) ? true : false,
				'weight'     => $values['data']->get_weight() ? true : false,
			);

			if ( 'box_packing' === $this->packing_method && ! $product_has['dimensions'] && ! $product_has['weight'] ) {
				$message = sprintf(
					/* translators: %s: Product name. */
					__( 'Product "%1$s" is missing dimensions and weight. Please %2$sremove product%3$s to continue, or contact our support.', 'woocommerce-shipping-fedex' ),
					$item_name,
					'<a class="fedex-product-remove" style="color:currentColor;" data-product_id="' . $values['product_id'] . '" href="' . esc_url( wc_get_cart_remove_url( $item_id ) ) . '">',
					'</a>'
				);
				$log_message = sprintf(
					/* translators: %s: Product name. */
					__( 'Product name: %1$s id: %2$s is missing dimensions.', 'woocommerce-shipping-fedex' ),
					$item_name,
					$values['product_id']
				);
			} elseif ( 'box_packing' === $this->packing_method && ! $product_has['dimensions'] ) {
				$message = sprintf(
					/* translators: %s: Product name. */
					__( 'Product "%1$s" is missing dimensions. Please %2$sremove product%3$s to continue, or contact our support.', 'woocommerce-shipping-fedex' ),
					$item_name,
					'<a class="fedex-product-remove" style="color:currentColor;" data-product_id="' . $values['product_id'] . '" href="' . esc_url( wc_get_cart_remove_url( $item_id ) ) . '">',
					'</a>'
				);
				$log_message = sprintf(
					/* translators: %s: Product name. */
					__( 'Product name: %1$s id: %2$s is missing dimensions.', 'woocommerce-shipping-fedex' ),
					$item_name,
					$values['product_id']
				);
			} elseif ( ! $product_has['weight'] ) {
				$message = sprintf(
					/* translators: %s: Product name. */
					__( 'Product "%1$s" is missing weight. Please %2$sremove product%3$s to continue, or contact our support.', 'woocommerce-shipping-fedex' ),
					$item_name,
					'<a class="fedex-product-remove" style="color:currentColor;" data-product_id="' . $values['product_id'] . '" href="' . esc_url( wc_get_cart_remove_url( $item_id ) ) . '">',
					'</a>'
				);
				$log_message = sprintf(
					/* translators: %s: Product name. */
					__( 'Product name: %1$s id: %2$s is missing weight.', 'woocommerce-shipping-fedex' ),
					$item_name,
					$values['product_id']
				);
			} else {
				continue;
			}

			$errors[]     = $message;
			$log_errors[] = $log_message;
		}

		if ( ! empty( $errors ) ) {
			$this->cant_calculate_shipping_rates_notification_init( $errors, $package );
		}

		if ( ! empty( $log_errors ) ) {

			foreach ( $log_errors as $log_error ) {
				Logger::warning( "\n" . $log_error, array( 'source' => 'plugin-woocommerce-shipping-fedex-product-issues' ) );
			}
		}

		$valid = empty( $errors );

		return $valid;
	}

	/**
	 * No need to calculate the rates if there is any warning or error on cart/checkout page.
	 *
	 * @param array $errors Error texts.
	 * @param array $package Cart package.
	 */
	private function cant_calculate_shipping_rates_notification_init( $errors, $package ) {
		static $initialized = false;

		if ( $initialized ) {
			return;
		}

		add_filter(
			'woocommerce_cart_no_shipping_available_html',
			function ( $original_html ) use ( $errors, $package ) {
				return $this->cant_calculate_shipping_rates_notification( $original_html, $errors, $package, 'cart' );
			}
		);

		add_filter(
			'woocommerce_no_shipping_available_html',
			function ( $original_html ) use ( $errors, $package ) {
				return $this->cant_calculate_shipping_rates_notification( $original_html, $errors, $package, 'checkout' );
			}
		);

		if ( is_cart() ) {
			wc_enqueue_js(
				"
				jQuery('.woocommerce').on( 'click', '.fedex-product-remove', function(e) {
					e.preventDefault();
					var product_id = jQuery(this).data('product_id');
					jQuery('.woocommerce-cart-form .product-remove > a[data-product_id=\"' + product_id + '\"]').trigger('click');
				});
				"
			);
		}

		$initialized = true;
	}

	/**
	 * Return Notification markup.
	 *
	 * @param string $original_html Original HTML.
	 * @param array  $errors List or error messages.
	 * @param array  $package Shipping package.
	 * @param string $location Location (cart or checkout).
	 *
	 * @return string
	 */
	public function cant_calculate_shipping_rates_notification( $original_html, $errors, $package, $location ) {
		$message_html  = '<div style="line-height:1.2;">';
		$message_html .= '<b>' . __( 'We\'re sorry, we can\'t calculate shipping rates.', 'woocommerce-shipping-fedex' ) . '</b>';
		$message_html .= '<ul style="list-style-type:none; padding:0; margin:0.5rem 0;">';
		foreach ( $errors as $message ) {
			$message_html .= '<li style="margin:0.5rem 0;">' . $message . '</li>';
		}
		$message_html .= '</ul>';
		$message_html .= '</div>';

		$message_html = 'cart' === $location ? $message_html . '<strong>' . WC()->countries->get_formatted_address( $package['destination'], ', ' ) . '</strong>' : $message_html;

		/**
		 * Allow third party to modify the message when shipping rates calculation cannot be done.
		 *
		 * @since 3.8.0
		 */
		return apply_filters(
			'woocommerce_fedex_' . $location . '_no_shipping_available_html',
			$message_html,
			$original_html,
			$errors,
			$package
		);
	}

	/**
	 * Run requests and get/parse results
	 *
	 * @param array|false $requests Request.
	 * @param string      $request_type Shipping service type.
	 */
	public function run_package_request( $requests, $request_type = 'default' ) {
		// phpcs:disable WordPress.PHP.DevelopmentFunctions.error_log_print_r --- For debugging only
		if ( empty( $requests ) || ! is_array( $requests ) ) {
			return false;
		}
		try {
			foreach ( $requests as $request ) {
				$this->process_result( $request, $this->get_result( $request, $request_type ), $request_type );
			}
		} catch ( Exception $e ) {
			Logger::error(
				'run_package_request ERROR',
				array( 'error' => $e )
			);
			$this->notify( print_r( $e, true ), 'error' );

			return false;
		}
		// phpcs:enable WordPress.PHP.DevelopmentFunctions.error_log_print_r
	}

	/**
	 * Get API results.
	 *
	 * @param mixed  $request API request.
	 * @param string $request_type API request type.
	 *
	 * @return array|false
	 */
	private function get_result( $request, $request_type = '' ) {
		// phpcs:disable WordPress.PHP.DevelopmentFunctions.error_log_print_r --- For debugging only
		$request = $this->fedex_api->prepare_request( $request, $request_type );
		Logger::debug( 'REQUEST service: ' . $request_type, array( 'request' => $request ) );
		$this->notify( '<b>REQUEST:</b> service: <b>' . ucfirst( $request_type ) . '</b> <a href="#" style="float:right;" class="debug_reveal">Show</a><pre style="font-size: 12px; line-height:1.5;" class="debug_info">' . print_r( $request, true ) . '</pre>' );

		// Use cached response if available.
		$cached_response = get_transient( $this->get_transient_name( $request ) );
		// If there's a cached response, return it.
		if ( false !== $cached_response ) {
			Logger::debug( 'CACHED RESPONSE service: ' . $request_type, array( 'response' => $cached_response ) );
			$this->notify( '<b>CACHED RESPONSE:</b> service: <b>' . ucfirst( $request_type ) . '</b> <a href="#" style="float:right;" class="debug_reveal">Show</a><pre style="font-size: 12px; line-height:1.5;" class="debug_info">' . print_r( $cached_response, true ) . '</pre>' );

			return $cached_response;
		}

		$result        = $this->fedex_api->get_result( $request, $request_type );
		$transient_key = $this->get_transient_name( $request );
		// Cache the response for one week if response contains rates.
		if ( $result && $transient_key ) {
			set_transient( $transient_key, $result, DAY_IN_SECONDS * 7 );
		}
		// phpcs:enable WordPress.PHP.DevelopmentFunctions.error_log_print_r
		return $result;
	}

	/**
	 * Process API result.
	 *
	 * @param array  $request      Request.
	 * @param mixed  $result       Result.
	 * @param string $request_type Shipping service type.
	 *
	 * @return void
	 */
	private function process_result( $request, $result = '', $request_type = '' ) {

		$this->fedex_api->process_result( $request, $result, $request_type );
	}

	/**
	 * Prepare rate.
	 *
	 * @param mixed  $rate_code    Rate code.
	 * @param mixed  $rate_id      Rate ID.
	 * @param mixed  $rate_name    Rate name.
	 * @param mixed  $rate_cost    Cost.
	 * @param mixed  $currency     Currency.
	 * @param mixed  $details      XML details.
	 * @param string $request_type Request type.
	 */
	public function prepare_rate( $rate_code, $rate_id, $rate_name, $rate_cost, $currency, $details, $request_type ) {
		// Name adjustment.
		if ( ! empty( $this->custom_services[ $rate_code ]['name'] ) ) {
			$rate_name = $this->custom_services[ $rate_code ]['name'];
		}

		// Cost adjustment %.
		if ( ! empty( $this->custom_services[ $rate_code ]['adjustment_percent'] ) ) {
			$rate_cost = $rate_cost + ( $rate_cost * ( floatval( $this->custom_services[ $rate_code ]['adjustment_percent'] ) / 100 ) );
			// Add rounding to match WooCommerce decimal places.
			$rate_cost = round( $rate_cost, wc_get_price_decimals() );
		}
		// Cost adjustment.
		if ( ! empty( $this->custom_services[ $rate_code ]['adjustment'] ) ) {
			$rate_cost = $rate_cost + floatval( $this->custom_services[ $rate_code ]['adjustment'] );
			// Add rounding to match WooCommerce decimal places.
			$rate_cost = round( $rate_cost, wc_get_price_decimals() );
		}

		// Enabled check.
		if ( isset( $this->custom_services[ $rate_code ] ) && empty( $this->custom_services[ $rate_code ]['enabled'] ) ) {
			return;
		}

		// Merging.
		if ( isset( $this->found_rates[ $request_type ][ $rate_id ] ) ) {
			$rate_cost = $rate_cost + $this->found_rates[ $request_type ][ $rate_id ]['cost'];
			$packages  = 1 + $this->found_rates[ $request_type ][ $rate_id ]['packages'];
		} else {
			$packages = 1;
		}

		// Sort.
		if ( isset( $this->custom_services[ $rate_code ]['order'] ) ) {
			$sort = $this->custom_services[ $rate_code ]['order'];
		} else {
			$sort = 999;
		}

		/**
		 * Allow 3rd parties to process the rates returned by FedEx. This will
		 * allow to convert them to the active currency. The original currency
		 * from the rates, the XML and the shipping method instance are passed
		 * as well, so that 3rd parties can fetch any additional information
		 * they might require.
		 *
		 * @since 3.4.30
		 */
		$this->found_rates[ $request_type ][ $rate_id ] = apply_filters(
			'woocommerce_shipping_fedex_rate',
			array(
				'id'       => $rate_id,
				'label'    => $rate_name,
				'cost'     => $rate_cost,
				'sort'     => $sort,
				'package'  => $this->package,
				'packages' => $packages,
			),
			$currency,
			$details,
			$this
		);
	}

	/**
	 * Get meta data string for the shipping rate.
	 *
	 * @param array $params Meta data info to join.
	 *
	 * @return string Rate meta data.
	 * @since   3.4.9
	 * @version 3.4.9
	 */
	private function get_rate_meta_data( $params ) {
		$meta_data = array();

		if ( ! empty( $params['name'] ) ) {
			$meta_data[] = $params['name'] . ' -';
		}

		if ( $params['length'] && $params['width'] && $params['height'] ) {
			$meta_data[] = sprintf( '%1$s × %2$s × %3$s (in)', $params['length'], $params['width'], $params['height'] );
		}
		if ( $params['weight'] ) {
			$meta_data[] = round( $params['weight'], 2 ) . 'lbs';
		}
		if ( $params['qty'] ) {
			$meta_data[] = '× ' . $params['qty'];
		}

		return implode( ' ', $meta_data );
	}

	/**
	 * Add found rates to WooCommerce
	 */
	public function add_found_rates() {
		if ( empty( $this->found_rates ) ) {
			return;
		}
		$cheapest_rate = array();
		foreach ( $this->found_rates as $rate_type => $rates ) {
			if ( 'all' === $this->offer_rates ) {
				uasort( $rates, array( $this, 'sort_rates' ) );

				foreach ( $rates as $rate ) {
					$this->add_rate( $rate );
				}
			} else {
				// Loop to find the cheapest rate.
				foreach ( $rates as $rate ) {
					if ( empty( $cheapest_rate ) || $rate['cost'] < $cheapest_rate['cost'] ) {
						$cheapest_rate = $rate;
					}
				}
			}
		}
		// If cheapest rate isset, add it to the list of found rates.
		if ( ! empty( $cheapest_rate ) ) {
			$cheapest_rate['label'] = $this->title;
			$this->add_rate( $cheapest_rate );
		}
	}

	/**
	 * Determine if the current shipping is to be done internationally
	 *
	 * @return bool
	 */
	public function is_shipping_internationally() {
		// Compare base and package country: not equal for international shipping.
		return $this->origin_country !== $this->package['destination']['country'];
	}

	/**
	 * Check if any Ground service is enabled.
	 *
	 * @return bool
	 */
	public function is_ground_service_enabled() {
		foreach ( $this->ground_services as $service ) {
			if ( ! empty( $this->custom_services[ $service ]['enabled'] ) ) {
				return true;
			}
		}

		return false;
	}

	/**
	 * Check if any SmartPost service is enabled.
	 *
	 * @return bool
	 */
	public function is_smartpost_service_enabled() {
		foreach ( $this->smartpost_services as $service ) {
			if ( ! empty( $this->custom_services[ $service ]['enabled'] ) ) {
				return true;
			}
		}

		return false;
	}

	/**
	 * Check if any Freight service is enabled.
	 *
	 * @return bool
	 */
	public function is_freight_service_enabled() {
		foreach ( $this->freight_services as $service ) {
			if ( ! empty( $this->custom_services[ $service ]['enabled'] ) ) {
				return true;
			}
		}

		return false;
	}

	/**
	 * Sorting the rates.
	 *
	 * @param mixed $a First rate.
	 * @param mixed $b Second rate.
	 *
	 * @return int
	 */
	public function sort_rates( $a, $b ) {
		if ( $a['sort'] === $b['sort'] ) {
			return 0;
		}

		return ( $a['sort'] < $b['sort'] ) ? - 1 : 1;
	}

	/**
	 * Get the transient name based on the given request. Return
	 * a hash representation of the request.
	 *
	 * @param array $request Request.
	 *
	 * @return string|false
	 * @since 3.4.25
	 */
	private function get_transient_name( $request ) {

		// Unset Ship Timestamp as this will change and won't produce matching transient key.
		// SOAP Legacy.
		unset( $request['RequestedShipment']['ShipTimestamp'] );
		// REST.
		unset( $request['requestedShipment']['shipDateStamp'] );

		$encoded = wp_json_encode( $request );
		if ( empty( $encoded ) ) {
			return false;
		}

		$request_body_fingerprint = md5( $encoded );
		$settings_fingerprint     = 'rest' === $this->api_type ? md5( $this->client_id . $this->client_secret . $this->api_mode ) : md5( $this->api_key . $this->api_pass . $this->api_mode );

		return 'fedex_quote_' . md5( $request_body_fingerprint . $settings_fingerprint );
	}

	/**
	 * Loop through packages, grouping them by type
	 *
	 * @param array $packages Packages to loop through.
	 * @param array $request_type Request type: [default, ground, smartpost, freight].
	 *
	 * @return array The packages grouped by type
	 */
	private function get_fedex_packages_grouped_by_type( array $packages, $request_type = '' ) {
		$package_types = array();
		foreach ( $packages as $package ) {
			if (
				! empty( $package['package_id'] )
				&& ! in_array( $request_type, array( 'ground', 'smartpost', 'freight' ), true )
			) {
				$package_types[ $package['package_id'] ][] = $package;
			} else {
				$package_types['YOUR_PACKAGING'][] = $package;
				// Log when switching packaging type.
				if ( ! empty( $package['package_id'] ) && 'YOUR_PACKAGING' !== $package['package_id'] ) {
					Logger::debug(
						sprintf(
							'Switching PackagingType from: %1$s to: YOUR_PACKAGING.',
							$package['package_id']
						)
					);
					// translators: %1$s is package type.
					$this->notify( '<b>BOX PACKER:</b> ' . sprintf( __( 'Switching PackagingType from: %1$s to: YOUR_PACKAGING.', 'woocommerce-shipping-fedex' ), $package['package_id'] ) );
				}
			}
		}

		Logger::debug(
			'BOX PACKER ' . sprintf(
				'Grouping packages by PackagingType (GROUPED: %1$s) resulting in %2$d API requests.',
				implode( ', ', array_keys( $package_types ) ),
				count( $package_types )
			)
		);

		// translators: %1$s is all package types and %2$d is the total number of package types.
		$this->notify( '<b>BOX PACKER:</b> ' . sprintf( __( 'Grouping packages by PackagingType (GROUPED: %1$s) resulting in %2$d API requests.', 'woocommerce-shipping-fedex' ), implode( ', ', array_keys( $package_types ) ), count( $package_types ) ) );

		return $package_types;
	}

	/**
	 * Checking if using Production environment or not.
	 */
	public function is_production() {
		// phpcs:disable WordPress.Security.NonceVerification.Missing --- security handled by WooCommerce
		if ( isset( $_POST['woocommerce_fedex_account_number'] ) && ! isset( $_POST['woocommerce_fedex_production'] ) ) {
			return false;
		}

		if ( isset( $_POST['woocommerce_fedex_production'] ) && '1' === $_POST['woocommerce_fedex_production'] ) {
			return true;
		}
		// phpcs:enable WordPress.Security.NonceVerification.Missing

		return $this->production;
	}

	/**
	 * Get API type.
	 *
	 * @return string.
	 */
	public function api_type() {
		// phpcs:disable WordPress.Security.NonceVerification.Missing --- security handled by WooCommerce
		return isset( $_POST['woocommerce_fedex_api_type'] ) && in_array( wc_clean( $_POST['woocommerce_fedex_api_type'] ), array( 'soap', 'rest' ), true ) ? wc_clean( wp_unslash( $_POST['woocommerce_fedex_api_type'] ) ) : $this->api_type; // phpcs:ignore WordPress.Security.ValidatedSanitizedInput.InputNotSanitized --- has been sanitized by wc_clean()
		// phpcs:enable WordPress.Security.NonceVerification.Missing
	}

	/**
	 * Check the value of residential.
	 */
	public function is_residential() {
		return $this->residential;
	}

	/**
	 * Get the API key from the setting.
	 */
	public function get_api_key() {
		return $this->api_key;
	}

	/**
	 * Get the API password from the setting.
	 */
	public function get_api_pass() {
		return $this->api_pass;
	}

	/**
	 * Get the client ID from the setting.
	 */
	public function get_client_id() {
		return $this->client_id;
	}

	/**
	 * Get the client secret from the setting.
	 */
	public function get_client_secret() {
		return $this->client_secret;
	}

	/**
	 * Get the Fedex account number.
	 */
	public function get_account_number() {
		return $this->account_number;
	}

	/**
	 * Get the Fedex meter number.
	 */
	public function get_meter_number() {
		return $this->meter_number;
	}

	/**
	 * Get oAuth value.
	 */
	public function get_oauth() {
		return $this->fedex_oauth;
	}

	/**
	 * Get the service data.
	 *
	 * @param string $service Service ID.
	 */
	public function get_service( $service ) {
		return isset( $this->services[ $service ] ) ? $this->services[ $service ] : '';
	}

	/**
	 * Get the request type.
	 */
	public function get_request_type() {
		return $this->request_type;
	}

	/**
	 * Helper method to get the number of FedEx method instances.
	 *
	 * @return int The number of FedEx method instances
	 */
	public function instance_count(): int {
		global $wpdb;

		// phpcs:ignore --- Need to use WPDB::get_var() to count the existing FedEx in the shipping zone
		return absint( $wpdb->get_var( "SELECT COUNT(*) FROM {$wpdb->prefix}woocommerce_shipping_zone_methods WHERE method_id = 'fedex'" ) );
	}

	/**
	 * Helper method to check if there are existing FedEx method instances.
	 *
	 * @return bool
	 */
	public function instances_exist(): bool {
		return $this->instance_count() > 0;
	}
}

new WC_Shipping_Fedex();
