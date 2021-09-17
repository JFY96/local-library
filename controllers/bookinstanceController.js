const { body, validationResult } = require('express-validator');

const Book = require('../models/book');
const BookInstance = require('../models/bookinstance');

// Display list of all BookInstances.
exports.bookinstance_list = (req, res, next) => {
	BookInstance.find()
		.populate('book')
		.exec()
		.then(list_bookinstances => {
			res.render('bookinstance_list', { title: 'Book Instance List', bookinstance_list: list_bookinstances });
		})
		.catch(err => next(err));
};

// Display detail page for a specific BookInstance.
exports.bookinstance_detail = (req, res, next) => {
	BookInstance.findById(req.params.id)
		.populate('book')
		.exec()
		.then(bookinstance => {
			if (bookinstance === null) {
				const err = new Error('Book copy not found');
				err.status = 404;
				return next(err);
			}
			res.render('bookinstance_detail', {
				title: `Copy: ${bookinstance.book.title}`,
				bookinstance,
			});
		})
		.catch(err => next(err));
};

// Display BookInstance create form on GET.
exports.bookinstance_create_get = (req, res, next) => {
	Book.find({}, 'title')
		.exec()
		.then(books => {
			res.render('bookinstance_form', { title: 'Create BookInstance', book_list: books });
		})
		.catch(err => next(err));
};

// Handle BookInstance create on POST.
exports.bookinstance_create_post = [
	// Validate and sanitise fields.
	body('book', 'Book must be specified').trim().isLength({ min: 1 }).escape(),
	body('imprint', 'Imprint must be specified').trim().isLength({ min: 1 }).escape(),
	body('status').escape(),
	body('due_back', 'Invalid date').optional({ checkFalsy: true }).isISO8601().toDate(),
	// Process request after validation and sanitization.
	(req, res, next) => {
		// Extract the validation errors from a request.
		const errors = validationResult(req);

		// Create a BookInstance object with escaped and trimmed data.
		const bookinstance = new BookInstance({
			book: req.body.book,
			imprint: req.body.imprint,
			status: req.body.status,
			due_back: req.body.due_back
		});

		if (!errors.isEmpty()) {
			// There are errors. Render form again with sanitized values and error messages.
			Book.find({},'title')
				.exec()
				.then(() => {
					// Successful, so render.
					res.render('bookinstance_form', {
						title: 'Create BookInstance',
						book_list: books,
						selected_book: bookinstance.book._id,
						errors: errors.array(),
						bookinstance: bookinstance
					});
				})
				.catch(err => next(err));
			return;
	  }
	  else {
			// Data from form is valid.
			bookinstance.save()
				.then(() => {
					// Successful - redirect to new record.
					res.redirect(bookinstance.url);
				})
				.catch(err => next(err));
	  }
	},
];

// Display BookInstance delete form on GET.
exports.bookinstance_delete_get = (req, res, next) => {
	BookInstance.findById(req.params.id)
		.populate('book')
		.exec()
		.then(bookinstance => {
			if (bookinstance === null) {
				const err = new Error('Book copy not found');
				err.status = 404;
				return next(err);
			}
			res.render('bookinstance_delete', {
				title: `Delete Book Instance`,
				bookinstance,
			});
		})
		.catch(err => next(err));
};

// Handle BookInstance delete on POST.
exports.bookinstance_delete_post = (req, res, next) => {
	BookInstance.findByIdAndRemove(req.params.id)
		.then(() => {
			// Success - go to bookinstance list
			res.redirect('/catalog/bookinstances');
		})
		.catch(err => next(err));
};

// Display BookInstance update form on GET.
exports.bookinstance_update_get = (req, res, next) => {
	Promise.all([
		Book.find({}, 'title'),
		BookInstance.findById(req.params.id),
	])
		.then(([books, bookinstance]) => {
			res.render('bookinstance_form', {
				title: 'Update BookInstance',
				book_list: books,
				bookinstance,
			});
		})
		.catch(err => next(err));
};

// Handle bookinstance update on POST.
exports.bookinstance_update_post = [
	// Validate and sanitise fields.
	body('book', 'Book must be specified').trim().isLength({ min: 1 }).escape(),
	body('imprint', 'Imprint must be specified').trim().isLength({ min: 1 }).escape(),
	body('status').escape(),
	body('due_back', 'Invalid date').optional({ checkFalsy: true }).isISO8601().toDate(),
	// Process request after validation and sanitization.
	(req, res, next) => {
		// Extract the validation errors from a request.
		const errors = validationResult(req);

		// Create a BookInstance object with escaped and trimmed data.
		const bookinstance = new BookInstance({
			_id: req.params.id,
			book: req.body.book,
			imprint: req.body.imprint,
			status: req.body.status,
			due_back: req.body.due_back
		});

		if (!errors.isEmpty()) {
			// There are errors. Render form again with sanitized values and error messages.
			Promise.all([
				Book.find({}, 'title'),
			])
				.then(([books, bookinstance]) => {
					res.render('bookinstance_form', {
						title: 'Update BookInstance',
						book_list: books,
						bookinstance,
					});
				})
				.catch(err => next(err));
			return;
	  }
	  else {
			// Data from form is valid.
			BookInstance.findByIdAndUpdate(req.params.id, bookinstance)
				.then(theBookInstance => {
					// Successful - redirect to book instance details page
					res.redirect(theBookInstance.url);
				})
				.catch(err => next(err));
	  }
	},
];