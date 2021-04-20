const graphql = require('graphql');
const axios = require('axios');
const { GraphQLObjectType, GraphQLString, GraphQLInt, GraphQLSchema } = graphql;

const UserType = new GraphQLObjectType({
  name: 'User',
  fields: {
    id: { type: GraphQLString },
    firstName: { type: GraphQLString },
    age: { type: GraphQLInt },
  },
});

const RootQuery = new GraphQLObjectType({
  name: 'RootQueryType',
  fields: {
    user: {
      type: UserType,
      args: { id: { type: GraphQLString } },
      // reaches out and grabs the real data
      resolve(parent, args, ctx, info) {
        return axios
          .get(`http://localhost:3000/users/${args.id}`)
          .then((res) => res.data)
          .catch((err) => console.log(err));
      },
    },
  },
});

module.exports = new GraphQLSchema({
  query: RootQuery,
});
