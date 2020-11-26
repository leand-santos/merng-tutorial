const postsResolver = require('./posts')
const usersResolver = require('./users')
const commentsResolver = require('./comments')

module.exports = {
    Post: {
        likeCount: (parent) => parent.likes.length,
        commentCount: (parent) => parent.comments.length
    },
    Query: {
        ...postsResolver.Query
    },
    Mutation: {
        ...usersResolver.Mutation,
        ...postsResolver.Mutation,
        ...commentsResolver.Mutation
    },
    Subscription: {
        ...postsResolver.Subscription
    }
}