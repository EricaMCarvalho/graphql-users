const graphql = require('graphql');
const axios = require('axios');
const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLInt,
  GraphQLSchema,
  GraphQLList,
  GraphQLNonNull,
} = graphql;

const CompanyType = new GraphQLObjectType({
  name: 'Company',
  // we need an arrow function because when the file first runs, it gets defined but it doesn't run right away
  fields: () => ({
    id: { type: GraphQLString },
    name: { type: GraphQLString },
    description: { type: GraphQLString },
    users: {
      type: new GraphQLList(UserType),
      resolve(parent, args, ctx, info) {
        return axios
          .get(`http://localhost:3000/companies/${parent.id}/users`)
          .then((res) => res.data)
          .catch((err) => console.log(err));
      },
    },
  }),
});

const UserType = new GraphQLObjectType({
  name: 'User',
  fields: () => ({
    id: { type: GraphQLString },
    firstName: { type: GraphQLString },
    age: { type: GraphQLInt },
    company: {
      type: CompanyType,
      resolve(parent, args, ctx, info) {
        return axios
          .get(`http://localhost:3000/companies/${parent.companyId}`)
          .then((res) => res.data)
          .catch((err) => console.log(err));
      },
    },
  }),
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
    company: {
      type: CompanyType,
      args: { id: { type: GraphQLString } },
      resolve(parent, args, ctx, info) {
        return axios
          .get(`http://localhost:3000/companies/${args.id}`)
          .then((res) => res.data)
          .catch((err) => console.log(err));
      },
    },
  },
});

const mutation = new GraphQLObjectType({
  name: 'Mutation',
  fields: {
    addUser: {
      type: UserType,
      args: {
        firstName: { type: new GraphQLNonNull(GraphQLString) },
        age: { type: new GraphQLNonNull(GraphQLInt) },
        companyId: { type: GraphQLString },
      },
      resolve(parent, { firstName, age }, ctx, info) {
        return axios
          .post('http://localhost:3000/users', {
            firstName,
            age,
          })
          .then((res) => res.data);
      },
    },
    deleteUser: {
      type: UserType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLString) },
      },
      resolve(parent, { id }) {
        return axios
          .delete(`http://localhost:3000/users/${id}`)
          .then((res) => res.data);
      },
    },
    updateUser: {
      type: UserType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLString) },
        firstName: { type: GraphQLString },
        age: { type: GraphQLInt },
      },
      resolve(parent, args) {
        return axios
          .patch(`http://localhost:3000/users/${id}`, args)
          .then((res) => res.data);
      },
    },
  },
});

module.exports = new GraphQLSchema({
  query: RootQuery,
  mutation,
});
