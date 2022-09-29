// Testing Controllers

import {
	buildNext,
	buildReq,
	buildRes,
	buildListItem,
	buildBook,
	buildUser,
	notes,
} from 'utils/generate';

import * as booksDB from '../../db/books';

import * as listItemsController from '../list-items-controller';
import * as listItemsDB from '../../db/list-items';
// database calls in this test file.
jest.mock('../../db/books');
jest.mock('../../db/list-items');

beforeEach(() => {
	jest.clearAllMocks();
});

test('getListItem returns the req.listItem', async () => {
	const user = buildUser();
	const book = buildBook();
	const listItem = buildListItem({ ownerId: user.id, bookId: book.id });
	//
	booksDB.readById.mockResolvedValueOnce(book);
	//
	const req = buildReq({ user, listItem });
	const res = buildRes();
	await listItemsController.getListItem(req, res);
	//
	expect(booksDB.readById).toHaveBeenCalledWith(book.id);
	expect(booksDB.readById).toHaveBeenCalledTimes(1);
	expect(res.json).toHaveBeenCalledWith({ listItem: { ...listItem, book } });
	expect(res.json).toHaveBeenCalledTimes(1);
});

test(`getListItems returns a user's list items`, async () => {
	const user = buildUser();
	const booksList = [buildBook(), buildBook()];
	const userListItems = [
		buildListItem({ ownerId: user.id, bookId: booksList[0].id }),
		buildListItem({ ownerId: user.id, bookId: booksList[1].id }),
	];
	//
	booksDB.readManyById.mockResolvedValueOnce(booksList);
	listItemsDB.query.mockResolvedValueOnce(userListItems);
	//
	const req = buildReq({ user });
	const res = buildRes();
	await listItemsController.getListItems(req, res);
	//
	expect(booksDB.readManyById).toHaveBeenCalledWith([booksList[0].id, booksList[1].id]);
	expect(booksDB.readManyById).toHaveBeenCalledTimes(1);
	expect(listItemsDB.query).toHaveBeenCalledWith({ ownerId: req.user.id });
	expect(listItemsDB.query).toHaveBeenCalledTimes(1);
	expect(res.json).toHaveBeenCalledWith({
		listItems: [
			{
				...userListItems[0],
				book: booksList[0],
			},
			{ ...userListItems[1], book: booksList[1] },
		],
	});
	expect(res.json).toHaveBeenCalledTimes(1);
});

test('createListItem returns a 400 error if no bookId is provided', async () => {
	const req = buildReq();
	const res = buildRes();
	await listItemsController.createListItem(req, res);
	expect(res.status).toHaveBeenCalledWith(400);
	expect(res.status).toHaveBeenCalledTimes(1);

	expect(res.json.mock.calls[0]).toMatchInlineSnapshot(
		res.json.mock.calls[0],
		`
    Object {
      "0": Object {
        "message": "No bookId provided",
      },
    }
  `,
	);
	expect(res.json).toHaveBeenCalledTimes(1);
});

test('createListItem returns 400 if the user already has a list item for the given book', async () => {
	const user = buildUser({ id: 'FAKE_USER_ID' });
	const book = buildBook({ id: 'FAKE_BOOK_ID' });

	const existingListItem = buildListItem({ ownerId: user.id, bookId: book.id });
	listItemsDB.query.mockResolvedValueOnce([existingListItem]);

	const req = buildReq({ user, body: { bookId: book.id } });
	const res = buildRes();

	await listItemsController.createListItem(req, res);

	expect(listItemsDB.query).toHaveBeenCalledWith({
		ownerId: user.id,
		bookId: book.id,
	});
	expect(listItemsDB.query).toHaveBeenCalledTimes(1);

	expect(res.status).toHaveBeenCalledWith(400);
	expect(res.status).toHaveBeenCalledTimes(1);
	expect(res.json.mock.calls[0]).toMatchInlineSnapshot(`
    Array [
      Object {
        "message": "User FAKE_USER_ID already has a list item for the book with the ID FAKE_BOOK_ID",
      },
    ]
  `);
});

test('createListItem creates and returns the a listItem', async () => {
	const user = buildUser();
	const book = buildBook();
	const createdListItem = buildListItem({ ownerId: user.id, bookId: book.id });

	listItemsDB.query.mockResolvedValueOnce([]);
	listItemsDB.create.mockResolvedValueOnce({ ...createdListItem });
	booksDB.readById.mockResolvedValueOnce(book);

	const req = buildReq({ user, body: { bookId: book.id } });
	const res = buildRes();
	await listItemsController.createListItem(req, res);
	expect(listItemsDB.query).toHaveBeenCalledWith({
		ownerId: user.id,
		bookId: book.id,
	});
	expect(listItemsDB.query).toHaveBeenCalledTimes(1);

	expect(listItemsDB.create).toHaveBeenCalledWith({
		ownerId: user.id,
		bookId: book.id,
	});
	expect(listItemsDB.create).toHaveBeenCalledTimes(1);

	expect(booksDB.readById).toHaveBeenCalledWith(book.id);
	expect(booksDB.readById).toHaveBeenCalledTimes(1);

	expect(res.status).not.toHaveBeenCalled();
	expect(res.json).toHaveBeenCalledWith({ listItem: { ...createdListItem, book } });
});

