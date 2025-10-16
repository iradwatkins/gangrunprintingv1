<?php
/**
 * FedEx Legacy API class file.
 *
 * @package WC_Shipping_Fedex
 */

namespace WooCommerce\FedEx;

use WooCommerce\FedEx\Logger;

require_once WC_SHIPPING_FEDEX_API_DIR . '/abstract/class-abstract-fedex-api.php';

// phpcs:disable WordPress.NamingConventions.ValidVariableName.UsedPropertyNotSnakeCase --- FedEx API provides an object with camelCase properties and method
/**
 * FedEx REST API class.
 */
class FedEx_Legacy_API extends Abstract_FedEx_API {

	/**
	 * Endpoint for the FedEx Rating API.
	 *
	 * @var string
	 */
	protected $endpoint = '';

	/**
	 * Web Services Key.
	 *
	 * @var string
	 */
	private $api_key;

	/**
	 * Web Services Secret.
	 *
	 * @var string
	 */
	private $api_pass;

	/**
	 * Web Services Secret.
	 *
	 * @var bool
	 */

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
	 * API Mode Production or Test
	 *
	 * @var string
	 */
	private $api_mode;

	/**
	 * Request type
	 *
	 * @var string
	 */
	private $request_type;
	/**
	 * Is Recipient Address Residential.
	 *
	 * @var bool
	 */
	private $residential;

	/**
	 * Rate service version.
	 *
	 * @var int
	 */
	public static $rate_service_version = 31;

	/**
	 * Address validation service version.
	 *
	 * @var int
	 */
	public static $address_validation_service_version = 4;

	/**
	 * Class constructor.
	 *
	 * @param \WC_Shipping_FedEx $fedex_shipping_method The FedEx shipping method object.
	 */
	public function __construct( $fedex_shipping_method ) {
		$this->shipping_method = $fedex_shipping_method;
		$this->api_mode        = $fedex_shipping_method->is_production() ? 'production' : 'test';
		$this->api_key         = $fedex_shipping_method->get_api_key();
		$this->api_pass        = $fedex_shipping_method->get_api_pass();
		$this->account_number  = $fedex_shipping_method->get_account_number();
		$this->meter_number    = $fedex_shipping_method->get_meter_number();
		$this->request_type    = $fedex_shipping_method->get_request_type();
		$this->residential     = $fedex_shipping_method->is_residential();
	}

	/**
	 * Get FedEx API request.
	 *
	 * @param string $request_type Request type.
	 *
	 * @return array
	 */
	public function get_fedex_api_request( $request_type ) {
		$request['WebAuthenticationDetail'] = array(
			'UserCredential' => array(
				'Key'      => $this->api_key,
				'Password' => $this->api_pass,
			),
		);

		$request['ClientDetail'] = array(
			'AccountNumber' => $this->account_number,
			'MeterNumber'   => $this->meter_number,
		);

		$request['TransactionDetail'] = array(
			'CustomerTransactionId' => ' *** WooCommerce Rate Request ***',
		);

		$request['Version'] = array(
			'ServiceId'    => 'crs',
			'Major'        => self::$rate_service_version,
			'Intermediate' => '0',
			'Minor'        => '0',
		);

		// Include PREFERRED Rate Type.
		// The preferred currency is not returned if the requested currency is already present within the rate response.
		$request['RequestedShipment']['RateRequestTypes'] = 'LIST' === $this->request_type ? array( 'LIST', 'PREFERRED' ) : 'PREFERRED';

		$request['RequestedShipment']['DropoffType'] = 'REGULAR_PICKUP';

		return $request;
	}

