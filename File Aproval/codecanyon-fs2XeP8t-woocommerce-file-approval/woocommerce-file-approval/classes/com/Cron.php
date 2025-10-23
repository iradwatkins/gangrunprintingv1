<?php 
namespace WCFA\classes\com;

class Cron
{
	var $already_fiered = false;
	public function __construct()
	{
		add_action( 'wp_loaded', array(&$this,'check_schedule') );	//wp: fiered only when accessin frontend
		add_action( 'wcfa_cron_tick', array(&$this, 'on_tick' ));
		add_action( 'wcfa_cron_automatic_approval_tick', array(&$this, 'on_automatic_approval_tick' ));
		add_action( 'cron_schedules', array(&$this, 'cron_schedules' ));
	}
	function cron_schedules($schedules)
	{
		/* no needed:  if(!isset($schedules["wcfa_5_minutes"]))
		{
			$schedules["wcfa_5_minutes"] = array(
			'interval' => 5*60, 
			'display' => __('Once every 5 Minutes'));
		}
		if(!isset($schedules["wcfa_10_minutes"]))
		{
			$schedules["wcfa_10_minutes"] = array(
			'interval' => 10*60, 
			'display' => __('Once every 10 Minutes'));
		}
		if(!isset($schedules["wcfa_15_minutes"]))
		{
			$schedules["wcfa_15_minutes"] = array(
			'interval' => 15*60, //15 minutes
			'display' => __('Once every 15 Minutes'));
		}
		if(!isset($schedules["wcfa_30_minutes"]))
		{
			$schedules["wcfa_30_minutes"] = array(
			'interval' => 30*60, 
			'display' => __('Once every 30 Minutes'));
		} */
		if(!isset($schedules["wcfa_3_days"]))
		{
			$schedules["wcfa_3_days"] = array(
			'interval' => (1440*3)*60, 
			'display' => __('Once 3 Days'));
		}
		/* no needed: if(!isset($schedules["wcfa_1_second"]))
		{
			$schedules["wcfa_1_second"] = array(
			'interval' => 1, 
			'display' => __('[Debug] Once very 1 second'));
		} */
		return $schedules;
	}
	function check_schedule() 
	{
		if($this->already_fiered)
			return;
		
		$this->already_fiered = true;
		global $wcfa_option_model;
		$options = $wcfa_option_model->get_options();
		$update_frequency = wcfa_get_value_if_set($options, array('email','frequency'), "never");
		$automatic_approval_frequency = wcfa_get_value_if_set($options, array('automatic_approval', 'time_span'), "");
		
		//Reminder
		/* Fo testing reason: uncomment the following line to reset the timer
			wp_clear_scheduled_hook( 'wcfa_cron_tick' );
			return; 
		*/
		if($update_frequency != 'never')
		{
			if ( !wp_next_scheduled( 'wcfa_cron_tick' ) ) 
			{
				wp_schedule_event( time(), $update_frequency, 'wcfa_cron_tick' ); //seconds
			}
		}
		else 
			wp_clear_scheduled_hook( 'wcfa_cron_tick' );
			
		//Automatic approval
		if($automatic_approval_frequency != '' && $automatic_approval_frequency > 0)
		{
			if ( !wp_next_scheduled( 'wcfa_cron_automatic_approval_tick' ) ) 
			{
				wp_schedule_event( time(), 'hourly', 'wcfa_cron_automatic_approval_tick' ); //Every hour -> 'hourly'
			}
		}
		else 
			wp_clear_scheduled_hook( 'wcfa_cron_automatic_approval_tick' );
		
	}
	function on_tick()
	{
		global $wcfa_email_model;
		$wcfa_email_model->send_reminder();
	}
	function on_automatic_approval_tick()
	{
		global $wcfa_attachment_model;
		$wcfa_attachment_model->automatic_approve_pending_attachments();
	}
}
?>