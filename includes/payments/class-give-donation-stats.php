<?php
/**
 * Earnings / Sales Stats
 *
 * @package     Give
 * @subpackage  Classes/Stats
 * @copyright   Copyright (c) 2018, GiveWP
 * @license     https://opensource.org/licenses/gpl-license GNU Public License
 * @since       2.4.1
 */

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Give_Donation_Stats Class
 *
 * This class is for retrieving stats for earnings and sales.
 *
 * Stats can be retrieved for date ranges and pre-defined periods.
 *
 * @since 2.4.1
 */
class Give_Donation_Stats extends Give_Stats {
	/**
	 * Give_Donation_Stats constructor.
	 *
	 * @param array $query
	 */
	public function __construct( array $query = array() ) {
		// Add additional default query params
		$this->query_var_defaults = array_merge( array(
			'status'     => array( 'publish' ),
			'give_forms' => array(),
			'gateways'   => array(),
			'donor_id'   => 0,
		), $this->query_var_defaults );

		parent::__construct( $query );
	}

	/**
	 * Retrieve sale stats
	 *
	 * @since  2.4.1
	 * @access public
	 *
	 * @param array $query
	 *
	 * @return stdClass
	 */
	public function get_sales( $query = array() ) {
		// Add table and column name to query_vars to assist with date query generation.
		$this->query_vars['table']  = $this->get_db()->posts;
		$this->query_vars['column'] = 'ID';

		// Run pre-query checks and maybe generate SQL.
		$this->pre_query( $query );

		/**
		 * Return custom result
		 *
		 * @since 2.4.1
		 */
		$result = apply_filters( 'give_donation_stats_pre_get_sales', null, $this );
		if ( ! is_null( $result ) ) {
			return $result;
		}

		$allowed_functions = array( 'COUNT', 'AVG' );

		$is_relative = true === $this->query_vars['relative'];

		$function = isset( $this->query_vars['function'] ) && in_array( $this->query_vars['function'], $allowed_functions, true )
			? "{$this->query_vars['function']}({$this->query_vars['table']}.{$this->query_vars['column']})"
			: "COUNT({$this->query_vars['table']}.{$this->query_vars['column']})";

		if ( $is_relative ) {
			$sql = "SELECT IFNULL(COUNT({$this->query_vars['table']}.{$this->query_vars['column']}), 0) AS sales, IFNULL(relative, 0) AS relative
					FROM {$this->query_vars['table']}
					CROSS JOIN (
						SELECT IFNULL(COUNT({$this->query_vars['table']}.{$this->query_vars['column']}), 0) AS relative
						FROM {$this->query_vars['table']}
						{$this->query_vars['inner_join_sql']}
						WHERE 1=1
						{$this->query_vars['where_sql']}
						{$this->query_vars['relative_date_sql']}
					) o
					WHERE 1=1
					{$this->query_vars['where_sql']}
					{$this->query_vars['date_sql']}
					";
		} else {
			$sql = "SELECT IFNULL({$function}, 0) AS sales
					FROM {$this->query_vars['table']}
					{$this->query_vars['inner_join_sql']}
					WHERE 1=1
					{$this->query_vars['where_sql']}
					{$this->query_vars['date_sql']}
					";
		}

		$result = $this->get_db()->get_row( $sql );

		if ( is_null( $result ) ) {
			$result        = new stdClass();
			$result->sales = $result->relative = 0;
		}

		if ( $is_relative ) {
			$result->growth = $this->get_growth( $result->sales, $result->relative );
		}

		// Reset query vars.
		$result->sql        = $sql;
		$result->query_vars = $this->query_vars;
		$this->reset_query();

		/**
		 * Filter the result
		 *
		 * @since 2.4.1
		 */
		$result = apply_filters( 'give_donation_stats_get_sales', $result, $this );

		return $result;
	}


