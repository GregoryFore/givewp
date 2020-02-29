import { useStoreValue } from '../store';

export const getReport = ( report ) => {
	const [ { payments } ] = useStoreValue();
	return {
		report,
		payments,
	};
};
