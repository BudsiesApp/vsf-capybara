<template>
  <div ref="dropzone" class="m-artwork-upload _drop-zone" :class="classes">
    <div ref="dropzoneOverlay" class="_dropzone-overlay" />

    <slot />

    <div class="_upload-block">
      <file-pond
        ref="fileInput"
        class="_uploader"
        :class="{ '-disabled': disabled }"
        :disabled="disabled"
        name="file"
        accepted-file-types="image/gif, image/jpeg, image/png, image/heic, image/heif, application/pdf"
        image-transform-output-mime-type="image/jpeg"
        max-file-size="20MB"
        label-idle="Drag + Drop or <span class='filepond--label-action' tabindex='0' role='button'> Select File </span>"
        :max-files="maxFiles"
        :files="files"
        :allow-multiple="allowMultiple"
        :allow-drop="false"
        :drop-on-element="false"
        :file-validate-type-detect-type="detectFileType"
        :server="{
          process: processUpload,
          revert: processRevert,
          load: loadExisting
        }"
        @processfile="onFileProcessed"
        @processfiles="onAllFilesProcessed"
        @addfile="onFileAdded"
        @processfileabort="onFileAbort"
        @removefile="onFileRemove"
        @addfilestart="updateStatus"
        @processfilestart="updateStatus"
        @init="onFilePondInit"
      />

      <div
        class="_error-text"
        v-if="isMaxFilesLimitWarningShow"
      >
        {{ $t('You can only upload {count} files', {count: maxFiles}) }}
      </div>
    </div>
  </div>
</template>

<script lang="ts">
// Import FilePond styles
import 'filepond/dist/filepond.min.css';
import 'filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css';

import Vue, { PropType, ref, VueConstructor } from 'vue';
// Import Vue FilePond
import vueFilePond, { VueFilePondComponent } from 'vue-filepond';
import { File as FilePond, FileOrigin, FilePondFile, FileStatus } from 'filepond';
// Import image preview and file type validation plugins
import FilePondPluginFileValidateSize from 'filepond-plugin-file-validate-size';
import FilePondPluginFileValidateType from 'filepond-plugin-file-validate-type';
import FilePondPluginImageExifOrientation from 'filepond-plugin-image-exif-orientation';
import FilePondPluginImagePreview from 'filepond-plugin-image-preview';
// import FilePondPluginImageResize from "filepond-plugin-image-resize";
import FilePondPluginImageTransform from 'filepond-plugin-image-transform';

import EventBus from '@vue-storefront/core/compatibility/plugins/event-bus';
import { InjectType, CustomerImage } from 'src/modules/shared';
import { ErrorConverterService } from 'src/modules/budsies';
import {
  FileProcessingRepositoryFactory,
  FileProcessingRepository,
  ImageType
} from 'src/modules/file-storage';

import getCurrentThemeClass from 'theme/helpers/get-current-theme-class';
import { FilesUploaderEvents } from 'theme/interfaces/files-uploader-events';

// Create component
const FilePondComponent = vueFilePond(
  FilePondPluginFileValidateType,
  FilePondPluginFileValidateSize,
  FilePondPluginImageExifOrientation,
  FilePondPluginImageTransform,
  FilePondPluginImagePreview
);

interface FilePondErrorDescription {
  type: string,
  code: number,
  body: string
}

interface FilePondInitialFile {
  source: string,
  options: {
    type: 'input' | 'limbo' | 'local',
    file?: {
      name?: string,
      size?: number,
      type?: string
    },
    metadata?: { [key: string]: any }
  }
}

interface InjectedServices {
  fErrorConverterService: ErrorConverterService,
  fFileProcessingRepositoryFactory: FileProcessingRepositoryFactory,
  window: Window
}

const MAX_FILES_LIMIT_WARNING_SHOW_TIME = 3000;
const MAX_FILES_COUNT = 20;

