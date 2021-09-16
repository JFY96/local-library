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
	res.send('NOT IMPLEMENTED: Author create GET');
};

// Handle author create on POST
exports.author_create_post = (req, res) => {
	res.send('NOT IMPLEMENTED: Author create POST');
};

// Display author delete form on GET
exports.author_delete_get = (req, res) => {
	res.send('NOT IMPLEMENTED: Author delete GET');
};

// Handle author delete on POST
exports.author_delete_post = (req, res) => {
	res.send('NOT IMPLEMENTED: Author delete POST');
};

// Display author update form on GET
exports.author_update_get = (req, res) => {
	res.send('NOT IMPLEMENTED: Author update GET');
};

// Handle author update on POST
exports.author_update_post = (req, res) => {
	res.send('NOT IMPLEMENTED: Author update POST');
};