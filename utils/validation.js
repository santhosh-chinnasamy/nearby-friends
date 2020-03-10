const validator = require('express-validator');

exports.validate_login = [
    validator.check('username').not().isEmpty().withMessage('username must not be empty'),
    validator.check('password').not().isEmpty().withMessage('password must not be empty'),
    function (req, res, next) {
        let errors = validator.validationResult(req).array();
        if (errors.length != 0) {
            res.json({ 'message': errors[0].msg, 'status': 198 });
        } else next()
    }
];

exports.validate_nearby = [
    validator.check('type').not().isEmpty().withMessage('type must not be empty'),
    function (req, res, next) {
        let errors = validator.validationResult(req).array();
        if (errors.length != 0) {
            res.json({ 'message': errors[0].msg, 'status': 198 });
        } else next()
    }
];

exports.validate_signup = [
    validator.check('username').not().isEmpty().withMessage('username must not be empty'),
    validator.check('password').not().isEmpty().withMessage('password must not be empty'),
    validator.check('place').not().isEmpty().withMessage('place must not be empty'),
    validator.check('latitude').not().isEmpty().withMessage('latitude must not be empty'),
    validator.check('longitude').not().isEmpty().withMessage('longitude must not be empty')
];