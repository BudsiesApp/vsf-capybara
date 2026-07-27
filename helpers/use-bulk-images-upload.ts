import { useI18n, useStore } from '@vue-storefront/core/application-services';
import { onBeforeMount, onBeforeUnmount } from 'vue';

import EventBus from '@vue-storefront/core/compatibility/plugins/event-bus';

import { UploaderData } from 'theme/store/ui/artwork-upload';
import { FilesUploaderEvents } from 'theme/interfaces/files-uploader-events';

export function useBulkImagesUpload (
  allowMultipleImagesPerUploader = true
) {
  const applicationStore = useStore();
  const applicationI18n = useI18n();
  function windowDragHoverHandler (event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
  }

  function handleMaxFilesLimitWarning (uploaders: UploaderData[], filesCount: number): void {
    if (uploaders.length === 0) {
      return;
    }

    if (uploaders.length > 1) {
      applicationStore.dispatch('notification/spawnNotification', {
        type: 'error',
        message: applicationI18n.t(
          '{filesCount} images were not uploaded because the maximum number of images reached',
          { filesCount }
        ),
        action1: { label: applicationI18n.t('OK') }
      });
      return;
    }

    const uploader = uploaders[0];

    EventBus.$emit(
      FilesUploaderEvents.FILES_UPLOADER_MAX_FILES_COUNT_REACHED,
      { uid: uploader.uid }
    );
  }

  function windowDropHandler (event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();

    const uploaders: UploaderData[] = applicationStore.getters['ui/getUploaders'];

    if (!uploaders || uploaders.length === 0) {
      return;
    }

    const files = event.dataTransfer?.files;

    if (!files || files.length === 0) {
      return;
    }

    let uploadedFilesCount = 0;

    for (const uploader of uploaders) {
      let availableForUploadFilesCount = uploader.availableForUploadFilesCount;

      if (availableForUploadFilesCount === 0) {
        continue;
      }

      if (!allowMultipleImagesPerUploader) {
        if (uploader.hasUploadedFiles) {
          continue;
        }

        availableForUploadFilesCount = 1;
      }

      const filesToUpload = Array.from(files).slice(
        uploadedFilesCount,
        uploadedFilesCount + availableForUploadFilesCount
      );

      EventBus.$emit(
        FilesUploaderEvents.FILES_UPLOADER_FILES_TO_UPLOAD_ADDED,
        { uid: uploader.uid, filesToUpload }
      );
      uploadedFilesCount += filesToUpload.length;
    }

    if ((files.length - uploadedFilesCount) > 0) {
      handleMaxFilesLimitWarning(uploaders, files.length - uploadedFilesCount);
    }
  }

  onBeforeMount(() => {
    window.addEventListener('dragover', windowDragHoverHandler);
    window.addEventListener('dragleave', windowDragHoverHandler);
    window.addEventListener('drop', windowDropHandler);
  });

  onBeforeUnmount(() => {
    window.removeEventListener('dragover', windowDragHoverHandler);
    window.removeEventListener('dragleave', windowDragHoverHandler);
    window.removeEventListener('drop', windowDropHandler);
  });

  return {};
}
