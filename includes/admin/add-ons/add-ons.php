<?php
/**
 * Admin Add-ons
 *
 * @package     Give
 * @subpackage  Admin/Add-ons
 * @copyright   Copyright (c) 2016, GiveWP
 * @license     https://opensource.org/licenses/gpl-license GNU Public License
 * @since       1.0
 */

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}


/**
 * Class Give_Admin
 */
class Give_Addons {
	/**
	 * Instance.
	 *
	 * @since  2.5.0
	 * @access private
	 * @var
	 */
	static private $instance;

	/**
	 * Singleton pattern.
	 *
	 * @since  2.5.0
	 * @access private
	 */
	private function __construct() {
	}


	/**
	 * Get instance.
	 *
	 * @since  2.5.0
	 * @access public
	 * @return Give_Addons
	 */
	public static function get_instance() {
		if ( null === static::$instance ) {
			self::$instance = new static();
			self::$instance->setup();
		}

		return self::$instance;
	}

	/**
	 * Setup Admin
	 *
	 * @sinve  2.5.0
	 * @access private
	 */
	private function setup() {

	}

}

Give_Addons::get_instance();


/**
 * Add-ons Page
 *
 * Renders the add-ons page content.
 *
 * @since 1.0
 * @return void
 */
function give_add_ons_page() {
	?>
	<div class="wrap" id="give-add-ons">
		<h1><?php echo esc_html( get_admin_page_title() ); ?>
			&nbsp;&mdash;&nbsp;<a href="https://givewp.com/addons/" class="button-primary give-view-addons-all"
			                      target="_blank"><?php esc_html_e( 'View All Add-ons', 'give' ); ?>
				<span class="dashicons dashicons-external"></span></a>
		</h1>

		<hr class="wp-header-end">

		<p><?php esc_html_e( 'The following Add-ons extend the functionality of Give.', 'give' ); ?></p>

		<div id="give-addon-uploader-wrap" ondragover="event.preventDefault()">
			<div id="give-addon-uploader-inner">
				<form method="post" enctype="multipart/form-data" class="give-upload-form" action="/">
					<?php wp_nonce_field( 'give-upload-addon', '_give_upload_addon' ); ?>
					<?php _e( '<h1>Drag and Drop file here<br/>Or<br/>Click to select file</h1>', 'give'); ?>
					<input type="file" name="addon" style="display: none">
				</form>
			</div>
		</div>

		<div id="give-license-activator-wrap">
			<div id="give-license-activator-inner">
				<div class="give-errors"></div>
				<form method="post">
					<?php wp_nonce_field( 'license_activator-nonce', 'license_activator-nonce' ); ?>
					<label for="give-license-activator"><?php _e( 'Activate License', 'give' ); ?></label>
					<input id="give-license-activator" type="text" name="give_license_key" placeholder="<?php _e( 'Enter a valid license key', 'give' ) ?>">
					<input value="<?php _e( 'Activate License', 'give' ); ?>" type="submit" class="button">
				</form>
			</div>

			<p class="give-field-description"><?php _e( 'Enter a license key above to unlock your GiveWP add-ons. You can access your licenses anytime from the My Account section on the GiveWP website.' ); ?></p>
		</div>

		<?php //give_add_ons_feed(); ?>
	</div>
	<?php

}

/**
 * Add-ons Render Feed
 *
 * Renders the add-ons page feed.
 *
 * @since 1.0
 * @return void
 */
function give_add_ons_feed() {

	$addons_debug = false; // set to true to debug
	$cache        = Give_Cache::get( 'give_add_ons_feed', true );

	if ( false === $cache || ( true === $addons_debug && true === WP_DEBUG ) ) {
		if ( function_exists( 'vip_safe_wp_remote_get' ) ) {
			$feed = vip_safe_wp_remote_get( 'https://givewp.com/downloads/feed/', false, 3, 1, 20, array( 'sslverify' => false ) );
		} else {
			$feed = wp_remote_get( 'https://givewp.com/downloads/feed/', array( 'sslverify' => false ) );
		}

		if ( ! is_wp_error( $feed ) && ! empty( $feed ) ) {
			if ( isset( $feed['body'] ) && strlen( $feed['body'] ) > 0 ) {
				$cache = wp_remote_retrieve_body( $feed );
				Give_Cache::set( 'give_add_ons_feed', $cache, HOUR_IN_SECONDS, true );
			}
		} else {
			$cache = sprintf(
				'<div class="error"><p>%s</p></div>',
				esc_html__( 'There was an error retrieving the Give Add-ons list from the server. Please try again later.', 'give' )
			);
		}
	}

	echo wp_kses_post( $cache );
}
