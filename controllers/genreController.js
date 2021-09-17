const { body, validationResult } = require('express-validator');

const Genre = require('../models/genre');
const Book = require('../models/book');

// Display list of all Genre.
exports.genre_list = (req, res) => {
	Genre.find()
		.sort([['name', 'asc']])
		.exec()
		.then(list_genres => {
			res.render('genre_list', { title: 'Genre List', genre_list: list_genres });
		})
		.catch(err => next(err));
};

// Display detail page for a specific Genre.
exports.genre_detail = (req, res, next) => {
	Promise.all([
		Genre.findById(req.params.id).exec(),
		Book.find({ 'genre': req.params.id }).exec(),
	])
	.then(([genre, genre_books]) => {
		if (genre === null) { // No results
			const err = new Error('Genre not found');
			err.status = 404;
			return next(err);
		}
		// Successful so render
		res.render('genre_detail', {
			title: 'Genre Detail',
			genre,
			genre_books,
		});
	})
	.catch(err => next(err));
};

// Display Genre create form on GET.
exports.genre_create_get = (req, res) => {
	res.render('genre_form', { title: 'Create Genre' });
};

// Handle Genre create on POST.
exports.genre_create_post = [
	// Validate and sanitize the name field
	body('name', 'Genre name required')
		.trim()
		.isLength({ min: 1 })
		.escape(),
	// Process request after validation and sanitization
	(req, res, next) => {
		// Extract validation errors from a request
		const errors = validationResult(req);

		// Create genre object with escaped and trimmed data
		const genre = new Genre(
			{ name: req.body.name }
		);

		if (!errors.isEmpty()) {
			// There are errors, so render the form again with sanitized values/error messages
			res.render('genre_form', { title: 'Create Genre', genre, errors: errors.array() })
			return;
		} else {
			// Data from form is valid

			// Check if Genre of same name exists
			Genre.findOne({ 'name': req.body.name })
				.exec()
				.then(found_genre => {
					if (found_genre) {
						// Genre exists, so redirect to its detail page
						res.redirect(found_genre.url);
					} else {
						genre.save()
							.then(() => {
								// Genre saved. Redirect to genre detail page
								res.redirect(genre.url);
							})
							.catch(err => next(err));
					}
				})
				.catch(err => next(err));
		}
	},
];

// Display Genre delete form on GET.
exports.genre_delete_get = (req, res, next) => {
	Promise.all([
		Genre.findById(req.params.id),
		Book.find({ 'genre': req.params.id }),
	])
		.then(([genre, genre_books]) => {
			if (genre === null) { // No results
				res.redirect('/catalog/genres');
			}
			res.render('genre_delete', {
				title: 'Delete Genre',
				genre,
				genre_books,
			});
		})
		.catch(err => next(err));
};

// Handle Genre delete on POST.
exports.genre_delete_post = (req, res, next) => {
	Promise.all([
		Genre.findById(req.params.id),
		Book.find({ 'genre': req.params.id }),
	])
		.then(([genre, genre_books]) => {
			if (genre_books.length > 0) { // Genre has books, so render in same way as GET route
				res.render('genre_delete', {
					title: 'Delete Genre',
					genre,
					genre_books,
				});
			} else {
				// Genre has no books. Delete object and redirect to the list of genres.
            Genre.findByIdAndRemove(req.body.id)
					.then(() => {
						// Success - go to genre list
						res.redirect('/catalog/genres');
					})
					.catch(err => next(err));
			}
		})
		.catch(err => next(err));
};

// Display Genre update form on GET.
exports.genre_update_get = (req, res, next) => {
	Genre.findById(req.params.id)
		.then(genre => {
			if (genre === null) { // No results
				res.redirect('/catalog/genres');
			}
			res.render('genre_form', {
				title: 'Update Genre',
				genre,
			});
		});
};

// Handle Genre update on POST.
exports.genre_update_post = [
	// Validate and sanitize the name field
	body('name', 'Genre name required')
		.trim()
		.isLength({ min: 1 })
		.escape(),
	// Process request after validation and sanitization
	(req, res, next) => {
		// Extract validation errors from a request
		const errors = validationResult(req);

		// Create genre object with escaped and trimmed data
		const genre = new Genre({
			_id: req.params.id,
			name: req.body.name,
		});

		if (!errors.isEmpty()) {
			// There are errors, so render the form again with sanitized values/error messages
			res.render('genre_form', {
				title: 'Update Genre',
				genre,
				errors: errors.array()
			});
			return;
		} else {
			// Data from form is valid. Update the record
			Genre.findByIdAndUpdate(req.params.id, genre)
				.then(updatedGenre => {
					// Successful - redirect to detail page
					res.redirect(updatedGenre.url);
				})
				.catch(err => next(err));
		}
	},
];