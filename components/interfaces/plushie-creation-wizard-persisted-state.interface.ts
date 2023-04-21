import PlushieWizardImageUploadStepData from './plushie-wizard-image-upload-step-data.interface';
import PlushieWizardPetInfoStepData from './plushie-wizard-pet-info-step-data.interface';

export default interface PlushieCreationWizardPersistedState {
  currentStepIndex?: number,
  productTypeData?: {
    plushieId: number,
    productSku: string
  },
  imageUploadStepData?: PlushieWizardImageUploadStepData,
  petInfoStepData?: PlushieWizardPetInfoStepData
}
