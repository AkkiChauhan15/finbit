export const mapApiErrors = (error) =>
  Array.isArray(error.errors)
    ? Object.fromEntries(
        error.errors.filter(({ field }) => field).map(({ field, message }) => [field, message]),
      )
    : {};

export const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
