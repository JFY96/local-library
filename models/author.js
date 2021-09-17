const mongoose = require('mongoose');
const { DateTime } = require('luxon');

const Schema = mongoose.Schema;

const AuthorSchema = new Schema(
	{
		first_name: {
			type: String,
			required: true,
			maxlength: 100,
		},
		family_name: {
			type: String,
			required: true,
			maxlength: 100,
		},
		date_of_birth: Date,
		date_of_death: Date,
	}
);

// Virtual for author full name
AuthorSchema
	.virtual('name')
	.get(function(){
		return `${this.family_name}, ${this.first_name}`;
	});

// Virtual for authors lifespan
AuthorSchema
	.virtual('lifespan')
	.get(function() {
		let lifetimeString = '';
		if (this.date_of_birth) lifetimeString = DateTime.fromJSDate(this.date_of_birth).toLocaleString(DateTime.DATE_MED);
		if (lifetimeString && this.date_of_death) lifetimeString += ' - ';
		if (this.date_of_death) lifetimeString += DateTime.fromJSDate(this.date_of_death).toLocaleString(DateTime.DATE_MED);
		return lifetimeString;
	});

// Virtual for author's URL
AuthorSchema
	.virtual('url')
	.get(function(){
		return `/catalog/author/${this._id}`;
	});

// Virtual for date of birth/death formatted in form yyyy-mm-dd
AuthorSchema
	.virtual('date_of_birth_formatted')
	.get(function() {
		return DateTime.fromJSDate(this.date_of_birth).toFormat('yyyy-LL-dd');
	});
AuthorSchema
	.virtual('date_of_death_formatted')
	.get(function() {
		return DateTime.fromJSDate(this.date_of_death).toFormat('yyyy-LL-dd');
	});

// Export model
module.exports = mongoose.model('Author', AuthorSchema);