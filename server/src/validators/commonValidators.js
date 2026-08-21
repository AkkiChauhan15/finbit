import { body } from 'express-validator';

export const onlyBodyFields = (...allowedFields) =>
  body().custom((value) => {
    const unknownFields = Object.keys(value ?? {}).filter(
      (field) => !allowedFields.includes(field),
    );

    if (unknownFields.length > 0) {
      throw new Error(
        `Unsupported request field${unknownFields.length === 1 ? '' : 's'}: ${unknownFields.join(', ')}.`,
      );
    }

    return true;
  });

export const emptyBodyValidators = [onlyBodyFields()];
