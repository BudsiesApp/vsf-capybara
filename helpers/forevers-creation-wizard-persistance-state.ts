import { StorageManager } from 'core/lib/storage-manager';
import { SN_BUDSIES } from 'src/modules/budsies/store/mutation-types';
import ForeversCreationWizardPersistanceState from 'theme/components/interfaces/forevers-creation-wizard-persistance-state.interface';
import ForeversWizardImageUploadStepData from 'theme/components/interfaces/forevers-wizard-image-upload-step-data.interface';
import ForeversWizardPetInfoStepData from 'theme/components/interfaces/forevers-wizard-pet-info-step-data.interface';

const STORAGE_KEY = 'forevers-creation-wizard-state'

async function getForeversCreationWizardProductTypeStepDataFromLocalStorage (plushieId: number): Promise<any> {
  const budsiesStorage = StorageManager.get(SN_BUDSIES);

  let foreversCreationWizardStateByPlushieId = budsiesStorage.getItem(
    `${STORAGE_KEY}/${plushieId}`
  );

  if (!foreversCreationWizardStateByPlushieId) {
    foreversCreationWizardStateByPlushieId = {};
  }

  return foreversCreationWizardStateByPlushieId;
}

export async function saveForeversCreationWizardProductTypeStepData (plushieId: number, productSku: string): Promise<void> {
  const budsiesStorage = StorageManager.get(SN_BUDSIES);

  let foreversCreationWizardStateByPlushieId = await getForeversCreationWizardProductTypeStepDataFromLocalStorage(plushieId);

  foreversCreationWizardStateByPlushieId.productTypeStepData = {
    plushieId,
    productSku
  }

  await budsiesStorage.setItem(
    `${STORAGE_KEY}/${plushieId}`,
    foreversCreationWizardStateByPlushieId
  )
};

export async function saveForeversCreationWizardImageUploadStepData (plushieId: number, imageUploadStepData: ForeversWizardImageUploadStepData): Promise<void> {
  const budsiesStorage = StorageManager.get(SN_BUDSIES);
  let foreversCreationWizardStateByPlushieId = await getForeversCreationWizardProductTypeStepDataFromLocalStorage(plushieId);

  foreversCreationWizardStateByPlushieId.imageUploadStepData = imageUploadStepData;

  await budsiesStorage.setItem(
    `forevers-creation-wizard-state/${plushieId}`,
    foreversCreationWizardStateByPlushieId
  )
};

export async function saveForeversCreationWizardPetInfoStepData (plushieId: number, petInfoStepData: ForeversWizardPetInfoStepData): Promise<void> {
  const budsiesStorage = StorageManager.get(SN_BUDSIES);
  let foreversCreationWizardStateByPlushieId = await getForeversCreationWizardProductTypeStepDataFromLocalStorage(plushieId);

  foreversCreationWizardStateByPlushieId.petInfoStepData = petInfoStepData;

  await budsiesStorage.setItem(
    `forevers-creation-wizard-state/${plushieId}`,
    foreversCreationWizardStateByPlushieId
  )
};

export async function getForeversCreationWizardPersistanceState (plushieId: number): Promise<ForeversCreationWizardPersistanceState | undefined> {
  const budsiesStorage = StorageManager.get(SN_BUDSIES);
  return budsiesStorage.getItem(`${STORAGE_KEY}/${plushieId}`);
}