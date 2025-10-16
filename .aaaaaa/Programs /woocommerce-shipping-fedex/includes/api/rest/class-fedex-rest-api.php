<?php
/**
 * FedEx REST API class file.
 *
 * @package WC_Shipping_Fedex
 */

namespace WooCommerce\FedEx;

require_once WC_SHIPPING_FEDEX_API_DIR . '/abstract/class-abstract-fedex-api.php';

use WC_Shipping_FedEx;
use WooCommerce\FedEx\Logger;

/**
 * FedEx REST API class.
 */
class FedEx_REST_API extends Abstract_FedEx_API {

	/**
	 * Endpoint for the FedEx Rating API.
	 *
	 * @var string
	 */
	protected $api_url = '';

	/**
	 * OAuth value.
	 *
	 * @var \WooCommerce\FedEx\FedEx_OAuth
	 */
	private $oauth;

	/**
	 * FedEx Account Number
	 *
	 * @var string
	 */
	private $account_number;

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
	 * Request headers.
	 *
	 * @var array
	 */
	private $headers;

	/**
	 * FedEx_REST_API constructor.
	 *
	 * @param WC_Shipping_FedEx $fedex_shipping_method The FedEx shipping method object.
	 */
	public function __construct( $fedex_shipping_method ) {
		$this->shipping_method = $fedex_shipping_method;
		$this->api_mode        = $fedex_shipping_method->is_production() ? 'production' : 'test';
		$this->account_number  = $fedex_shipping_method->get_account_number();
		$this->request_type    = $fedex_shipping_method->get_request_type();
		$this->oauth           = $fedex_shipping_method->get_oauth();
		$this->residential     = $fedex_shipping_method->is_residential();
		$this->api_url         = $fedex_shipping_method->is_production() ? 'https://apis.fedex.com' : 'https://apis-sandbox.fedex.com';
		$this->set_headers();
	}

	/**
	 * Set request headers.
	 *
	 * @param bool $force_refresh Force refresh access token.
	 *
	 * @return void
	 */
	private function set_headers( $force_refresh = false ) {
		$this->headers = array(
			'Authorization' => 'Bearer ' . $this->oauth->get_access_token( $force_refresh ),
			'X-locale'      => 'en_US',
			'Content-Type'  => 'application/json',
		);
	}

	/**
	 * Get the common API request parameters.
	 *
	 * @param string $request_type Request type.
	 *
	 * @return array
	 */
	public function get_fedex_api_request( $request_type ) {
		$request['AccountNumber'] = $this->account_number;

		$request['rateRequestControlParameters'] = array(
			'returnTransitTimes'          => false,
			'servicesNeededOnRateFailure' => true,
			'rateSortOrder'               => 'SERVICENAMETRADITIONAL',
		);

		// Include PREFERRED Rate Type.
		// The preferred currency is not returned if the requested currency is already present within the rate response.
		$request['RequestedShipment']['RateRequestType'] = array( $this->request_type, 'PREFERRED' );

		if ( 'freight' !== $request_type ) {
			$request['RequestedShipment']['PickupType'] = 'DROPOFF_AT_FEDEX_LOCATION';
		}

		if ( 'default' === $request_type ) {
			$request['carrierCodes'] = array( 'FDXE' );
			if ( $this->shipping_method->is_ground_service_enabled() ) {
				$request['carrierCodes'][] = 'FDXG';
			}
		}

		if ( 'ground' === $request_type ) {
			$request['carrierCodes'] = array( 'FDXG' );
		}

		if ( 'smartpost' === $request_type ) {
			$request['carrierCodes'] = array( 'FXSP' );
		}

		return $request;
	}

