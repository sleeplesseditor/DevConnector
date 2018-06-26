const express = require('express');
const router = express.Router();

//ROUTE: GET request to API/posts/test
//DESC: Tests post route
//ACCESS: Public
router.get('/test', (req, res) => res.json({msg: "Posts Works"})
);

module.exports = router;