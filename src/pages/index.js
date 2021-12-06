import { gql, useApolloClient, useQuery } from '@apollo/client';
import { useCallback } from 'react';

const Item = ({ projectID, todo }) => {
	const client = useApolloClient();

	const handleDoneClick = useCallback(() => {
		client.mutate({
			mutation: gql`
				mutation UpdateTodo($input: UpdateTodoInput!) {
					updateTodo(input: $input) {
						_id
						done
						description
					}
				}
			`,
			variables: {
				input: {
					_id: todo._id,
					done: !todo.done,
				},
			},
		});
	}, [todo]);

	const handlePushClick = useCallback(() => {
		client.mutate({
			mutation: gql`
				mutation UpdateTodoSettings($input: UpdateTodoSettingsInput!) {
					updateTodoSettings(input: $input) {
						_id
						settings {
							push
						}
						description
					}
				}
			`,
			variables: {
				input: {
					_id: todo._id,
					push: !todo.settings.push,
				},
			},
		});
	}, [todo]);

	const handleEmailClick = useCallback(() => {
		client.mutate({
			mutation: gql`
				mutation UpdateTodoSettings($input: UpdateTodoSettingsInput!) {
					updateTodoSettings(input: $input) {
						_id
						settings {
							email
						}
						description
					}
				}
			`,
			variables: {
				input: {
					_id: todo._id,
					email: !todo.settings.email,
				},
			},
		});
	}, [todo]);

	const handleDeleteClick = useCallback(async () => {
		await client.mutate({
			mutation: gql`
				mutation DeleteTodo($input: DeleteTodoInput!) {
					deleteTodo(input: $input)
				}
			`,
			variables: {
				input: {
					_id: projectID,
					todoID: todo._id,
				},
			},
		});

		console.log('evict', client.cache.identify(todo));

		client.cache.evict(client.cache.identify(todo));
	}, [todo, projectID]);

	return (
		<li>
			<span>{todo.name}</span>{' '}
			<button onClick={handleDoneClick}>{todo.done ? 'DONE' : 'PENDING'}</button> -
			<button onClick={handlePushClick}>
				{todo.settings.push ? 'PUSH: ON' : 'PUSH: OFF'}
			</button>
			<button onClick={handleEmailClick}>
				{todo.settings.email ? 'EMAIL: ON' : 'EMAIL: OFF'}
			</button>{' '}
			- {todo.description} -<button onClick={handleDeleteClick}>DELETE</button>
		</li>
	);
};

const Page = () => {
	const { data, loading, error } = useQuery(gql`
		query GetProjects {
			allProjects {
				_id
				name
				todos {
					_id
					name
					done
					settings {
						push
						email
					}
					description
				}
			}
		}
	`);

	if (error) {
		throw error;
	} else if (loading || !data) {
		return <div>Loading...</div>;
	}

	return (
		<div>
			<ul>
				{data.allProjects.map((project) => (
					<li key={project._id}>
						<span>
							<h2>{project.name}</h2>
						</span>
						<ul>
							{project.todos.map((todo) => (
								<Item key={todo._id} projectID={project._id} todo={todo} />
							))}
						</ul>
					</li>
				))}
			</ul>
		</div>
	);
};

export default Page;
