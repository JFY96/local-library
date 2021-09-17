const mongoose = require('mongoose');
const { DateTime } = require('luxon');

const Schema = mongoose.Schema;

const BookInstanceSchema = new Schema(
	{
		book: { // Reference to the associated book
			type: Schema.Types.ObjectId,
			ref: 'Book',
			required: true,
		},
		imprint: {
			type: String,
			required: true,
		},
		status: {
			type: String,
			required: true,
			enum: ['Available', 'Maintenance', 'Loaned', 'Reserved'],
			default: 'Maintenance',
		},
		due_back: {
			type: Date,
			default: Date.now(),
		},
	}
);

// Virtual for bookinstance's URL
BookInstanceSchema
	.virtual('url')
	.get(function(){
		return `/catalog/bookinstance/${this._id}`;
	});

// Virtual for due_back dates formatted
BookInstanceSchema
	.virtual('due_back_formatted')
	.get(function () {
		return DateTime.fromJSDate(this.due_back).toLocaleString(DateTime.DATE_MED);
	});
BookInstanceSchema
	.virtual('due_back_formatted_short')
	.get(function () {
		return DateTime.fromJSDate(this.due_back).toFormat('yyyy-LL-dd');
	});

// Export model
module.exports = mongoose.model('BookInstance', BookInstanceSchema);