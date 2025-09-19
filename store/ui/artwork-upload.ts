export interface UploaderData {
  uid: number,
  hasUploadedFiles: boolean,
  availableForUploadFilesCount: number
};

interface ArtworkUploadStoreState {
  activeUploaders: UploaderData[]
};

export const artworkUploadStore = {
  state: {
    activeUploaders: [] as UploaderData[]
  },
  mutations: {
    registerUploader (state: ArtworkUploadStoreState, uploaderData: UploaderData) {
      state.activeUploaders.push(uploaderData);
    },
    unregisterUploader (state: ArtworkUploadStoreState, uploaderUid: number) {
      const index = state.activeUploaders.findIndex(({ uid }) => uid === uploaderUid);

      if (index < 0) {
        return;
      }

      state.activeUploaders.splice(index, 1);
    },
    updateUploaderData (
      state: ArtworkUploadStoreState,
      { uid, dataForUpdate }: { uid: number, dataForUpdate: Partial<UploaderData> }
    ) {
      const index = state.activeUploaders.findIndex((uploaderData) => uid === uploaderData.uid);

      if (index < 0) {
        return;
      }

      const uploader = { ...state.activeUploaders[index], ...dataForUpdate };
      state.activeUploaders.splice(index, 1, uploader);
    }
  },
  getters: {
    getUploaders (state: ArtworkUploadStoreState): UploaderData[] {
      return state.activeUploaders;
    }
  }
}
