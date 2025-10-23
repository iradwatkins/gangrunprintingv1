<?php
/*
Plugin Name: WooCommerce File Approval
Description: File approval system.
Author: Lagudi Domenico
Text Domain: woocommerce-file-approval
Domain Path: /languages/
Version: 10.7
*/

add_action( 'before_woocommerce_init', function() {
	if ( class_exists( \Automattic\WooCommerce\Utilities\FeaturesUtil::class ) ) {
		\Automattic\WooCommerce\Utilities\FeaturesUtil::declare_compatibility( 'custom_order_tables', __FILE__, true );
	}
} );

define('WCFA_PLUGIN_PATH', rtrim(plugin_dir_url(__FILE__), "/") ) ;
define('WCFA_PLUGIN_LANG_PATH', basename( dirname( __FILE__ ) ) . '/languages' ) ;
define('WCFA_PLUGIN_ABS_PATH', dirname( __FILE__ ) );


if ( !defined('WP_CLI') && ( in_array( 'woocommerce/woocommerce.php', apply_filters( 'active_plugins', get_option( 'active_plugins' ) ) ) ||
					   (is_multisite() && array_key_exists( 'woocommerce/woocommerce.php', get_site_option('active_sitewide_plugins') ))
					 )	
	)
{
	$wcfa_id = "26507418";
	$wcfa_name = "WooCommerce File Approval";
	$wcfa_activator_slug = "wcfa-activator";
	
	include 'classes/com/Globals.php';
	require_once('classes/vendor/vanquish/admin/ActivationPage.php');
	
	add_action('init', 'wcfa_init');
	add_action('admin_menu', 'wcfa_init_act');
	if(defined('DOING_AJAX') && DOING_AJAX)
			wcfa_init_act();
	add_action('admin_notices', 'wcfa_admin_notices' );
}
function wcfa_admin_notices()
{
	global $lcfa, $wcfa_name, $wcfa_activator_slug;
	if($lcfa && (!isset($_GET['page']) || $_GET['page'] != $wcfa_activator_slug))
	{
		 ?>
		<div class="notice notice-success">
			<p><?php wcfa_html_escape_allowing_special_tags( sprintf(__( 'To complete the <span style="color:#96588a; font-weight:bold;">%s</span> plugin activation, you must verify your purchase license. Click <a href="%s">here</a> to verify it.', 'woocommerce-file-approval' ), $wcfa_name, get_admin_url()."admin.php?page=".$wcfa_activator_slug)); ?></p>
		</div>
		<?php
	}
}
function wcfa_init_act()
{
	global $wcfa_activator_slug, $wcfa_name, $wcfa_id;
	new WCFA\vendor\vanquish\admin\ActivationPage($wcfa_activator_slug, $wcfa_name, 'woocommerce-file-approval', $wcfa_id, WCFA_PLUGIN_PATH);
}

