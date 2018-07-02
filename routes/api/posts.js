const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');

//Post model
const Post = require('../../models/Post');

//Profile model
const Profile = require('../../models/Profile');

//Validation
const validatePostInput = require('../../validation/post');

//ROUTE:    GET request to API/posts/test
//DESC:     Tests post route
//ACCESS:   Public
router.get('/test', (req, res) => res.json({msg: "Posts Works"})
);

//ROUTE:    GET request to API/posts
//DESC:     Get posts
//ACCESS:   Public
router.get('/', (req, res) => {
    Post.find()
        .sort({date: -1})
        .then(posts => res.json(posts))
        .catch(err => 
            res.status(404).json({nopostsfound: 'No posts found'}));
});

//ROUTE:    GET request to API/posts/:id
//DESC:     Get posts by id
//ACCESS:   Public
router.get('/:id', (req, res) => {
    Post.findbyId(req.params.id)
        .then(post => res.json(post))
        .catch(err => 
            res.status(404).json({nopostfound: 'No post found with that ID'}));
});

//ROUTE:    POST request to API/posts
//DESC:     Create post
//ACCESS:   Private
router.post('/', passport.authenticate('jwt', { session: false }), (req, res) => {
    const { errors, isValid } = validatePostInput(req.body);

    //Check validation
    if(!isValid) {
        //If any errors, send 400 with errors object
        return res.status(400).json(errors);
    }
    
    const newPost = new Post({
        text: req.body.text,
        name: req.body.name,
        avatar: req.body.avatar,
        user: req.user.id
    });

    newPost.save().then(post => res.json(post));
});

//ROUTE:    DELETE request to API/posts/:id
//DESC:     Delete post
//ACCESS:   Private
router.delete(
    '/:id', 
    passport.authenticate('jwt', { session: false }), 
    (req, res) => {
    Profile.findOne({ user: req.user.id })
        .then(profile => {
            Post.findById(req.params.id)
                .then(post => {
                    //Check for post authour
                    if(post.user.toString() !== req.user.id) {
                        return res.status(401).json({ notauthorized: 'User not authorized' });
                    }

                    //Delete
                    post.remove().then(() => res.json({ success: true }));
                })
                .catch(err => res.status(404).json({ postnotfound: 'No post found' }));
        })
});

//ROUTE:    POST request to API/posts/like/:id
//DESC:     Like post
//ACCESS:   Private
router.post(
    '/like/:id', 
    passport.authenticate('jwt', { session: false }), 
    (req, res) => {
    Profile.findOne({ user: req.user.id })
        .then(profile => {
            Post.findById(req.params.id)
                .then(post => {
                    if(
                        post.likes.filter(like => like.user.toString() === req.user.id)
                            .length > 0
                    ) {
                        return res
                            .status(400)
                            .json({ alreadyliked: 'User already liked this post' });
                    }

                    //Add user id to likes array
                    post.likes.unshift({ user: req.user.id });

                    post.save().then(post => res.json(post));
                })
                .catch(err => res.status(404).json({ postnotfound: 'No post found' }));
        })
});

//ROUTE:    POST request to API/posts/unlike/:id
//DESC:     Unlike post
//ACCESS:   Private
router.post(
    '/unlike/:id', 
    passport.authenticate('jwt', { session: false }), 
    (req, res) => {
    Profile.findOne({ user: req.user.id })
        .then(profile => {
            Post.findById(req.params.id)
                .then(post => {
                    if(post.likes.filter(like => like.user.toString() === req.user.id)
                        .length === 0
                    ) {
                        return res
                            .status(400)
                            .json({ notliked: 'You have not yet liked this post' });
                    }

                    //Get remove index
                    const removeIndex = post.likes 
                        .map(item => item.user.toString())
                        .indexOf(req.user.id);
                    
                    //Splice out of array
                    post.likes.splice(removeIndex, 1);

                    //Save
                    post.save().then(post => res.json(post));
                })
                .catch(err => res.status(404).json({ postnotfound: 'No post found' }));
        })
});

//ROUTE:    POST request to API/posts/comment/:id
//DESC:     Add comment to post
//ACCESS:   Private
router.post(
    '/comment/:id', 
    passport.authenticate('jwt', { session: false }), 
    (req, res) => {
        const { errors, isValid } = validatePostInput(req.body);

        //Check validation
        if(!isValid) {
            //If any errors, send 400 with errors object
            return res.status(400).json(errors);
        }

        Post.findbyId(req.params.id)
            .then(post => {
                const newComment = {
                    text: req.body.text,
                    name: req.body.name,
                    avatar: req.body.avatar,
                    user: req.user.id
                }

                //Add to comments array
                post.comments.unshift(newComment);

                //Save
                post.save().then(post => res.json(post))
            })
            .catch(err => res.status(404).json({ postnotfound: 'No post found' }));
});

//ROUTE:    DELETE request to API/posts/comment/:id/:comment_id
//DESC:     Remove comment from post
//ACCESS:   Private
router.delete(
    '/comment/:id/:comment_id', 
    passport.authenticate('jwt', { session: false }), 
    (req, res) => {
        Post.findbyId(req.params.id)
            .then(post => {
                //Check to see if comment exists
                if(
                    post.comments.filter(
                        comment => comment._id.toString() === req.params.comment_id
                    ).length === 0
                ) {
                    return res
                        .status(404)
                        .json({ commentnotexists: 'Comment does not exist' });
                }

                //Get remove index
                const removeIndex = post.comments
                    .map(item => item._id.toString())
                    .indexOf(req.params.comment_id);
                
                //Splice comment out of array
                post.comments.splice(removeIndex, 1);

                post.save().then(post => res.json(post))
            })
            .catch(err => res.status(404).json({ postnotfound: 'No post found' }));
});

module.exports = router;