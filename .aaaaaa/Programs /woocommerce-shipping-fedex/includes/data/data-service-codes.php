<?php
/**
 * FEDEX Service codes in array format.
 *
 * @package WC_Shipping_Fedex
 */

/**
 * Filter for allowing third party to modify the service codes.
 *
 * @param array All service codes.
 *
 * @since 3.6.3
 */
return apply_filters(
	'woocommerce_fedex_data_service_codes',
	array(
		'FIRST_OVERNIGHT'                      => 'FedEx First Overnight',
		'PRIORITY_OVERNIGHT'                   => 'FedEx Priority Overnight',
		'STANDARD_OVERNIGHT'                   => 'FedEx Standard Overnight',
		'FEDEX_2_DAY_AM'                       => 'FedEx 2Day A.M',
		'FEDEX_2_DAY'                          => 'FedEx 2Day',
		'FEDEX_EXPRESS_SAVER'                  => 'CA' === $this->get_base_country() ? 'FedEx Economy' : 'FedEx Express Saver',
		'GROUND_HOME_DELIVERY'                 => 'FedEx Ground Home Delivery',
		'FEDEX_GROUND'                         => 'FedEx Ground',
		'INTERNATIONAL_ECONOMY'                => 'FedEx International Economy',
		'INTERNATIONAL_FIRST'                  => 'FedEx International First',
		'INTERNATIONAL_PRIORITY'               => 'FedEx International Priority',
		'EUROPE_FIRST_INTERNTIONAL_PRIORITY'   => 'FedEx Europe First International Priority',
		'FEDEX_1_DAY_FREIGHT'                  => 'FedEx 1 Day Freight',
		'FEDEX_2_DAY_FREIGHT'                  => 'FedEx 2 Day Freight',
		'FEDEX_3_DAY_FREIGHT'                  => 'FedEx 3 Day Freight',
		'INTERNATIONAL_ECONOMY_FREIGHT'        => 'FedEx Economy Freight',
		'INTERNATIONAL_PRIORITY_FREIGHT'       => 'FedEx Priority Freight',
		'FEDEX_FREIGHT'                        => 'Fedex Freight',
		'FEDEX_NATIONAL_FREIGHT'               => 'FedEx National Freight',
		'INTERNATIONAL_GROUND'                 => 'FedEx International Ground',
		'SMART_POST'                           => 'FedEx Ground Economy',
		'FEDEX_FIRST_FREIGHT'                  => 'FedEx First Freight',
		'FEDEX_FREIGHT_ECONOMY'                => 'FedEx Freight Economy',
		'FEDEX_FREIGHT_PRIORITY'               => 'FedEx Freight Priority',
		'FEDEX_INTERNATIONAL_CONNECT_PLUS'     => 'FedEx International Connect Plus',
		'INTERNATIONAL_DISTRIBUTION_FREIGHT'   => 'FedEx International Distribution Freight',
		'INTERNATIONAL_ECONOMY_DISTRIBUTION'   => 'FedEx International Economy Distribution',
		'INTERNATIONAL_PRIORITY_DISTRIBUTION'  => 'FedEx International Priority Distribution',
		'FEDEX_INTERNATIONAL_PRIORITY_EXPRESS' => 'FedEx International Priority Express',
		'FEDEX_INTERNATIONAL_PRIORITY'         => 'FedEx International Priority',
		'FEDEX_REGIONAL_ECONOMY'               => 'FedEx Regional Economy',
		'FEDEX_REGIONAL_ECONOMY_FREIGHT'       => 'FedEx Regional Economy Freight',
	)
);
