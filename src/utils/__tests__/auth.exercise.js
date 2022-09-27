// Testing Pure Functions

// 🐨 import the function that we're testing
import cases from 'jest-in-case'
import {isPasswordAllowed} from '../auth'

// 🐨 write tests for valid and invalid passwords
// 💰 here are some you can use:
//
// valid:
// - !aBc123
//
// invalid:
// - a2c! // too short
// - 123456! // no alphabet characters
// - ABCdef! // no numbers
// - abc123! // no uppercase letters
// - ABC123! // no lowercase letters
// - ABCdef123 // no non-alphanumeric characters

//#region My Version of ExtraCredit 1 Solution
// const tests = [
//   {
//     name: `isPasswordAllowed returns true when given a valid password.`,
//     result: isPasswordAllowed('!aBc123'),
//     expected: true,
//   },
//   {
//     name: `isPasswordAllowed returns false when given a password that is too short.`,
//     result: isPasswordAllowed('a2c!'),
//     expected: false,
//   },
//   {
//     name: `isPasswordAllowed returns false when given a password with no alphabet characters.`,
//     result: isPasswordAllowed('123456!'),
//     expected: false,
//   },
//   {
//     name: `isPasswordAllowed returns false when given a password with no numbers.`,
//     result: isPasswordAllowed('ABASDFfdd!'),
//     expected: false,
//   },
//   {
//     name: `isPasswordAllowed returns false when given a password with no uppercase letters.`,
//     result: isPasswordAllowed('abc123!'),
//     expected: false,
//   },
//   {
//     name: `isPasswordAllowed returns false when given a password with no lowercase letters.`,
//     result: isPasswordAllowed('ABC123!'),
//     expected: false,
//   },
//   {
//     name: `isPasswordAllowed returns false when given a password with no non-alphanumeric characters.`,
//     result: isPasswordAllowed('ABCdef123'),
//     expected: false,
//   },
// ]

// for (const test of tests) {
//   global.test(test.name, () => {
//     expect(test.result).toBe(test.expected)
//   })
// }
//#endregion

//#region Course Solution of Extra Credit 1
// describe('isPasswordAllowed only allows some passwords', () => {
//   const allowedPasswords = ['!aBc123']
//   const disallowedPasswords = [
//     'a2c!',
//     '123456!',
//     'ABCdef!',
//     'abc123!',
//     'ABC123!',
//     'ABCdef123',
//   ]

//   allowedPasswords.forEach(password => {
//     test(`allows ${password}`, () => {
//       expect(isPasswordAllowed(password)).toBe(true)
//     })
//   })

//   disallowedPasswords.forEach(password => {
//     test(`disallows ${password}`, () => {
//       expect(isPasswordAllowed(password)).toBe(false)
//     })
//   })
// })
//#endregion

//#region ExtraCredit 2 - My Solution - use `jest-in-case`
// cases(
//   'isPasswordAllowed allows',
//   opts => {
//     expect(isPasswordAllowed(opts.password)).toBe(true)
//   },
//   {
//     '!aBc123': {password: '!aBc123'},
//   },
// )
// cases(
//   'isPasswordAllowed disallows',
//   opts => {
//     expect(isPasswordAllowed(opts.password)).toBe(false)
//   },
//   {
//     'a2c!': {password: 'a2c!'},
//     '123456!': {password: '123456!'},
//     'ABCdef!': {password: 'ABCdef!'},
//     'abc123!': {password: 'abc123!'},
//     'ABC123!': {password: 'ABC123!'},
//     ABCdef123: {password: 'ABCdef123'},
//   },
// )
//#endregion

//#region ExtraCredit 2 - Course Solution - use `jest-in-case`
// cases(
//   'isPasswordAllowed: valid passwords',
//   opts => {
//     expect(isPasswordAllowed(opts.password)).toBe(true)
//   },
//   {
//     '!aBc123': {password: '!aBc123'},
//   },
// )
// cases(
//   'isPasswordAllowed: invalid passwords',
//   opts => {
//     expect(isPasswordAllowed(opts.password)).toBe(false)
//   },
//   {
//     'too short!': {password: 'a2c!'},
//     'no letters': {password: '123456!'},
//     'no numbers': {password: 'ABCdef!'},
//     'no capital letters': {password: 'abc123!'},
//     'no lower case letters!': {password: 'ABC123!'},
//     'no non-alphanumeric characters': {password: 'ABCdef123'},
//   },
// )
//#endregion

//#region Extra Credit 3 - My Solution - improve titles for jest-in-case
const casify = obj => {
  return Object.entries(obj).map(([name, password]) => {
    return {
      name: `${password} - ${name}`,
      password,
    }
  })
}
cases(
  'isPasswordAllowed: valid passwords',
  opts => {
    expect(isPasswordAllowed(opts.password)).toBe(true)
  },
  casify({'valid password': '!aBc123'}),
)
cases(
  'isPasswordAllowed: invalid passwords',
  opts => {
    expect(isPasswordAllowed(opts.password)).toBe(false)
  },
  casify({
    'too short!': 'a2c!',
    'no letters': '123456!',
    'no numbers': 'ABCdef!',
    'no capital letters': 'abc123!',
    'no lower case letters!': 'ABC123!',
    'no non-alphanumeric characters': 'ABCdef123',
  }),
)
//#endregion