function wcfa_init()
{
	load_plugin_textdomain('woocommerce-file-approval', false, basename( dirname( __FILE__ ) ) . '/languages' );
}
function wcfa_eu()
{
	global $wcfa_media_model, $wcfa_html_model, $wcfa_user_model, $wcfa_order_model, $wcfa_message_model, $wcfa_attachment_model,
	$wcfa_option_model, $wcfa_wpml_model, $wcfa_email_model, $wcfa_shortcode_model, $wcfa_cron_model, $wcfa_upload_model;
	
	//com
	require_once('classes/vendor/vanquish/com/Updater.php'); 
	new WCFA\vendor\vanquish\com\Updater(); 
	if(!class_exists('WCFA\classes\com\Media'))
	{
		require_once('classes/com/Media.php');
		$wcfa_media_model = new WCFA\classes\com\Media();
	}
	if(!class_exists('WCFA\classes\com\Html'))
	{
		require_once('classes/com/Html.php');
		$wcfa_html_model = new WCFA\classes\com\Html();
	}
	if(!class_exists('WCFA\classes\com\User'))
	{
		require_once('classes/com/User.php');
		$wcfa_user_model = new WCFA\classes\com\User();
	}
	if(!class_exists('WCFA\classes\com\Order'))
	{
		require_once('classes/com/Order.php');
		$wcfa_order_model = new WCFA\classes\com\Order();
	}
	if(!class_exists('WCFA\classes\com\Message'))
	{
		require_once('classes/com/Message.php');
		$wcfa_message_model = new WCFA\classes\com\Message();
	}
	if(!class_exists('WCFA\classes\com\Attachment'))
	{
		require_once('classes/com/Attachment.php');
		$wcfa_attachment_model = new WCFA\classes\com\Attachment();
	}
	if(!class_exists('WCFA\classes\com\Option'))
	{
		require_once('classes/com/Option.php');
		$wcfa_option_model = new WCFA\classes\com\Option();
	}
	if(!class_exists('WCFA\classes\com\Wpml'))
	{
		require_once('classes/com/Wpml.php');
		$wcfa_wpml_model = new WCFA\classes\com\Wpml();
	}
	if(!class_exists('WCFA\classes\com\Email'))
	{
		require_once('classes/com/Email.php');
		$wcfa_email_model = new WCFA\classes\com\Email();
	}
	if(!class_exists('WCFA\classes\com\Shortcode'))
	{
		require_once('classes/com/Shortcode.php');
		$wcfa_shortcode_model = new WCFA\classes\com\Shortcode();
	}
	if(!class_exists('WCFA\classes\com\Cron'))
	{
		require_once('classes/com/Cron.php');
		$wcfa_cron_model = new WCFA\classes\com\Cron();
	}
	if(!class_exists('WCFA\classes\com\Upload'))
	{
		require_once('classes/com/Upload.php');
		$wcfa_upload_model = new WCFA\classes\com\Upload();
	}
		
	//admin 
	if(!class_exists('WCFA\classes\admin\OrderPage'))
	{
		require_once('classes/admin/OrderPage.php');
		new WCFA\classes\admin\OrderPage();
	}
	if(!class_exists('WCFA\classes\admin\SettingsPage'))
	{
		require_once('classes/admin/SettingsPage.php');
	}
	if(!class_exists('WCFA\classes\admin\EmailTextsPage'))
	{
		require_once('classes/admin/EmailTextsPage.php');
	}
	if(!class_exists('WCFA\classes\admin\GeneralTextsPage'))
	{
		require_once('classes/admin/GeneralTextsPage.php');
	}
	if(!class_exists('WCFA\classes\admin\PresetAnswersPage'))
	{
		require_once('classes/admin/PresetAnswersPage.php');
	}
	if(!class_exists('WCFA\classes\admin\OrdersListPage'))
	{
		require_once('classes/admin/OrdersListPage.php');
		new WCFA\classes\admin\OrdersListPage();
	}
	if(!class_exists('WCFA\classes\admin\CleanerPage'))
	{
		require_once('classes/admin/CleanerPage.php');
		new WCFA\classes\admin\CleanerPage();
	}
	
	//frontend 
	if(!class_exists('WCFA\classes\frontend\OrderPage'))
	{
		require_once('classes/frontend/OrderPage.php');
		new WCFA\classes\frontend\OrderPage();
	}
	
	add_action('admin_menu', 'wcfa_init_admin_panel');
}
function wcfa_init_admin_panel()
{
	if(!current_user_can('manage_woocommerce'))
		return;
	
	$place = wcfa_get_free_menu_position(59 , .1);
	$cap = 'manage_woocommerce';
	
	add_menu_page( 'WooCommerce File Approval', esc_html__('WooCommerce File Approval', 'woocommerce-file-approval'), $cap, 'wcfa-woocommerce-file-approval', null,  "dashicons-yes" , (string)$place);
	add_submenu_page( 'wcfa-woocommerce-file-approval', esc_html__('WooCommerce File Approval - Settings', 'woocommerce-file-approval'),  esc_html__('Settings', 'woocommerce-file-approval'), $cap, 'woocommerce-file-approval-settings-page', 'wcfa_render_admin_page' );
	add_submenu_page( 'wcfa-woocommerce-file-approval', esc_html__('WooCommerce File Approval - General text settings', 'woocommerce-file-approval'),  esc_html__('Texts: General', 'woocommerce-file-approval'), $cap, 'woocommerce-file-approval-general-texts-page', 'wcfa_render_admin_page' );
	add_submenu_page( 'wcfa-woocommerce-file-approval', esc_html__('WooCommerce File Approval - Email text settings', 'woocommerce-file-approval'),  esc_html__('Texts: Email', 'woocommerce-file-approval'), $cap, 'woocommerce-file-approval-email-texts-page', 'wcfa_render_admin_page' );
	add_submenu_page( 'wcfa-woocommerce-file-approval', esc_html__('WooCommerce File Approval - Preset answer settings', 'woocommerce-file-approval'),  esc_html__('Texts: Preset answers', 'woocommerce-file-approval'), $cap, 'woocommerce-file-approval-preset-answers-page', 'wcfa_render_admin_page' );
	add_submenu_page('wcfa-woocommerce-file-approval', esc_html__('WooCommerce File Approval - Cleaner','woocommerce-file-approval'), esc_html__('Cleaner','woocommerce-file-approval'), $cap, 'woocommerce-file-approval-cleaner-page', 'wcfa_render_admin_page');
	remove_submenu_page( 'wcfa-woocommerce-file-approval', 'wcfa-woocommerce-file-approval'); 
}
function wcfa_render_admin_page()
{
	if(!isset($_REQUEST['page']))
		return;
	switch($_REQUEST['page'])
	{
		case 'woocommerce-file-approval-settings-page':
			$settings_page = new WCFA\classes\admin\SettingsPage();
			$settings_page->render_page();
		break;
		case 'woocommerce-file-approval-email-texts-page':
			$settings_page = new WCFA\classes\admin\EmailTextsPage();
			$settings_page->render_page();
		break;
		case 'woocommerce-file-approval-general-texts-page':
			$settings_page = new WCFA\classes\admin\GeneralTextsPage();
			$settings_page->render_page();
		break;
		case 'woocommerce-file-approval-preset-answers-page':
			$settings_page = new WCFA\classes\admin\PresetAnswersPage();
			$settings_page->render_page();
		break;
		case 'woocommerce-file-approval-cleaner-page':
			$settings_page = new WCFA\classes\admin\CleanerPage();
			$settings_page->render_page();
		break;
	}
}
function wcfa_get_free_menu_position($start, $increment = 0.1)
{
	foreach ($GLOBALS['menu'] as $key => $menu) {
		$menus_positions[] = $key;
	}
	
	if (!in_array($start, $menus_positions)) return $start;

	/* the position is already reserved find the closet one */
	while (in_array($start, $menus_positions)) {
		$start += $increment;
	}
	return $start;
}