	/**
	 * Get result.
	 *
	 * @param array  $request Request.
	 * @param string $request_type Rate service type.
	 * @param bool   $allow_retry Allow retry.
	 *
	 * @return mixed
	 */
	public function get_result( $request, $request_type, $allow_retry = true ) {
		// phpcs:disable WordPress.PHP.DevelopmentFunctions.error_log_print_r --- Its needed for debugging
		$args = array(
			'headers' => $this->headers,
			'body'    => wp_json_encode( $request ),
		);

		$endpoint = 'freight' === $request_type ? '/rate/v1/freight/rates/quotes' : '/rate/v1/rates/quotes';

		$response = wp_remote_post( $this->api_url . $endpoint, $args );

		if ( $response instanceof \WP_Error ) {
			$code          = '?';
			$message       = 'FedEx Rate API no response';
			$response_body = $response->get_error_messages();
			Logger::error(
				'RESPONSE service: ' . $request_type . ', code: ' . $code . ', message: ' . $message,
				array( 'response' => $response_body )
			);

			return false;

		}

		if ( is_array( $response ) ) {
			$code          = wp_remote_retrieve_response_code( $response );
			$message       = wp_remote_retrieve_response_message( $response );
			$response_body = json_decode( wp_remote_retrieve_body( $response ) );

			if ( 200 !== $code ) {
				Logger::error(
					'RESPONSE service: ' . $request_type . ', code: ' . $code . ', message: ' . $message,
					array( 'response' => $response_body )
				);
				$this->shipping_method->notify( '<b>RESPONSE:</b> service: <b>' . ucfirst( $request_type ) . '</b> &#10072; code: <b>' . $code . '</b> &#10072; message: <b>' . $message . '</b> <a href="#" style="float:right;" class="debug_reveal">Show</a><pre style="font-size: 12px; line-height:1.5;" class="debug_info">' . print_r( $response_body, true ) . '</pre>' );

				// JWT token expired. Refresh token and retry.
				if ( true === $allow_retry && 401 === $code ) {
					Logger::debug( 'Trying to refresh JWT token and retry the request.' );

					// Update headers with new token.
					$this->set_headers( true );

					return $this->get_result( $request, $request_type, false );
				}

				return false;
			}
		} else {
			$code          = '?';
			$message       = '?';
			$response_body = $response;
		}
		Logger::debug(
			'RESPONSE service: ' . $request_type . ', code: ' . $code . ', message: ' . $message,
			array( 'response' => $response_body )
		);
		$this->shipping_method->notify( '<b>RESPONSE:</b> service: <b>' . ucfirst( $request_type ) . '</b> &#10072; code: <b>' . $code . '</b> &#10072; message: <b>' . $message . '</b> <a href="#" style="float:right;" class="debug_reveal">Show</a><pre style="font-size: 12px; line-height:1.5;" class="debug_info">' . print_r( $response_body, true ) . '</pre>' );

		// Prevent caching 200 response when it doesn't contain the rates.
		if ( ! isset( $response_body->output->rateReplyDetails ) ) {
			return false;
		}

		return $response_body;
	}

