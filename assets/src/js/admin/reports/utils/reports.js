import moment from '../../../../../../../../../../../../../Library/Caches/typescript/3.6/node_modules/moment/moment';
const { _n } = wp.i18n;

const forPeriod = ( { start, end, callback, payments } ) => {
	const diff = end.diff( start, 'days' );
	let interval;
	switch ( true ) {
		case ( diff > 12 ):
			interval = moment.duration( diff / 12, 'days' );
			break;
		case ( diff > 5 ):
			interval = moment.duration( 1, 'days' );
			break;
		case ( diff > 4 ):
			interval = moment.duration( 12, 'hours' );
			break;
		case ( diff > 2 ):
			interval = moment.duration( 3, 'hours' );
			break;
		case ( diff >= 0 ):
			interval = moment.duration( 1, 'hours' );
			break;
	}

	const arr = [];

	const periodStart = moment( start );
	const periodEnd = moment( start ).add( interval );
	while ( periodStart.isBefore( end ) ) {
		const filtered = payments.filter( payment => moment( payment.date ).isAfter( periodStart ) && moment( payment.date ).isBefore( periodEnd ) );
		const value = callback( { periodPayments: filtered, periodStart, periodEnd } );
		arr.push( value );
		periodStart.add( interval );
		periodEnd.add( interval );
	}

	return arr;
};

