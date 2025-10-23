"use strict";
const wcfa_chunk_size = 20;
var wcfa_total_orders = 0;
var wcfa_next_order_index_to_process = 0;
var wcfa_iteration_num = 1;

jQuery(document).ready(function()
{
	wcfa_init_date_selector();
	jQuery(document).on('click', '#wcfa_start_process',wcfa_start_cleaning_process)
	jQuery(document).on('click', '#wcfa_reload_process',wcfa_reload_page)
});
function wcfa_reload_page(event)
{
	location.reload();
}
function wcfa_init_date_selector()
{
	var today = new Date();
	var dd = String(today.getDate()).padStart(2, '0');
	var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
	var yyyy = today.getFullYear();

jQuery("#wcfa_start_date").pickadate(
		{ 
			format: 'yyyy-mm-dd',
			formatSubmit: 'yyyy-mm-dd',
			selectYears: 10,
			max: new Date(yyyy,mm,dd),
			selectYears: true,
			selectMonths: true
		});
}
function wcfa_start_cleaning_process(event)
{
	
	let order_stauses = new Array();
	jQuery('.wcfa_order_status').each(function(index, elem)
	{
		if(elem.checked)
			order_stauses.push(elem.value);
	});
	
	if(order_stauses.length == 0)
	{
		alert(wcfa.order_statuses_error);
		return;
	}
	else if(jQuery('#wcfa_start_date').val() == "")
	{
		alert(wcfa.date_error);
		return;
	}
	
	//UI
	jQuery('#wcfa_settings').fadeOut(500);
	jQuery('#wcfa_start_process').fadeOut(500);
	jQuery('#wcfa_progess_display').delay(600).fadeIn();
	
	wcfa_get_order_ids(order_stauses, jQuery('#wcfa_start_date').val())
	
}

function wcfa_get_order_ids(order_stauses, date)
{
	wcfa_total_orders = wcfa_next_order_index_to_process = 0;
	wcfa_iteration_num = 1;
	var formData = new FormData();
	formData.append('action', 'wcfa_get_order_ids_by_date');	
	formData.append('order_statuses', order_stauses); 			
	formData.append('start_date', date); 			
	jQuery.ajax({
			url: ajaxurl,
			type: 'POST',
			data: formData,
			dataType : "html",
			contentType: "application/json; charset=utf-8",
			async: true,
			success: function (data) 
			{
				const result = JSON.parse(data);
				//UI 
				wcfa_update_progress_bar(0);	
				wcfa_process_orders(result);
			},
			error: function (data) 
			{
				
			},
			cache: false,
			contentType: false,
			processData: false
		}); 
}
function wcfa_process_orders(order_ids)
{
	wcfa_total_orders = order_ids.length;
	const end = wcfa_chunk_size*wcfa_iteration_num;
	const current_chunk = order_ids.slice(wcfa_next_order_index_to_process, end);
	
	wcfa_next_order_index_to_process += wcfa_chunk_size;
	wcfa_iteration_num++;
	
	//UI 
	jQuery('#notice-box').html(wcfa.order_detected_msg+order_ids.length);
	
	var formData = new FormData();
	formData.append('action', 'wcfa_delete_order_attachments');	
	formData.append('order_ids', current_chunk); 			
				
	jQuery.ajax({
			url: ajaxurl,
			type: 'POST',
			data: formData,
			async: true,
			success: function (data) 
			{
				//UI
				if(end < order_ids.length)
				{
					const current_perc = (wcfa_next_order_index_to_process/order_ids.length)*100;
					wcfa_update_progress_bar(current_perc);
					wcfa_process_orders(order_ids);
				}
				else
				{
					wcfa_update_progress_bar(100);
					//UI 
					jQuery('#wcfa_reload_process').fadeIn();
					jQuery('#notice-box').html(wcfa.done_msg);
				}
			},
			error: function (data) 
			{
				
			},
			cache: false,
			contentType: false,
			processData: false
		}); 
}
function wcfa_update_progress_bar(perc)
{
	const perc_text = Math.round(perc);
	jQuery('#progress-bar').animate({width: perc+"%"});
	jQuery('#percentage-text').html(perc_text+"%");
}