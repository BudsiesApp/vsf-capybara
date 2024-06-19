import { Ref, ref, computed } from '@vue/composition-api';

import { Customization } from 'src/modules/customization-system';

export function useFormSteps (
  customizationRootGroups: Ref<Customization[]>
) {
  const currentStep = ref<number>(0);

  const lastStepIndex = computed<number>(() => {
    return customizationRootGroups.value.length - 1;
  });
  const lastStepCustomization = computed<Customization>(() => {
    return customizationRootGroups.value[lastStepIndex.value];
  });

  return {
    currentStep,
    lastStepCustomization,
    lastStepIndex
  }
}
