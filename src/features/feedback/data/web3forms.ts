export const WEB3FORMS_ENDPOINT = 'https://api.web3forms.com/submit';

type BuildWeb3FormsFormDataParams = {
  accessKey: string;
  name: string;
  message: string;
};

export const buildWeb3FormsFormData = ({
  accessKey,
  name,
  message,
}: BuildWeb3FormsFormDataParams): FormData => {
  const formData = new FormData();

  formData.append('access_key', accessKey);
  formData.append('subject', `CV feedback from ${name}`);
  formData.append('from_name', name);
  formData.append('name', name);
  formData.append('message', message);

  return formData;
};
