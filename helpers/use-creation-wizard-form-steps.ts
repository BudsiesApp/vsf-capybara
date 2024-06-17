import { computed, nextTick, Ref } from '@vue/composition-api';

import CartItem from 'core/modules/cart/types/CartItem';
import { Customization } from 'src/modules/customization-system';
import { useFormSteps } from './use-form-steps';

export function useCreationWizardFormSteps (
  customizationRootGroups: Ref<Customization[]>,
  existingCartItem: Ref<CartItem | undefined>
) {
  const {
    currentStep,
    lastStepCustomization
  } = useFormSteps(customizationRootGroups);

  const stepsCustomizations = computed<Customization[]>(() => {
    const groups = customizationRootGroups.value;
    return groups.slice(0, groups.length - 1);
  });

  const isLastStep = computed<boolean>(() => {
    return currentStep.value === customizationRootGroups.value.length;
  });

  const canGoBack = computed<boolean>(() => {
    return (currentStep.value !== 1 || !existingCartItem.value);
  });

  function scrollToTop (): void {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  }
  async function nextStep (): Promise<void> {
    currentStep.value += 1;
    await nextTick();
    scrollToTop();
  }
  async function onStepChanged (nextStep: number): Promise<void> {
    if (nextStep >= currentStep.value) {
      return;
    }

    currentStep.value = nextStep;
    await nextTick();
    scrollToTop();
  }

  return {
    canGoBack,
    currentStep,
    isLastStep,
    lastStepCustomization,
    nextStep,
    onStepChanged,
    stepsCustomizations
  }
}