	/**
	 * Retrieve earning stats
	 *
	 * @since  2.4.1
	 * @access public
	 *
	 * @param array $query
	 *
	 * @return stdClass
	 */
	public function get_earnings( $query = array() ) {
		// Add table and column name to query_vars to assist with date query generation.
		$this->query_vars['table']  = $this->get_db()->donationmeta;
		$this->query_vars['column'] = 'meta_value';

		// Run pre-query checks and maybe generate SQL.
		$this->pre_query( $query );

		/**
		 * Return custom result
		 *
		 * @since 2.4.1
		 */
		$result = apply_filters( 'give_donation_stats_pre_get_earnings', null, $this );
		if ( ! is_null( $result ) ) {
			return $result;
		}

		$allowed_functions = array( 'SUM', 'AVG' );

		$is_relative = true === $this->query_vars['relative'];

		$function = isset( $this->query_vars['function'] ) && in_array( $this->query_vars['function'], $allowed_functions, true )
			? "{$this->query_vars['function']}({$this->query_vars['table']}.{$this->query_vars['column']})"
			: "SUM({$this->query_vars['table']}.{$this->query_vars['column']})";

		if ( $is_relative ) {
			$sql = "SELECT IFNULL({$function}, 0) AS total, IFNULL(relative, 0) AS relative
					FROM {$this->query_vars['table']}
					CROSS JOIN (
						SELECT IFNULL($function, 0) AS relative
						FROM {$this->query_vars['table']}
						INNER JOIN {$this->get_db()->posts} on {$this->get_db()->posts}.ID = {$this->query_vars['table']}.{$this->query_vars['inner_join_at']}
						{$this->query_vars['inner_join_sql']}
						WHERE 1=1
						{$this->query_vars['where_sql']}
						{$this->query_vars['relative_date_sql']}
						AND {$this->query_vars['table']}.meta_key='_give_payment_total'
					) o
					INNER JOIN {$this->get_db()->posts} on {$this->get_db()->posts}.ID = {$this->query_vars['table']}.{$this->query_vars['inner_join_at']}
					{$this->query_vars['inner_join_sql']}
					WHERE 1=1
					{$this->query_vars['where_sql']}
					{$this->query_vars['date_sql']}
					AND {$this->query_vars['table']}.meta_key='_give_payment_total'
					";
		} else {
			$sql = "SELECT IFNULL({$function}, 0) AS total
					FROM {$this->query_vars['table']}
					INNER JOIN {$this->get_db()->posts} on {$this->get_db()->posts}.ID = {$this->query_vars['table']}.{$this->query_vars['inner_join_at']}
					{$this->query_vars['inner_join_sql']}
					WHERE 1=1
					{$this->query_vars['where_sql']}
					{$this->query_vars['date_sql']}
					AND {$this->query_vars['table']}.meta_key='_give_payment_total'
					";
		}

		$result = $this->get_db()->get_row( $sql );

		if ( is_null( $result ) ) {
			$result        = new stdClass();
			$result->total = $result->relative = $result->growth = 0;
		}

		if ( $is_relative ) {
			$result->growth = $this->get_growth( $result->total, $result->relative );
		}

		// Reset query vars.
		$result->sql        = $sql;
		$result->query_vars = $this->query_vars;
		$this->reset_query();

		/**
		 * Filter the result
		 *
		 * @since 2.4.1
		 */
		$result = apply_filters( 'give_donation_stats_get_earnings', $result, $this );

		return $result;
	}