	/**
	 * Check if Destination Address is Residential.
	 *
	 * @param array   $request API Request value.
	 * @param boolean $retry true to command retry if something goes wrong.
	 *
	 * @return bool
	 */
	public function residential_address_validation( $request, $retry = true ) {
		$request_body = $this->prepare_request( $request );

		$args = array(
			'headers' => $this->headers,
			'body'    => wp_json_encode( $request_body ),
		);

		$transient_key  = $this->get_address_key( $request_body );
		$classification = $transient_key ? get_transient( $transient_key ) : false;
		// If there's a cached classification, return it.
		if ( false !== $classification ) {
			unset( $request_body['requestTimestamp'] );
			Logger::debug( 'CACHED RESPONSE service: address validation, classification: ' . $classification, array( 'request' => $request_body ) );
			$this->shipping_method->notify( '<b>CACHED RESPONSE:</b> service: <b>Address Validation</b> &#10072; classification: <b>' . $classification . '</b>' );

			return $this->is_residential( $classification );
		}

		$response = wp_remote_post( $this->api_url . '/address/v1/addresses/resolve', $args );
		if ( $response instanceof \WP_Error ) {
			$code          = '?';
			$message       = 'FedEx Rate API no response';
			$response_body = $response->get_error_messages();
			Logger::error(
				'RESPONSE service: address validation, code: ' . $code . ', message: ' . $message,
				array(
					'request'  => $request_body,
					'response' => $response_body,
				)
			);

			$this->shipping_method->notify( '<b>RESPONSE:</b> service: <b>Address Validation</b> &#10072; code: <b>' . $code . '</b> &#10072; message: <b>' . $message . '</b> <a href="#" style="float:right;" class="debug_reveal">Show</a><pre style="font-size: 12px; line-height:1.5; display: none;" class="debug_info">' . print_r( $response_body, true ) . '</pre>' );

			return $this->residential;
		} elseif ( $retry && is_array( $response ) && 503 === wp_remote_retrieve_response_code( $response ) ) {
			// Retry once if service return 503 status code.
			$this->residential_address_validation( $request, false );
		} elseif ( is_array( $response ) && 200 !== wp_remote_retrieve_response_code( $response ) ) {
			$code          = wp_remote_retrieve_response_code( $response );
			$message       = wp_remote_retrieve_response_message( $response );
			$response_body = json_decode( wp_remote_retrieve_body( $response ) );
			Logger::error(
				'RESPONSE service: address validation, code: ' . $code . ', message: ' . $message,
				array(
					'request'  => $request_body,
					'response' => $response_body,
				)
			);

			$this->shipping_method->notify( '<b>RESPONSE:</b> service: <b>Address Validation</b> &#10072; code: <b>' . $code . '</b> &#10072; message: <b>' . $message . '</b> <a href="#" style="float:right;" class="debug_reveal">Show</a><pre style="font-size: 12px; line-height:1.5; display: none;" class="debug_info">' . print_r( $response_body, true ) . '</pre>' );

			return $this->residential;
		} else {
			$code           = is_array( $response ) ? wp_remote_retrieve_response_code( $response ) : '?';
			$response_body  = is_array( $response ) ? json_decode( wp_remote_retrieve_body( $response ) ) : $response;
			$classification = isset( $response_body->output->resolvedAddresses[0]->classification ) ? strtoupper( $response_body->output->resolvedAddresses[0]->classification ) : '?';

			// Cache address classification result.
			if (
				$response
				&& $transient_key
				&& in_array( $classification, array( 'MIXED', 'UNKNOWN', 'BUSINESS', 'RESIDENTIAL' ), true )
			) {
				$days = 'UNKNOWN' === $classification ? 7 : 90;
				set_transient( $transient_key, $classification, DAY_IN_SECONDS * $days );
			}

			Logger::debug(
				'RESPONSE service: address validation, code: ' . $code . ', classification: ' . $classification,
				array(
					'request'  => $request_body,
					'response' => $response_body,
				)
			);

			$this->shipping_method->notify( '<b>RESPONSE:</b> service: <b>Address Validation</b> &#10072; code: <b>' . $code . '</b> &#10072; classification: <b>' . $classification . '</b> <a href="#" style="float:right;" class="debug_reveal">Show</a><pre style="font-size: 12px; line-height:1.5; display: none;" class="debug_info">' . print_r( $response_body, true ) . '</pre>' );

			return $this->is_residential( $classification );
		}
		// phpcs:enable WordPress.PHP.DevelopmentFunctions.error_log_print_r
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
	 * Generate key from address data.
	 *
	 * @param  array $request Address validation request.
	 *
	 * @return string|false
	 */
	private function get_address_key( $request ) {
		if ( ! isset( $request['addressesToValidate'][0]['address'] ) || ! is_array( $request['addressesToValidate'][0]['address'] ) ) {
			return false;
		}
		$address = $request['addressesToValidate'][0]['address'];
		array_walk_recursive(
			$address,
			function ( &$element ) {
				$element = strtoupper( $element );
			}
		);

		$address_encoded = wp_json_encode( $address );
		return $address_encoded ? 'fedex_address_validation_' . md5( $address_encoded ) : false;
	}

	/**
	 * Prepare request elements.
	 *
	 * Depending on the request type, some elements need to be renamed or removed.
	 * This function will loop through the request array, and modify the keys and values as needed.
	 *
	 * @param array  $request      The request array.
	 * @param string $request_type The request type.
	 * @param string $parent_key   The parent key.
	 *
	 * @return array
	 */
	public function prepare_request( $request, $request_type = '', $parent_key = '' ) {

		if ( ! is_array( $request ) ) {
			return array();
		}

		$updated_request = array();
		foreach ( $request as $key => $value ) {
			$original_key = $key;

			if ( 'AccountNumber' === $key ) {
				$value = array( 'value' => $value );
			}

			if ( 'PackageCount' === $key ) {
				$key = 'totalPackageCount';
			}

			if ( 'freight' === $request_type && 'PackagingType' === $key ) {
				continue;
			}

			if ( 'freight' === $request_type && 'RequestedShipment' === $key ) {
				$key = 'freightRequestedShipment';
			}

			if ( 'freight' === $request_type && 'PhysicalPackaging' === $key ) {
				$key = 'subPackagingType';
			}

			if ( 'freight' === $request_type && 'FedExFreightAccountNumber' === $key ) {
				$key   = 'accountNumber';
				$value = array( 'value' => $value );
			}

			if ( 'freight' === $request_type && 'RequestedPackageLineItems' === $key ) {
				$value = array( $value );
			}

			if ( 'freight' === $request_type && 'LineItems' === $key ) {
				$key   = 'lineItem';
				$value = array( $value );
			}

			if ( 'freight' === $request_type && 'Packaging' === $key ) {
				$key = 'subPackagingType';
			}

			if ( 'freight' === $request_type && 'LineItems' === $parent_key && 'Id' === $key ) {
				$value = (string) $value;
			}

			if ( 'freight' === $request_type && 'AssociatedFreightLineItems' === $key ) {
				$value = array( $value );
			}

			if ( 'SmartPostDetail' === $key ) {
				$key = 'smartPostInfoDetail';
			}

			if ( 'ShipTimestamp' === $key ) {
				$value = wp_date( 'Y-m-d', strtotime( $value ) );
				$key   = 'shipDateStamp';
			}

			if ( 'InsuredValue' === $key ) {
				$key = 'declaredValue';
			}

			if ( 'SpecialServicesRequested' === $key ) {
				$key = 'shipmentSpecialServices';
			}

			if ( ( 'freight' !== $request_type && 'ShippingChargesPayment' === $key ) || 'SequenceNumber' === $key || 'GroupNumber' === $key || 'DropoffType' === $key || '' === $value ) {
				continue;
			}

			$updated_request[ lcfirst( $key ) ] = is_array( $value ) ? $this->prepare_request( $value, $request_type, $original_key ) : $value;
		}

		return $updated_request;
	}

	/**
	 * Process result.
	 *
	 * @param array  $request Request data.
	 * @param object $result API response or result.
	 * @param string $request_type Request type.
	 *
	 * @return void
	 */
	public function process_result( $request, $result, $request_type ) {
		// phpcs:disable WordPress.NamingConventions.ValidVariableName.UsedPropertyNotSnakeCase --- FedEx API provides an object with camelCase properties and method
		if ( ! isset( $result->output ) || ! isset( $result->output->rateReplyDetails ) ) {
			return;
		}

		$store_currency = get_woocommerce_currency();

		foreach ( $result->output->rateReplyDetails as $quote ) {

			// Prevent double rates we should already have rate for "FedEx SmartPost®" both rates have same service key "SMART_POST".
			if (
				isset( $quote->serviceType ) && 'SMART_POST' === $quote->serviceType &&
				isset( $quote->serviceName ) && 'FedEx SmartPost®' !== $quote->serviceName ) {
				continue;
			}

			if ( isset( $quote->serviceName ) && 'FedEx International Ground®' === $quote->serviceName ) {
				$quote->serviceType = 'INTERNATIONAL_GROUND';
			}

			if ( is_array( $quote->ratedShipmentDetails ) ) {
				$details = false;
				foreach ( $quote->ratedShipmentDetails as $i => $d ) {
					// Attempt to return Rate Type set in Shipping Zone settings, ACCOUNT or LIST.
					if (
						strstr( $d->rateType, $this->shipping_method->get_request_type() ) &&
						$d->currency === $store_currency
					) {
						$details = $quote->ratedShipmentDetails[ $i ];
						break;
					}
				}

				// If first attempt don't return Shipment Details due to currency mismatch, look for PREFERRED rate.
				if ( ! $details ) {
					foreach ( $quote->ratedShipmentDetails as $i => $d ) {
						if (
							strstr( $d->rateType, 'PREFERRED_CURRENCY' ) &&
							$d->currency === $store_currency
						) {
							$details = $quote->ratedShipmentDetails[ $i ];
							break;
						}
					}
				}
			} else {
				$details = $quote->ratedShipmentDetails;
			}

			if ( empty( $details ) ) {
				continue;
			}

			$currency  = isset( $details->currency ) ? $details->currency : '';
			$rate_name = strval( $this->shipping_method->get_service( $quote->serviceType ) );

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
				/* translators: 1: FedEx service name 2: currency for the rate 3: store's currency */
				$this->shipping_method->notify( sprintf( __( '[FedEx] Rate for %1$s is in %2$s but store currency is %3$s.', 'woocommerce-shipping-fedex' ), $rate_name, $currency, $store_currency ) );
				continue;
			}

			$rate_code = strval( $quote->serviceType );
			$rate_id   = $this->shipping_method->get_rate_id( $rate_code );
			$rate_cost = floatval( $details->totalNetCharge );

			if ( 'smartpost' === $request_type ) {
				$qty       = isset( $request['RequestedShipment']['PackageCount'] ) ? $request['RequestedShipment']['PackageCount'] : 1;
				$rate_cost = $rate_cost * intval( $qty );
			}

			$this->shipping_method->prepare_rate( $rate_code, $rate_id, $rate_name, $rate_cost, $currency, $details, $request_type );
		}
		// phpcs:enable WordPress.NamingConventions.ValidVariableName.UsedPropertyNotSnakeCase
	}
}
