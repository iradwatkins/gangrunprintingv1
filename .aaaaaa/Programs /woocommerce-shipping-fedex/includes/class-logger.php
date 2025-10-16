<?php
/**
 * Logger class.
 *
 * A class to handle logging for the FedEx shipping method.
 *
 * @package WC_Shipping_FedEx
 */

namespace WooCommerce\FedEx;

use WC_Log_Levels;
use WC_Shipping_FedEx;

/**
 * Class Logger
 *
 * Handles logging functionality for the SandboxLogger.
 */
class Logger {

	/**
	 * Fix linebreaks in log messages.
	 *
	 * @param string $message The original log message.
	 * @return string The formatted log entry.
	 */
	private static function format_linebreaks( string $message ): string {
		// Remove tabs from begining of new line.
		$message = preg_replace( '/(\r\n|\r|\n)\t+/', '$1', $message );
		// Replace new line with html break line symbol.
		return str_replace( array( "\r\n", "\n", "\r" ), '&#10;', $message );
	}

	/**
	 * Get the FedEx shipping method instance.
	 *
	 * @param string $method The shipping method identifier.
	 *
	 * @return WC_Shipping_FedEx|false The FedEx shipping method instance or false if not found.
	 */
	private static function get_shipping_method( string $method = 'fedex' ) {
		static $instance = null;

		if ( null !== $instance ) {
			return $instance;
		}

		$methods  = WC()->shipping()->get_shipping_methods();
		$instance = ( isset( $methods[ $method ] ) && $methods[ $method ] instanceof WC_Shipping_FedEx ) ? $methods[ $method ] : false;

		return $instance;
	}

	/**
	 * Logs a message with the specified level.
	 *
	 * @param string $level   Log level.
	 * @param string $message Message to log.
	 * @param array  $context Log context.
	 *
	 * @return void
	 */
	public static function log( string $level, string $message, array $context = array() ) {
		static $logger = null;

		if ( null === $logger ) {
			$logger = wc_get_logger();
		}

		$method = self::get_shipping_method();

		// Log warnings and errors even if debug mode is disabled.
		if ( ! $method || ( ! $method->debug && in_array( $level, array( WC_Log_Levels::DEBUG, WC_Log_Levels::NOTICE ), true ) ) ) {
			return;
		}

		if ( is_array( $context ) && ! isset( $context['source'] ) ) {
			$context['source'] = 'plugin-woocommerce-shipping-fedex-' . $method->api_type . '-' . $method->api_mode;
		}

		$message = self::format_linebreaks( $message );

		$logger->log( $level, $message, $context );
	}

	/**
	 * Adds an emergency level message.
	 *
	 * System is unusable.
	 *
	 * @see WC_Logger::log
	 *
	 * @param string $message Message to log.
	 * @param array  $context Log context.
	 */
	public static function emergency( string $message, array $context = array() ) {
		self::log( WC_Log_Levels::EMERGENCY, $message, $context );
	}

	/**
	 * Adds an alert level message.
	 *
	 * Action must be taken immediately.
	 * Example: Entire website down, database unavailable, etc.
	 *
	 * @see WC_Logger::log
	 *
	 * @param string $message Message to log.
	 * @param array  $context Log context.
	 */
	public static function alert( string $message, array $context = array() ) {
		self::log( WC_Log_Levels::ALERT, $message, $context );
	}

	/**
	 * Adds a critical level message.
	 *
	 * Critical conditions.
	 * Example: Application component unavailable, unexpected exception.
	 *
	 * @see WC_Logger::log
	 *
	 * @param string $message Message to log.
	 * @param array  $context Log context.
	 */
	public static function critical( string $message, array $context = array() ) {
		self::log( WC_Log_Levels::CRITICAL, $message, $context );
	}

	/**
	 * Adds an error level message.
	 *
	 * Runtime errors that do not require immediate action but should typically be logged
	 * and monitored.
	 *
	 * @see WC_Logger::log
	 *
	 * @param string $message Message to log.
	 * @param array  $context Log context.
	 */
	public static function error( string $message, array $context = array() ) {
		self::log( WC_Log_Levels::ERROR, $message, $context );
	}

	/**
	 * Adds a warning level message.
	 *
	 * Exceptional occurrences that are not errors.
	 *
	 * Example: Use of deprecated APIs, poor use of an API, undesirable things that are not
	 * necessarily wrong.
	 *
	 * @see WC_Logger::log
	 *
	 * @param string $message Message to log.
	 * @param array  $context Log context.
	 */
	public static function warning( string $message, array $context = array() ) {
		self::log( WC_Log_Levels::WARNING, $message, $context );
	}

	/**
	 * Adds a notice level message.
	 *
	 * Normal but significant events.
	 *
	 * @see WC_Logger::log
	 *
	 * @param string $message Message to log.
	 * @param array  $context Log context.
	 */
	public static function notice( string $message, array $context = array() ) {
		self::log( WC_Log_Levels::NOTICE, $message, $context );
	}

	/**
	 * Adds an info level message.
	 *
	 * Interesting events.
	 * Example: User logs in, SQL logs.
	 *
	 * @see WC_Logger::log
	 *
	 * @param string $message Message to log.
	 * @param array  $context Log context.
	 */
	public static function info( string $message, array $context = array() ) {
		self::log( WC_Log_Levels::INFO, $message, $context );
	}

	/**
	 * Adds a debug level message.
	 *
	 * Detailed debug information.
	 *
	 * @see WC_Logger::log
	 *
	 * @param string $message Message to log.
	 * @param array  $context Log context.
	 */
	public static function debug( string $message, array $context = array() ) {
		self::log( WC_Log_Levels::DEBUG, $message, $context );
	}
}
