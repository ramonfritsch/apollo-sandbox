import { ApolloClient, ApolloProvider, from, InMemoryCache } from '@apollo/client';
import { onError } from '@apollo/client/link/error';
import 'isomorphic-unfetch';
import React, { useMemo } from 'react';
import { wrapDisplayName } from 'recompose';

let globalApolloClient = null;

const cacheOptions = {
	typePolicies: {
		Project: { fields: { todos: { merge: false } } },
	},
};

function initApolloClient(ctx = {}, initialState) {
	if (!process.browser) {
		// New client on server-side
		return createApolloClient(ctx, initialState);
	}

	// Reuse client on the client-side
	if (!globalApolloClient) {
		globalApolloClient = createApolloClient(ctx, initialState);
	}

	return globalApolloClient;
}

function createApolloClient(ctx, initialState) {
	let link = null;

	if (!process.browser) {
		const { SchemaLink } = require('@apollo/client/link/schema');
		const schema = require('../server/apollo/schema').default;

		link = new SchemaLink({ schema, context: ctx });
	} else {
		const { HttpLink } = require('@apollo/client/link/http');

		link = from([
			onError(({ graphQLErrors, response }) => {
				for (let k in graphQLErrors) {
					const graphQLError = graphQLErrors[k];

					if (graphQLError.extensions.code === 'REDIRECT') {
						window.location = graphQLError.extensions.url;
						response.errors = null;
					}
				}
			}),
			new HttpLink({
				uri: `/api/graphql/`,
				credentials: 'include',
			}),
		]);
	}

	const cache = new InMemoryCache(cacheOptions).restore(initialState);

	// Check out https://github.com/zeit/next.js/pull/4611 if you want to use the AWSAppSyncClient
	return new ApolloClient({
		ssrMode: !process.browser,
		link,
		cache,
	});
}

const withApolloApp = (AppComponent) => {
	const WrappedComponent = ({ apolloClient, initialApolloState, ...props }) => {
		const client = useMemo(
			() => apolloClient || initApolloClient(undefined, initialApolloState),
			[apolloClient, initialApolloState]
		);

		return (
			<ApolloProvider client={client}>
				<AppComponent {...props} />
			</ApolloProvider>
		);
	};

	WrappedComponent.displayName = wrapDisplayName(AppComponent, 'withApolloApp');

	WrappedComponent.getInitialProps = async (appContext) => {
		const { AppTree, ctx } = appContext;
		const { req, res } = ctx;

		const apolloClient = initApolloClient({
			req,
			res,
		});

		ctx.apolloClient = apolloClient;

		let initialAppProps = { pageProps: {} };
		if (AppComponent.getInitialProps) {
			initialAppProps = await AppComponent.getInitialProps(appContext);
		}

		// Only on the server:
		if (!process.browser) {
			// When redirecting, the response is finished.
			// No point in continuing to render
			if (res && res.finished) {
				return initialAppProps;
			}

			try {
				// Run all GraphQL queries
				const { getDataFromTree } = await import('@apollo/client/react/ssr');
				await getDataFromTree(<AppTree apolloClient={apolloClient} {...initialAppProps} />);
			} catch (error) {
				// Prevent Apollo Client GraphQL errors from crashing SSR.
				// Handle them in components via the data.error prop:
				// https://www.apollographql.com/docs/react/api/react-apollo.html#graphql-query-data-error
				for (let k in error.graphQLErrors) {
					const graphQLError = error.graphQLErrors[k];

					if (graphQLError.extensions.code === 'REDIRECT') {
						res.writeHead(302, {
							Location: graphQLError.extensions.url,
						});
						res.end();

						return {};
					}
				}

				// eslint-disable-next-line no-console
				console.error('Error while running `getDataFromTree`', error);
			}
		}

		const apolloState = apolloClient.extract();

		return {
			...initialAppProps,
			initialApolloState: apolloState,
		};
	};

	return WrappedComponent;
};

export default withApolloApp;