export default (Vue as VueConstructor<Vue & InjectedServices>).extend({
  name: 'MArtworkUpload',
  components: {
    FilePond: FilePondComponent
  },
  inject: {
    fErrorConverterService: { from: 'ErrorConverterService' },
    fFileProcessingRepositoryFactory: { from: 'FileProcessingRepositoryFactory' },
    window: { from: 'WindowObject' }
  } as unknown as InjectType<InjectedServices>,
  props: {
    productId: {
      type: String,
      required: true
    },
    uploadUrl: {
      type: String,
      required: true
    },
    allowMultiple: {
      type: Boolean,
      default: false
    },
    disabled: {
      type: Boolean,
      default: false
    },
    initialItems: {
      type: Array as PropType<CustomerImage[]>,
      default: () => []
    },
    maxFiles: {
      type: Number as PropType<number | null>,
      default: null
    },
    ariaDescribedby: {
      type: String as PropType<string | undefined>,
      default: undefined
    },
    ariaInvalid: {
      type: String as PropType<string | undefined>,
      default: undefined
    },
    ariaLabelledby: {
      type: String as PropType<string | undefined>,
      default: undefined
    }
  },
  setup () {
    return {
      dropzone: ref<HTMLElement | null>(null),
      dropzoneOverlay: ref<HTMLElement | null>(null),
      fileInput: ref<VueFilePondComponent | null>(null)
    };
  },
  data () {
    return {
      file: undefined as undefined | string,
      fRemoveRequestsCount: 0,
      fIsBusy: false,
      fFileProcessingRepository: undefined as undefined | FileProcessingRepository,
      fDragHoverHandler: undefined as undefined | ((e: DragEvent) => void),
      fDragDropHandler: undefined as undefined | ((e: DragEvent) => void),
      files: undefined as FilePondInitialFile[] | undefined,
      filesCount: 0,
      isMaxFilesLimitWarningShow: false,
      maxFilesLimitWarningTimeout: undefined as undefined | number
    }
  },
  computed: {
    availableForUploadFilesCount (): number {
      if (this.disabled || this.isMaxFilesCountReached) {
        return 0;
      }

      if (!this.maxFiles) {
        return MAX_FILES_COUNT;
      }

      return Math.max(0, this.maxFiles - this.filesCount);
    },
    hasUploadedFiles (): boolean {
      return this.filesCount > 0;
    },
    classes (): string[] {
      const result = [getCurrentThemeClass()];

      if (this.allowMultiple) {
        result.push('-multiple-items');
      }

      return result;
    },
    isBusy (): boolean {
      return this.fIsBusy || this.fRemoveRequestsCount > 0;
    },
    isMaxFilesCountReached (): boolean {
      return !!this.maxFiles && this.maxFiles <= this.filesCount;
    }
  },
  created () {
    this.fFileProcessingRepository = this.fFileProcessingRepositoryFactory.create(
      this.uploadUrl
    );
    this.fDragHoverHandler = (e: DragEvent) => this.onDropzoneDragHover(e);
    this.fDragDropHandler = (e: DragEvent) => this.onDropzoneDrop(e);
    this.initFiles();
  },
  mounted (): void {
    const dropzone = this.getDropzone();
    const dropzoneOverlay = this.getDropzoneOverlay();

    this.registerUploaderInStore();

    EventBus.$on(FilesUploaderEvents.FILES_UPLOADER_MAX_FILES_COUNT_REACHED, this.onMaxFilesCountReached);
    EventBus.$on(FilesUploaderEvents.FILES_UPLOADER_FILES_TO_UPLOAD_ADDED, this.onFilesToUploadAdded);

    if (
      !dropzone ||
      !dropzoneOverlay ||
      !this.fDragHoverHandler ||
      !this.fDragDropHandler
    ) {
      return;
    }

    dropzone.addEventListener('dragover', this.fDragHoverHandler, {
      capture: true
    });

    dropzoneOverlay.addEventListener('dragleave', this.fDragHoverHandler, {
      capture: true
    });

    dropzoneOverlay.addEventListener('drop', this.fDragDropHandler, {
      capture: true
    });
  },
  beforeDestroy (): void {
    this.unregisterUploaderInStore();

    EventBus.$off(FilesUploaderEvents.FILES_UPLOADER_MAX_FILES_COUNT_REACHED, this.onMaxFilesCountReached);
    EventBus.$off(FilesUploaderEvents.FILES_UPLOADER_FILES_TO_UPLOAD_ADDED, this.onFilesToUploadAdded);

    const dropzone = this.getDropzone();
    const dropzoneOverlay = this.getDropzoneOverlay();

    if (
      !dropzone ||
      !dropzoneOverlay ||
      !this.fDragHoverHandler ||
      !this.fDragDropHandler
    ) {
      return;
    }

    dropzone.removeEventListener('dragover', this.fDragHoverHandler, {
      capture: true
    });

    dropzoneOverlay.removeEventListener('dragleave', this.fDragHoverHandler, {
      capture: true
    });

    dropzoneOverlay.removeEventListener('drop', this.fDragDropHandler, {
      capture: true
    });
  },
  methods: {
    onFilePondInit (): void {
      this.syncAccessibilityAttributes();
    },
    getFilepondInput (): HTMLElement | undefined {
      const fileInput = this.getFileInput();

      if (!fileInput || !fileInput.$el) {
        return;
      }

      return fileInput.$el.querySelector('.filepond--label-action') as HTMLElement | undefined;
    },
    focusFilepondInput (): void {
      const input = this.getFilepondInput();

      if (!input) {
        return;
      }

      input.focus();
    },
    syncAccessibilityAttributes (): void {
      const fileInput = this.getFileInput();

      if (fileInput && fileInput.$el) {
        const input = this.getFilepondInput();
        const label = fileInput.$el.querySelector('.filepond--drop-label > label');

        if (this.ariaLabelledby) {
          input?.setAttribute('aria-labelledby', this.ariaLabelledby);
          label?.removeAttribute('aria-hidden');
        }

        if (this.ariaDescribedby) {
          input?.setAttribute('aria-describedby', this.ariaDescribedby);
        } else {
          input?.removeAttribute('aria-describedby');
        }

        if (typeof this.ariaInvalid !== 'undefined') {
          input?.setAttribute('aria-invalid', this.ariaInvalid);
        } else {
          input?.removeAttribute('aria-invalid');
        }
      }
    },
    getFiles (): FilePondFile[] {
      const fileInput = this.getFileInput();

      if (!fileInput) {
        return [];
      }

      return fileInput.getFiles();
    },
    onFileRemove (error: FilePondErrorDescription, event: any) {
      this.updateFilesCount();

      if (!error && this.filesCount === 0) {
        setTimeout(() => {
          this.focusFilepondInput();
        }, 50);
      }

      if (error || event.origin !== FileOrigin.LOCAL) {
        return;
      }

      this.$emit(
        'file-removed',
        event.filenameWithoutExtension
      );

      this.updateUploaderDataInStore();
    },
    clearInput (): void {
      const fileInput = this.getFileInput();
      if (!fileInput) {
        return;
      }

      fileInput.removeFiles();
    },
    browseFiles (): void {
      const fileInput = this.getFileInput();
      if (!fileInput || this.disabled) {
        return;
      }

      fileInput.browse();
    },
    async detectFileType (source: File, type: string) {
      if (type) {
        return type;
      }

      return 'image/' + source.name.toLowerCase().split('.').pop();
    },
    async loadExisting (
      source: string,
      load: (file: File | Blob) => void,
      error: (errorText: string) => void,
      progress: (
        lengthComputable: boolean,
        loaded: number,
        total: number
      ) => void,
      abort: () => void
    ) {
      progress(true, 0, 1024);

      const resource = await fetch(source);

      progress(true, 768, 1024);

      const blob = await resource.blob();

      progress(true, 1024, 1024);

      load(blob);

      return {
        abort: () => {
          abort();
        }
      };
    },
    processUpload (
      fieldName: string,
      file: File,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      metadata: Record<string, any>,
      load: (id: string) => void,
      error: (errorText: string) => void,
      progress: (
        lengthComputable: boolean,
        loaded: number,
        total: number
      ) => void,
      abort: () => void
      // transfer: (transferId: string) => void,
      // options: any
    ) {
      if (!this.fFileProcessingRepository) {
        error('Operations are disabled!');
        return;
      }

      let isAborted = false;

      this.fFileProcessingRepository
        .uploadFile(
          file,
          ImageType.Artwork,
          this.productId,
          (e: ProgressEvent) => {
            progress(e.lengthComputable, e.loaded, e.total);
          }
        )
        .then((item) => {
          if (isAborted) {
            return;
          }
          load(item.id);
          this.$emit('file-added', item);
        })
        .catch((e) => {
          const errors = this.fErrorConverterService.describeError(e);
          error(errors[0]);
        });

      return {
        abort: () => {
          isAborted = true;
          abort();
        }
      };
    },
    async processRevert (
      storageItemId: string,
      load: () => void,
      error: (errorText: string) => void
    ) {
      this.fRemoveRequestsCount++;

      try {
        const fileInput = this.getFileInput();
        if (!fileInput) {
          return;
        }

        load();

        this.updateUploaderDataInStore();

        this.$emit('file-removed', storageItemId);
      } catch (e) {
        const errors = this.fErrorConverterService.describeError(e);
        error(errors[0]);
      } finally {
        this.fRemoveRequestsCount--;
      }
    },
    onFileProcessed (error: Error, file: FilePondFile): void {
      this.updateStatus();
      this.updateUploaderDataInStore();

      if (error) {
        return;
      }

      this.$emit('file-processed', file.serverId);
    },
    onAllFilesProcessed (): void {
      this.updateStatus();
      this.updateUploaderDataInStore();
    },
    onFileAbort (): void {
      this.updateStatus();
      this.updateUploaderDataInStore();
    },
    onFileAdded (error: Error): void {
      if (error) {
        return;
      }

      this.updateStatus();
      this.updateUploaderDataInStore();
    },
    getDropzone (): HTMLElement | undefined {
      return this.dropzone || undefined;
    },
    getDropzoneOverlay (): HTMLElement | undefined {
      return this.dropzoneOverlay || undefined;
    },
    getFileInput (): VueFilePondComponent | undefined {
      return this.fileInput || undefined;
    },
    updateStatus (): void {
      const fileInput = this.getFileInput();
      if (!fileInput) {
        this.fIsBusy = false;
        return;
      }

      const files = fileInput.getFiles();
      let isBusy = false;

      for (const file of files) {
        if ([
          FileStatus.PROCESSING,
          FileStatus.LOADING,
          FileStatus.PROCESSING_QUEUED
        ].includes(file.status)) {
          isBusy = true;
          break;
        }
      }

      this.fIsBusy = isBusy;
    },
    onDropzoneDragHover (e: DragEvent): void {
      e.preventDefault();
      e.stopPropagation();

      const dropzone = this.getDropzone();
      if (!dropzone) {
        return;
      }

      if (
        e.type === 'dragover' &&
        !this.disabled &&
        !this.isMaxFilesCountReached
      ) {
        dropzone.classList.add('-drag-hover');
      } else {
        dropzone.classList.remove('-drag-hover');
      }
    },
    async onDropzoneDrop (e: DragEvent) {
      e.preventDefault();
      e.stopPropagation();

      const dropzone = this.getDropzone();
      if (dropzone) {
        dropzone.classList.remove('-drag-hover');
      }

      const fileInput = this.getFileInput();
      if (!e.dataTransfer || !fileInput || this.disabled) {
        return;
      }

      if (this.isMaxFilesCountReached) {
        this.showMaxFilesLimitWarning();
        return;
      }

      await this.addFilesFromDropEvent(e, fileInput);
    },
    initFiles (): void {
      this.files = this.initialItems.map((item) => ({
        source: item.url,
        options: {
          type: 'local',
          name: item.id
        }
      }));
    },
    registerUploaderInStore (): void {
      const fileInput = this.getFileInput();
      if (!fileInput) {
        return;
      }

      this.updateFilesCount();

      this.$store.commit(
        'ui/registerUploader',
        {
          uid: (fileInput as any)._uid,
          hasUploadedFiles: this.hasUploadedFiles,
          availableForUploadFilesCount: this.availableForUploadFilesCount
        }
      )
    },
    onMaxFilesCountReached ({ uid }: { uid: string }): void {
      const fileInput = this.getFileInput();
      if (!fileInput) {
        return;
      }

      if (uid !== (fileInput as any)._uid) {
        return;
      }

      this.showMaxFilesLimitWarning();
    },
    onFilesToUploadAdded ({ uid, filesToUpload }: { uid: string, filesToUpload: File[] }): void {
      const fileInput = this.getFileInput();
      if (!fileInput) {
        return;
      }

      if (uid !== (fileInput as any)._uid) {
        return;
      }

      this.uploadFiles(filesToUpload);
    },
    showMaxFilesLimitWarning (): void {
      if (this.maxFilesLimitWarningTimeout) {
        clearTimeout(this.maxFilesLimitWarningTimeout);
        this.maxFilesLimitWarningTimeout = undefined;
      }

      this.isMaxFilesLimitWarningShow = true;

      this.maxFilesLimitWarningTimeout = this.window.setTimeout(() => {
        this.isMaxFilesLimitWarningShow = false;
        this.maxFilesLimitWarningTimeout = undefined;
      }, MAX_FILES_LIMIT_WARNING_SHOW_TIME);
    },
    unregisterUploaderInStore (): void {
      const fileInput = this.getFileInput();
      if (!fileInput) {
        return;
      }

      this.$store.commit('ui/unregisterUploader', (fileInput as any)._uid);
    },
    updateFilesCount (): void {
      const fileInput = this.getFileInput();

      if (!fileInput) {
        this.filesCount = 0;
        return;
      }

      this.filesCount = fileInput.getFiles().length;
    },
    async updateUploaderDataInStore (): Promise<void> {
      await this.$nextTick();
      this.updateFilesCount();
    },
    async uploadFiles (files: File[] | Blob[]): Promise<void> {
      const fileInput = this.getFileInput();

      if (!fileInput || this.disabled) {
        return;
      }

      await fileInput.addFiles(files);
    },
    async addFilesFromDropEvent (event: DragEvent, fileInput: VueFilePondComponent): Promise<void> {
      if (!event.dataTransfer) {
        throw new Error('event.dataTransfer is not defined');
      }
      const droppedFiles = [].slice.call(event.dataTransfer.files);

      try {
        await fileInput.addFiles(droppedFiles);
      } catch (e) {
        //
      }
    }
  },
  watch: {
    isBusy: {
      handler (newValue: boolean) {
        this.$emit('is-busy-changed', newValue);
      },
      immediate: false
    },
    initialItems (newValue: CustomerImage[]) {
      if (!newValue.length) {
        this.initFiles();
      }
    },
    availableForUploadFilesCount () {
      const fileInput = this.getFileInput();

      if (!fileInput) {
        this.filesCount = 0;
        return;
      }

      this.$store.commit(
        'ui/updateUploaderData',
        {
          uid: (fileInput as any)._uid,
          dataForUpdate: {
            hasUploadedFiles: this.hasUploadedFiles,
            availableForUploadFilesCount: this.availableForUploadFilesCount
          }
        }
      );
    },
    ariaDescribedby () {
      this.$nextTick(() => {
        this.syncAccessibilityAttributes();
      });
    },
    ariaInvalid () {
      this.$nextTick(() => {
        this.syncAccessibilityAttributes();
      });
    },
    ariaLabelledby () {
      this.$nextTick(() => {
        this.syncAccessibilityAttributes();
      });
    }
  }
})
</script>