	/**
	 * Get donation earning and sales information
	 * Note: only for internal purpose.
	 *
	 * @since  2.4.1
	 * @access public
	 *
	 * @param array $query
	 *
	 * @return stdClass
	 */
	public function get_statistics( $query = array() ) {
		$this->query_vars['table']  = $this->get_db()->posts;
		$this->query_vars['column'] = 'post_date';

		$meta_table_count                     = $this->get_counter( $this->get_db()->donationmeta );
		$this->query_vars['inner_join_sql'][] = "INNER JOIN {$this->get_db()->donationmeta} as m{$meta_table_count} on m{$meta_table_count}.donation_id={$this->query_vars['table']}.ID";
		$this->set_counter( $this->get_db()->donationmeta );

		$column = "{$this->query_vars['table']}.{$this->query_vars['column']}";

		$query = wp_parse_args(
			$query,
			array( 'statistic_type' => 'time', )
		);

		// Set query on basis of statistic type
		switch ( $query['statistic_type'] ) {
			case 'time':
				$query = array_merge(
					$query,
					array(
						'select'  => "YEAR({$column}) AS year, MONTH({$column}) AS month, DAY({$column}) AS day",
						'groupby' => "YEAR({$column}), MONTH({$column}), DAY({$column})",
						'orderby' => "YEAR({$column}), MONTH({$column}), DAY({$column})",
					)
				);
				break;

			case 'form':
				$query = array_merge(
					$query,
					array(
						'select'  => "CAST( m1.meta_value as SIGNED ) as form",
						'groupby' => "form",
						'orderby' => "form",
					)
				);

				break;
		}

		$this->pre_query( $query );

		$sql = "SELECT COUNT(ID) AS sales, SUM(m{$meta_table_count}.meta_value) AS earnings, {$this->query_vars['select']}
					FROM {$this->query_vars['table']}
					{$this->query_vars['inner_join_sql']}
					{$this->query_vars['where_sql']}
					AND m{$meta_table_count}.meta_key='_give_payment_total'
					{$this->query_vars['date_sql']}
                    GROUP BY {$this->query_vars['groupby']}
                    ORDER BY {$this->query_vars['orderby']} ASC";

		$results = $this->get_db()->get_results( $sql );

		// Modify result.
		$sales    = array();
		$earnings = array();

		switch ( $this->query_vars['statistic_type'] ) {
			case 'time':
				$this->query_vars['day_by_day'] = true;

				$dates = array(
					'start' => $this->query_vars['start_date'],
					'end'   => $this->query_vars['end_date'],
				);

				$cache_timestamps = array();

				// Initialise all arrays with timestamps and set values to 0.
				while ( strtotime( $dates['start']->copy()->format( 'mysql' ) ) <= strtotime( $dates['end']->copy()->format( 'mysql' ) ) ) {
					$timestamp = Give_Date::create( $dates['start']->year, $dates['start']->month, $dates['start']->day, 0, 0, 0, $this->date->getWpTimezone() )->timestamp;

					$cache_timestamps["{$dates['start']->year}|{$dates['start']->month}|{$dates['start']->day}"] = $timestamp;

					$sales[ $timestamp ]    = 0;
					$earnings[ $timestamp ] = 0.00;

					$dates['start'] = ( true === $this->query_vars['day_by_day'] )
						? $dates['start']->addDays( 1 )
						: $dates['start']->addMonth( 1 );
				}

				foreach ( $results as $result ) {
					$cache_key = "{$result->year}|{$result->month}|{$result->day}";

					$timestamp = ! empty( $cache_timestamps[ $cache_key ] )
						? $cache_timestamps[ $cache_key ]
						: Give_Date::create( $result->year, $result->month, $result->day, 0, 0, 0, $this->date->getWpTimezone() )->timestamp;

					$sales[ $timestamp ]    = (int) $result->sales;
					$earnings[ $timestamp ] = floatval( $result->earnings );
				}

				break;

			case 'form':
				foreach ( $results as $result ) {
					$sales[ $result->form ]    = (int) $result->sales;
					$earnings[ $result->form ] = floatval( $result->earnings );
				}
		}

		$results = new stdClass();

		$results->sales    = $sales;
		$results->earnings = $earnings;

		// Reset query vars.
		$results->sql        = $sql;
		$results->query_vars = $this->query_vars;
		$this->reset_query();

		return $results;
	}

	/**
	 * Get the best selling forms
	 *
	 * @since  2.4.1
	 * @access public
	 *
	 * @param array $query Array of query arguments
	 *
	 * @return stdClass
	 */
	public function get_busiest_day( $query = array() ) {
		// Add table and column name to query_vars to assist with date query generation.
		$this->query_vars['table']  = $this->get_db()->posts;
		$this->query_vars['column'] = 'post_date';

		$this->pre_query( $query );

		/**
		 * Return custom result
		 *
		 * @since 2.4.1
		 */
		$result = apply_filters( 'give_donation_stats_pre_get_busiest_day', null, $this );
		if ( ! is_null( $result ) ) {
			return $result;
		}

		$sql = "SELECT DAYOFWEEK({$this->query_vars['column']}) AS day, COUNT(ID) as total
				FROM {$this->query_vars['table']}
				{$this->query_vars['inner_join_sql']}
				WHERE 1=1
				{$this->query_vars['where_sql'] }
				{$this->query_vars['date_sql'] }
				GROUP BY day
				ORDER BY day DESC
				LIMIT 1";

		$result = $this->get_db()->get_row( $sql );

		$result->day = is_null( $result )
			? ''
			: Give_Date::getDays()[ $result->day - 1 ];

		// Reset query vars.
		$result->sql        = $sql;
		$result->query_vars = $this->query_vars;
		$this->reset_query();

		/**
		 * Filter the result
		 *
		 * @since 2.4.1
		 */
		$result = apply_filters( 'give_donation_stats_get_busiest_day', $result, $this );

		return $result;
	}

