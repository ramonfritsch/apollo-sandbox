import { gql, useQuery } from '@apollo/client';

const REDIRECT_ERROR_QUERY = gql`
	query {
		redirectErrorQuery {
			_id
		}
	}
`;

const Page = () => {
	const { data, loading, error } = useQuery(REDIRECT_ERROR_QUERY);

	if (error) {
		throw error;
	}

	return <div>Error redirect</div>;
};

export default Page;
