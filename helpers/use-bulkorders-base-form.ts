import { ref } from 'vue';

import BulkordersBaseFormData from 'theme/components/interfaces/bulkorders-base-form-data.interface';

import { useBulkorderBaseFormPersistanceState } from './use-bulkorder-base-form-persistance-state';

export function useBulkOrdersBaseForm () {
  const bulkordersBaseFormData = ref<BulkordersBaseFormData>({
    name: '',
    description: '',
    quantity: undefined,
    additionalQuantity: undefined,
    deadline: undefined,
    deadlineDate: undefined,
    country: '',
    customerFirstName: '',
    customerLastName: undefined,
    customerEmail: '',
    customerPhone: '',
    customerImages: [],
    customerType: undefined,
    agreement: false
  });

  useBulkorderBaseFormPersistanceState(bulkordersBaseFormData);

  function trimValues (): void {
    // TODO: temporary - current TS version don't handle `value` type right in this case
    const value = ((bulkordersBaseFormData as any).value as unknown as BulkordersBaseFormData);

    value.name = value.name.trim();
    value.description = value.description.trim();
    value.customerEmail = value.customerEmail.trim();
    value.customerFirstName = value.customerFirstName.trim();
    value.customerLastName = value.customerLastName?.trim();
  }

  return {
    bulkordersBaseFormData,
    trimValues
  }
}
