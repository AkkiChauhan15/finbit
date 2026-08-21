export const userScope = (userId, conditions = {}) => ({
  ...conditions,
  user: userId,
});

export const ownedRecordFilter = (userId, recordId) => userScope(userId, { _id: recordId });

export const ownedChildFilter = (userId, parentField, parentId, conditions = {}) =>
  userScope(userId, { ...conditions, [parentField]: parentId });