	/**
	 * Get result.
	 *
	 * @param array  $request Request.
	 * @param string $request_type Request type.
	 * @return array|false
	 */
	public function get_result( $request, $request_type ) {

		$rate_soap_file_location = WC_SHIPPING_FEDEX_API_DIR . '/legacy/' . $this->api_mode . '/RateService_v' . self::$rate_service_version . '.wsdl';

		if ( ! class_exists( 'SoapClient' ) ) {
			return false;
		}

		try {

			$client = new \SoapClient( $rate_soap_file_location, array( 'trace' => 1 ) );
			$result = $client->getRates( $request );
		} catch ( \Exception $e ) {

			$stream_context_args = array(
				'ssl' => array(
					'verify_peer'      => false,
					'verify_peer_name' => false,
				),
			);
			$soap_args           = array(
				'trace'          => 1,
				'stream_context' => stream_context_create( $stream_context_args ),
			);

			$client = new \SoapClient( $rate_soap_file_location, $soap_args );
			$result = $client->getRates( $request );
		}

		$code    = $this->get_notification( 'Code', $result );
		$message = $this->get_notification( 'Message', $result );
		$result  = is_array( $result ) ? json_decode( wp_remote_retrieve_body( $result ) ) : $result;

		if ( isset( $result->HighestSeverity ) && ( 'FAILURE' === $result->HighestSeverity || 'ERROR' === $result->HighestSeverity ) ) {
			Logger::error(
				'RESPONSE service: ' . $request_type . ', code: ' . $code . ', message: ' . $message,
				array( 'response' => $result )
			);

			// phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_print_r --- Its needed for debugging
			$this->shipping_method->notify( '<b>RESPONSE:</b> service: <b>' . ucfirst( $request_type ) . '</b> &#10072; code: <b>' . $code . '</b> &#10072; message: <b>' . $message . '</b> <a href="#" style="float:right;" class="debug_reveal">Show</a><pre class="debug_info">' . print_r( $result, true ) . '</pre>' );

			return false;
		}

		Logger::debug(
			'RESPONSE service: ' . $request_type . ', code: ' . $code . ', message: ' . $message,
			array( 'response' => $result )
		);

		// phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_print_r --- Its needed for debugging
		$this->shipping_method->notify( '<b>RESPONSE:</b> service: <b>' . ucfirst( $request_type ) . '</b> &#10072; code: <b>' . $code . '</b> &#10072; message: <b>' . $message . '</b> <a href="#" style="float:right;" class="debug_reveal">Show</a><pre class="debug_info">' . print_r( $result, true ) . '</pre>' );

		return $result;
	}

	/**
	 * Check if property exists and retrieve vale, if array first item will be returned.
	 *
	 * @param  string $prop  Code|Message.
	 * @param  object $result SoapClient->getRates result.
	 *
	 * @return string $result Error code or Error Message or ?.
	 */
	private function get_notification( $prop, $result ) {
		if ( ! $prop || ! isset( $result->Notifications ) ) {
			return '?';
		}

		if ( is_array( $result->Notifications ) && isset( $result->Notifications[0]->$prop ) ) {
			return $result->Notifications[0]->$prop;
		}

		return isset( $result->Notifications->$prop ) ? $result->Notifications->$prop : '?';
	}

	/**
	 * Check if Destination Address is Residential.
	 *
	 * @param array $request API request.
	 *
	 * @return bool
	 */
	public function residential_address_validation( $request ) {

		if ( ! class_exists( 'SoapClient' ) ) {
			return $this->residential;
		}

		$request['Version'] = array(
			'ServiceId'    => 'aval',
			'Major'        => self::$address_validation_service_version,
			'Intermediate' => '0',
			'Minor'        => '0',
		);

		$request['WebAuthenticationDetail'] = array(
			'UserCredential' => array(
				'Key'      => $this->api_key,
				'Password' => $this->api_pass,
			),
		);

		$request['ClientDetail'] = array(
			'AccountNumber' => $this->account_number,
			'MeterNumber'   => $this->meter_number,
		);

		$request['TransactionDetail'] = array( 'CustomerTransactionId' => ' *** Address Validation Request v' . self::$address_validation_service_version . ' from WooCommerce ***' );

		// Check if address is residential or commerical.
		try {

			$client = new \SoapClient( WC_SHIPPING_FEDEX_API_DIR . '/legacy/' . $this->api_mode . '/AddressValidationService_v' . self::$address_validation_service_version . '.wsdl', array( 'trace' => 1 ) );

			$response = $client->addressValidation( $request );

			if ( 'SUCCESS' !== $response->HighestSeverity ) {
				return $this->residential;
			}

			if ( is_array( $response->AddressResults ) ) {
				$address_result = $response->AddressResults[0];
			} else {
				$address_result = $response->AddressResults;
			}

			return isset( $address_result->Classification ) ? $this->is_residential( $address_result->Classification ) : $this->residential;

		} catch ( \Exception $e ) { // phpcs:ignore
			// Does not want to display anything when error.
		}

		return $this->residential;
	}

