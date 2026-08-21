export const getProfile = async (request, response) => {
  response.status(200).json({ user: request.user });
};

export const updateProfile = async (request, response) => {
  const { name, currency, monthlyIncomeGoal } = request.body;

  if (name !== undefined) {
    request.user.name = name;
  }

  if (currency !== undefined) {
    request.user.financialProfile.currency = currency;
  }

  if (monthlyIncomeGoal !== undefined) {
    request.user.financialProfile.monthlyIncomeGoal = monthlyIncomeGoal;
  }

  await request.user.save();
  response.status(200).json({ user: request.user });
};
