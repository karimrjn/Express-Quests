const { body, validationResult } = require('express-validator');

const validateMovie = [
  body('title').notEmpty().isLength({ max: 255 }).withMessage('Should contain less than 255 characters'),
  body('director').notEmpty().withMessage('This field is required'),
  body('year').notEmpty().withMessage('This field is required'),
  body('color').notEmpty().withMessage('This field is required'),
  body('duration').notEmpty().withMessage('This field is required'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ validationErrors: errors.array() });
    }
    next();
  }
];

module.exports = validateMovie;
