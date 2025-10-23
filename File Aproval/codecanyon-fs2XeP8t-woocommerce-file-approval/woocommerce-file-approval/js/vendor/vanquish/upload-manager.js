var wcfa_num_uploads = 0;
jQuery(document).ready(function()
{
	//jQuery('.wcfa_delete_file_button').on("click",wcfa_delete_file);
	jQuery(document).on('click', '.wcfa_view_download_file_button', wcfa_view_download_file);
	jQuery(document).on('click','.wcfa_file_upload_button', wcfa_upload_file);
	jQuery(document).on('click','.wcfa_file_tmp_delete_button', wcfa_delete_tmp_file);
	document.addEventListener('onWCFAMultipleFileUploaderComplete', wcfa_upload_ended);
	if (window.File && window.FileReader && window.FileList && window.Blob) 
	{
		jQuery(document).on('change' ,'.wcfa_attachment_input', wcfa_on_file_selection);
	} 
	else {
		
	}
	
	//UI
	wcfa_hide_unnecessary_file_input('.wcfa_attachment_input');
});

function wcfa_hide_unnecessary_file_input(selector)
{
	jQuery(selector).each(function(index, obj)
	{
		if(jQuery(this).data('hide-index') != 0)
			jQuery(this).parent().fadeOut(0);
	});
}
function wcfa_show_next_file_input($current_element)
{
	var hide_index = $current_element.data('hide-index');
	//var main_container = $current_element.data('main-container');
	var elements = $current_element.parent().parent().find(".wcfa_attachment_input");
	
	//jQuery(main_container+" .wcfa_attachment_input").each(function(index, obj)
	jQuery(elements).each(function(index, obj)
	{
		//console.log(jQuery(this).data('hide-index'));
		if(jQuery(this).data('hide-index') == hide_index+1)
			jQuery(this).parent().fadeIn();
	});
}
function wcfa_view_download_file(evt)
{
	evt.stopPropagation();
	evt.preventDefault();
	var href =  jQuery(evt.currentTarget).data('href');
	var win = window.open(href, '_blank');
	return false;
}
//Not used
/* function wcfa_delete_file(evt)
{
	evt.stopPropagation();
	evt.preventDefault(); 
	var id =  jQuery(evt.currentTarget).data('id');
	if(confirm(delete_popup_warning_message))
	{
		jQuery('#wcfa-file-box-'+id).html(wcfa.delete_message);
		jQuery('#wcfa-file-box-'+id).append('<input type="hidden" name="wcfa_options[files_to_delete]['+id+']" value="'+id+'" id="wcfa-encoded-file_'+id+'" />');
	}
	return false;
} */
function wcfa_check_file_size_and_ext(files, max_size, extension, extension_accepted)
{
	if(max_size == "")
		return true;
	
	//size
	if (window.File && window.FileReader && window.FileList && window.Blob)
	{
		if(files != undefined)
		{
			var fsize =files[0].size/1024; //files[0].size is expressed in byte. max_size in kbyte
			var ftype = files[0].type;
			var fname = files[0].name;
			
			if(max_size != 0 && fsize > max_size)
			{
				var size = fsize/1048576; // 1MB in bytes
				size = size.toFixed(2);
				var max_size_text = (max_size/1024) < 1 ? Math.floor(max_size)+"kb" : Math.floor(max_size/1024)+"Mb";
				alert(wcfa.file_size_error+max_size_text);
				return false;
			}
		}
	}
	else{
		alert(wcfa.browser_compliant_error);
		return false;
	}
	
	//extension
	if(extension_accepted != undefined && extension_accepted.indexOf(extension) == -1)
	{
		alert(wcfa.extension_error);
		return false;
	}
	return true;
}
function wcfa_on_file_selection(evt) 
{
    var files = evt.target.files;
    var file = files[0];
	var id =  jQuery(evt.currentTarget).data('id');
	var max_size =  jQuery(evt.currentTarget).data('max-size');
	var upload_input_field = jQuery(evt.currentTarget);
	var upload_button = jQuery(evt.currentTarget).data('upload-button-id');
	var delete_button = jQuery(evt.currentTarget).data('delete-button-id');
	var extension =  jQuery(evt.currentTarget).val().replace(/^.*\./, '');
	var extension_accepted = jQuery(evt.currentTarget).attr('accept');
	
	wcfa_reset_upload_field_metadata(id);
	if(wcfa_check_file_size_and_ext(files, max_size, extension, extension_accepted))
	{	
		
		jQuery('#wcfa_file_upload_button_'+id).show();
		
		if (files && file) 
		{
			
		   //new
		  wcfa_show_next_file_input(jQuery(evt.currentTarget));
		  jQuery(upload_button).trigger('click');
		}
		//ToDo: Show error message?
	}
	else 
		jQuery(evt.currentTarget).val("");
};
function wcfa_reset_upload_field_metadata(id)
{
	jQuery('#wcfa_file_tmp_delete_button_'+id).hide();
	jQuery('#wcfa_file_tmp_delete_button_'+id).data('file-to-delete', "");
	jQuery('#wcfa-filename-'+id).val("");
	jQuery('#wcfa-complete-name-'+id).val("");
    jQuery('#wcfa-filenameprefix-'+id).val("");
}
function wcfa_upload_file(evt)
{
	evt.preventDefault();
	evt.stopPropagation();
	
	var id =  jQuery(evt.currentTarget).data('id');
	var upload_input_field = jQuery(evt.currentTarget).data('upload-field-id');
	var files = jQuery(upload_input_field).prop('files');
	var max_size = jQuery(upload_input_field).data('max-size');
    var file = files[0];
	
	wcfa_num_uploads++;
	
   //UI
   jQuery(evt.currentTarget).hide();
   jQuery(upload_input_field).hide();
   jQuery('#wcfa_upload_progress_status_container_'+id).fadeIn();
   jQuery('#wcfa_file_tmp_delete_button_'+id).hide();
   jQuery('#wcfa_file_upload_button_'+id).hide();
   
   var current_upload_session_id = Math.floor((Math.random() * 10000000) + 1);
   var tempfile_name  = wcfa_replace_bad_char(file.name);
 
   var multiple_file_uploader = new WCFAMultipleFileUploader({ field_id:id, 
																ajaxurl: wcfa.ajaxurl, 
																files: files, 
																file: file, 
																file_name:tempfile_name,
																upload_input_field:upload_input_field,
																current_upload_session_id: current_upload_session_id});
   
	multiple_file_uploader.continueUploading();						
	return false;
			
}
function wcfa_upload_ended(event)
{
	//UI
	wcfa_num_uploads--;
	var id = event.field_id;
	
	jQuery('#wcfa_upload_progress_status_container_'+id).fadeOut();
	jQuery('#wcfa_file_tmp_delete_button_'+id).fadeIn();
	jQuery('#wcfa-filename-display-'+id).html(event.file_name);
		
	jQuery('#wcfa-filename-'+id).val(event.file_name);
	jQuery('#wcfa-filenameprefix-'+id).val(event.current_upload_session_id);
	jQuery('#wcfa-complete-name-'+id).val(event.current_upload_session_id+"_"+event.file_name);
	jQuery('#wcfa_file_tmp_delete_button_'+id).data('file-to-delete', event.current_upload_session_id+"_"+event.file_name);
}
function wcfa_delete_tmp_file(event)
{
	event.preventDefault();
	event.stopPropagation();

	var file_to_delete =  jQuery(event.currentTarget).data('file-to-delete');
	var id =  jQuery(event.currentTarget).data('id');
	
	jQuery(event.currentTarget).fadeOut();
	if(file_to_delete == "")
		return false;
	
	//UI
	jQuery("#wcfa_input_file_"+id).fadeIn();
	jQuery("#wcfa_input_file_"+id).val("");
	jQuery("#wcfa-filename-"+id).val("");
	jQuery("#wcfa-filenameprefix-"+id).val("");
	jQuery("#wcfa-complete-name-"+id).val("");
	jQuery("#wcfa_input_file_-"+id).val("");
	
	var formData = new FormData();
	formData.append('action', 'wcfa_delete_tmp_uploaded_file');
	formData.append('file_to_delete', file_to_delete);
	
	jQuery.ajax({
		url: wcfa.ajaxurl,
		type: 'POST',
		data: formData,
		async: true,
		success: function (data) 
		{
			
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
function wcfa_replace_bad_char(text)
{
	text = text.replace(/'/g,"");
	text = text.replace(/"/g,"");
	text = text.replace(/ /g,"_");
	
	var remove_special_chars = true;
	var translate_re = /[öäüÖÄÜ]/g;
	var translate = {
		"ä": "a", "ö": "o", "ü": "u",
		"Ä": "A", "Ö": "O", "Ü": "U",
		"ß": "ss" // probably more to come
	  };
	text = text.replace(translate_re, function(match) { 
      return translate[match]; 
    });
	
	if(remove_special_chars)
	{
		text = text.replace(/[^0-9a-zA-Z_.]/g, '');
	}
	
	text = text == "" ? 'file' : text;
	return text;
}