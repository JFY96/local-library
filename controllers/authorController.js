const { body, validationResult } = require('express-validator');

const Author = require('../models/author');
const Book = require('../models/book');

// Display list of all authors
exports.author_list = (req, res, next) => {
	Author.find()
		.sort([['family_name', 'asc']])
		.exec()
		.then(list_authors => {
			res.render('author_list', { title: 'Author List', author_list: list_authors });
		})
		.catch(err => next(err));
};

// Display detail page for specific author
exports.author_detail = (req, res, next) => {
	Promise.all([
		Author.findById(req.params.id)
			.exec(),
		Book.find({ 'author': req.params.id }, 'title summary')
			.exec(),
	])
		.then(([author, author_books]) => {
			if (author === null) {
				const err = new Error('Author not found');
				err.status = 404;
				return next(err);
			}
			res.render('author_detail', {
				title: 'Author Detail',
				author,
				author_books,
			});
		})
		.catch(err => next(err));
};

// Display author create form on GET
exports.author_create_get = (req, res) => {
	res.render('author_form', { title: 'Create Author' });
};

// Handle author create on POST
exports.author_create_post = [
	// Validate and sanitize fields
	body('first_name')
		.trim()
		.isLength({ mine: 1 })
		.escape()
		.withMessage('First name must be specified')
		.isAlphanumeric()
		.withMessage('First name has non-alphanumeric characters.'),
	body('family_name')
		.trim()
		.isLength({ mine: 1 })
		.escape()
		.withMessage('Family name must be specified')
		.isAlphanumeric()
		.withMessage('Family name has non-alphanumeric characters.'),
	body('date_of_birth', 'Invalid date of birth')
		.optional({ checkFalsy: true })
		.isISO8601()
		.toDate(),
	body('date_of_death', 'Invalid date of death')
		.optional({ checkFalsy: true })
		.isISO8601()
		.toDate(),
	// Process request after validation and sanitization
	(req, res, next) => {
		// Extract validation errors from a request
		const errors = validationResult(req);

		if (!errors.isEmpty()) {
			// There are errors, so render the form again with sanitized values/error messages
			res.render('author_form', { title: 'Create Author', author: req.body, errors: errors.array() })
			return;
		} else {
			// Data from form is valid

			// Create an Author object
			const author = new Author(
				{
					first_name: req.body.first_name,
					family_name: req.body.family_name,
					date_of_birth: req.body.date_of_birth,
					date_of_death: req.body.date_of_death,
				}
			);
			author.save()
				.then(() => {
					// successful so redirect to new author record
					res.redirect(author.url);
				})
				.catch(err => next(err));
		}
	},
];

// Display author delete form on GET
exports.author_delete_get = (req, res, next) => {
	Promise.all([
		Author.findById(req.params.id).exec(),
		Book.find({ 'author': req.params.id }).exec(),
	])
		.then(([author, author_books]) => {
			if (author === null) { // No results
				res.redirect('/catalog/authors');
			}
			res.render('author_delete', {
				title: 'Delete Author',
				author,
				author_books,
			});
		})
		.catch(err => next(err));
};

// Handle author delete on POST
exports.author_delete_post = (req, res, next) => {
	Promise.all([
		Author.findById(req.params.authorid).exec(),
		Book.find({ 'author': req.params.authorid }).exec(),
	])
		.then(([author, author_books]) => {
			if (author_books.length > 0) { // Author has books, so render in same way as GET route
				res.render('author_delete', {
					title: 'Delete Author',
					author,
					author_books,
				});
			} else {
				// Author has no books. Delete object and redirect to the list of authors.
            Author.findByIdAndRemove(req.body.authorid)
					.then(() => {
						// Success - go to author list
						res.redirect('/catalog/authors');
					})
					.catch(err => next(err));
			}
		})
		.catch(err => next(err));
};

// Display author update form on GET
exports.author_update_get = (req, res, next) => {
	Author.findById(req.params.id)
		.then((author) => {
			if (author === null) { // No results
				res.redirect('/catalog/authors');
			}
			res.render('author_form', {
				title: 'Update Author',
				author,
			});
		})
		.catch(err => next(err));
};

// Handle author update on POST
exports.author_update_post = [
	// Validate and sanitize fields
	body('first_name')
		.trim()
		.isLength({ mine: 1 })
		.escape()
		.withMessage('First name must be specified')
		.isAlphanumeric()
		.withMessage('First name has non-alphanumeric characters.'),
	body('family_name')
		.trim()
		.isLength({ mine: 1 })
		.escape()
		.withMessage('Family name must be specified')
		.isAlphanumeric()
		.withMessage('Family name has non-alphanumeric characters.'),
	body('date_of_birth', 'Invalid date of birth')
		.optional({ checkFalsy: true })
		.isISO8601()
		.toDate(),
	body('date_of_death', 'Invalid date of death')
		.optional({ checkFalsy: true })
		.isISO8601()
		.toDate(),
	// Process request after validation and sanitization
	(req, res, next) => {
		// Extract validation errors from a request
		const errors = validationResult(req);

		// Create an Author object
		const author = new Author({
			_id: req.params.id,
			first_name: req.body.first_name,
			family_name: req.body.family_name,
			date_of_birth: req.body.date_of_birth,
			date_of_death: req.body.date_of_death,
		});

		if (!errors.isEmpty()) {
			// There are errors, so render the form again with sanitized values/error messages
			res.render('author_form', {
				title: 'Update Author',
				author,
				errors: errors.array(),
			});
			return;
		} else {
			// Data from form is valid. Update the record
			Author.findByIdAndUpdate(req.params.id, author)
				.then(updatedAuthor => {
					// Successful - redirect to detail page
					res.redirect(updatedAuthor.url);
				})
				.catch(err => next(err));
		}
	},
];