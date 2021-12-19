const { AuthenticationError } = require("apollo-server-errors");
const { User } = require("../models");


const resolvers = {
    Query: {
        me: async () => {
            if (context.user) {
                const userData = await User.findOne({ _id: context.user, _id })
                    .select('-__v -password')

                return userData
            }

            throw new AuthenticationError('Not logged in')
        },



        // books: async (parent, { username }) => {
        //     const params = username ? { username } : {};
        //     return Book.find(params).sort({ createdAt: -1 });
        // },
        // book: async (parent, { _id }) => {
        //     return Book.findOne({ _id });
    },
    Mutation: {
        addUser: async (parent, args) => {
            console.log(args)
            const user = await User.create(args);
            const token = signToken(user);

            return { token, user };
        },
        login: async (parent, { email, password }) => {
            const user = await User.findOne({ email });

            if (!user) {
                throw new AuthenticationError('Incorrect credentials');
            }

            const correctPw = await user.isCorrectPassword(password);

            if (!correctPw) {
                throw new AuthenticationError('Incorrect credentials');
            }

            const token = signToken(user);
            return { token, user };
        },
        saveBook: async (parent, { authors, description, title, bookId, image }, context) => {
            if (context.user) {
                const user = await User.findOneAndUpdate({
                    where: {

                        id: context.user._id
                    }
                }, { $push: { savedBooks: { authors, description, title, bookId, image } } })

                const token = signToken(user);
                return { token, user };
            }
            throw new AuthenticationError('Must be logged in');

        },
        removeBook: async (parent, { authors, description, title, bookId, image }, context) => {
            if (context.user) {
                const user = await User.findOneAndUpdate({
                    where: {

                        id: context.user._id
                    }
                }, { $pull: { savedBooks: { bookId } } })

                const token = signToken(user);
                return { token, user };
            }
            throw new AuthenticationError('Must be logged in');

        },


    }
}

module.exports = resolvers;