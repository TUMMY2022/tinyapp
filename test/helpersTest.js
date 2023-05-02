const { assert } = require('chai');

const { emailChecher } = require('../outer/helpers.js');

describe('emailChecher', function() {
  const testUsers = {
    'userRandomID': {
      id: 'userRandomID',
      name: 'user1',
      email: 'user1@example.com',
      password: 'user1p'
    },
    'user2RandomID': {
      id: 'user2RandomID',
      name: 'user2',
      email: 'user2@example.com',
      password: 'user2p'
    }
  };

  it('return a user with valid email', function() {
    const user = emailChecher("user1@example.com", testUsers)
    const expectedUser = testUsers['userRandomID'];
    assert.deepEqual(user, expectedUser)
  })

  it('return null with invalid email', function() {
    const user = emailChecher("user55@example.com", testUsers)
    const expectedUser = null;
    assert.deepEqual(user, expectedUser)
  })

  it('should return null if empty string', function() {
    const user = emailChecher("", testUsers)
    const expectedUser = null;
    assert.deepEqual(user, expectedUser)
  })
});