const express = require('express');
const router = express.Router();
const userController = require('../controllers/user');
const auth = require('../utils/authentication');
const validator = require('../utils/validation');
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Nearby Friends API' });
});

router.post('/login', validator.validate_login, userController.login);
router.post('/signup', validator.validate_signup, userController.signup);
router.post('/import_csv', userController.import_csv);
router.post('/nearby', auth, validator.validate_nearby, userController.users_nearby);
router.post('/view_profile/:id', userController.profile);
router.post('/edit_profile', auth, userController.edit_profile);
module.exports = router;
