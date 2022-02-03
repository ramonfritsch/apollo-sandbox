import React, { useContext, useMemo, useState } from 'react';

const ErrorWrapperContext = React.createContext();

export const ErrorWrapperProvider = ({ children }) => {
	const [error, setError] = useState(null);

	if (error) {
		throw error;
	}

	const value = useMemo(() => ({ setError }), [setError]);

	return <ErrorWrapperContext.Provider value={value}>{children}</ErrorWrapperContext.Provider>;
};

const useErrorWrapper = () => {
	const { setError } = useContext(ErrorWrapperContext);

	const wrapError =
		(callback) =>
		async (...args) => {
			let r = null;

			try {
				r = await callback(...args);
			} catch (error) {
				setError(error);

				// throw error;
			}

			return r;
		};

	return { wrapError };
};

export default useErrorWrapper;
