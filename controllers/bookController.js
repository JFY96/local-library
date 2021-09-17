const { body, validationResult } = require('express-validator');

const Book = require('../models/book');
const Author = require('../models/author');
const Genre = require('../models/genre');
const BookInstance = require('../models/bookinstance');

exports.index = (req, res, next) => {
	Promise.all([
		Book.countDocuments({}),
		BookInstance.countDocuments({}),
		BookInstance.countDocuments({ status: 'Available' }),
		Author.countDocuments({}),
		Genre.countDocuments({}),
	])
	.then(counts => {
		const keys = [
			'book_count',
			'book_instance_count',
			'book_instance_available_count',
			'author_count',
			'genre_count',
		];
		const results = keys.reduce((obj, key, index) => {
			obj[key] = counts[index];
			return obj;
		}, {});

		res.render('index', { title: 'Local Library Home', data: results });
	})
	.catch(err => next(err));
};

// Display list of all books.
exports.book_list = (req, res, next) => {
    Book
	 	.find({}, 'title author')
	 	.populate('author')
		.exec()
		.then(list_books => {
			res.render('book_list', { title: 'Book List', book_list: list_books });
		})
		.catch(err => next(err));
};

// Display detail page for a specific book.
exports.book_detail = (req, res, next) => {
	Promise.all([
		Book.findById(req.params.id)
			.populate('author')
			.populate('genre')
			.exec(),
		BookInstance.find({ 'book': req.params.id })
			.exec(),
	])
		.then(([book, book_instances]) => {
			if (book === null) {
				const err = new Error('Book not found');
				err.status = 404;
				return next(err);
			}
			res.render('book_detail', {
				title: book.title,
				book,
				book_instances,
			})
		})
		.catch(err => next(err));
};

// Display book create form on GET.
exports.book_create_get = (req, res, next) => {
	Promise.all([
		Author.find(),
		Genre.find(),
	])
		.then(([authors, genres]) => {
			res.render('book_form', { title: 'Create Book', authors, genres });
		})
		.catch(err => next(err));
};

// Handle book create on POST.
exports.book_create_post = [
	// Convert the genre to an array.
	(req, res, next) => {
		if(!(req.body.genre instanceof Array)){
			if (typeof req.body.genre ==='undefined') req.body.genre = [];
			else req.body.genre = new Array(req.body.genre);
	  }
	  next();
	},
	// Validate and sanitise fields.
	body('title', 'Title must not be empty.').trim().isLength({ min: 1 }).escape(),
	body('author', 'Author must not be empty.').trim().isLength({ min: 1 }).escape(),
	body('summary', 'Summary must not be empty.').trim().isLength({ min: 1 }).escape(),
	body('isbn', 'ISBN must not be empty').trim().isLength({ min: 1 }).escape(),
	body('genre.*').escape(),
	// Process request after validation and sanitization.
	(req, res, next) => {
		// Extract the validation errors from a request.
		const errors = validationResult(req);

		// Create a Book object with escaped and trimmed data.
		const book = new Book({
			title: req.body.title,
			author: req.body.author,
			summary: req.body.summary,
			isbn: req.body.isbn,
			genre: req.body.genre,
		});

		if (!errors.isEmpty()) {
			// There are errors. Render form again with sanitized values/error messages
			Promise.all([
				Author.find(),
				Genre.find(),
			])
				.then(([authors, genres]) => {
					// Mark our selected genres as checked.
					for (let i = 0; i < results.genres.length; i++) {
						if (book.genre.indexOf(results.genres[i]._id) > -1) {
							results.genres[i].checked='true';
						}
					}

					res.render('book_form', {
						title: 'Create Book',
						authors,
						genres,
						book,
						errors: errors.array(),
					});
				})
				.catch(err => next(err));
		} else {
			// Data from form is valid so save
			book.save()
				.then(() => {
					res.redirect(book.url);
				})
				.catch(err => next(err));
		}
	},
]

