import moment from '../../../../../../../../../../../../../Library/Caches/typescript/3.6/node_modules/moment/moment';
const { _n } = wp.i18n;

const formatCurrency = ( value, currency ) => {
	// Set defaul to USD
	if ( ! currency ) {
		currency = 'USD';
	}

	// Create our number formatter.
	const formatter = new Intl.NumberFormat( 'en-US', {
		style: 'currency',
		currency,
	} );

	return formatter.format( value );
};

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
						title: formatCurrency( total ),
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
		case 'total-income': {
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
						title: formatCurrency( total ),
						body: Object.keys( donors ).length + _n( ' Donor', ' Donors', Object.keys( donors ).length, 'give' ),
						footer: time,
					};
				},
			} );

			const highlight = filtered.length ? filtered.reduce( ( t, c ) => {
				if ( c.status === 'completed' || c.status === 'first_renewal' ) {
					return t + c.total;
				}
				return t;
			}, 0 ) : 0;

			const diff = period.endDate.diff( period.startDate );
			const prevStart = moment( period.startDate ).subtract( diff );
			const prevEnd = moment( period.startDate );
			const prevFiltered = payments.filter( payment => moment( payment.date ).isAfter( prevStart ) && moment( payment.date ).isBefore( prevEnd ) );
			const prevTotal = prevFiltered.length ? prevFiltered.reduce( ( t, c ) => {
				if ( c.status === 'completed' || c.status === 'first_renewal' ) {
					return t + c.total;
				}
				return t;
			}, 0 ) : 0;
			const total = highlight;

			let trend = 0;
			if ( prevTotal > 0 && total > 0 ) {
				if ( prevTotal > total ) {
					trend = Math.round( ( ( ( prevTotal - total ) / prevTotal ) * 100 ), 1 ) * -1;
				} else if ( total > prevTotal ) {
					trend = Math.round( ( ( ( total - prevTotal ) / prevTotal ) * 100 ), 1 );
				}
			}

			return {
				datasets: [
					{
						trend,
						highlight: formatCurrency( highlight ),
						info: 'VS previous 7 days',
						data,
						tooltips,
					},
				],
			};
		}
		case 'total-donors': {
			const data = forPeriod( {
				start: period.startDate,
				end: period.endDate,
				payments: filtered,
				callback: ( { periodPayments, periodEnd } ) => {
					const donors = {};
					periodPayments.forEach( ( payment ) => {
						donors[ payment.donor.id ] = donors[ payment.donor.id ] ? donors[ payment.donor.id ] + 1 : 1;
					} );
					const time = periodEnd.format();
					return {
						x: time,
						y: Object.keys( donors ).length,
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
						title: formatCurrency( total ),
						body: Object.keys( donors ).length + _n( ' Donor', ' Donors', Object.keys( donors ).length, 'give' ),
						footer: time,
					};
				},
			} );

			const donors = {};
			filtered.forEach( ( payment ) => {
				donors[ payment.donor.id ] = donors[ payment.donor.id ] ? donors[ payment.donor.id ] + 1 : 1;
			} );
			const highlight = Object.keys( donors ).length;

			const diff = period.endDate.diff( period.startDate );
			const prevStart = moment( period.startDate ).subtract( diff );
			const prevEnd = moment( period.startDate );
			const prevFiltered = payments.filter( payment => moment( payment.date ).isAfter( prevStart ) && moment( payment.date ).isBefore( prevEnd ) );
			const prevDonors = {};
			prevFiltered.forEach( ( payment ) => {
				donors[ payment.donor.id ] = donors[ payment.donor.id ] ? donors[ payment.donor.id ] + 1 : 1;
			} );
			const prevTotal = Object.keys( prevDonors ).length;
			const total = highlight;

			let trend = 0;
			if ( prevTotal > 0 && total > 0 ) {
				if ( prevTotal > total ) {
					trend = Math.round( ( ( ( prevTotal - total ) / prevTotal ) * 100 ), 1 ) * -1;
				} else if ( total > prevTotal ) {
					trend = Math.round( ( ( ( total - prevTotal ) / prevTotal ) * 100 ), 1 );
				}
			}

			return {
				datasets: [
					{
						trend,
						highlight,
						info: 'VS previous 7 days',
						data,
						tooltips,
					},
				],
			};
		}
		case 'average-donation': {
			const data = forPeriod( {
				start: period.startDate,
				end: period.endDate,
				payments: filtered,
				callback: ( { periodPayments, periodEnd } ) => {
					const total = periodPayments.length ? periodPayments.reduce( ( t, c ) => {
						return t + c.total;
					}, 0 ) : 0;
					const avg = total > 0 && periodPayments.length > 0 ? total / periodPayments.length : 0;
					const time = periodEnd.format();
					return {
						x: time,
						y: avg,
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
					const avg = total > 0 && periodPayments.length > 0 ? total / periodPayments.length : 0;
					return {
						title: formatCurrency( avg ),
						body: Object.keys( donors ).length + _n( ' Donor', ' Donors', Object.keys( donors ).length, 'give' ),
						footer: time,
					};
				},
			} );

			const total = filtered.length ? filtered.reduce( ( t, c ) => {
				return t + c.total;
			}, 0 ) : 0;
			const highlight = total > 0 && filtered.length > 0 ? Math.round( total / filtered.length, 2 ) : 0;

			const diff = period.endDate.diff( period.startDate );
			const prevStart = moment( period.startDate ).subtract( diff );
			const prevEnd = moment( period.startDate );
			const prevFiltered = payments.filter( payment => moment( payment.date ).isAfter( prevStart ) && moment( payment.date ).isBefore( prevEnd ) );
			const prevTotal = prevFiltered.length ? prevFiltered.reduce( ( t, c ) => {
				return t + c.total;
			}, 0 ) : 0;
			const prevAvg = prevTotal > 0 && prevFiltered.length > 0 ? Math.round( prevTotal / prevFiltered.length, 2 ) : 0;
			const avg = highlight;

			let trend = 0;
			if ( prevAvg > 0 && avg > 0 ) {
				if ( prevAvg > avg ) {
					trend = Math.round( ( ( ( prevAvg - avg ) / prevAvg ) * 100 ), 1 ) * -1;
				} else if ( avg > prevAvg ) {
					trend = Math.round( ( ( ( avg - prevAvg ) / prevAvg ) * 100 ), 1 );
				}
			}

			return {
				datasets: [
					{
						trend,
						highlight: formatCurrency( highlight ),
						info: 'VS previous 7 days',
						data,
						tooltips,
					},
				],
			};
		}
		case 'total-refunds': {
			const data = forPeriod( {
				start: period.startDate,
				end: period.endDate,
				payments: filtered,
				callback: ( { periodPayments, periodEnd } ) => {
					const count = periodPayments.length ? periodPayments.reduce( ( t, c ) => {
						if ( c.status === 'refunded' ) {
							return t + 1;
						}
						return t;
					}, 0 ) : 0;
					const time = periodEnd.format();
					return {
						x: time,
						y: count,
					};
				},
			} );
			const tooltips = forPeriod( {
				start: period.startDate,
				end: period.endDate,
				payments: filtered,
				callback: ( { periodPayments, periodEnd } ) => {
					const total = periodPayments.length ? periodPayments.reduce( ( t, c ) => {
						if ( c.status === 'refunded' ) {
							return t + c.total;
						}
						return t;
					}, 0 ) : 0;
					const count = periodPayments.length ? periodPayments.reduce( ( t, c ) => {
						if ( c.status === 'refunded' ) {
							return t + 1;
						}
						return t;
					}, 0 ) : 0;
					const time = periodEnd.format( 'MMM Do, Y' );

					return {
						title: total,
						body: count + _n( ' Refund', ' Refunds', count, 'give' ),
						footer: time,
					};
				},
			} );

			const highlight = filtered.length ? filtered.reduce( ( t, c ) => {
				if ( c.status === 'refunded' ) {
					return t + 1;
				}
				return t;
			}, 0 ) : 0;

			const diff = period.endDate.diff( period.startDate );
			const prevStart = moment( period.startDate ).subtract( diff );
			const prevEnd = moment( period.startDate );
			const prevFiltered = payments.filter( payment => moment( payment.date ).isAfter( prevStart ) && moment( payment.date ).isBefore( prevEnd ) );
			const prevTotal = prevFiltered.length ? prevFiltered.reduce( ( t, c ) => {
				if ( c.status === 'refunded' ) {
					return t + 1;
				}
				return t;
			}, 0 ) : 0;
			const total = highlight;

			let trend = 0;
			if ( prevTotal > 0 && total > 0 ) {
				if ( prevTotal > total ) {
					trend = Math.round( ( ( ( prevTotal - total ) / prevTotal ) * 100 ), 1 ) * -1;
				} else if ( total > prevTotal ) {
					trend = Math.round( ( ( ( total - prevTotal ) / prevTotal ) * 100 ), 1 );
				}
			}

			return {
				datasets: [
					{
						trend,
						highlight,
						info: 'VS previous 7 days',
						data,
						tooltips,
					},
				],
			};
		}
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
						donations: formatCurrency( donations ),
						refunds: formatCurrency( refunds ),
						net: formatCurrency( net ),
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
					title: formatCurrency( value.total ),
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
					title: formatCurrency( value.total ),
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
					title: formatCurrency( value.total ),
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
						amount: formatCurrency( payment.total, payment.currency ),
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
					total: formatCurrency( value.total ),
					count: value.count + _n( ' Payment', ' Payments', value.count, 'give' ),
				} );
			} );

			return topDonors;
		default:
			return null;
	}
};
