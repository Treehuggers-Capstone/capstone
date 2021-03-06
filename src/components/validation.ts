const isEmail = (input: string): boolean =>
  /^[a-zA-Z0-9_.]+@[a-zA-Z0-9-.]+\.[a-z]{2,}$/.test(input);

const isPassword = (input: string): boolean =>
  /^[a-z0-9!@#$%^&*()_-]{6,}/i.test(input);
const isName = (input: string): boolean => /^[a-zA-Z]{1,30}$/.test(input);
const isPrice = (input: string): boolean =>
  /^\$?(\d{1,3}(\d{3})*|(\d+))(\.\d{2})?$/.test(input);

const setClassName = (validateBy, valid = '', invalid = 'invalid'): string => {
  return validateBy ? valid : invalid;
};

export const isFormValid = (formId: string): boolean => {
  const form = document.getElementById(formId);
  const inputs = form.querySelectorAll('.invalid');

  return inputs.length === 0;
};

const isValid = (inputs: HTMLInputElement[]): boolean => {
  let valid = 0;
  // if any are invalid or empty, validation fails
  inputs.forEach(input => {
    const isThisInvalid = input.getAttribute('aria-invalid');
    if (isThisInvalid === 'false' || input.value.length) {
      valid++;
    }
  });
  // otherwise, form is good to go
  return valid === inputs.length;
};

export const validate = {
  isEmail,
  isPassword,
  isName,
  isPrice,
  setClassName,
  isFormValid,
  isValid,
};
