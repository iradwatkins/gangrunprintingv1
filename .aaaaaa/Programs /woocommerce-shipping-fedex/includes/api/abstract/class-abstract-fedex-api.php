<?php
/**
 * FedEx Abstract API class file.
 *
 * @package WC_Shipping_Fedex
 */

namespace WooCommerce\FedEx;

use WC_Shipping_FedEx;

/**
 * FedEx Abstract API class.
 */
abstract class Abstract_FedEx_API {

	/**
	 * Endpoint for the API.
	 *
	 * @var string
	 */
	protected $endpoint;

	/**
	 * FedEx Shipping Method Class.
	 *
	 * @var WC_Shipping_FedEx
	 */
	protected $shipping_method;

	/**
	 * Get the common API request parameters.
	 *
	 * @param string $request_type Request type.
	 *
	 * @return array
	 */
	abstract public function get_fedex_api_request( $request_type );

	/**
	 * Prepare request elements.
	 *
	 * @param array $request API request.
	 *
	 * @return array
	 */
	public function prepare_request( $request ) {
		return $request;
	}

	/**
	 * Get result.
	 *
	 * @param array  $request API request.
	 * @param string $request_type Request type.
	 *
	 * @return array
	 */
	abstract public function get_result( $request, $request_type );

	/**
	 * Check if Destination Address is Residential.
	 *
	 * @param array $request API request.
	 *
	 * @return bool
	 */
	abstract public function residential_address_validation( $request );

	/**
	 * Process API response.
	 *
	 * @param array  $request Request data.
	 * @param mixed  $result API response or result.
	 * @param string $request_type Request type.
	 *
	 * @return void
	 */
	abstract public function process_result( $request, $result, $request_type );
}