// Display book delete form on GET.
exports.book_delete_get = (req, res, next) => {
	Promise.all([
		Book.findById(req.params.id)
			.populate('author')
			.exec(),
		BookInstance.find({ 'book': req.params.id }),
	])
		.then(([book, book_instances]) => {
			if (book === null) { // No results, redirect to book list
				res.redirect('/catalog/books');
			}
			res.render('book_delete', {
				title: 'Delete Book',
				book,
				book_instances,
			});
		})
		.catch(err => next(err));
};

// Handle book delete on POST.
exports.book_delete_post = (req, res, next) => {
	Promise.all([
		Book.findById(req.params.id),
		BookInstance.find({ 'book': req.params.id }),
	])
		.then(([book, book_instances]) => {
			if (book_instances.length > 0) { // Book has instances, so render in same way as GET route
				res.render('book_delete', {
					title: 'Delete Book',
					book,
					book_instances,
				});
			} else {
				// Book has no instances. Delete object and redirect to the list of books.
            Book.findByIdAndRemove(req.body.id)
					.then(() => {
						// Success - go to book list
						res.redirect('/catalog/books')
					})
					.catch(err => next(err));
			}
		})
		.catch(err => next(err));
};

// Display book update form on GET.
exports.book_update_get = (req, res, next) => {
	// Get book, authors, and genres for form
	Promise.all([
		Book.findById(req.params.id)
			.populate('author')
			.populate('genre')
			.exec(),
		Author.find(),
		Genre.find(),
	]).then(([book, authors, genres]) => {
		if (book === null) { // No results.
			const err = new Error('Book not found');
			err.status = 404;
			return next(err);
		}
		// Success. Mark our selected genres as checked.
		for (let all_g_iter = 0; all_g_iter < genres.length; all_g_iter++) {
			for (let book_g_iter = 0; book_g_iter < book.genre.length; book_g_iter++) {
				if (genres[all_g_iter]._id.toString()===book.genre[book_g_iter]._id.toString()) {
					genres[all_g_iter].checked='true';
				}
			}
		}
		res.render('book_form', {
			title: 'Update Book',
			authors,
			genres,
			book
		});
	})
	.catch(err => next(err));
};

// Handle book update on POST.
exports.book_update_post = [
	// Convert the genre to an array
	(req, res, next) => {
		if (!(req.body.genre instanceof Array)) {
			if (typeof req.body.genre==='undefined') req.body.genre=[];
			else req.body.genre=new Array(req.body.genre);
		}
		next();
	},
	// Validate and sanitise fields.
	body('title', 'Title must not be empty.').trim().isLength({ min: 1 }).escape(),
	body('author', 'Author must not be empty.').trim().isLength({ min: 1 }).escape(),
	body('summary', 'Summary must not be empty.').trim().isLength({ min: 1 }).escape(),
	body('isbn', 'ISBN must not be empty').trim().isLength({ min: 1 }).escape(),
	body('genre.*').escape(),
	// Process request after validation and sanitization.
	(req, res, next) => {
		// Extract the validation errors from a request.
		const errors = validationResult(req);

		// Create a Book object with escaped/trimmed data and old id.
		const book = new Book({
			_id: req.params.id, // This is required, or a new ID will be assigned!
			title: req.body.title,
			author: req.body.author,
			summary: req.body.summary,
			isbn: req.body.isbn,
			genre: (typeof req.body.genre==='undefined') ? [] : req.body.genre,
		});

		if (!errors.isEmpty()) {
			// There are errors. Render form again with sanitized values/error messages.
			Promise.all([
				Author.find(),
				Genre.find(),
			]).then(([authors, genres]) => {
				// Mark our selected genres as checked
				for (let i = 0; i < genres.length; i++) {
					if (book.genre.indexOf(genres[i]._id) > -1) {
						genres[i].checked = 'true';
					}
				}
				res.render('book_form', {
					title: 'Update Book',
					authors,
					genres,
					book,
					errors: errors.array(),
				});
			})
			.catch(err => next(err));
		} else {
			// Data from form is valid. Update the record
			Book.findByIdAndUpdate(req.params.id, book)
				.then(thebook => {
					// Successful - redirect to book detail page
					res.redirect(thebook.url);
				})
				.catch(err => next(err));
		}
	},
]