<style lang="scss" scoped>
@import "~@storefront-ui/shared/styles/components/atoms/SfButton";
@import "theme/css/components/atoms/SfButton";

.m-artwork-upload {
    &._drop-zone {
        position: relative;

        ._dropzone-overlay {
            bottom: -0.6em;
            display: none;
            left: -0.6em;
            outline: 2px dashed;
            position: absolute;
            right: -0.6em;
            top: -0.6em;
            z-index: 1;
        }

        &.-drag-hover {
            ._dropzone-overlay {
                display: block;
            }
        }
    }

    ._uploader {
        &.-disabled {
            pointer-events: none;
        }
    }

    ._error-text {
        font-size: var(--font-sm);
        margin-top: var(--spacer-sm);
        color: var(--c-danger-variant);
    }

    ::v-deep {
        .filepond--root {
            margin-bottom: 0;
            box-sizing: content-box;

            .filepond--list {
              list-style-image: none;
            }

            .filepond--drop-label {
                .filepond--label-action {
                    @extend .sf-button;
                    @extend .color-secondary;
                    --button-font-size: var(--font-xs);
                    --button-display: inline;
                }
            }

            .filepond--drop-label {
                .filepond--label-action {
                    text-decoration: none;
                    margin-left: 1em;
                }
            }
        }

        .filepond--item {
            &[data-filepond-item-state="processing-complete"] {
                .filepond--file {
                    color: #fefefe;
                }
            }
        }
    }

    &.-multiple-items {
      ::v-deep {
        $itemMargin: 0.5em;

        .filepond--root {
            .filepond--list {
              list-style-image: none;
              left: $itemMargin;
              //left: 0;
              right: 0;
            }
        }

        .filepond--item {
          $itemsPerLine: 3;
          //$marginPerItem: $itemMargin * ($itemsPerLine - 1) / $itemsPerLine;
          $marginPerItem: $itemMargin;

          width: calc(100% / #{$itemsPerLine} - #{$marginPerItem});
          margin-left: 0;
          margin-right: $itemMargin;
          margin-bottom: 0.25em;
          margin-top: 0.25em;

          &:nth-child(#{$itemsPerLine}n) {
            margin-right: 0;
          }
        }
      }
    }

    &.-skin-budsies,
    &.-skin-petsies {
        ::v-deep {
            .filepond--root {
                .filepond--panel {
                    border: 1px solid #dadad9 !important;
                }

                .filepond--panel-root {
                    background-color: #fafafa;
                }

                .filepond--credits,
                .filepond--browser {
                    display: none;
                }
            }

            .filepond--item {
                &[data-filepond-item-state="processing-complete"] {
                    .filepond--item-panel {
                        background-color: var(--c-text);
                    }

                    .filepond--image-preview-overlay-success {
                        color: var(--c-text);
                    }
                }

                &[data-filepond-item-state*="error"] {
                    .filepond--item-panel {
                        background-color: var(--c-danger-variant);
                    }
                }

                .filepond--file-wrapper {
                  legend {
                    display: none;
                  }
                }
            }
        }
    }
}
</style>
