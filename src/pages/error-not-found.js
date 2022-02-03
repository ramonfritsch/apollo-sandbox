import { gql, useQuery } from '@apollo/client';

const NOT_FOUND_ERROR_QUERY = gql`
	query {
		notFoundErrorQuery {
			_id
		}
	}
`;

const Page = () => {
	const { data, loading, error } = useQuery(NOT_FOUND_ERROR_QUERY);

	if (error) {
		throw error;
	}

	return <div>Error not found</div>;
};

export default Page;
