import { ObjectId } from 'mongodb';

export function toObjectId(id, fieldName) {
  if (!id) {
    throw new Error(`${fieldName ?? 'id'} is required`);
  }

  if (id instanceof ObjectId) {
    return id;
  }

  if (ObjectId.isValid(id)) {
    return new ObjectId(id);
  }

  throw new Error(`${fieldName ?? 'id'} is not a valid ObjectId`);
}

export function serialiseDocument(document) {
  if (!document) {
    return document;
  }

  const result = { ...document };

  if (result._id) {
    result.id = result._id.toString();
    delete result._id;
  }

  if (result.userId instanceof ObjectId) {
    result.userId = result.userId.toString();
  }

  if (result.warehouseId instanceof ObjectId) {
    result.warehouseId = result.warehouseId.toString();
  }

  return result;
}
