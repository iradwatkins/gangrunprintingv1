"use strict";

jQuery(document).ready( function($) 
{
	jQuery(document).on('click', '.wcfa-button-details',  wcfa_managed_attachment_display);
	console.log("here");
});
function wcfa_managed_attachment_display(event)
{
	event.preventDefault();
	event.stopPropagation();
	var id = jQuery(event.currentTarget).data("id");
	jQuery( "#wcfa-container-"+id ).toggle( "slow");
	
	return false;
}