// get users page
const bcrypt = require('bcrypt');

const User = require('../models/People');
const path = require('path')
const { unlink } = require('fs');

// get user page
async function getUsers(req, res, next) {
    try {
        const users = await User.find()
        res.render('users', {
            users: users
        })
    } catch (err) {
        next(err)
    }
    
}

// add user
async function addUser (req, res, next) {
    let newUser;
    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    if(req.files && req.files.length > 0){
        newUser = new User({
            ...req.body,
            avatar: req.files[0].filename,
            password: hashedPassword
        })
    } else {
        newUser = new User({
            ...req.body,
            password: hashedPassword
        })
    }

    // save user or send error
    try {
        const result = await newUser.save()
        res.status(200).json({
            message: "User was added successfully"
        })
    } catch (err){
        res.status(500).json({
            errors: {
                common: {
                    msg: 'Unknow error occured!'
                }
            }
        })
    }
}

async function removeUser(req, res, next) {
    try {
        const user = await User.findByIdAndDelete({
            _id: req.params.id
        })

        // remove avatar
        if(user.avatar){
            unlink(
                path.join(__dirname, `/../public/uploads/avatars/${user.avatar}`),
                (err) => {
                   if (err) console.log(err)
                }
            )
        }
        res.status(200).json({
            message: "User was removed successfully"
        })
    } catch (err) {
        res.status(500).json({
            errors: {
                common: {
                    msg: 'User unable to delete!'
                }
            }
        })
    }
}

module.exports = {
    getUsers,
    addUser,
    removeUser
}