import MArtworkUpload from 'theme/components/molecules/m-artwork-upload.vue';

export interface UploaderData {
  uid: number,
  artworkUploadComponent: InstanceType<typeof MArtworkUpload>
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
    }
  },
  getters: {
    getUploaders (state: ArtworkUploadStoreState): UploaderData[] {
      return state.activeUploaders;
    }
  }
}
