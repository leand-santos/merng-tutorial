const { AuthenticationError } = require('apollo-server')

const Post = require('../../models/Post')
const checkAuth = require('../../utils/checkAuth')

module.exports = {
    Query: {
        getPosts: async () => {
            try {
                const posts = await Post.find().sort({ createdAt: -1 })
                return posts
            } catch (e) {
                throw new Error(e)
            }
        },
        async getPost(_, { postId }) {
            try {
                const post = await Post.findById(postId)
                if (!post)
                    throw new Error('Post not found')

                return post
            } catch (e) {
                throw new Error(e)
            }
        }
    },
    Mutation: {
        async createPost(_, { body }, context) {
            const user = checkAuth(context)

            if (body.trim() === '') {
                throw new Error('Post must not be empty')
            }

            const newPost = new Post({
                body,
                user: user.id,
                username: user.username,
                createdAt: new Date().toISOString()
            })

            const post = await newPost.save()

            context.pubsub.publish('NEW_POST', {
                newPost: post
            })

            return post
        },
        async deletePost(_, { postId }, context) {
            const user = checkAuth(context)

            try {
                const post = await Post.findById(postId)
                if (user.username === post.username) {
                    await post.deleteOne()
                    return 'Post deleted successfully'
                }
                throw new AuthenticationError('Action not allowed')
            } catch (e) {
                throw new Error(e)
            }
        }
    },
    Subscription: {
        newPost: {
            subscribe: (_, __, { pubsub }) => pubsub.asyncIterator('NEW_POST')
        }
    }
}