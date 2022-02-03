import { gql, useApolloClient } from '@apollo/client';
import { useCallback } from 'react';
import useErrorWrapper from '../hooks/useErrorWrapper';

const ERROR_QUERY = gql`
	query {
		errorQuery {
			_id
		}
	}
`;

const REDIRECT_ERROR_QUERY = gql`
	query {
		redirectErrorQuery {
			_id
		}
	}
`;

// const wrapError = (fn) => fn;

const Page = () => {
	// const [fetch, { data, loading, error }] = useLazyQuery(ERROR_QUERY);
	const client = useApolloClient();
	const { wrapError } = useErrorWrapper();

	// if (error) {
	// 	throw error;
	// }

	const handler = useCallback(() => {
		// fetch();
	});

	// const handler2 = useCallback(() => {
	// 	client.query({
	// 		query: ERROR_QUERY,
	// 	});
	// });

	const handler2 = useCallback(
		wrapError(() => {
			return client.query({
				query: ERROR_QUERY,
			});
		})
	);

	const handler3 = useCallback(
		wrapError(() => {
			return client.query({
				query: REDIRECT_ERROR_QUERY,
			});
		})
	);

	return (
		<div>
			Error page
			<ul>
				<li>
					<button onClick={handler}>Error 1</button>
				</li>
				<li>
					<button onClick={handler2}>Error 2</button>
				</li>
				<li>
					<button onClick={handler3}>Error 3</button>
				</li>
			</ul>
		</div>
	);
};

export default Page;
