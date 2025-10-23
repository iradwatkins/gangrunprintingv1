jQuery(document).ready(function()
{
	"use strict";
	jQuery(document).on('click','.master_option', wcfa_manage_master_option);
	jQuery(document).on('click','.wcfa_order_status_change_status_selector:checkbox', wcfa_manage_order_status_change_checkboxes);
	
	//init
	wcfa_manage_master_option(null);
});
function wcfa_manage_master_option(event)
{
	const transition_time = event == null ? 0 : 300;
	jQuery('.master_option').each(function(index, elem)
	{
	if(jQuery(elem).is(':checkbox'))
		{
			const hide_process_result = elem.checked ? jQuery(".master_related_"+jQuery(elem).data('related-id')).fadeIn(transition_time) : jQuery(".master_related_"+jQuery(elem).data('related-id')).fadeOut(transition_time);
		}
	});
}

function wcfa_manage_order_status_change_checkboxes(event)
{
	jQuery('.wcfa_order_status_change_status_selector:checkbox').not(this).prop('checked', false);
}