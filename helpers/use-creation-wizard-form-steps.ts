import { computed, nextTick, Ref } from '@vue/composition-api';

import CartItem from 'core/modules/cart/types/CartItem';
import { Customization } from 'src/modules/customization-system';
import { useFormSteps } from './use-form-steps';

const productTypeChooseStepName = 'Type';
const previousCustomizationStepOffset = 2;

export function useCreationWizardFormSteps (
  customizationRootGroups: Ref<Customization[]>,
  existingCartItem: Ref<CartItem | undefined>,
  afterStepChanged: (previousStepCustomization?: Customization) => void
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

  const stepsList = computed<string[]>(() => {
    const stepsNames = customizationRootGroups.value.map(({ name }) => name);

    stepsNames.unshift(productTypeChooseStepName);

    return stepsNames;
  });

  const previousStepCustomization = computed<Customization | undefined>(() => {
    return customizationRootGroups.value[currentStep.value - previousCustomizationStepOffset];
  });

  function scrollToTop (): void {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  }

  async function nextStep (): Promise<void> {
    currentStep.value += 1;
    afterStepChanged(previousStepCustomization.value);
    await nextTick();
    scrollToTop();
  }

  async function goToStep (index: number): Promise<void> {
    if (index < 0 || index > customizationRootGroups.value.length) {
      return;
    }

    currentStep.value = index;
    await nextTick();
    scrollToTop();
  }

  async function onStepChanged (nextStep: number): Promise<void> {
    if (nextStep >= currentStep.value) {
      return;
    }

    goToStep(nextStep);
  }

  return {
    canGoBack,
    currentStep,
    goToStep,
    isLastStep,
    lastStepCustomization,
    nextStep,
    onStepChanged,
    productTypeChooseStepName,
    stepsCustomizations,
    stepsList
  }
}
