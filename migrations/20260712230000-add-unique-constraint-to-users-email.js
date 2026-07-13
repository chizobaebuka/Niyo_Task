'use strict';

module.exports = {
  up: async (queryInterface) => {
    await queryInterface.addConstraint('Users', {
      fields: ['email'],
      type: 'unique',
      name: 'users_email_unique',
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeConstraint('Users', 'users_email_unique');
  },
};
