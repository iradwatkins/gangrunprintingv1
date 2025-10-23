var wcfa_approval_status = 'idle'; //used only for the "buttons" approval style
jQuery(document).ready( function($) 
{
	  "use strict";
      jQuery(document).on('click', ".wcfa-save-button", wcfa_save_button_click);
      jQuery(document).on('click', ".wcfa-approve-button, .wcfa-reject-button", wcfa_toggle_buttons_click);
      jQuery(document).on('change', ".wcfa-appoval-toggle", wcfa_on_toggle_slider_click);
	  jQuery(document).on('click', '#wcfa-close-popup-alert', wcfa_ui_close_popup); 
	  jQuery('#wcfa-show-popup-button').magnificPopup({
          type: 'inline',
		  showCloseBtn:false,
          preloader: false,
            callbacks: {
            /*
			
			beforeOpen: function() {
              console.log("here");
            }*/
			 /* close: function(event) {
				  wcuf_test(event)
				} */
          } 
        });
		
      //jQuery('.wcfa-appoval-toggle').trigger('change');

});
function wcfa_toggle_buttons_click(e)
{
	e.stopPropagation();
	const result = jQuery(e.currentTarget).data('approval');
	const id = jQuery(e.currentTarget).data('id');
	jQuery("#wcfa-approved-result-"+id).prop('checked', result=='approved');
	wcfa_approval_status = 'ok';
	if(result =='approved')
	{
		if(!jQuery("#wcfa-approve-button-"+id).hasClass('wcfa-approve-active-button'))
			jQuery("#wcfa-approve-button-"+id).addClass('wcfa-approve-active-button');
		
			jQuery("#wcfa-reject-button-"+id).removeClass('wcfa-reject-active-button');
	}
	else 
	{
		
		if(!jQuery("#wcfa-reject-button-"+id).hasClass('wcfa-reject-active-button'))
			jQuery("#wcfa-reject-button-"+id).addClass('wcfa-reject-active-button');
			
		jQuery("#wcfa-approve-button-"+id).removeClass('wcfa-approve-active-button');
	}

	return false;
}
function wcfa_on_toggle_slider_click(e)
{
	const id = jQuery(e.currentTarget).data('id');
	
	//idle status
	if(jQuery("#wcfa-slider-"+id).hasClass('wcfa-idle-slider'))
	{
		jQuery("#wcfa-idle-text-"+id).addClass('wcfa-hidden');
		jQuery("#wcfa-slider-"+id).removeClass('wcfa-idle-slider');
		
		 jQuery("#wcfa-approved-result-"+id).prop("checked", wcfa.approval_button_first_status_on_click == 'approved')
		wcfa_switch_approval_button(id, wcfa.approval_button_first_status_on_click == 'approved');
	}
	
	else 
		wcfa_switch_approval_button(id, jQuery("#wcfa-approved-result-"+id).prop("checked"));
}
function wcfa_switch_approval_button(id, is_checked)
{
	if(is_checked)
	{
		jQuery("#wcfa-rejected-text-"+id).addClass('wcfa-hidden');
		jQuery("#wcfa-approved-text-"+id).removeClass('wcfa-hidden');
	}
	else 
	{
		jQuery("#wcfa-approved-text-"+id).addClass('wcfa-hidden');
		jQuery("#wcfa-rejected-text-"+id).removeClass('wcfa-hidden');
	}
}
function wcfa_save_button_click(e)
{
	e.preventDefault();
	const id = jQuery(e.currentTarget).data('id');
	const msg = jQuery("#wcfa-reply-message-"+id).val();
	const leave_blank_message = parseInt(jQuery("#wcfa-leave-blank-message-"+id).val());
	const approval_initial_value = jQuery("#wcfa-approved-result-"+id).data("approval-initial-value");
	const approval_value = jQuery("#wcfa-approved-result-"+id).prop("checked") ? 1 : 0;
	const is_idle = wcfa.approval_button_style != 'buttons' ? jQuery("#wcfa-slider-"+id).hasClass('wcfa-idle-slider') :  wcfa_approval_status == 'idle';
	const already_processed = jQuery("#wcfa-already-processed-"+id).val() ? 1 : 0;
	
	/*  |leave_blank_message|
		0: Never
		1: Only if approved
		2: Only when rejected
		3: Always		
	*/
	if(is_idle && already_processed == 0)
	{
		wcfa_ui_popup_alert(wcfa.idle_warning);
		//confirm(wcfa.idle_warning);
		return;
	}
	else if(!msg && (already_processed == 1 || (leave_blank_message == 1 && approval_value == 0) || leave_blank_message == 0 || (leave_blank_message == 2 && approval_value == 1)))
	{
		wcfa_ui_popup_alert(wcfa.empty_warning);
		//alert(wcfa.empty_warning);
		return;
	}
	/* else if(approval_value == 0 && approval_initial_value == 2)
	{
		if(!confirm(wcfa.rejected_warning))
			return;
	} */
	
	
	var formData = new FormData();
	formData.append('action', 'wcfa_frontend_save_data'); 	
	formData.append('id', id); 	
	formData.append('order_id', wcfa.order_id); 	
	formData.append('msg', msg); 	
	formData.append('approval_value', approval_value); 	
	formData.append('security',  wcfa.security); 	
	
	
	//file attachments
	jQuery('.wcfa_file_metadata_'+id).each(function(index,elem)
	{
		if(jQuery(this).val() != "")
			formData.append(jQuery(this).prop('name'), jQuery(this).val());
	});
	
	//UI 
	wcfa_ui_start_loading(id);
	/* 
	Old method no longer used:
		var data = {
				action: 'wcfa_frontend_save_data',
				id: id,
				order_id: wcfa.order_id,
				msg: msg,
				approval_value: approval_value,
				security: wcfa.security
		};

		jQuery.post(wcfa.ajaxurl, data, function(response) 
		{
			//UI
			wcfa_ui_end_loading(id)
			jQuery("#wcfa-ajax-content-"+id).html(response);
			wcfa_ui_popup_alert(wcfa.succesfully_sent_message);
		}); 
	*/
	
	jQuery.ajax({
		url: wcfa.ajaxurl,
		type: 'POST',
		data: formData,
		async: true,
		success: function (response) 
		{
			//UI
			wcfa_ui_end_loading(id)
			jQuery("#wcfa-ajax-content-"+id).html(response);
			wcfa_ui_popup_alert(wcfa.succesfully_sent_message);
			
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
		
	return false;
}
function wcfa_ui_start_loading(id)
{
	jQuery("#wcfa-single-attachment-container-"+id).animate({opacity: 0.3}, 0);
	jQuery("#wcfa-single-attachment-container-"+id).css({'cursor':'wait'});
	jQuery('.wcfa-disable-during-transition').prop('disabled', 'disabled');
	jQuery('.wcfa-disable-during-transition').css({'pointer-events':'none'})
	jQuery('.wcfa-disable-during-transition').css({'cursor':'wait'});
}
function wcfa_ui_end_loading(id)
{
	jQuery("#wcfa-single-attachment-container-"+id).animate({opacity: 1}, 300);
	jQuery("#wcfa-single-attachment-container-"+id).css({'cursor':'default'});
	jQuery('.wcfa-disable-during-transition').css({'pointer-events':'auto'})
	jQuery('.wcfa-disable-during-transition').prop("disabled", false);
	jQuery('.wcfa-disable-during-transition').css({'cursor':'default'});
}
function wcfa_ui_popup_alert(text)
{
	jQuery('#wcfa-alert-popup').css({'display':'block'});
	jQuery('#wcfa-alert-popup-content').html(text);
	jQuery('#wcfa-show-popup-button').trigger('click');
}
function wcfa_ui_close_popup(event)
{
	event.preventDefault(); 
	event.stopImmediatePropagation(); 
	jQuery.magnificPopup.close(); 
	
	return false
}