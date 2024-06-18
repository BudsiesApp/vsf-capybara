import { computed, ref, Ref } from '@vue/composition-api';

import { Customization } from 'src/modules/customization-system';

import CustomizationOption from 'theme/components/customization-system/customization-option.vue';

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

  function resetValidationState (): void {
    const state: Record<string, boolean> = {};

    for (const customization of stepsCustomizations.value) {
      state[customization.name] = true;
    }

    state['Add to Cart'] = true;

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

  resetValidationState();

  return {
    ...formSteps,
    activateFirstStepWithError,
    isStepInvalid,
    lastStepAvailableCustomizations,
    onChangeStep,
    stepsCustomizations,
    customizationOptionsRefs
  }
}