	/**
	 * Get residential/business classification from FedEx address validation response.
	 *
	 * @param string $classification The classification returned from FedEx (MIXED, UNKNOWN, BUSINESS, RESIDENTIAL).
	 * @return bool True if residential, false if business or default to zone setting.
	 */
	private function is_residential( string $classification ): bool {
		$classification_data = array(
			'MIXED'       => $this->residential,
			'UNKNOWN'     => $this->residential,
			'BUSINESS'    => false,
			'RESIDENTIAL' => true,
		);

		if ( ! isset( $classification_data[ $classification ] ) ) {
			return $this->residential;
		}

		return $classification_data[ $classification ];
	}

	/**
	 * Process the API result.
	 *
	 * @param array  $request Request data.
	 * @param mixed  $result API result.
	 * @param string $request_type [default, ground, smartpost, freight].
	 */
	public function process_result( $request, $result = '', $request_type = '' ) {
		if ( ! $result || empty( $result->RateReplyDetails ) ) {
			return;
		}

		$rate_reply_details = $result->RateReplyDetails;
		$store_currency     = get_woocommerce_currency();

		// Workaround for when an object is returned instead of array.
		if ( is_object( $rate_reply_details ) && isset( $rate_reply_details->ServiceType ) ) {
			$rate_reply_details = array( $rate_reply_details );
		}

		if ( ! is_array( $rate_reply_details ) ) {
			return;
		}

		foreach ( $rate_reply_details as $quote ) {

			if ( is_array( $quote->RatedShipmentDetails ) ) {

				$details = false;
				foreach ( $quote->RatedShipmentDetails as $i => $d ) {
					if (
						// Attempt to return Rate Type set in Shipping Zone settings, ACCOUNT or LIST.
						strstr( $d->ShipmentRateDetail->RateType, 'PAYOR_' . $this->shipping_method->get_request_type() ) &&
						$d->ShipmentRateDetail->TotalNetCharge->Currency === $store_currency
					) {
						$details = $quote->RatedShipmentDetails[ $i ];
						break;
					}
				}

				// If first attempt don't return Shipment Details due to currency mismatch, look for PREFERRED rate.
				if ( ! $details ) {
					foreach ( $quote->RatedShipmentDetails as $i => $d ) {
						if (
							strstr( $d->ShipmentRateDetail->RateType, 'PREFERRED_' . $this->shipping_method->get_request_type() ) &&
							$d->ShipmentRateDetail->TotalNetCharge->Currency === $store_currency
						) {
							$details = $quote->RatedShipmentDetails[ $i ];
							break;
						}
					}
				}
			} else {
				$details = $quote->RatedShipmentDetails;
			}

			if ( empty( $details ) ) {
				continue;
			}

			$currency  = isset( $details->ShipmentRateDetail->TotalNetCharge->Currency ) ? $details->ShipmentRateDetail->TotalNetCharge->Currency : '';
			$rate_name = strval( $this->shipping_method->get_service( $quote->ServiceType ) );

			/**
			 * Allow third party to hide the check store currency debug text.
			 *
			 * @param boolean Flag for hide or display the debug text.
			 * @param string Store currency.
			 * @param string Rate shipment details.
			 * @param object Shipping method.
			 *
			 * @since 3.7.0
			 */
			if ( apply_filters( 'woocommerce_shipping_fedex_check_store_currency', true, $currency, $details, $this->shipping_method ) && ( $store_currency !== $currency ) ) {
				Logger::warning(
					sprintf(
						'[FedEx] Rate for %1$s is in %2$s but store currency is %3$s.',
						$rate_name,
						$currency,
						$store_currency
					)
				);
				/* translators: 1: FedEx service name 2: currency for the rate 3: store's currency */
				$this->shipping_method->notify( sprintf( __( '[FedEx] Rate for %1$s is in %2$s but store currency is %3$s.', 'woocommerce-shipping-fedex' ), $rate_name, $currency, $store_currency ) );
				continue;
			}

			$rate_code = strval( $quote->ServiceType );
			$rate_id   = $this->shipping_method->get_rate_id( $rate_code );
			$rate_cost = floatval( $details->ShipmentRateDetail->TotalNetCharge->Amount );

			if ( 'smartpost' === $request_type ) {
				$qty       = isset( $request['RequestedShipment']['PackageCount'] ) ? $request['RequestedShipment']['PackageCount'] : 1;
				$rate_cost = $rate_cost * intval( $qty );
			}

			$this->shipping_method->prepare_rate( $rate_code, $rate_id, $rate_name, $rate_cost, $currency, $details, $request_type );
		}
	}
// phpcs:enable WordPress.NamingConventions.ValidVariableName.UsedPropertyNotSnakeCase
}
