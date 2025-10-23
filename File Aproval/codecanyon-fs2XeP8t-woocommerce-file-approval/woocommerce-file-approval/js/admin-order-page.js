var wcfa_file_has_been_selected = false;
var wcfa_attachment_editing_id = 0;
var wcfa_image_frame;
var wcfa_tinyMCE_ref;
jQuery(document).ready( function($) 
{
	  "use strict";
      jQuery(document).on('click', "#wcfa-media-manager", wcfa_file_selection_click);
      jQuery(document).on('click', "#wcfa-save-button", wcfa_on_save_click);
      jQuery(document).on('click', ".wcfa-delete-button", wcfa_delete_attachment_click);
      jQuery(document).on('click', ".wcfa-collapse-expand-button, .wcfa-msg-stats", wcfa_collapse_exapand_click);
      jQuery(document).on('click', ".wcfa-edit-button", wcfa_file_edit_click);
      jQuery(document).on('change', ".wcfa_preset_answer_selector", wcfa_load_preset_answer);
      jQuery(document).on('click', ".wcfa-delete-admin-message-button, .wcfa-delete-customer-message-button", wcfa_delete_message_click);
	  jQuery(document).on('click', '.wcfa-delete-attachment-button', wcfa_delete_selected_attachment);
	  
	  //init
	  jQuery('.wcfa_preset_answer_selector').val('none');
	  
	  //master toggles
	  jQuery(document).on('click','.master_option', wcfa_manage_master_option);
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
function wcfa_before_loading_anserw(id)
{
	jQuery('.wcfa_preset_answer_selector').attr('disabled','disabled');
	jQuery('#wcfa_preset_answer_loader_'+id).fadeIn();
}
function wcfa_after_loading_answer(id)
{
	jQuery('.wcfa_preset_answer_selector').prop('disabled', false);
	jQuery('#wcfa_preset_answer_loader_'+id).fadeOut();
}
function wcfa_load_preset_answer(e)
{
	const answer_id = jQuery(e.currentTarget).val();
	const id = jQuery(e.currentTarget).data('id');
	const tinyMCE_ref = tinyMCE;
	//UI
	wcfa_before_loading_anserw(id);
	var data = {
		action: 'wcfa_get_preset_answer',
		id: answer_id,
		security: wcfa.security
	};

	jQuery.post(ajaxurl, data, function(response) 
	{
		//UI
		wcfa_after_loading_answer(id);
		tinyMCE_ref.get('wcfa-reply-message-'+id).setContent(response);
	});
}
function wcfa_collapse_exapand_click(e)
{
	e.preventDefault();
	const id = jQuery(e.currentTarget).data('id');
	const elem = jQuery(e.currentTarget);
	
	//Text management
	if(elem.hasClass('wcfa-has-text'))
	{
		if(elem.hasClass('collapsed'))
		{
			elem.removeClass('collapsed').addClass('expanded');
			elem.html(wcfa.hide_msg_area_message);
		}
		else
		{
			elem.removeClass('expanded').addClass('collapsed');
			elem.html(wcfa.show_msg_area_message);
		}
	}
	jQuery("#wcfa-messages-container-"+id).toggleClass('wcfa-hidden');
	return false;
}
function wcfa_delete_attachment_click(e)
{
	 e.preventDefault();
	 const id = jQuery(e.currentTarget).data('id');
	 if(confirm(wcfa.delete_attachment_confirm_message))
	 {
		//UI
		wcfa_ui_start_loading();
		var data = {
            action: 'wcfa_delete_attachment',
            id: id,
			security: wcfa.security
        };
		
        jQuery.get(ajaxurl, data, function(response) 
		{
			//UI
			wcfa_ui_end_loading()
        });
		
		jQuery('#wcfa-'+id).fadeOut(300, function() { jQuery(this).remove(); });
	 }
	 return false;
}
function wcfa_delete_message_click(e)
{
	e.preventDefault();
	 const id = jQuery(e.currentTarget).data('id');
	 if(confirm(wcfa.delete_message_confirm_message))
	 {
		//UI
		wcfa_ui_start_loading();
		var data = {
            action: 'wcfa_delete_single_message',
            id: id,
			security: wcfa.security
        };

        jQuery.get(ajaxurl, data, function(response) 
		{
			//UI
			wcfa_ui_end_loading()
        });
		
		 jQuery('#wcfa-ticket-message-'+id).fadeOut(300, function() { jQuery(this).remove(); });
	 }
	return false;
}
function wcfa_on_save_click(e)
{
	wcfa_ui_start_loading();
	jQuery('.save_order').trigger('click'); //This is necessary to make the submit process work on Chrome

	return true;
}
function wcfa_file_edit_click(e)
{
	wcfa_attachment_editing_id = jQuery(e.currentTarget).data('id');
	wcfa_file_selection_click(e);
}
function wcfa_file_selection_click(e)
{

	e.preventDefault();
	//UI
	wcfa_ui_start_loading();
	 
	if(!wcfa_image_frame)
	{
		 wcfa_init_media_manager();
	}
	wcfa_image_frame.open();
}
function wcfa_init_media_manager()
{
	//reference: https://github.com/ericandrewlewis/wp-media-javascript-guide
	wcfa_image_frame = wp.media({
					   title: wcfa.select_file_message,
					   multiple : false,					  
					   library : {
							//To finter only image, use the parameter-> type : 'image',
							uploadedTo: wp.media.view.settings.post.id //Includes media only uploaded to the specified post (ID)
						}  
				   });
	
	   
	wcfa_image_frame.on('close', function() 
	{
		 //'close' is fired before 'select' event
		setTimeout(function() 
		{
			if(!wcfa_file_has_been_selected)
				wcfa_ui_end_loading();
		}, 500);
		
	});
	
	wcfa_image_frame.on('select',function() 
	   {
		  var selection =  wcfa_image_frame.state().get('selection');
		  var gallery_ids = new Array();
		  var my_index = 0;
		  selection.each(function(attachment) 
		  {
			 gallery_ids[my_index] = attachment['id'];
			 my_index++;
		  });
		  var ids = gallery_ids.join(",");
		  
		  if(ids != "")
		  {
			wcfa_file_has_been_selected = true;
			wcfa_ajax_render_order_page_file_data_box(ids);
		  }
	   });

	wcfa_image_frame.on('open',function() 
	  {
		
		var selection =  wcfa_image_frame.state().get('selection');

	  });
}

// Ajax request to refresh the image preview
function wcfa_ajax_render_order_page_file_data_box(the_id)
{
	if(wcfa_attachment_editing_id != 0) //Editing
	{
		 var data = {
            action: 'wcfa_update_image_preview_area',
            id: the_id,
			order_id: wcfa.order_id,
			attachment_id: wcfa_attachment_editing_id,
			security: wcfa.security
        };
		jQuery.post(ajaxurl, data, function(response) 
		{
			//In case of succesfull response, use -> if(response.success === true) 
			{
				jQuery('#wcfa-single-file-data-container-'+wcfa_attachment_editing_id).html(response);
                jQuery('#wcfa-media-id-'+wcfa_attachment_editing_id).val( the_id );
				wcfa_attachment_editing_id = 0;
            }
			//UI
			wcfa_ui_end_loading()
        });
	}
	else //New attachment
	{
        var data = {
            action: 'wcfa_render_order_page_file_data_container',
			order_id: wcfa.order_id,
            id: the_id,
			security: wcfa.security
        };

        jQuery.post(ajaxurl, data, function(response) 
		{
			//succesfull response -> if(response.success === true) 
			{
				const result = jQuery.parseJSON(response);
                jQuery('#wcfa-attachment-container').append(  result.html );
				tinyMCE.execCommand( 'mceAddEditor', true, 'wcfa-reply-message-'+result.attachment_id )
            }
			//UI
			wcfa_ui_end_loading();
        });
	}
}
function wcfa_delete_selected_attachment(event)
{
	var unique_value = jQuery(event.currentTarget).data('unique-value');
	var box_id = jQuery(event.currentTarget).data('box-id');
	var message_id = jQuery(event.currentTarget).data('message-id');
	if(!confirm(wcfa.customer_file_delete_confirm_message))
		return;
	
	var random = Math.floor((Math.random() * 1000000) + 999);
	var formData = new FormData();
	formData.append('action', 'wcfa_delete_customer_file'); 
	formData.append('attachment_unique_value', unique_value);
	formData.append('message_id', message_id);
	
	//UI
	jQuery('#wcfa-single-customer-file_'+box_id).fadeOut('3000', function(){jQuery('#wcfa-single-customer-file_'+box_id).remove();});
	
	jQuery.ajax({
		url: ajaxurl+"?nocache="+random,
		type: 'POST',
		data: formData,
		async: true,
		success: function (data) 
		{
			//UI
		},
		error: function (data) 
		{
			//console.log(data);
			//alert("Error: "+data);
		},
		cache: false,
		contentType: false,
		processData: false
	});
}
function wcfa_ui_end_loading()
{
	wcfa_file_has_been_selected = false;
	wcfa_manage_master_option(null);
	jQuery('#wcfa-media-manager, #wcfa-save-button, .wcfa-disable-during-transitions').prop('disabled', false);
	jQuery('#wcfa-media-manager, #wcfa-save-button, .wcfa-disable-during-transitions').removeProp('disabled');
	jQuery('#wcfa-files-spin-loader').hide();
}
function wcfa_ui_start_loading()
{
	jQuery('#wcfa-media-manager, #wcfa-save-button, .wcfa-disable-during-transitions').prop('disabled', 'disabled');
	jQuery('#wcfa-files-spin-loader').show();
}