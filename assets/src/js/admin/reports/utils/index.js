import { useStoreValue } from '../store';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { setGiveStatus, setPageLoaded, setQueriedRange, setPayments } from '../store/actions';
import { getSamplePayments } from './sample';
import { getReport } from './reports';
import moment from '../../../../../../../../../../../../../Library/Caches/typescript/3.6/node_modules/moment/moment';

export const getWindowData = ( value ) => {
	const data = window.giveReportsData;
	return data[ value ];
};

export const useReportsAPI = () => {
	const [ {}, dispatch ] = useStoreValue();

	const fetched = null;
	const querying = false;

	useEffect( () => {
		dispatch( setGiveStatus( 'donations_found' ) );
		dispatch( setPageLoaded( true ) );
	}, [] );

	return [ fetched, querying ];
};

export const useReport = ( report ) => {
	// Use period from store
	const [ { period } ] = useStoreValue();

	// Use state to hold data fetched from API
	const [ fetched, setFetched ] = useState( null );

	// Use state to hold querying status
	const [ querying, setQuerying ] = useState( false );

	// Fetch new data when period changes
	useEffect( () => {
		if ( period.startDate && period.endDate ) {
			setFetched( getReport( report ) );
			setQuerying( true );
		}
	}, [ period ] );

	return [ fetched, querying ];
};

export const usePayments = () => {
	// Use queriedRange from store
	const [ { queriedRange }, dispatch ] = useStoreValue();

	const [ querying, setQuerying ] = useState( false );

	// Get all time start date
	const allTimeStart = getWindowData( 'allTimeStart' ) ? getWindowData( 'allTimeStart' ) : '2015-01-01';

	let range;
	let period;

	switch ( queriedRange ) {
		case null:
			period = {
				start: moment().subtract( 1, 'month' ),
				end: moment(),
			};
			range = 'month';
			break;
		case 'month':
			period = {
				start: moment().subtract( 1, 'year' ),
				end: moment(),
			};
			range = 'year';
			break;
		case 'year':
			period = {
				start: moment( allTimeStart ),
				end: moment(),
			};
			range = 'alltime';
			break;
	}

	// Setup cancel token for request
	const CancelToken = axios.CancelToken;
	const source = CancelToken.source();

	// Fetch new data when period changes
	useEffect( () => {
		if ( queriedRange === 'alltime' ) {
			return;
		}

		if ( querying === true ) {
			source.cancel( 'Operation canceled by the user.' );
		}

		setQuerying( true );

		axios.get( wpApiSettings.root + 'give-api/v2/reports/payments', {
			cancelToken: source.token,
			params: {
				start: period.start.format( 'YYYY-MM-DD-HH' ),
				end: period.end.format( 'YYYY-MM-DD-HH' ),
			},
			headers: {
				'X-WP-Nonce': wpApiSettings.nonce,
			},
		} )
			.then( function( response ) {
				setQuerying( false );

				const status = response.data.status;
				dispatch( setGiveStatus( status ) );

				if ( status === 'no_donations_found' ) {
					const sample = getSamplePayments();
					dispatch( setPayments( sample ) );
				} else {
					dispatch( setPayments( response.data.data ) );
				}

				dispatch( setQueriedRange( range ) );
			} )
			.catch( function() {
				setQuerying( false );
			} );
	}, [ queriedRange ] );

	return queriedRange;
};
