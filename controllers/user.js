const jwt = require('jsonwebtoken');
const md5 = require('md5');
const path = require('path');
const fs = require('fs');
const csv = require('csv-parser');
const multer = require('multer');
const User = require('../models/user');
const userUtil = require('../utils/userdata');

// File Upload setting
const storage = multer.diskStorage({
	fileFilter: (req, file, cb) => {
		file.mimetype === 'text/csv' ? cb(null, true) : cb(null, false);
	},
	destination: (req, file, cb) => {
		file.mimetype === 'text/csv' ? cb(null, './uploads') : cb(null, false);
	},
	filename: (req, file, cb) => {
		cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
	}
});

const upload = multer({ storage: storage }).array('file', parseInt(process.env.FILE_COUNT));

// User Login
exports.login = async (req, res) => {
	let { username, password } = req.body;
	password = md5(password);
	const user = await User.findOne({ username, password });
	if (!user) {
		res.json({ status: 199, message: "Invalid Credentials" });
	} else {
		const accessToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
		res.json({ status: 200, message: "Login sucess", details: user, accessToken: accessToken });
	}
};

// User Signup
exports.signup = async (req, res) => {
	const data = req.body;
	data.location = { type: "Point", coordinates: [parseFloat(data.latitude), parseFloat(data.longitude)] };
	data.username = (data.username).toLowerCase();
	data.password = md5(data.password);
	delete data.longitude;
	delete data.latitude;
	let user = await User.updateOne({ username: data.username }, { $set: data }, { upsert: true });
	if (!user) {
		res.json({ status: 199, message: "User adding failed" });
	} else {
		res.json({ status: 200, message: "User added successfully" });
	}
};

// Get user details
exports.profile = async (req, res) => {
	const { id } = req.body;
	console.log(id);
	const user = await User.findById({ _id: id });
	if (!user) {
		res.json({ status: 199, message: "User Id not found" });
		return
	}
	res.json({ status: 200, message: "User details", details: user });
}

// Edit User profile
exports.edit_profile = async (req, res) => {
	const data = req.body;
	const user = await User.findById({ _id: data.id });
	if (!user) {
		res.json({ status: 199, message: "User Id not found" });
		return
	}
	let userData = {
		username: data.username ? (data.username).toLowerCase() : user.username,
		password: data.password ? md5(data.password) : user.password,
		place: data.place ? data.place : user.place,
		"location.coordinates": data.latitude && data.longitude ? [parseFloat(data.latitude), parseFloat(data.longitude)] : user.location.coordinates
	}
	await User.updateOne({ _id: data.id }, { $set: userData }, { upsert: false });
	let result = await User.findById({ _id: data.id });
	res.json({ status: 200, message: "Profile updated successfully", details: result });
}

// Get nearby users list
exports.users_nearme = async (req, res) => {
	let coordinates = [];
	let data = req.body;
	if (data.username)
		data.username = (data.username).toLowerCase();

	if (data.type == 'nearme') {
		let user = await User.findOne({ username: data.username });
		coordinates = user.location.coordinates;
	} else if (data.type == 'points') {
		coordinates = [parseFloat(data.latitude), parseFloat(data.longitude)];
	} else {
		res.json({ status: 199, message: "Type must be nearme or points" });
		return
	}

	let args = [
		{
			$geoNear: {
				near: { type: "Point", coordinates: coordinates },
				distanceField: "distance",
				includeLocs: "location",
				spherical: true
			}
		}
	];

	let nearby_list = await User.aggregate(args);
	res.json({ status: 200, message: "Neearby users list", list: nearby_list.length });
}

// Import users from csv
exports.import_csv = (req, res) => {
	upload(req, res, (err) => {
		if (req.files.length == 0) {
			res.json({ status: 199, message: "Kindly upload csv file" });
			return
		}
		if (err) {
			console.log(err)
			res.json({ status: 199, message: "Something went wrong, Try again!" });
			return
		}
		else {
			let errors = [];
			let users = [];
			req.files.forEach(async (el, index) => {
				fs.createReadStream(el.path)
					.pipe(csv())
					.on('data', (data) => users.push(data))
					.on('end', () => {
						fs.unlink(el.path, async (err) => {
							if (err) console.log(err);
							let result = await userUtil.parse_data(users, index)

							if (result.status == 199) {
								res.json({ message: "Error inserting Users in database", status: 199 })
							} else if (result.status == 200) {
								let err = result.errors
								errors = [...errors, ...err]
							}
							if (index == (req.files.length - 1)) {
								res.json({ message: "Users Imported successfully", status: 200, errors: errors })
							}
						})
					});
			});
		}
	});
}