test('setListItem returns a 404 error if listItem does not exist', async () => {
	const fakeListItemId = 'FAKE_LIST_ITEM_ID';
	const req = buildReq({ params: { id: fakeListItemId } });
	const res = buildRes();
	const next = buildNext();
	listItemsDB.readById.mockResolvedValueOnce(null);
	await listItemsController.setListItem(req, res, next);
	expect(next).not.toHaveBeenCalled();
	expect(res.status).toHaveBeenCalledWith(404);
	expect(res.status).toHaveBeenCalledTimes(1);
	expect(res.json.mock.calls[0]).toMatchInlineSnapshot(`
    Array [
      Object {
        "message": "No list item was found with the id of FAKE_LIST_ITEM_ID",
      },
    ]
  `);
	expect(res.json).toHaveBeenCalledTimes(1);
});

test('setListItem returns a 403 error if the list item does not belong to the user', async () => {
	const user = buildUser({ id: 'FAKE_USER_ID' });
	// listItem.ownerId is pretty much guaranteed to be different from
	// the userId of the user generated above.
	const listItem = buildListItem();
	const req = buildReq({ user, params: { id: 'FAKE_LIST_ITEM_ID' } });
	const res = buildRes();
	const next = buildNext();
	listItemsDB.readById.mockResolvedValueOnce(listItem);
	await listItemsController.setListItem(req, res, next);
	expect(res.status).toHaveBeenCalledWith(403);
	expect(res.status).toHaveBeenCalledTimes(1);
	expect(res.json.mock.calls[0]).toMatchInlineSnapshot(`
    Array [
      Object {
        "message": "User with id FAKE_USER_ID is not authorized to access the list item FAKE_LIST_ITEM_ID",
      },
    ]
  `);
	expect(res.json).toHaveBeenCalledTimes(1);
});

test('setListItem sets listItem on the req', async () => {
	const user = buildUser();
	const listItem = buildListItem({ ownerId: user.id });

	listItemsDB.readById.mockResolvedValueOnce(listItem);

	const req = buildReq({ user, params: { id: listItem.id } });
	const res = buildRes();
	const next = buildNext();

	await listItemsController.setListItem(req, res, next);

	expect(listItemsDB.readById).toHaveBeenCalledWith(listItem.id);
	expect(listItemsDB.readById).toHaveBeenCalledTimes(1);
	expect(res.json).not.toHaveBeenCalled();
	expect(next).toHaveBeenLastCalledWith(/* nothing! */);
	expect(next).toHaveBeenCalledTimes(1);
});

test('updateListItem updates an existing list item', async () => {
	const user = buildUser();
	const book = buildBook();
	const originalListItem = buildListItem({ ownerId: user.id, bookId: book.id });
	const updates = { notes: notes() };
	const mergedListItemsAndUpdates = { ...originalListItem, ...updates };

	listItemsDB.update.mockResolvedValueOnce(mergedListItemsAndUpdates);
	booksDB.readById.mockResolvedValueOnce(book);

	const req = buildReq({ user, listItem: originalListItem, body: { ...updates } });
	const res = buildRes();

	await listItemsController.updateListItem(req, res);

	expect(listItemsDB.update).toHaveBeenCalledWith(originalListItem.id, updates);
	expect(listItemsDB.update).toHaveBeenCalledTimes(1);
	expect(booksDB.readById).toHaveBeenCalledWith(book.id);
	expect(booksDB.readById).toBeCalledTimes(1);

	expect(listItemsDB.update).toHaveBeenCalledWith(req.listItem.id, req.body);
	expect(res.json).toHaveBeenCalledWith({ listItem: { ...mergedListItemsAndUpdates, book } });
	expect(res.json).toHaveBeenCalledTimes(1);
});

test('deleteListItem deletes an existing list item', async () => {
	const user = buildUser();
	const listItem = buildListItem({ ownerId: user.id });
	const req = buildReq({ listItem: { id: listItem.id } });
	const res = buildRes();
	await listItemsController.deleteListItem(req, res);
	expect(listItemsDB.remove).toHaveBeenCalledWith(listItem.id);
	expect(listItemsDB.remove).toHaveBeenCalledTimes(1);
	expect(res.status).not.toHaveBeenCalled();
	expect(res.json).toHaveBeenCalledWith({ success: true });
	expect(res.json).toHaveBeenCalledTimes(1);
});
