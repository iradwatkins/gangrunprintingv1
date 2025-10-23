function WCFAMultipleFileUploader (params) 
{
	var myself = this;
	
    //this.form_data = params.form_data;
	this.current_uploaded_file_index = 0;
	this.number_of_files_to_upload = params.files.length;
	this.files = params.files;
	this.file = params.file;
	this.file_name = params.file_name;
	this.upload_input_field = params.upload_input_field;
	this.xhr = new XMLHttpRequest(); //params.xhr;
	this.sum_all_file_sizes = 0;
	this.already_loaded_globally_bytes = 0;
	this.bytes_loaded_until_latest_chunk_upload = 0;
	this.field_id = params.field_id;
	this.isUploadingFileChunk = false;
	this.uploadcounter=0;
	this.uploadfilearray = [];		
	this.current_file;
	this.current_file_name;
	this.current_upload_session_id = params.current_upload_session_id;
	this.formData;
	this.BYTES_PER_CHUNK = 10485760; //1MB
	this.ajaxurl = params.ajaxurl;
	this.upload_ended = true;
	
	for(var i = 0; i < this.files.length; i++)
		this.sum_all_file_sizes += this.files[i].size;
	
	
	//this.xhr.upload.addEventListener("progress", function(event){myself.onSingleFileUploadProgress(myself,event)}, false);
	this.xhr.onreadystatechange = function(e) 
	{
		if (myself.xhr.readyState == 4) 
		{
			//1.
			if(myself.xhr.responseText === '0' || myself.xhr.responseText === '1')
			{
				//jQuery('#wcfa_status_'+id).html(wcfa_file_sizes_error);
			}
			else if(myself.xhr.status == 200)
			{
				//3
				myself.continueUploading();
			}
		}
	}
}
 
WCFAMultipleFileUploader.prototype.continueUploading = function() 
{
	//Used to display progress bar
	/*if(this.current_uploaded_file_index != 0)
		this.already_loaded_globally_bytes += this.files[this.current_uploaded_file_index - 1].size;*/
	
	if(this.current_uploaded_file_index == this.number_of_files_to_upload)
	{
		if(!this.upload_ended)
		{
			var event = new Event('onWCFAMultipleFileUploaderComplete');
			event.field_id = this.field_id;
			event.file_name = this.file_name;
			event.upload_input_field = this.upload_input_field;
			event.current_upload_session_id = this.current_upload_session_id;
			document.dispatchEvent(event);
		}
		this.upload_ended = true;
		return false;
	}
	var i = this.current_uploaded_file_index; 
	this.current_file = this.number_of_files_to_upload == 1 ? this.file : this.files[i] ;
	this.current_file_name  = wcfa_replace_bad_char(this.current_file.name);
	var quantity = typeof this.files[i].quantity !== 'undefined' ? this.current_file.quantity : 1;
	
	this.current_uploaded_file_index++;
	this.startUploadingFileChunk();
	return true;
};

WCFAMultipleFileUploader.prototype.startUploadingFileChunk = function()
{
	var blob = this.current_file;
	var SIZE = blob.size;
	var start = 0;
	var end = this.BYTES_PER_CHUNK;
	this.uploadcounter=0;
	this.uploadfilearray = [];
	this.upload_ended = false;
	
	while( start < SIZE ) 
	{

		var chunk = blob.slice(start, end);  //blob.webkitSlice(start, end); 
		this.uploadfilearray[this.uploadcounter] = chunk;
		this.uploadcounter = this.uploadcounter+1;
		start = end;
		end = start + this.BYTES_PER_CHUNK;
	}
	this.uploadcounter = 0;
	this.continueUploadingFileChunk(this.uploadfilearray[this.uploadcounter]);
}