export const getReport = ( { report, payments, period } ) => {
	const filtered = payments.filter( payment => moment( payment.date ).isAfter( period.startDate ) && moment( payment.date ).isBefore( period.endDate ) );

	switch ( report ) {
		case 'income': {
			const data = forPeriod( {
				start: period.startDate,
				end: period.endDate,
				payments: filtered,
				callback: ( { periodPayments, periodEnd } ) => {
					const total = periodPayments.length ? periodPayments.reduce( ( t, c ) => {
						return t + c.total;
					}, 0 ) : 0;
					const time = periodEnd.format();
					return {
						x: time,
						y: total,
					};
				},
			} );
			const tooltips = forPeriod( {
				start: period.startDate,
				end: period.endDate,
				payments: filtered,
				callback: ( { periodPayments, periodEnd } ) => {
					const total = periodPayments.length ? periodPayments.reduce( ( t, c ) => {
						return t + c.total;
					}, 0 ) : 0;
					const time = periodEnd.format( 'MMM Do, Y' );
					const donors = {};
					periodPayments.forEach( ( payment ) => {
						donors[ payment.donor.id ] = donors[ payment.donor.id ] ? donors[ payment.donor.id ] + 1 : 1;
					} );

					return {
						title: total,
						body: Object.keys( donors ).length + _n( ' Donor', ' Donors', Object.keys( donors ).length, 'give' ),
						footer: time,
					};
				},
			} );

			return {
				datasets: [
					{
						data,
						tooltips,
					},
				],
			};
		}
		case 'total-income':
			return {
				datasets: [
					{
						trend: -5,
						highlight: '$150.00',
						info: 'VS previous 7 days',
						data: [
							{
								y: 20,
								x: '2001-01-01',
							},
							{
								y: 88,
								x: '2001-01-02',
							},
							{
								y: 88,
								x: '2001-01-03',
							},
							{
								y: 88,
								x: '2001-01-04',
							},
							{
								y: 88,
								x: '2001-01-05',
							},
							{
								y: 88,
								x: '2001-01-06',
							},
							{
								y: 88,
								x: '2001-01-07',
							},
						],
						tooltips: [
							{
								title: '$10.00',
								body: '12 Donors',
								footer: 'Jan 1',
							},
							{
								title: '$10.00',
								body: '12 Donors',
								footer: 'Jan 2',
							},
							{
								title: '$10.00',
								body: '12 Donors',
								footer: 'Jan 3',
							},
							{
								title: '$10.00',
								body: '12 Donors',
								footer: 'Jan 4',
							},
							{
								title: '$10.00',
								body: '12 Donors',
								footer: 'Jan 5',
							},
							{
								title: '$20.00',
								body: '3 Donors',
								footer: 'Jan 6',
							},
							{
								title: '$20.00',
								body: '3 Donors',
								footer: 'Jan 7',
							},
						],
					},
				],
			};
		case 'total-donors':
			return {
				datasets: [
					{
						trend: -5,
						highlight: '4',
						info: 'VS previous 7 days',
						data: [
							{
								y: 20,
								x: '2001-01-01',
							},
							{
								y: 88,
								x: '2001-01-02',
							},
							{
								y: 88,
								x: '2001-01-03',
							},
							{
								y: 88,
								x: '2001-01-04',
							},
							{
								y: 88,
								x: '2001-01-05',
							},
							{
								y: 88,
								x: '2001-01-06',
							},
							{
								y: 88,
								x: '2001-01-07',
							},
						],
						tooltips: [
							{
								title: '$10.00',
								body: '12 Donors',
								footer: 'Jan 1',
							},
							{
								title: '$10.00',
								body: '12 Donors',
								footer: 'Jan 2',
							},
							{
								title: '$10.00',
								body: '12 Donors',
								footer: 'Jan 3',
							},
							{
								title: '$10.00',
								body: '12 Donors',
								footer: 'Jan 4',
							},
							{
								title: '$10.00',
								body: '12 Donors',
								footer: 'Jan 5',
							},
							{
								title: '$20.00',
								body: '3 Donors',
								footer: 'Jan 6',
							},
							{
								title: '$20.00',
								body: '3 Donors',
								footer: 'Jan 7',
							},
						],
					},
				],
			};
		case 'average-donation':
			return {
				datasets: [
					{
						trend: -5,
						highlight: '$88.00',
						info: 'VS previous 7 days',
						data: [
							{
								y: 20,
								x: '2001-01-01',
							},
							{
								y: 88,
								x: '2001-01-02',
							},
							{
								y: 88,
								x: '2001-01-03',
							},
							{
								y: 88,
								x: '2001-01-04',
							},
							{
								y: 88,
								x: '2001-01-05',
							},
							{
								y: 88,
								x: '2001-01-06',
							},
							{
								y: 88,
								x: '2001-01-07',
							},
						],
						tooltips: [
							{
								title: '$10.00',
								body: '12 Donors',
								footer: 'Jan 1',
							},
							{
								title: '$10.00',
								body: '12 Donors',
								footer: 'Jan 2',
							},
							{
								title: '$10.00',
								body: '12 Donors',
								footer: 'Jan 3',
							},
							{
								title: '$10.00',
								body: '12 Donors',
								footer: 'Jan 4',
							},
							{
								title: '$10.00',
								body: '12 Donors',
								footer: 'Jan 5',
							},
							{
								title: '$20.00',
								body: '3 Donors',
								footer: 'Jan 6',
							},
							{
								title: '$20.00',
								body: '3 Donors',
								footer: 'Jan 7',
							},
						],
					},
				],
			};
		case 'total-refunds':
			return {
				datasets: [
					{
						trend: -5,
						highlight: '9',
						info: 'VS previous 7 days',
						data: [
							{
								y: 20,
								x: '2001-01-01',
							},
							{
								y: 88,
								x: '2001-01-02',
							},
							{
								y: 88,
								x: '2001-01-03',
							},
							{
								y: 88,
								x: '2001-01-04',
							},
							{
								y: 88,
								x: '2001-01-05',
							},
							{
								y: 88,
								x: '2001-01-06',
							},
							{
								y: 88,
								x: '2001-01-07',
							},
						],
						tooltips: [
							{
								title: '$10.00',
								body: '12 Donors',
								footer: 'Jan 1',
							},
							{
								title: '$10.00',
								body: '12 Donors',
								footer: 'Jan 2',
							},
							{
								title: '$10.00',
								body: '12 Donors',
								footer: 'Jan 3',
							},
							{
								title: '$10.00',
								body: '12 Donors',
								footer: 'Jan 4',
							},
							{
								title: '$10.00',
								body: '12 Donors',
								footer: 'Jan 5',
							},
							{
								title: '$20.00',
								body: '3 Donors',
								footer: 'Jan 6',
							},
							{
								title: '$20.00',
								body: '3 Donors',
								footer: 'Jan 7',
							},
						],
					},
				],
			};
		case 'payment-methods': {
			const methods = {};
			if ( filtered.length ) {
				filtered.forEach( ( payment ) => {
					const gateway = payment.gateway;
					methods[ gateway.id ] = methods[ gateway ] ? methods[ gateway ] : {};
					methods[ gateway.id ].total = methods[ gateway.id ].total ? methods[ gateway.id ].total + payment.total : payment.total;
					methods[ gateway.id ].donors = methods[ gateway.id ].donors ? methods[ gateway.id ].donors + 1 : 1;
					methods[ gateway.id ].label = methods[ gateway.id ].label ? methods[ gateway.id ].label : gateway.label;
				} );
			}

			const data = [];
			const tooltips = [];

			Object.values( methods ).forEach( ( value ) => {
				data.push( value.total );
				tooltips.push( {
					title: value.total,
					body: value.donors + _n( ' Donor', ' Donors', value.donors, 'give' ),
					footer: value.label,
				} );
			} );

			return {
				datasets: [
					{
						data,
						tooltips,
					},
				],
			};
		}
		case 'payment-statuses':
			return {
				labels: [
					'PayPal',
					'Stipe',
				],
				datasets: [
					{
						data: [ 3, 5 ],
						tooltips: [
							{
								title: '$12,000',
								body: '44 Donors',
								footer: 'PayPal',
							},
							{
								title: '$4,000',
								body: '468 Donors',
								footer: 'Stripe',
							},
						],
					},
				],
			};
		case 'form-performance':
			return {
				datasets: [
					{
						data: [ 3, 5 ],
						tooltips: [
							{
								title: '$12,000',
								body: '44 Donors',
								footer: 'PayPal',
							},
							{
								title: '$4,000',
								body: '468 Donors',
								footer: 'Stripe',
							},
						],
					},
				],
			};
		case 'recent-donations':
			return [
				{
					type: 'donation',
					amount: '$400.00',
					donor: {
						name: 'JK Rowling',
						id: 44,
					},
					status: 'completed',
					time: '2001-01-01',
					source: 'Save the Planet',
				},
				{
					type: 'donation',
					amount: '$400.00',
					donor: {
						name: 'JK Rowling',
						id: 44,
					},
					status: 'first_renewal',
					time: '2001-01-01',
					source: 'Save the Planet',
				},
				{
					type: 'donation',
					amount: '$400.00',
					donor: {
						name: 'JK Rowling',
						id: 44,
					},
					status: 'refunded',
					time: '2001-01-01',
					source: 'Save the Planet',
				},
				{
					type: 'donation',
					amount: '$400.00',
					donor: {
						name: 'JK Rowling',
						id: 44,
					},
					status: 'completed',
					time: '2001-01-01',
					source: 'Save the Planet',
				},
				{
					type: 'donation',
					amount: '$400.00',
					donor: {
						name: 'JK Rowling',
						id: 44,
					},
					status: 'renewal',
					time: '2001-01-01',
					source: 'Save the Planet',
				},
			];
		case 'top-donors':
			return [
				{
					type: 'donor',
					id: 44,
					name: 'JK Rowling',
					image: null,
					email: 'test@email.com',
					total: '$44,000',
					count: '48 Donations',
				},
				{
					type: 'donor',
					id: 44,
					name: 'JK Rowling',
					image: null,
					email: 'test@email.com',
					total: '$44,000',
					count: '48 Donations',
				},
				{
					type: 'donor',
					id: 44,
					name: 'JK Rowling',
					image: null,
					email: 'test@email.com',
					total: '$44,000',
					count: '48 Donations',
				},
				{
					type: 'donor',
					id: 44,
					name: 'JK Rowling',
					image: null,
					email: 'test@email.com',
					total: '$44,000',
					count: '48 Donations',
				},
				{
					type: 'donor',
					id: 44,
					name: 'JK Rowling',
					image: null,
					email: 'test@email.com',
					total: '$44,000',
					count: '48 Donations',
				},
				{
					type: 'donor',
					id: 44,
					name: 'JK Rowling',
					image: null,
					email: 'test@email.com',
					total: '$44,000',
					count: '48 Donations',
				},
			];
		default:
			return null;
	}
};
