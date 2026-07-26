import { ref } from 'vue';
import {
  getFieldAnchorName,
  getNestedFormRefs,
  useFormValidation
} from './use-form-validation';

jest.mock('@vue-storefront/core/lib/logger', () => ({
  Logger: {
    warn: jest.fn(() => jest.fn())
  }
}));
describe('form validation ref behavior', () => {
  it('normalizes dynamic field anchors with an optional stable prefix', () => {
    expect(getFieldAnchorName('"First Name"')).toBe('first-name-field-anchor');
    expect(getFieldAnchorName("'Option Value'", 'customization-42')).toBe(
      'customization-42-option-value-field-anchor'
    );
  });

  it('combines refs exposed by repeated nested form components', () => {
    const firstAnchor = document.createElement('div');
    const secondAnchor = document.createElement('div');
    const firstNestedForm = {
      getFormValidationRefs: () => ({
        'first-field-anchor': firstAnchor
      })
    };
    const secondNestedForm = {
      getFormValidationRefs: () => ({
        'second-field-anchor': secondAnchor
      })
    };

    expect(getNestedFormRefs([
      firstNestedForm,
      secondNestedForm
    ])).toEqual({
      'first-field-anchor': firstAnchor,
      'second-field-anchor': secondAnchor
    });
  });

  it('validates and focuses the first invalid field in document order', async () => {
    const firstAnchor = document.createElement('div');
    const firstInput = document.createElement('input');
    firstAnchor.appendChild(firstInput);
    const secondAnchor = document.createElement('div');
    const secondInput = document.createElement('input');
    secondAnchor.appendChild(secondInput);
    document.body.append(firstAnchor, secondAnchor);
    const firstScroll = jest.fn();
    const secondScroll = jest.fn();
    firstAnchor.scrollIntoView = firstScroll;
    secondAnchor.scrollIntoView = secondScroll;
    const firstFocus = jest.spyOn(firstInput, 'focus');
    const observer = {
      errors: {
        Second: ['Second is invalid'],
        First: ['First is invalid']
      },
      validate: jest.fn().mockResolvedValue(false)
    };
    const validationObserver = ref(observer as any);
    const validation = useFormValidation(
      validationObserver,
      () => ({
        'first-field-anchor': firstAnchor,
        'second-field-anchor': secondAnchor
      })
    );

    await expect(validation.validateAndGoToFirstError()).resolves.toBe(false);
    expect(observer.validate).toHaveBeenCalledTimes(1);
    expect(firstScroll).toHaveBeenCalledWith({
      behavior: 'smooth',
      block: 'center'
    });
    expect(firstFocus).toHaveBeenCalledTimes(1);
    expect(secondScroll).not.toHaveBeenCalled();

    firstAnchor.remove();
    secondAnchor.remove();
  });
});
