import { reactive } from '@vue/composition-api';

import BulkordersBaseFormData from 'theme/components/interfaces/bulkorders-base-form-data.interface';

import { useBulkorderBaseFormPersistanceState } from './use-bulkorder-base-form-persistance-state';

export function useBulkOrdersBaseForm () {
  const bulkordersBaseFormData = reactive<BulkordersBaseFormData>({
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

  useBulkorderBaseFormPersistanceState(bulkordersBaseFormData as unknown as BulkordersBaseFormData);

  return {
    bulkordersBaseFormData
  }
}
