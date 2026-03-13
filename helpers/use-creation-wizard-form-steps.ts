import debounce from 'lodash.debounce';
import { computed, nextTick, Ref, SetupContext, watch } from '@vue/composition-api';

import CartItem from 'core/modules/cart/types/CartItem';
import { ProductCustomizationMode, Customization } from 'src/modules/customization-system';

import { useFormSteps } from './use-form-steps';

const productTypeChooseStepName = 'Type';
const previousCustomizationStepOffset = 2;
const updateQueryDebounceTime = 100;

function getStepQueryValue (step: number, stepsList: string[]): string {
  return stepsList[step].toLowerCase().replace(/ /g, '-');
}

export function useCreationWizardFormSteps (
  customizationRootGroups: Ref<Customization[]>,
  existingCartItem: Ref<CartItem | undefined>,
  afterStepChanged: (previousStepCustomization?: Customization) => void,
  customizationMode: Ref<ProductCustomizationMode>,
  { root }: SetupContext
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

    if (customizationMode.value !== ProductCustomizationMode.CUSTOMIZE) {
      stepsNames.unshift(productTypeChooseStepName);
    }

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

  const updateStepQuery = debounce(
    (step: number) => {
      const stepQueryValue = getStepQueryValue(step, stepsList.value);

      if (stepQueryValue === root.$route.query.step) {
        return;
      }

      root.$router.replace({
        query: {
          ...root.$route.query,
          step: stepQueryValue
        }
      });
    },
    updateQueryDebounceTime
  );

  watch(
    currentStep,
    (value) => {
      updateStepQuery(value);
    },
    {
      immediate: true
    }
  );

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
