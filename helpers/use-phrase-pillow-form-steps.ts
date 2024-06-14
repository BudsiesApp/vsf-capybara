import { ref, Ref } from '@vue/composition-api';

import { Customization } from 'src/modules/customization-system';

import { useFormSteps } from './use-form-steps';

export function usePhrasePillowFormSteps (
  customizationRootGroups: Ref<Customization[]>
) {
  const formSteps = useFormSteps(customizationRootGroups);

  function isLastStep (stepIndex: number): boolean {
    return formSteps.lastStepIndex.value === stepIndex;
  }

  const validationState = ref<Record<string, boolean>>({})

  async function validateStepsBefore (stepIndex: number): Promise<void> {

  }

  function isStepInvalid (step): boolean {
    // TODO: implement
    return false;
  }

  async function onChangeStep (stepIndex: number) {
    await validateStepsBefore(stepIndex);

    formSteps.currentStep.value = stepIndex;
  }

  return {
    ...formSteps,
    isLastStep,
    isStepInvalid,
    onChangeStep
  }
}
