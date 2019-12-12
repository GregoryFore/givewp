<?php
/**
 * Single Page
 *
 * @package Give
 */

namespace Give;

defined( 'ABSPATH' ) || exit;

require_once GIVE_PLUGIN_DIR . 'includes/reports/cards/class-card.php';
require_once GIVE_PLUGIN_DIR . 'includes/reports/pages/class-page.php';

/**
 * Functionality and actions specific to the single page
 */
class Single_Page extends Page {

    public function __construct() {
        $this->title = 'Single';
        $this->show_in_menu = false;
        $this->path = '/single';
        $this->cards = [
            'donations_for_period' => new Card([
                'title' => 'Donations For Period',
                'type' => 'line',
                'width' => 12,
                'props' => [
                    [
                        'label' => 'Total Raised',
                        'data' => ''
                    ],
                    [
                        'label' => 'Total Donors',
                        'data' => ''
                    ],
                    [
                        'label' => 'Average Donation',
                        'data' => ''
                    ],
                    [
                        'label' => 'Total Refunded',
                        'data' => ''
                    ]
                ]
            ]),
            'campaign_performance' => new Card([
                'title' => 'Campaign Performance',
                'type' => 'doughnut',
                'width' => 6,
                'props' => ''
            ]),
            'payment_statuses' => new Card([
                'title' => 'Payment Statuses',
                'type' => 'bar',
                'width' => 6,
                'props' => ''
            ]),
        ];
    }
}