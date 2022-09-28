// Testing Middleware

// 🐨 you'll need both of these:
import {UnauthorizedError} from 'express-jwt'
import errorMiddleware from '../error-middleware'

// 🐨 Write a test for the UnauthorizedError case
describe('errorMiddleware', () => {
  // shared variables
  //
  test('responds with 401 for express-jwt UnauthorizedError', () => {
    const req = {}
    const next = jest.fn()
    const code = 'some_error_code'
    const message = 'Some message'
    const res = {
      json: jest.fn(() => res),
      status: jest.fn(() => res),
    }
    const error = new UnauthorizedError(code, {
      message,
    })
    errorMiddleware(error, req, res, next)
    expect(next).not.toHaveBeenCalled()
    expect(res.json).toHaveBeenCalledTimes(1)
    expect(res.json).toHaveBeenCalledWith({
      code: error.code,
      message: error.message,
    })
    expect(res.status).toHaveBeenCalledWith(401)
    expect(res.status).toHaveBeenCalledTimes(1)
  })

  // 🐨 Write a test for the headersSent case
  test('calls next if headersSent is true', () => {
    const req = {}
    const next = jest.fn()
    const code = 'some_error_code'
    const message = 'Some message'
    const error = new Error(code, {message})
    const res = {
      json: jest.fn(() => res),
      status: jest.fn(() => res),
      headersSent: jest.fn(() => res),
    }
    errorMiddleware(error, req, res, next)
    expect(res.json).not.toHaveBeenCalled()
    expect(res.status).not.toHaveBeenCalled()
    expect(next).toHaveBeenCalledTimes(1)
    expect(next).toHaveBeenCalledWith(error)
  })

  test('responds with status code 500', () => {
    const req = {}
    const next = jest.fn()
    const error = new Error('blah')
    const res = {
      json: jest.fn(() => res),
      status: jest.fn(() => res),
    }
    errorMiddleware(error, req, res, next)
    expect(next).not.toHaveBeenCalled()
    expect(res.status).toHaveBeenCalledTimes(1)
    expect(res.status).toHaveBeenCalledWith(500)
    // not production env... expect a stack trace...
    expect(res.json).toHaveBeenCalledTimes(1)
    expect(res.json).toHaveBeenCalledWith({
      message: error.message,
      stack: error.stack,
    })
  })
})
