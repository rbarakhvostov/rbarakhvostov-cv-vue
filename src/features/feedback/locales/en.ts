import type { FeedbackCopy } from '../types';

export const en: FeedbackCopy = {
  heading: 'FEEDBACK',
  subheading: 'Have a question? Send it directly.',
  nameLabel: 'Name',
  messageLabel: 'Message',
  nameRequiredError: 'Please enter your name.',
  messageRequiredError: 'Please enter a message.',
  sendLabel: 'Send',
  sendingLabel: 'Sending…',
  successMessage: 'Thanks! Your message has been sent.',
  networkErrorMessage:
    "Couldn't reach the server. Check your connection and try again, or email me directly:",
  configErrorMessage:
    "The feedback form isn't configured yet. Please email me directly:",
  serverErrorMessage:
    'Something went wrong sending your message. Please try again, or email me directly:',
  fallbackLinkLabel: 'rbarakhvostov@gmail.com',
};
