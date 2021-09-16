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
exports.book_create_get = (req, res) => {
    res.send('NOT IMPLEMENTED: Book create GET');
};

// Handle book create on POST.
exports.book_create_post = (req, res) => {
    res.send('NOT IMPLEMENTED: Book create POST');
};

// Display book delete form on GET.
exports.book_delete_get = (req, res) => {
    res.send('NOT IMPLEMENTED: Book delete GET');
};

// Handle book delete on POST.
exports.book_delete_post = (req, res) => {
    res.send('NOT IMPLEMENTED: Book delete POST');
};

// Display book update form on GET.
exports.book_update_get = (req, res) => {
    res.send('NOT IMPLEMENTED: Book update GET');
};

// Handle book update on POST.
exports.book_update_post = (req, res) => {
    res.send('NOT IMPLEMENTED: Book update POST');
};