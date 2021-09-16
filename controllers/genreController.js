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
    res.send('NOT IMPLEMENTED: Genre create GET');
};

// Handle Genre create on POST.
exports.genre_create_post = (req, res) => {
    res.send('NOT IMPLEMENTED: Genre create POST');
};

// Display Genre delete form on GET.
exports.genre_delete_get = (req, res) => {
    res.send('NOT IMPLEMENTED: Genre delete GET');
};

// Handle Genre delete on POST.
exports.genre_delete_post = (req, res) => {
    res.send('NOT IMPLEMENTED: Genre delete POST');
};

// Display Genre update form on GET.
exports.genre_update_get = (req, res) => {
    res.send('NOT IMPLEMENTED: Genre update GET');
};

// Handle Genre update on POST.
exports.genre_update_post = (req, res) => {
    res.send('NOT IMPLEMENTED: Genre update POST');
};