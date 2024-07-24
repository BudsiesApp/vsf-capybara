import { computed, ref, Ref } from '@vue/composition-api';

import { Customization } from 'src/modules/customization-system';

import CustomizationOption from 'theme/components/customization-system/customization-option.vue';

import { useFormSteps } from './use-form-steps';

const lastStepName = 'Add to Cart';

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

  const customizationOptionsRefs = ref<InstanceType<typeof CustomizationOption>[]>([])
  const validationState = ref<Record<string, boolean>>({})

  async function validateStepsBefore (stepIndex: number): Promise<void> {
    const stepsValidationState: Record<string, boolean> = {};

    for (const stepCustomization of stepsCustomizations.value.slice(0, stepIndex)) {
      // TODO: temporary - current TS version don't handle `value` type right in this case
      const relatedCustomizationOptions = (customizationOptionsRefs as any).value.filter((item) => {
        return item.customization?.parentId && item.customization.parentId === stepCustomization.id;
      });

      stepsValidationState[stepCustomization.name] = true;

      for (const customizationOption of relatedCustomizationOptions) {
        const result = await customizationOption.validateSilent();
        if (!result.valid) {
          stepsValidationState[stepCustomization.name] = false;
          break;
        }
      }
    }

    // TODO: temporary - current TS version don't handle `value` type right in this case
    validationState.value = { ...(validationState as any).value, ...stepsValidationState };
  }

  const stepsList = computed<string[]>(() => {
    const stepsNames = stepsCustomizations.value.map(({ name }) => name);

    stepsNames.push(lastStepName);

    return stepsNames;
  });

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
    stepsCustomizations.value.forEach((customization, index) => {
      if (!validationState.value[customization.name]) {
        formSteps.currentStep.value = index;
        return index;
      }
    });
  }

  async function onChangeStep (stepIndex: number) {
    await validateStepsBefore(stepIndex);

    formSteps.currentStep.value = stepIndex;
  }

  function nextStep (): void {
    onChangeStep(formSteps.currentStep.value + 1);
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