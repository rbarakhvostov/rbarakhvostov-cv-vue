import type { Web3FormsSubmission } from '../types';

export const WEB3FORMS_ENDPOINT = 'https://api.web3forms.com/submit';

type BuildWeb3FormsPayloadParams = {
  accessKey: string;
  name: string;
  message: string;
  isBot: boolean;
};

export const buildWeb3FormsPayload = ({
  accessKey,
  name,
  message,
  isBot,
}: BuildWeb3FormsPayloadParams): Web3FormsSubmission => {
  return {
    access_key: accessKey,
    subject: `CV feedback from ${name}`,
    from_name: name,
    name,
    message,
    botcheck: isBot,
  };
};
