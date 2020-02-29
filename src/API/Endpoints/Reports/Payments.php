<?php

/**
 * Recent Donations endpoint
 *
 * @package Give
 */

namespace Give\API\Endpoints\Reports;

class RecentDonations extends Endpoint {

	public function __construct() {
		$this->endpoint = 'payments';
	}

	public function get_report( $request ) {

		// Check if a cached version exists
		$cached_report = $this->get_cached_report( $request );
		if ( $cached_report !== null ) {
			// Bail and return the cached version
			return new \WP_REST_Response(
				[
					'data' => $cached_report,
				]
			);
		}

		$this->payments = $this->get_payments( $start->format( 'Y-m-d' ), $end->format( 'Y-m-d' ) );

		// Populate $list with arrays in correct shape for frontend RESTList component
		$data = [];
		foreach ( $payments as $payment ) {

			// Setup payment status
			$payment_status = null;
			switch ( $payment->status ) {
				case 'publish':
					$meta           = $donation->payment_meta;
					$payment_status = $meta['_give_is_donation_recurring'] ? 'first_renewal' : 'completed';
					break;
				case 'give_subscription':
					$payment_status = 'renewal';
					break;
				default:
					$payment_status = $donation->status;
			}

			// Setup payment url
			$payment_url = admin_url( 'edit.php?post_type=give_forms&page=give-payment-history&view=view-payment-details&id=' . absint( $payment->ID ) );

			// Setup donor image url
			$donor_image = give_validate_gravatar( $payment->email ) ? get_avatar_url( $payment->email, 60 ) : null;

			// Setup donor url
			$donor_url = admin_url( 'edit.php?post_type=give_forms&page=give-donors&view=overview&id=' . absint( $payment->donor_id ) );

			$paymentArr = [
				'id'       => $payment->ID,
				'total'    => $payment->total,
				'date'     => $payment->date,
				'status'   => $payment_status,
				'currency' => $payment->currency,
				'ip'       => $payment->ip,
				'url'      => $payment_url,
				'form'     => [
					'id'    => $payment->form_id,
					'title' => $payment->form_title,
				],
				'donor'    => [
					'first' => $payment->first_name,
					'last'  => $payment->last_name,
					'id'    => $payment->donor_id,
					'email' => $payment->email,
					'image' => $donor_image,
					'url'   => $donor_url,
				],
			];

			$data[] = $paymentArr;
		}

		// Cache the report data
		$result = $this->cache_report( $request, $data );

		// Get Give status
		$status = $this->get_give_status();

		// Return $list of donations for RESTList component
		return new \WP_REST_Response(
			[
				'data'   => $data,
				'status' => $status,
			]
		);
	}
}
