const express = require('express');
const router = express.Router();
const userController = require('../controllers/user');
const auth = require('../utils/authentication');

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/login', userController.login);
router.post('/signup', userController.signup);
router.post('/import_csv', userController.import_csv);
router.post('/friends', auth, userController.users_nearme);
router.post('/view_profile', auth, userController.profile);
router.post('/edit_profile', auth, userController.edit_profile);
module.exports = router;
