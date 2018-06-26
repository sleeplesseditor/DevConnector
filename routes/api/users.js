const express = require('express');
const router = express.Router();

//ROUTE: GET request to API/users/test
//DESC: Tests Users route
//ACCESS: Public
router.get('/test', (req, res) => res.json({msg: "Users Works"})
);

module.exports = router;