const mongoose = require('mongoose');
const Seat = require('../../models/Seat'); // Imports your Seat Model

describe('Seat Model Unit Test', () => {
  
  // Test 1: It should fail if we try to save a seat without a Row
  test('Should validate that Row is required', async () => {
    const seat = new Seat({ number: 1, price: 1000 }); // Missing 'row'
    
    let err;
    try {
      await seat.validate();
    } catch (error) {
      err = error;
    }
    
    expect(err).toBeDefined();
    expect(err.errors.row).toBeDefined(); // Expects an error about 'row'
  });

  // Test 2: It should fail if we try to save a seat without a Number
  test('Should validate that Seat Number is required', async () => {
    const seat = new Seat({ row: 'A', price: 1000 }); // Missing 'number'
    
    let err;
    try {
      await seat.validate();
    } catch (error) {
      err = error;
    }
    
    expect(err).toBeDefined();
    expect(err.errors.number).toBeDefined();
  });

  // Test 3: It should pass if everything is correct
  test('Should accept a valid seat', async () => {
    const seat = new Seat({ row: 'A', number: 1, price: 1500, status: 'available' });
    
    let err;
    try {
      await seat.validate();
    } catch (error) {
      err = error;
    }
    
    expect(err).toBeUndefined(); // No error means success
  });
});