<?php 
namespace WCFA\classes\com;

class User
{
	public function __construct()
	{
		
	}
	public function get_user_name($user_id)
	{
		if(!isset($user_id))
			return "";
		
		$data = get_userdata($user_id);
		return !$data ? "" : $data->display_name;
	}
}
?>