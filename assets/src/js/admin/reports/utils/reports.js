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
		case 'income-breakdown': {
			const rows = forPeriod( {
				start: period.startDate,
				end: period.endDate,
				payments: filtered,
				callback: ( { periodPayments, periodEnd } ) => {
					const donations = periodPayments.length ? periodPayments.reduce( ( t, c ) => {
						if ( c.status === 'completed' || c.status === 'first_renewal' ) {
							return t + c.total;
						}
						return t;
					}, 0 ) : 0;

					const refunds = periodPayments.length ? periodPayments.reduce( ( t, c ) => {
						if ( c.status === 'refunded' ) {
							return t + c.total;
						}
						return t;
					}, 0 ) : 0;

					const net = donations - refunds;

					const donors = {};
					periodPayments.forEach( ( payment ) => {
						donors[ payment.donor.id ] = donors[ payment.donor.id ] ? donors[ payment.donor.id ] + 1 : 1;
					} );

					return {
						date: periodEnd.format( 'MMM Do, Y' ),
						donors: Object.keys( donors ).length,
						donations,
						refunds,
						net,
					};
				},
			} );
			return rows;
		}
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
		case 'payment-statuses': {
			const statuses = {
				completed: {
					total: 0,
					count: 0,
					label: 'Completed',
				},
				cancelled: {
					total: 0,
					count: 0,
					label: 'Cancelled',
				},
				refunded: {
					total: 0,
					count: 0,
					label: 'Refunded',
				},
				abandoned: {
					total: 0,
					count: 0,
					label: 'Abandoned',
				},
			};

			if ( filtered.length ) {
				filtered.forEach( ( payment ) => {
					const status = payment.status;

					if ( ! statuses[ status ] ) {
						return;
					}

					statuses[ status ].total = statuses[ status ].total ? statuses[ status ].total + payment.total : payment.total;
					statuses[ status ].count = statuses[ status ].count ? statuses[ status ].count + 1 : 1;
					statuses[ status ].label = statuses[ status ].label ? statuses[ status ].label : status;
				} );
			}

			const labels = [];
			const data = [];
			const tooltips = [];

			Object.values( statuses ).forEach( ( value ) => {
				labels.push( value.label );
				data.push( value.count );
				tooltips.push( {
					title: value.total,
					body: value.count + _n( ' Payment', ' Payments', value.count, 'give' ),
					footer: value.label,
				} );
			} );

			return {
				labels,
				datasets: [
					{
						data,
						tooltips,
					},
				],
			};
		}
		case 'form-performance': {
			const forms = {};
			if ( filtered.length ) {
				filtered.forEach( ( payment ) => {
					const form = payment.form;
					forms[ form.id ] = forms[ form.id ] ? forms[ form.id ] : {};
					forms[ form.id ].total = forms[ form.id ].total ? forms[ form.id ].total + payment.total : payment.total;
					forms[ form.id ].count = forms[ form.id ].count ? forms[ form.id ].count + 1 : 1;
					forms[ form.id ].label = forms[ form.id ].label ? forms[ form.id ].label : form.title;
				} );
			}

			const data = [];
			const tooltips = [];

			Object.values( forms ).forEach( ( value ) => {
				data.push( value.total );
				tooltips.push( {
					title: value.total,
					body: value.count + _n( ' Payment', ' Payments', value.count, 'give' ),
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
		case 'recent-donations': {
			const donations = [];
			if ( filtered.length ) {
				filtered.forEach( ( payment ) => {
					donations.push( {
						type: 'donation',
						amount: payment.total,
						donor: {
							name: payment.donor.first + ' ' + payment.donor.last,
							id: payment.donor.id,
						},
						status: payment.status,
						time: payment.date,
						source: payment.form.title,
					} );
				} );
			}
			return donations;
		}
		case 'top-donors':
			const donors = {};
			if ( filtered.length ) {
				filtered.forEach( ( payment ) => {
					const donor = payment.donor;
					donors[ donor.id ] = donors[ donor.id ] ? donors[ donor.id ] : {};

					// Cumulative properties
					donors[ donor.id ].total = donors[ donor.id ].total ? donors[ donor.id ].total + payment.total : payment.total;
					donors[ donor.id ].count = donors[ donor.id ].count ? donors[ donor.id ].count + 1 : 1;

					// Static properties
					donors[ donor.id ].name = donors[ donor.id ].name ? donors[ donor.id ].name : donor.first + ' ' + donor.last;
					donors[ donor.id ].id = donors[ donor.id ].id ? donors[ donor.id ].id : donor.id;
					donors[ donor.id ].image = donors[ donor.id ].image ? donors[ donor.id ].image : donor.image;
					donors[ donor.id ].email = donors[ donor.id ].email ? donors[ donor.id ].email : donor.email;
				} );
			}

			const topDonors = [];

			Object.values( donors ).forEach( ( value ) => {
				topDonors.push( {
					type: 'donor',
					id: value.id,
					name: value.name,
					image: value.image,
					email: value.email,
					total: value.total,
					count: value.count + _n( ' Payment', ' Payments', value.count, 'give' ),
				} );
			} );

			return topDonors;
		default:
			return null;
	}
};
