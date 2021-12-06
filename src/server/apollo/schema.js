import { gql, UserInputError } from 'apollo-server-micro';
// import { applyMiddleware } from 'graphql-middleware';
import { makeExecutableSchema } from 'graphql-tools';

const typeDefs = gql`
	type Project {
		_id: ID!
		name: String!
		todos: [Todo!]!
	}

	type Todo {
		_id: ID!
		name: String!
		done: Boolean!
		settings: TodoSettings
		description: String!
	}

	type TodoSettings {
		push: Boolean!
		email: Boolean!
	}

	type Query {
		allProjects: [Project!]!
	}

	input UpdateTodoInput {
		_id: ID!
		done: Boolean!
	}

	input UpdateTodoSettingsInput {
		_id: ID!
		push: Boolean
		email: Boolean
	}

	input DeleteTodoInput {
		_id: ID!
		todoID: ID!
	}

	type Mutation {
		updateTodo(input: UpdateTodoInput!): Todo!
		updateTodoSettings(input: UpdateTodoSettingsInput!): Todo!
		deleteTodo(input: DeleteTodoInput!): Boolean!
	}
`;

const TODOS = [
	{
		_id: '1',
		name: 'Todo 1',
		done: false,
		settings: {
			push: false,
			email: false,
		},
	},
	{
		_id: '2',
		name: 'Todo 2',
		done: false,
		settings: {
			push: false,
			email: false,
		},
	},
	{
		_id: '3',
		name: 'Todo 3',
		done: true,
		settings: {
			push: false,
			email: false,
		},
	},
];

const PROJECTS = [
	{
		_id: 'p1',
		name: 'Project 1',
		todos: [{ _id: '1' }, { _id: '2' }],
	},
	{
		_id: 'p2',
		name: 'Project 2',
		todos: [{ _id: '2' }, { _id: '3' }],
	},
];

const projectByID = (_id) => {
	return PROJECTS.find((project) => project._id === _id);
};

const todoByID = (_id) => {
	return TODOS.find((todo) => todo._id === _id);
};

const resolvers = {
	Project: {
		todos: (parent) => {
			const project = projectByID(parent._id);

			return project.todos.map((todo) => todoByID(todo._id));
		},
	},
	Todo: {
		description: (todo) =>
			todo.name +
			(todo.done ? ' (done)' : '') +
			' - ' +
			[todo.settings.push && 'push', todo.settings.email && 'email']
				.filter(Boolean)
				.join(','),
	},
	Query: {
		allProjects: () => PROJECTS,
	},
	Mutation: {
		updateTodo: (parent, { input: { _id, done } }) => {
			let todo = todoByID(_id);

			if (!todo) {
				throw new UserInputError('Todo not found');
			}

			todo.done = done;

			return todo;
		},
		updateTodoSettings: (parent, { input: { _id, push, email } }) => {
			let todo = todoByID(_id);

			if (!todo) {
				throw new UserInputError('Todo not found');
			}

			if (typeof push === 'boolean') {
				todo.settings.push = push;
			}

			if (typeof email === 'boolean') {
				todo.settings.email = email;
			}

			return todo;
		},
		deleteTodo: (parent, { input: { _id, todoID, done } }) => {
			let project = projectByID(_id);

			if (!project) {
				throw new UserInputError('Project not found');
			}

			project.todos = project.todos.filter((todo) => todo._id !== todoID);

			return true;
		},
	},
};

const schema = makeExecutableSchema({
	typeDefs,
	resolvers,
});

// const authMiddleware = async (resolve, root, args, context, info) => {
// 	console.log('before');
// 	const r = await resolve(root, args, context, info);
// 	console.log('after');
// 	return r;
// };

// const schema = applyMiddleware(baseSchema, authMiddleware);

export default schema;
