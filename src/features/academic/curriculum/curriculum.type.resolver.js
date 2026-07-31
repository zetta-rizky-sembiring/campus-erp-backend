// *************** EXPORT MODULE ***************
module.exports = {
  Block: {
    id(parent) {
      return parent._id.toString();
    },
  },

  Subject: {
    id(parent) {
      return parent._id.toString();
    },
  },

  Test: {
    id(parent) {
      return parent._id.toString();
    },
  },
};