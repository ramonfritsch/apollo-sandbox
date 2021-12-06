import { ApolloServer } from 'apollo-server-micro';
import schema from '../../server/apollo/schema';

const apolloServer = new ApolloServer({
	schema,
	context: ctx => ctx
});

export const config = {
	api: {
		bodyParser: false
	}
};

const graphqlHandler = apolloServer.createHandler({ path: '/api/graphql/' });

const handler = async (...args) => {
	return graphqlHandler(...args);
};

export default handler;
