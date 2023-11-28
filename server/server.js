import mongoose from 'mongoose';
import express from 'express';
import { ApolloServer, gql } from 'apollo-server-express';
import userModel from './controllers/model.js';
import { expressMiddleware } from '@apollo/server/express4';

const app = express();

async function conn() {
  await mongoose
    .connect('mongodb://localhost:27017/graphql')
    .then(() => console.log('Connected to mongoose'))
    .catch((err) => console.error('Error connecting to mongoose:', err));
}

conn();

const typeDefs = gql`
  type User {
    name: String
    id: ID
    age: Int
  }

  type Query {
    user: [User]
  }

  type Mutation {
    createUser(name: String!, age: Int!): User
  }
`;

const resolvers = {
  Query: {
    user: async () => {
      try {
        const users = await userModel.find();
        return users;
      } catch (err) {
        throw new Error(err);
      }
    },
  },
  Mutation: {
    createUser: async (_, { name, age }) => {
      try {
        const newUser = new userModel({ name, age });
        await newUser.save();
        return newUser;
      } catch (err) {
        throw new Error(err);
      }
    },
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

app.use(express.json());

// Configure Apollo Server as middleware
await server.start()
server.applyMiddleware({ app, path: '/graphql' });


const PORT = 1000;

app.listen(PORT, () => {
  console.log(`Server ready at http://localhost:${PORT}`);
});
