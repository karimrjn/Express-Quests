const { body, validationResult } = require('express-validator');

const validateUser = [
  body('email').isEmail().withMessage('Invalid email'),

  (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({ validationErrors: errors.array() });
    }

    next();
  }
];

module.exports = validateUser;