	/**
	 * Get the best selling forms
	 * @todo   : make this function dynamic with new api
	 *
	 * @since  2.4.1
	 * @access public
	 * @global wpdb $wpdb
	 *
	 * @param array $query
	 */
	public function get_best_selling( $query = array() ) {
	}

	/**
	 * Get most valuable cause
	 *
	 * @since  2.4.1
	 * @access public
	 *
	 * @param array $query
	 *
	 * @return stdClass
	 */
	public function get_most_valuable_cause( $query = array() ) {
		$donation_col_name = Give()->payment_meta->get_meta_type() . '_id';

		// Add table and column name to query_vars to assist with date query generation.
		$this->query_vars['table']  = $this->get_db()->donationmeta;
		$this->query_vars['column'] = 'meta_value';

		$this->pre_query( $query );

		/**
		 * Return custom result
		 *
		 * @since 2.4.1
		 */
		$result = apply_filters( 'give_donation_stats_pre_get_most_valuable_cause', null, $this );
		if ( ! is_null( $result ) ) {
			return $result;
		}

		$sql = "SELECT {$this->query_vars['table']}.{$this->query_vars['column']} as form, COUNT({$this->query_vars['table']}.{$donation_col_name}) as total_donation
			FROM {$this->query_vars['table']}
			INNER JOIN {$this->get_db()->posts} ON {$this->query_vars['table']}.{$donation_col_name}={$this->get_db()->posts}.ID
			{$this->query_vars['inner_join_sql']}
			WHERE 1=1
			{$this->query_vars['where_sql']}
			{$this->query_vars['date_sql']}
			AND {$this->query_vars['table']}.meta_key='_give_payment_form_id'
			GROUP BY form
			ORDER BY total_donation DESC
			LIMIT 1
			";

		$result = $this->get_db()->get_row( $sql );

		$result->form = is_null( $result ) ? 0 : absint( $result->form );

		// Reset query vars.
		$result->sql        = $sql;
		$result->query_vars = $this->query_vars;
		$this->reset_query();

		/**
		 * Filter the result
		 *
		 * @since 2.4.1
		 */
		$result = apply_filters( 'give_donation_stats_get_most_valuable_sause', $result, $this );

		return $result;
	}

	/**
	 * Calculate number of refunded donations.
	 *
	 * @since 2.4.1
	 * @acess public
	 *
	 * @param array $query
	 *
	 * @return stdClass
	 */
	public function get_refund_count( $query = array() ) {
		$query['status'] = isset( $query['status'] )
			? $query['status']
			: array( 'refunded' );

		$result = $this->get_sales( $query );

		return $result;
	}

	/**
	 * Calculate amount of refunded donations.
	 *
	 * @since 2.4.1
	 * @acess public
	 *
	 * @param array $query
	 *
	 * @return stdClass
	 */
	public function get_refund( $query = array() ) {
		$query['status'] = isset( $query['status'] )
			? $query['status']
			: array( 'refunded' );

		$result = $this->get_earnings( $query );

		return $result;
	}

