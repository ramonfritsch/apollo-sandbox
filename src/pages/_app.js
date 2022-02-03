import NextApp from 'next/app';
import Error from 'next/error';
import { withRouter } from 'next/router';
import React from 'react';
import withApolloApp from '../containers/withApolloApp';
import { ErrorWrapperProvider } from '../hooks/useErrorWrapper';

const isNotFoundError = (error) =>
	Boolean(
		error?.graphQLErrors?.some((graphQLError) => graphQLError.extensions.code === 'NOT_FOUND')
	);

class _AppInner extends React.Component {
	state = { error: null, previousAsPath: null };

	static getDerivedStateFromProps(props, state) {
		const newState = {};

		// Clear error on navigation
		if (state.previousAsPath !== props.router.asPath && (state.error || state.notFound)) {
			newState.error = null;
		}

		newState.previousAsPath = props.router.asPath;

		return newState;
	}

	componentDidCatch(error) {
		this.setState({ error });
	}

	render() {
		const { Component, pageProps } = this.props;
		const { error } = this.state;

		if (isNotFoundError(error)) {
			return <Error statusCode={404} />;
		} else if (error) {
			return <Error statusCode={500} />;
		}

		return (
			<>
				<ErrorWrapperProvider>
					<Component {...pageProps} />
				</ErrorWrapperProvider>
			</>
		);
	}
}

const _App = withRouter(_AppInner);

_App.getInitialProps = (appContext) => {
	const { ctx } = appContext;
	const { req, res, apolloClient } = ctx;

	ctx.isServer = Boolean(req && req.client);

	// if static resource like favicon.ico
	const pieces = ctx.asPath.split('/');
	if (ctx.isServer && pieces.length >= 2 && pieces[1].includes('.')) {
		res.writeHead(302, {
			Location: `${process.env.NEXT_PUBLIC_STATIC_BASE_URL}/_next/static${ctx.asPath}`,
		});
		return res.end();
	}

	return NextApp.getInitialProps(appContext);
};

const App = withApolloApp(_App);

export default App;
