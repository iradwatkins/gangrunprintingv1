<?php
/**
 * FedEx OAuth class file.
 *
 * @package WC_Shipping_Fedex
 */

namespace WooCommerce\FedEx;

use WC_Shipping_FedEx;

/**
 * Class FedEx_OAuth
 *
 * Handles the OAuth authentication for the FedEx REST API.
 *
 * @package WooCommerce\FedEx
 */
class FedEx_OAuth {

	/**
	 * WC_Shipping_Fedex method.
	 *
	 * @var WC_Shipping_Fedex
	 */
	private $shipping_method;

	/**
	 * The client ID used to authenticate with the FedEx OAuth API.
	 *
	 * @var string
	 */
	private $api_type;

	/**
	 * The client ID used to authenticate with the FedEx OAuth API.
	 *
	 * @var string
	 */
	private $client_id;
	/**
	 * The client secret used to authenticate with the FedEx OAuth API.
	 *
	 * @var string
	 */
	private $client_secret;
	/**
	 * The URL for the FedEx OAuth API endpoint.
	 *
	 * @var string
	 */
	private $endpoint;
	/**
	 * The name of the transient used to store the access token.
	 *
	 * @var string
	 */
	private $access_token_transient_name;

	/**
	 * Constructor.
	 *
	 * @param WC_Shipping_Fedex $fedex_shipping_method The FedEx shipping method object.
	 */
	public function __construct( $fedex_shipping_method ) {
		$this->shipping_method             = $fedex_shipping_method;
		$this->api_type                    = $fedex_shipping_method->api_type();
		$this->client_id                   = $fedex_shipping_method->get_client_id();
		$this->client_secret               = $fedex_shipping_method->get_client_secret();
		$this->endpoint                    = $fedex_shipping_method->is_production() ? 'https://apis.fedex.com/oauth/token' : 'https://apis-sandbox.fedex.com/oauth/token';
		$this->access_token_transient_name = 'woocommerce_fedex_oauth_access_token_' . md5( $this->client_id . $this->client_secret . $fedex_shipping_method->api_mode );
	}

	/**
	 * Check if we've successfully authenticated.
	 *
	 * @return bool
	 */
	public function is_authenticated() {
		return (bool) $this->get_access_token();
	}

	/**
	 * Get an access token.
	 *
	 * @param bool $force_refresh Force token refresh.
	 *
	 * @return string|bool
	 */
	public function get_access_token( $force_refresh = false ) {

		if ( 'soap' === $this->api_type ) {
			return false;
		}

		$access_token = get_transient( $this->access_token_transient_name );

		if ( false === $access_token || $force_refresh ) {

			$response = $this->get_access_token_from_fedex();
			if ( $response ) {
				set_transient( $this->access_token_transient_name, $response->access_token, $response->expires_in - 60 );

				$access_token = $response->access_token;
			}
		}

		return $access_token;
	}

	/**
	 * Get an access token from the FedEx OAuth API.
	 *
	 * @return object|bool The response from the FedEx OAuth API, or false if the request fails.
	 */
	private function get_access_token_from_fedex() {
		static $token_data;

		if ( null !== $token_data ) {
			return $token_data;
		}

		if ( ! $this->client_id || ! $this->client_secret ) {
			$token_data = false;

			return false;
		}

		$headers = array(
			'Content-Type' => 'application/x-www-form-urlencoded',
		);

		$body = array(
			'grant_type'    => 'client_credentials',
			'client_id'     => $this->client_id,
			'client_secret' => $this->client_secret,
		);

		$response = wp_remote_post(
			$this->endpoint,
			array(
				'headers' => $headers,
				'body'    => $body,
			)
		);

		$response_body = $this->get_response_body( $response );

		if ( is_wp_error( $response ) || empty( $response_body->access_token ) || empty( $response_body->expires_in ) ) {
			$error_message = is_wp_error( $response ) ? $response->get_error_message() : $this->retrieve_error_message_from_response( $response_body );

			Logger::error( "FedEx_OAuth::request_access_token: The FedEx OAuth endpoint returned the following error: $error_message" );

			$token_data = false;

			return false;
		}

		$token_data = $this->get_response_body( $response );

		return $token_data;
	}

	/**
	 * Get response body.
	 *
	 * @param  array $response FedEx API response.
	 *
	 * @return object
	 */
	private function get_response_body( $response ) {
		return json_decode( wp_remote_retrieve_body( $response ) );
	}

	/**
	 * Get error message from FedEx API response.
	 *
	 * @param  object $response FedEx API response.
	 *
	 * @return string
	 */
	private function retrieve_error_message_from_response( $response ) {
		$message = '';
		if ( isset( $response->errors ) && is_array( $response->errors ) ) {
			foreach ( $response->errors as $error ) {
				if ( empty( $error->code ) || empty( $error->message ) ) {
					continue;
				}

				$message .= "\n" . $error->code . ': ' . $error->message;
			}
		}

		return $message;
	}
}
