( function( $ ) {
	const fedex_api_type_field_selector = '#woocommerce_fedex_api_type';

	function fedex_toggle_api_settings() {
		const api_type_value = $( fedex_api_type_field_selector ).val(),
		      api_type_attr  = 'data-fedex_api_type',
		      show_selector  = '[' + api_type_attr + '="' + api_type_value + '"]',
		      rows_to_show   = $( show_selector ).closest( 'tr' ),
		      rows_to_hide   = $( '[' + api_type_attr + ']:not(' + show_selector +
		                          ')' ).closest( 'tr' );

		rows_to_show.show();
		rows_to_hide.hide();
	}

	fedex_toggle_api_settings();

	$( document ).on( 'change', fedex_api_type_field_selector, function() {
		fedex_toggle_api_settings();
	} );
} )( jQuery );