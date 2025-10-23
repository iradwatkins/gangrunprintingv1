jQuery(document).ready( function($) 
{
	  "use strict";
      jQuery(document).on('click', ".wcfa-delete-button", wcfa_delete_preset_text);

});
function wcfa_delete_preset_text(event)
{
	event.preventDefault();
	const id = jQuery(event.currentTarget).data('id');
	if(confirm(wcfa.confirm_message))
	{
		jQuery('#wcfa_row_'+id).remove();
	}
	return false;
}