const mongoose = require('mongoose')
const Schema = mongoose.Schema

const userSchema = new Schema({
	username: {
		type: String,
		required: [true],
		unique: true,
		trim: true
	},
	password: {
		type: String,
		required: true
	},
	place: {
		type: String
	},
	location: {
		type: { type: String, default: "Point" },
		coordinates: { type: [Number], default: [0, 0] }
	}
});
const User = mongoose.model('user', userSchema);
module.exports = User;