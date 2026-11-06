export type FeedbackStatus = 'idle' | 'sending' | 'success' | 'error';

export type FeedbackErrorReason =
  'validation' | 'missing-key' | 'network' | 'server';

export type FeedbackFieldErrors = {
  name: boolean;
  message: boolean;
};

export type FeedbackToastTone = 'success' | 'error';

export type FeedbackToastLink = {
  href: string;
  label: string;
};

export type FeedbackToast = {
  tone: FeedbackToastTone;
  message: string;
  link?: FeedbackToastLink;
};

export type Web3FormsResponse = {
  success: boolean;
  message: string;
};

export type FeedbackCopy = {
  heading: string;
  subheading: string;
  nameLabel: string;
  messageLabel: string;
  nameRequiredError: string;
  messageRequiredError: string;
  sendLabel: string;
  sendingLabel: string;
  successMessage: string;
  networkErrorMessage: string;
  configErrorMessage: string;
  serverErrorMessage: string;
  fallbackLinkLabel: string;
  dismissLabel: string;
};