	/**
	 *  Set meta query
	 *
	 * @since  2.4.1
	 * @access public
	 *
	 * @param string $query_key
	 * @param string $meta_key
	 *
	 */
	private function set_meta_sql( $query_key, $meta_key ) {
		// Bailout.
		if ( empty( $this->query_vars[ $query_key ] ) ) {
			return;
		}

		$donation_col_name              = Give()->payment_meta->get_meta_type() . '_id';
		$this->query_vars[ $query_key ] = (array) $this->query_vars[ $query_key ];

		$alias = "m{$this->get_counter( $this->get_db()->donationmeta )}";
		$data  = implode( '\',\'', $this->query_vars[ $query_key ] );

		$this->query_vars['inner_join_sql'][] = "INNER JOIN {$this->get_db()->donationmeta} as {$alias} on {$alias}.{$donation_col_name}={$this->query_vars['table']}.{$this->query_vars['inner_join_at']}";

		$this->query_vars['where_sql'][] = " AND {$alias}.meta_key='{$meta_key}'";
		$this->query_vars['where_sql'][] = " AND {$alias}.meta_value IN ('{$data}')";


		// Set counter.
		$this->set_counter( $this->get_db()->donationmeta );
	}

	/**
	 * Pre process query
	 *
	 * @since  2.4.1
	 * @access protected
	 *
	 * @param array $query
	 */
	protected function pre_query( $query = array() ) {
		parent::pre_query( $query );

		$this->query_vars['function'] = strtoupper( $this->query_vars['function'] );

		$sql_types = array( 'relative_date_sql', 'date_sql', 'inner_join_sql', 'where_sql' );

		// Set empty sql collection string to array
		foreach ( $sql_types as $sql_type ) {
			$this->query_vars[ $sql_type ] = array_filter( (array) $this->query_vars[ $sql_type ] );
		}

		// Where sql.
		if ( ! empty( $this->query_vars['status'] ) ) {
			if ( 'any' !== $this->query_vars['status'] ) {
				$this->query_vars['status'] = array_map( 'sanitize_text_field', $this->query_vars['status'] );

				$placeholders = implode( ', ', array_fill( 0, count( $this->query_vars['status'] ), '%s' ) );

				$this->query_vars['where_sql'][] = $this->get_db()->prepare( "AND {$this->get_db()->posts}.post_status IN ({$placeholders})", $this->query_vars['status'] );
			}
		}
		$this->query_vars['where_sql'][] = $this->get_db()->prepare( "AND {$this->get_db()->posts}.post_type=%s", 'give_payment' );

		// Date sql.
		if ( $this->query_vars["start_date"] ) {
			$this->query_vars['date_sql'][] = "AND {$this->get_db()->posts}.post_date>='{$this->query_vars["start_date"]->format('mysql')}'";
		}

		if ( $this->query_vars["end_date"] ) {
			$this->query_vars['date_sql'][] = "AND {$this->get_db()->posts}.post_date<='{$this->query_vars["end_date"]->format('mysql')}'";
		}

		// Relative date query.
		if ( $this->query_vars['range'] ) {
			if ( $this->query_vars["relative_start_date"] ) {
				$this->query_vars['relative_date_sql'][] = "AND {$this->get_db()->posts}.post_date>='{$this->query_vars["relative_start_date"]->format('mysql')}'";
			}

			if ( $this->query_vars["relative_end_date"] ) {
				$this->query_vars['relative_date_sql'][] = "AND {$this->get_db()->posts}.post_date<='{$this->query_vars["relative_end_date"]->format('mysql')}'";
			}
		}

		// Add sql for specific donation form.
		$this->set_meta_sql( 'give_forms', '_give_payment_form_id' );

		// Add sql for specific donation payment gateways.
		$this->set_meta_sql( 'gateways', '_give_payment_gateway' );

		// Add sql for specific donation donor id.
		$this->set_meta_sql( 'donor_id', '_give_payment_donor_id' );

		// Create sql query string
		foreach ( $sql_types as $sql_type ) {
			$this->query_vars[ $sql_type ] = is_array( $this->query_vars[ $sql_type ] )
				? implode( ' ', $this->query_vars[ $sql_type ] )
				: $this->query_vars[ $sql_type ];
		}
	}

}

// @todo: compatibility with recurring, fee recovery and currency switcher
// @todo: currency formatting compatibility for earnings and other
// @todo  review donation earning growth logic
// @todo: develop logic to sent raw and formatted value
// @todo: review number decimal format
// @todo: document stat query params
// @todo: think about table backward compatibility for paymentmeta
// @todo: think about custom dates
// @todo: add snippet to show how to use donation api filters
// @todo: update REST api integration

