import Feedback from '../models/Feedback.js';

export const createFeedback = async (request, response) => {
  const feedback = await Feedback.create({
    user: request.user.id,
    category: request.body.category,
    subject: request.body.subject,
    message: request.body.message,
  });

  response.status(201).json({ feedback });
};
