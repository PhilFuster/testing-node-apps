// Testing Middleware

// 🐨 you'll need both of these:
import { UnauthorizedError } from 'express-jwt';
import { buildRes, buildReq, buildNext } from 'utils/generate';
import errorMiddleware from '../error-middleware';

// My solution to extra credit 1. Might have been a hasty abstraction
// in comparison to the course solution
// const setup = (overrides = {}) => {
//   const req = {}
//   const next = jest.fn()
//   const res = {
//     json: jest.fn(() => res),
//     status: jest.fn(() => res),
//   }
//   const error = new Error('blah')
//   return {
//     req,
//     res,
//     next,
//     error,
//     ...overrides,
//   }
// }

// course solution to extra credit 1.
// const buildRes = overrides => {
//   const res = {
//     json: jest.fn(() => res),
//     status: jest.fn(() => res),
//     ...overrides,
//   }
//   return res
// }

// 🐨 Write a test for the UnauthorizedError case
describe('errorMiddleware', () => {
	//
	test('responds with 401 for express-jwt UnauthorizedError', () => {
		const req = buildReq();
		const res = buildRes();
		const next = buildNext();
		const error = new UnauthorizedError('error_code', { message: 'Some message' });
		errorMiddleware(error, req, res, next);
		expect(next).not.toHaveBeenCalled();
		expect(res.json).toHaveBeenCalledTimes(1);
		expect(res.json).toHaveBeenCalledWith({
			code: error.code,
			message: error.message,
		});
		expect(res.status).toHaveBeenCalledTimes(1);
		expect(res.status).toHaveBeenCalledWith(401);
	});

	// 🐨 Write a test for the headersSent case
	test('calls next if headersSent is true', () => {
		const req = buildReq();
		const res = buildRes({ headersSent: true });
		const next = buildNext();
		const error = new Error('blah');
		errorMiddleware(error, req, res, next);
		expect(res.json).not.toHaveBeenCalled();
		expect(res.status).not.toHaveBeenCalled();
		expect(next).toHaveBeenCalledTimes(1);
		expect(next).toHaveBeenCalledWith(error);
	});

	test('responds with status code 500', () => {
		const req = buildReq();
		const res = buildRes();
		const next = buildNext();
		const error = new Error('blah');
		errorMiddleware(error, req, res, next);
		expect(next).not.toHaveBeenCalled();
		expect(res.status).toHaveBeenCalledTimes(1);
		expect(res.status).toHaveBeenCalledWith(500);
		// not production env... expect a stack trace...
		expect(res.json).toHaveBeenCalledTimes(1);
		expect(res.json).toHaveBeenCalledWith({
			message: error.message,
			stack: error.stack,
		});
	});
});
