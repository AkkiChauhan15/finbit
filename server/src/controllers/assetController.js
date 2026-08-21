import Asset from '../models/Asset.js';
import { AppError } from '../utils/AppError.js';
import { ownedRecordFilter, userScope } from '../utils/ownership.js';

const getOwnedAsset = async (userId, assetId) => {
  const asset = await Asset.findOne(ownedRecordFilter(userId, assetId));

  if (!asset) {
    throw new AppError('Asset not found', 404);
  }

  return asset;
};

export const createAsset = async (request, response) => {
  const asset = await Asset.create({
    user: request.user.id,
    type: request.body.type,
    name: request.body.name,
    currentValue: request.body.currentValue,
    dateUpdated: request.body.dateUpdated,
  });

  response.status(201).json({ asset });
};

export const getAssets = async (request, response) => {
  const assets = await Asset.find(userScope(request.user.id)).sort({
    currentValue: -1,
    dateUpdated: -1,
  });
  response.status(200).json({ assets, count: assets.length });
};

export const getAsset = async (request, response) => {
  const asset = await getOwnedAsset(request.user.id, request.params.id);
  response.status(200).json({ asset });
};

export const updateAsset = async (request, response) => {
  const updates = Object.fromEntries(
    ['type', 'name', 'currentValue', 'dateUpdated']
      .filter((field) => request.body[field] !== undefined)
      .map((field) => [field, request.body[field]]),
  );
  const asset = await Asset.findOneAndUpdate(
    ownedRecordFilter(request.user.id, request.params.id),
    updates,
    { new: true, runValidators: true },
  );

  if (!asset) {
    throw new AppError('Asset not found', 404);
  }

  response.status(200).json({ asset });
};

export const deleteAsset = async (request, response) => {
  const asset = await Asset.findOneAndDelete(ownedRecordFilter(request.user.id, request.params.id));

  if (!asset) {
    throw new AppError('Asset not found', 404);
  }

  response.status(204).send();
};
