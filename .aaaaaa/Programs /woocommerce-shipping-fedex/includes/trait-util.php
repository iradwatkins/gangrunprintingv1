<?php
/**
 * A collection of helpful methods that can be used in
 * multiple classes to help keep things DRY
 *
 * @package WC_Shipping_Fedex
 */

namespace WooCommerce\FedEx;

trait Util {

	/**
	 * Helper method to check whether given zone_id has fedex method instance.
	 *
	 * @param int $zone_id Zone ID.
	 *
	 * @return bool True if given zone_id has fedex method instance
	 * @since 4.4.0
	 */
	public function is_zone_has_fedex( $zone_id ) {
		global $wpdb;

		return (int) $wpdb->get_var( $wpdb->prepare( "SELECT COUNT(instance_id) FROM {$wpdb->prefix}woocommerce_shipping_zone_methods WHERE method_id = 'fedex' AND zone_id = %d", $zone_id ) ) > 0;
	}

	/**
	 * Helper method to check whether given country uses the postcode or not.
	 *
	 * @param string $country_code Country code.
	 *
	 * @return bool True if given country uses the postcode.
	 * @since 3.9.5
	 */
	public function country_uses_postcode( $country_code ) {
		$country_fields = WC()->countries->get_address_fields( $country_code, 'shipping_' );

		return isset( $country_fields['shipping_postcode'] ) && $country_fields['shipping_postcode']['required'];
	}

	/**
	 * Helper method to check if the destination country don't use the postcode, will return fake one.
	 *
	 * @param array $package Shipping package.
	 *
	 * @return string Destination postcode.
	 * @since 3.9.5
	 */
	public function get_shipping_postcode( $package ) {
		if ( ! $this->country_uses_postcode( $package['destination']['country'] ) && empty( $package['destination']['postcode'] ) ) {
			return '0000';
		}

		return $package['destination']['postcode'];
	}

	/**
	 * Helper method to get WooCommerce base country.
	 *
	 * @return string Base country or empty string.
	 * @since 4.1.0
	 */
	public function get_base_country() {

		static $country;

		if ( null === $country ) {
			$location = wc_get_base_location();
			$country  = isset( $location['country'] ) ? $location['country'] : '';
		}

		/**
		 * Apply WooCommerce filter use in WC()->countries->get_base_country().
		 *
		 * @var string $country Country.
		 * @since 4.1.0
		 */
		return apply_filters( 'woocommerce_countries_base_country', $country ); // phpcs:ignore WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedHooknameFound
	}
}
