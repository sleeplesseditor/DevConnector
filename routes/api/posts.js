const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');

//Post model
const Post = require('../../models/Post');

//Validation
const validatePostInput = require('../../validation/post');

//ROUTE: GET request to API/posts/test
//DESC: Tests post route
//ACCESS: Public
router.get('/test', (req, res) => res.json({msg: "Posts Works"})
);

//ROUTE: GET request to API/posts
//DESC: Get posts
//ACCESS: Public
router.get('/', (req, res) => {
    Post.find()
        .sort({date: -1})
        .then(posts => res.json(posts))
        .catch(err => 
            res.status(404).json({nopostsfound: 'No posts found'}));
});

//ROUTE: GET request to API/posts/:id
//DESC: Get posts by id
//ACCESS: Public
router.get('/:id', (req, res) => {
    Post.findbyId(req.params.id)
        .then(post => res.json(post))
        .catch(err => 
            res.status(404).json({nopostfound: 'No post found with that ID'}));
});

//ROUTE: POST request to API/posts
//DESC: Create post
//ACCESS: Private
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

module.exports = router;