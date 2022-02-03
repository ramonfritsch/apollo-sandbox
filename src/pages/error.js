import { gql, useQuery } from '@apollo/client';

const Page = () => {
	const { data, loading, error } = useQuery(gql`
		query {
			errorQuery {
				_id
			}
		}
	`);

	if (error) {
		throw error;
	}

	return (
		<div>
			Error
			<br />
			<br />
			<pre>{JSON.stringify(error, null, 2)}</pre>
		</div>
	);
};

export default Page;
