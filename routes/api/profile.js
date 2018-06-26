const express = require('express');
const router = express.Router();

//ROUTE: GET request to API/profile/test
//DESC: Tests profile route
//ACCESS: Public
router.get('/test', (req, res) => res.json({msg: "Profile Works"})
);

module.exports = router;