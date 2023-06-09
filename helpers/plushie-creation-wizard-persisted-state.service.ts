import { StorageManager } from '@vue-storefront/core/lib/storage-manager';
import LocalForageCacheDriver from '@vue-storefront/core/lib/store/storage';
import { Mutex, MutexInterface } from 'async-mutex';

import { SN_BUDSIES } from 'src/modules/budsies/store/mutation-types';
import PlushieCreationWizardPersistedState from 'theme/components/interfaces/plushie-creation-wizard-persisted-state.interface';
import PlushieWizardImageUploadStepData from 'theme/components/interfaces/plushie-wizard-image-upload-step-data.interface';
import PlushieWizardPetInfoStepData from 'theme/components/interfaces/plushie-wizard-pet-info-step-data.interface';

const STORAGE_KEY = 'forevers-creation-wizard-state';

class PlushieCreationWizardPersistedStateService {
  private fBudsiesStorage: LocalForageCacheDriver;
  private fMutex: MutexInterface;

  public constructor () {
    this.fBudsiesStorage = StorageManager.get(SN_BUDSIES);
    this.fMutex = new Mutex();
  }

  public async saveCurrentStepIndex (plushieId: number, stepIndex: number): Promise<void> {
    const mutexRelease = await this.fMutex.acquire();

    try {
      let wizardState = await this.getStateByPlushieId(plushieId);

      if (!wizardState) {
        wizardState = {};
      }

      wizardState.currentStepIndex = stepIndex;

      await this.updateStateForPlushie(plushieId, wizardState);
    } finally {
      mutexRelease();
    }
  }

  public async saveProductTypeStepData (plushieId: number, productSku: string): Promise<void> {
    const mutexRelease = await this.fMutex.acquire();

    try {
      let wizardState = await this.getStateByPlushieId(plushieId);

      if (!wizardState) {
        wizardState = {};
      }

      wizardState.productTypeData = {
        plushieId,
        productSku
      }

      await this.updateStateForPlushie(plushieId, wizardState)
    } finally {
      mutexRelease();
    }
  };

  public async saveImageUploadStepData (plushieId: number, imageUploadStepData: PlushieWizardImageUploadStepData): Promise<void> {
    const mutexRelease = await this.fMutex.acquire();

    try {
      let wizardState = await this.getStateByPlushieId(plushieId);

      if (!wizardState) {
        wizardState = {};
      }

      wizardState.imageUploadStepData = imageUploadStepData;

      await this.updateStateForPlushie(plushieId, wizardState)
    } finally {
      mutexRelease();
    }
  };

  public async savePetInfoStepData (plushieId: number, petInfoStepData: PlushieWizardPetInfoStepData): Promise<void> {
    const mutexRelease = await this.fMutex.acquire();

    try {
      let wizardState = await this.getStateByPlushieId(plushieId);

      if (!wizardState) {
        wizardState = {};
      }

      wizardState.petInfoStepData = petInfoStepData;

      await this.updateStateForPlushie(plushieId, wizardState)
    } finally {
      mutexRelease();
    }
  };

  public async getStateByPlushieId (plushieId: number): Promise<PlushieCreationWizardPersistedState | undefined> {
    let wizardStateDictionary = await this.fBudsiesStorage.getItem(STORAGE_KEY);

    if (!wizardStateDictionary) {
      return;
    }

    return wizardStateDictionary[plushieId];
  }

  public async removeStateByPlushieId (plushieId: number): Promise<void> {
    const mutexRelease = await this.fMutex.acquire();

    try {
      let wizardStateDictionary = await this.fBudsiesStorage.getItem(STORAGE_KEY);
      if (!wizardStateDictionary || !wizardStateDictionary[plushieId]) {
        return;
      }

      delete wizardStateDictionary[plushieId];

      await this.fBudsiesStorage.setItem(
        STORAGE_KEY,
        wizardStateDictionary
      )
    } finally {
      mutexRelease();
    }
  }

  private async updateStateForPlushie (plushieId: number, state: PlushieCreationWizardPersistedState): Promise<void> {
    let stateDictionary = await this.fBudsiesStorage.getItem(STORAGE_KEY);

    if (!stateDictionary) {
      stateDictionary = {};
    }

    stateDictionary[plushieId] = state;

    await this.fBudsiesStorage.setItem(
      STORAGE_KEY,
      stateDictionary
    )
  }
}

const foreversCreationWizardPersistedStateService = new PlushieCreationWizardPersistedStateService();

export default foreversCreationWizardPersistedStateService;
