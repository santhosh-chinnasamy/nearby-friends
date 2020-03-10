const _ = require('lodash');
const md5 = require('md5')
const forEach = require('async-foreach').forEach;
const User = require('../models/user');

exports.parse_data = (data, file_no) => {
    return new Promise((resolve, reject) => {
        let errors = []
        forEach(data, async (el, index) => {
            let values = _.values(el)
            if (_.every(['username', 'latitude', 'longitude', 'password', 'place'], _.partial(_.has, el)) && !(values.includes(''))) {
                el.location = { type: "Point", coordinates: [parseFloat(el.latitude), parseFloat(el.longitude)] };
                el.username = (el.username).toLowerCase();
                el.password = md5(el.password)
                delete el.latitude
                delete el.longitude
                await User.updateOne({ username: el.username }, { $set: el }, { upsert: true })
                    .catch((el) => { console.log(el); reject({ status: 199, error: "Error updating document" }) });
            } else {
                if (el.username == undefined || el.username == '') {
                    errors.push(`Invalid username in row ${index + 1} value: ${el.username} (File no: ${file_no + 1})`)
                }
                if (el.password == undefined || el.password == '') {
                    errors.push(`Invalid password in row ${index} value: ${el.password} (File no: ${file_no + 1})`)
                }
                if (el.latitude == '') {
                    errors.push(`Invalid latitude in row ${index} value: ${el.latitude} (File no: ${file_no + 1})`)
                }
                if (el.longitude == '') {
                    errors.push(`Invalid longitude in row ${index} value: ${el.longitude} (File no: ${file_no + 1})`)
                }
                if (el.place == undefined || el.place == '') {
                    errors.push(`Invalid place in row ${index} value: ${el.place} (File no: ${file_no + 1})`)
                }
            }
        }, () => {
            let res = { errors: errors }
            res["status"] = 200;
            resolve(res);
        })
    })
}