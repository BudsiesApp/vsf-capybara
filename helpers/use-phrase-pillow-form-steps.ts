import { computed, ref, Ref } from '@vue/composition-api';
import Vue from 'vue';

import { Customization } from 'src/modules/customization-system';

import { useFormSteps } from './use-form-steps';

const lastStepName = 'Add to Cart';

type CustomizationOptionComponent = Vue & {
  customization: Customization;
  validate: (silent: boolean) => Promise<{ valid: boolean }>;
};

export function usePhrasePillowFormSteps (
  customizationRootGroups: Ref<Customization[]>,
  customizationRootGroupCustomizations: Ref<Record<string, Customization[]>>
) {
  const formSteps = useFormSteps(customizationRootGroups);
  const lastStepAvailableCustomizations = computed<Customization[]>(() => {
    const groupCustomization = customizationRootGroups.value.find(
      (customization) => customization.name.toLowerCase() === lastStepName.toLowerCase()
    );

    if (!groupCustomization) {
      return [];
    }

    return customizationRootGroupCustomizations.value[groupCustomization.id] || [];
  });
  const stepsCustomizations = computed<Customization[]>(() => {
    return customizationRootGroups.value.filter(
      (customization) => customization.name.toLowerCase() !== lastStepName.toLowerCase()
    )
  });
  const stepsCustomizationDictionary = computed<Record<string, Customization>>(() => {
    const dictionary: Record<string, Customization> = {};

    for (const customization of stepsCustomizations.value) {
      dictionary[customization.id] = customization;
    }

    return dictionary;
  });

  const customizationOptionsRefs = ref<CustomizationOptionComponent[]>([]);
  const validationState = ref<Record<string, boolean>>({});

  const stepsList = computed<string[]>(() => {
    const stepsNames = stepsCustomizations.value.map(({ name }) => name);

    stepsNames.push(lastStepName);

    return stepsNames;
  });

  const stepNameCustomizationOptionsRefs = computed<Record<string, CustomizationOptionComponent[]>>(() => {
    // TODO: temporary - current TS version don't handle `value` type right in this case
    const _customizationOptionsRefs =
      (customizationOptionsRefs as any).value as unknown as CustomizationOptionComponent[];
    const customizationOptionsRefsDictionary: Record<string, CustomizationOptionComponent[]> = {};
    const _stepsCustomizationDictionary = stepsCustomizationDictionary.value;

    for (const customizationOption of _customizationOptionsRefs) {
      if (!customizationOption.customization.parentId) {
        continue;
      }

      const parentCustomization = _stepsCustomizationDictionary[customizationOption.customization.parentId];

      if (!parentCustomization) {
        continue;
      }

      if (!customizationOptionsRefsDictionary[parentCustomization.name]) {
        customizationOptionsRefsDictionary[parentCustomization.name] = [];
      }

      customizationOptionsRefsDictionary[parentCustomization.name].push(customizationOption);
    }

    return customizationOptionsRefsDictionary;
  });

  async function validateStep (stepIndex: number, silent: boolean): Promise<boolean> {
    const _stepsList = stepsList.value as string[];
    const stepName = _stepsList[stepIndex];

    if (!stepName) {
      return true;
    }

    const stepCustomizationOptions = stepNameCustomizationOptionsRefs.value[stepName] || [];
    let isStepValid = true;

    for (const customizationOption of stepCustomizationOptions) {
      const result = await customizationOption.validate(silent);

      if (!result.valid) {
        isStepValid = false;
      }
    }

    return isStepValid;
  }

  async function validateStepsBefore (stepIndex: number): Promise<void> {
    const stepsValidationState: Record<string, boolean> = {};

    for (let i = 0; i < stepIndex; i++) {
      const stepName = stepsList.value[i];

      if (!stepName) {
        continue;
      }

      stepsValidationState[stepName] = await validateStep(i, true);
    }

    // TODO: temporary - current TS version don't handle `value` type right in this case
    validationState.value = { ...(validationState as any).value, ...stepsValidationState };
  }

  function resetValidationState (): void {
    const state: Record<string, boolean> = {};

    for (const customization of stepsCustomizations.value) {
      state[customization.name] = true;
    }

    state[lastStepName] = true;

    (validationState as any).value = state;
  }

  function isStepInvalid (step: string): boolean {
    return !validationState.value[step];
  }

  function activateFirstStepWithError (): number | void {
    for (let index = 0; index < stepsCustomizations.value.length; index++) {
      const customization = stepsCustomizations.value[index];
      if (!validationState.value[customization.name]) {
        formSteps.currentStep.value = index;
        return index;
      }
    }
  }

  async function onChangeStep (stepIndex: number) {
    if (isStepInvalid(stepsList.value[stepIndex])) {
      await validateStep(stepIndex, false);
    }

    await validateStepsBefore(stepIndex);

    formSteps.currentStep.value = stepIndex;
  }
  async function nextStep (): Promise<void> {
    await onChangeStep(formSteps.currentStep.value + 1);
  }

  resetValidationState();

  return {
    ...formSteps,
    activateFirstStepWithError,
    isStepInvalid,
    lastStepAvailableCustomizations,
    lastStepName,
    nextStep,
    onChangeStep,
    stepsCustomizations,
    stepsList,
    customizationOptionsRefs
  }
}
