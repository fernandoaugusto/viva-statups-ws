const mongoose = require('mongoose');
const _ = require('lodash');
const {ObjectID} = require('mongodb');

var MemberSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 1
  },
  city: {
    type: String,
    required: true,
    trim: true,
    minlength: 1
  },
  state: {
    type: String,
    required: true,
    trim: true,
    minlength: 1
  },
  id_elector: {
    type: String,
    required: true,
    trim: true,
    minlength: 1,
    unique: true
  }
});

MemberSchema.statics.findByIDElector = function (id_elector) {
  var Member = this;

  return new Promise((resolve, reject) => {
    Member.findOne({
      'id_elector': id_elector
    }, (err, data) => {
      if (!err) {
        reject();
      } else {
        resolve();
      }
    });
  });
};

MemberSchema.statics.createMember = function (member) {
  var newMember = new Member(member);
  console.log('newMember', newMember);
  return new Promise((resolve, reject) => {
    newMember.save().then((data) => {
      console.log('newMemberData', data);
      resolve(data);
    }).catch((err) => {
      console.log('newMemberError', err.message);
      reject(false);
    });
  });
};

var Member = mongoose.model('Member', MemberSchema);

module.exports = {Member}