WCFAMultipleFileUploader.prototype.continueUploadingFileChunk = function(blobFile) 
{
	var chunkFormData = new FormData();
	var chunk_xhr = new XMLHttpRequest();
	var myself = this;
	this.bytes_loaded_until_latest_chunk_upload = 0;
	
	chunkFormData.append("action", "wcfa_file_chunk_upload");
	chunkFormData.append("wcfa_file_chunk", blobFile);
	chunkFormData.append("wcfa_file_name", this.current_file_name);
	chunkFormData.append("wcfa_upload_field_name",  this.file_name);
	chunkFormData.append("wcfa_current_chunk_num",  this.uploadcounter);
	chunkFormData.append("wcfa_current_upload_session_id",  this.current_upload_session_id);
	chunkFormData.append("wcfa_is_last_chunk",  this.uploadfilearray.length - 1 == this.uploadcounter ? "true" : "false");
	
	chunk_xhr.open("POST", this.ajaxurl);
	chunk_xhr.upload.addEventListener("progress",  function(event){myself.onSingleFileUploadProgress(myself,event)}, false);
	//chunk_xhr.upload.addEventListener("load",  function(event){myself.onSingleFileUploadLoaded(myself,event, chunk_xhr)}, false);
	//chunk_xhr.upload.addEventListener("error", function(event){myself.onSingleFileUploadError(myself,event)}, false);
	chunk_xhr.onreadystatechange = function(e) 
	{
		if (chunk_xhr.readyState == XMLHttpRequest.DONE && chunk_xhr.responseText == '0') 
		{
			//console.log("error, old chunk size: "+myself.BYTES_PER_CHUNK);
			myself.onSingleFileUploadError(myself, e);
			//console.log("error, new chunk size: "+myself.BYTES_PER_CHUNK);
			
			return;
		}			
		
		if (chunk_xhr.readyState == 4 && chunk_xhr.status == 200) 
		{
			myself.uploadcounter++;
			if (myself.uploadfilearray.length > myself.uploadcounter )
			{
				myself.continueUploadingFileChunk(myself.uploadfilearray[myself.uploadcounter]); 			                             
			}
			else
			{
				myself.continueUploading();
			}
		}
	};
	myself.resetFileUploadProgressBar(myself);
	chunk_xhr.send(chunkFormData);

}

WCFAMultipleFileUploader.prototype.onSingleFileUploadLoaded = function(myself, event, chunk_xhr) 
{
	console.log(this.responseJSON());	
}
WCFAMultipleFileUploader.prototype.onSingleFileUploadError = function(myself, event) 
{
	myself.already_loaded_globally_bytes -= myself.BYTES_PER_CHUNK;
	
	myself.BYTES_PER_CHUNK = myself.BYTES_PER_CHUNK/2;
	if(myself.BYTES_PER_CHUNK <= 0)
		myself.BYTES_PER_CHUNK = 1048576;
	
	myself.startUploadingFileChunk(myself.uploadfilearray[myself.uploadcounter]); 	
}

WCFAMultipleFileUploader.prototype.getCurrentUploadedFileIndex = function() 
{
     return this.current_uploaded_file_index;
};
WCFAMultipleFileUploader.prototype.setGloballyLoadedBytes = function(already_loaded, myself) 
{
	myself.already_loaded_globally_bytes += already_loaded - myself.bytes_loaded_until_latest_chunk_upload;
	myself.bytes_loaded_until_latest_chunk_upload = already_loaded; 
}; 

WCFAMultipleFileUploader.prototype.getNumberOfFilesToUpload = function() 
{
     return this.number_of_files_to_upload;
};
/*WCFAMultipleFileUploader.prototype.getProgress = function(currently_loaded, myself)
{
	var result = parseInt(((this.already_loaded_globally_bytes + currently_loaded) / this.sum_all_file_sizes) * 100);
	return result > 100 ? 100 : result;
	
}*/
WCFAMultipleFileUploader.prototype.onSingleFileUploadProgress = function(myself, event)
{
	myself.setGloballyLoadedBytes(event.loaded, myself);
	
	var pc = parseInt((myself.already_loaded_globally_bytes / myself.sum_all_file_sizes * 100));
	pc = pc > 100 ? 100 : pc;
	jQuery('#wcfa_upload_progressbar_'+myself.field_id).css('width', pc+"%");
	jQuery('#wcfa_upload_progressbar_percent_'+myself.field_id).html(pc + "%");

}
WCFAMultipleFileUploader.prototype.resetFileUploadProgressBar = function(myself)
{
	jQuery('#wcfa_upload_progressbar_'+myself.field_id).css('width', "0%");
	jQuery('#wcfa_upload_progressbar_percent_'+myself.field_id).html("0%");
}
WCFAMultipleFileUploader.prototype.cloneObject = function( original )  
{
    var clone = Object.create( Object.getPrototypeOf( original ) ) ;
    var i , keys = Object.getOwnPropertyNames( original ) ;

    for ( i = 0 ; i < keys.length ; i ++ )
    {
        Object.defineProperty( clone , keys[ i ] ,
            Object.getOwnPropertyDescriptor( original , keys[ i ] )
        ) ;
    }

    return clone;
}