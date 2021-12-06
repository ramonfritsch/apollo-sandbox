import NextApp from 'next/app';
import React from 'react';
import withApolloApp from '../containers/withApolloApp';

const _App = ({ Component, pageProps }) => {
	return (
		<>
			<Component {...pageProps} />
		</>
	);
};

(_App.getInitialProps = (appContext) => {
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
}),
	NextApp.getInitialProps;

const App = withApolloApp(_App);

export default App;
