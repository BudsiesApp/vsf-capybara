import { computed, ref, Ref } from '@vue/composition-api';

import { Customization } from 'src/modules/customization-system';

import { useFormSteps } from './use-form-steps';

const lastStepCustomizationName = 'add to cart';

export function usePhrasePillowFormSteps (
  customizationRootGroups: Ref<Customization[]>,
  customizationRootGroupCustomizations: Ref<Record<string, Customization[]>>
) {
  const formSteps = useFormSteps(customizationRootGroups);
  const lastStepAvailableCustomizations = computed<Customization[]>(() => {
    const groupCustomization = customizationRootGroups.value.find(
      (customization) => customization.name.toLowerCase() === lastStepCustomizationName
    );

    if (!groupCustomization) {
      return [];
    }

    return customizationRootGroupCustomizations.value[groupCustomization.id] || [];
  });
  const stepsCustomizations = computed<Customization[]>(() => {
    return customizationRootGroups.value.filter(
      (customization) => customization.name.toLowerCase() !== lastStepCustomizationName
    )
  });

  const validationState = ref<Record<string, boolean>>({})

  async function validateStepsBefore (stepIndex: number): Promise<void> {

    // for (let i = 0; i < stepIndex; i++) {
    //   stepsCustomizations[i]
    // }
  }

  function resetValidationState (): void {
    const state: Record<string, boolean> = {};

    for (const customization of stepsCustomizations.value) {
      state[customization.name] = true;
    }

    validationState.value = state;
  }

  function isStepInvalid (step: string): boolean {
    return !validationState.value[step];
  }

  async function onChangeStep (stepIndex: number) {
    await validateStepsBefore(stepIndex);

    formSteps.currentStep.value = stepIndex;
  }

  resetValidationState();

  return {
    ...formSteps,
    isStepInvalid,
    lastStepAvailableCustomizations,
    onChangeStep,
    stepsCustomizations
  }
}
