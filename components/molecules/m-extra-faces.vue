<template>
  <div class="m-extra-faces" :class="skinClass">
    <div class="_artwork-upload">
      <div class="_step-title" v-show="isUploadersSubtitleVisible">
        Upload additional photos
      </div>
      <div
        v-for="index in maxInputsCount"
        :key="'uploader_wrapper_' + index.toString()"
        class="_extra-face-uploader-wrapper"
      >
        <validation-provider
          v-slot="{ errors }"
          :name="getInputName(index)"
          :rules="showImageUploader(index - 1) ? 'required' : ''"
          :ref="getFieldAnchorName(getInputName(index))"
          v-show="showImageUploader(index - 1)"
        >
          <input
            name="uploaded_artwork_ids[]"
            type="hidden"
            :value="getUploadedArtworkId(index - 1)"
          >

          <MArtworkUpload
            ref="artwork-upload"
            :product-id="backendProductId"
            :upload-url="uploadUrl"
            :disabled="disabled"
            :initial-items="artworkUploadInitialItems(index - 1)"
            @file-added="(value) => onArtworkAdd(index - 1, value)"
            @file-removed="(storageItemId) => onArtworkRemove(index - 1, storageItemId)"
            @is-busy-changed="onArtworkUploadBusyStatusChanged('uploader_wrapper_' + index.toString(), $event)"
          />

          <div class="_error-text">
            {{ errors[0] }}
          </div>
        </validation-provider>
      </div>
    </div>

    <div class="_step-description">
      <div class="_step-title">
        {{ $t(stepTitle) }}
      </div>
      <div class="_step-subtitle">
        How many additional faces do you want to add to the same design?
      </div>
    </div>

    <SfSelect
      v-model="selectedVariant"
      v-if="shouldShowAddonSelector"
      name="extra_faces_addon"
      class="_extra-faces-selector sf-select--underlined"
      selected=""
      :disabled="disabled"
      :should-lock-scroll-on-open="isMobile"
    >
      <SfSelectOption
        v-for="option in selectOptions"
        :key="option.id"
        :value="option.value ? option.value : ''"
      >
        {{ option.label }}
      </SfSelectOption>
    </SfSelect>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';
import { mapMutations } from 'vuex';
import { ValidationProvider, extend } from 'vee-validate';
import { required } from 'vee-validate/dist/rules';
import { SfSelect } from '@storefront-ui/vue';
import * as types from '@vue-storefront/core/modules/catalog/store/product/mutation-types';
import {
  mapMobileObserver,
  unMapMobileObserver
} from '@storefront-ui/vue/src/utilities/mobile-observer';

import { Item } from 'src/modules/file-storage';
import { CustomerImage } from 'src/modules/shared';
import { Dictionary } from 'src/modules/budsies';

import MArtworkUpload from './m-artwork-upload.vue';
import ExtraPhotoAddonOption from '../interfaces/extra-photo-addon-option.interface';
import ExtraFacesConfiguratorData from '../interfaces/extra-faces-configurator-data.interface';

extend('required', {
  ...required,
  message: 'The {_field_} field is required'
});

interface SelectOptionItem {
  id: string,
  value?: ExtraPhotoAddonOption,
  label: string
}

const defaultOptionId = 'no-extra-pets';

export default Vue.extend({
  name: 'MExtraFaces',
  components: {
    ValidationProvider,
    MArtworkUpload,
    SfSelect
  },
  props: {
    availableOptions: {
      type: Array as PropType<ExtraPhotoAddonOption[]>,
      default: []
    },
    backendProductId: {
      type: String,
      required: true
    },
    uploadUrl: {
      type: String,
      required: true
    },
    disabled: {
      type: Boolean,
      default: false
    },
    initialVariant: {
      type: String,
      default: ''
    },
    initialArtworks: {
      type: Array as PropType<CustomerImage[]>,
      default: () => []
    },
    stepTitle: {
      type: String,
      default: 'Add more pets'
    },
    defaultOptionLabel: {
      type: String,
      default: 'No Extra Pets'
    },
    getFieldAnchorName: {
      type: Function as PropType<(fieldName: string) => string>,
      required: true
    }
  },
  data () {
    const artworkUploaderBusyState: Dictionary<boolean> = {};

    return {
      fSelectedVariant: undefined as undefined | ExtraPhotoAddonOption,
      uploaderValues: [] as CustomerImage[],
      shouldShowAddonSelector: true,
      artworkUploaderBusyState
    }
  },
  computed: {
    ...mapMobileObserver(),
    selectOptions (): SelectOptionItem[] {
      const defaultOption = {
        id: defaultOptionId,
        label: this.$t(this.defaultOptionLabel).toString(),
        value: undefined
      }
      const options: SelectOptionItem[] = [defaultOption];

      this.availableOptions.forEach((item) => {
        options.push({
          id: item.id,
          label: item.label,
          value: item
        })
      });

      return options;
    },
    selectedVariant: {
      get: function (): ExtraPhotoAddonOption | undefined {
        return this.fSelectedVariant;
      },
      set: function (value: ExtraPhotoAddonOption | undefined) {
        this.fSelectedVariant = value;

        let extraPhotosCount = 0;
        if (value) {
          extraPhotosCount = this.inputsCount;
        }

        this.uploaderValues.length = Math.min(
          this.uploaderValues.length,
          extraPhotosCount
        );

        this.clearUnusedUploaders();

        const eventData: ExtraFacesConfiguratorData = {
          addon: value,
          storageItems: [...this.uploaderValues]
        };

        this.$emit('input', eventData)
      }
    },
    skinClass (): string {
      return `-skin-petsies`;
    },
    maxInputsCount (): number {
      let maxInputsCount = 0;

      for (const option of this.availableOptions) {
        if (option.value > maxInputsCount) {
          maxInputsCount = option.value;
        }
      }

      return maxInputsCount;
    },
    inputsCount (): number {
      if (!this.selectedVariant) {
        return 0;
      }

      return this.selectedVariant.value;
    },
    isUploadersSubtitleVisible (): boolean {
      return this.inputsCount > 0;
    }
  },
  created (): void {
    for (const artwork of this.initialArtworks) {
      this.uploaderValues.push({
        id: artwork.id,
        url: artwork.url
      });
    }

    const matchingOption = this.availableOptions.find(
      (item) => item.id === this.initialVariant
    );

    if (matchingOption) {
      this.selectedVariant = matchingOption;
    }
  },
  beforeDestroy (): void {
    unMapMobileObserver();
  },
  methods: {
    ...mapMutations('product', {
      setBundleOptionValue: types.PRODUCT_SET_BUNDLE_OPTION
    }),
    artworkUploadInitialItems (index: number): CustomerImage[] | undefined {
      if (!this.initialArtworks.length) {
        return;
      }

      const artwork = this.initialArtworks[index];
      return artwork ? [artwork] : undefined;
    },
    clearUploaders (): void {
      const uploaders = this.getUploaders();

      if (!uploaders) {
        return;
      }

      uploaders.forEach(uploader => uploader.clearInput());
    },
    clearUnusedUploaders (): void {
      const uploaders = this.getUploaders();

      if (!uploaders) {
        return;
      }

      uploaders.forEach((uploader, index) => {
        if (index >= this.uploaderValues.length) {
          uploader.clearInput();
        }
      });
    },
    getInputName (index: number): string {
      return `'Extra Face ${index}'`;
    },
    getUploaders (): InstanceType<typeof MArtworkUpload>[] | undefined {
      return this.$refs['artwork-upload'] as InstanceType<typeof MArtworkUpload>[] | undefined;
    },
    getUploadedArtworkId (index: number): string | undefined {
      const item = this.uploaderValues[index];
      if (!item) {
        return;
      }

      return item.id;
    },
    getFilesIds (): string[] {
      return this.uploaderValues.map(item => item.id);
    },
    reset (): void {
      this.selectedVariant = undefined;
    },
    onArtworkAdd (index: number, value: Item): void {
      this.uploaderValues.splice(index, 0, value);

      const eventData: ExtraFacesConfiguratorData = {
        addon: this.selectedVariant,
        storageItems: [...this.uploaderValues]
      };

      this.$emit('input', eventData)
    },
    onArtworkRemove (index: number, storageItemId: string): void {
      this.uploaderValues.splice(index, 1);

      const eventData: ExtraFacesConfiguratorData = {
        addon: this.selectedVariant,
        storageItems: [...this.uploaderValues]
      };

      this.$emit('input', eventData)
    },
    onArtworkUploadBusyStatusChanged (key: string, isBusy: boolean): void {
      Vue.set(this.artworkUploaderBusyState, key, isBusy);

      const isSomeUploaderBusy = !!Object.values(this.artworkUploaderBusyState).find((isBusy) => isBusy);

      this.$emit('is-busy-changed', isSomeUploaderBusy);
    },
    showImageUploader (uploaderIndex: number): boolean {
      return uploaderIndex < this.inputsCount;
    }
  },
  watch: {
    backendProductId: {
      handler (newValue: string, oldValue: string) {
        if (newValue === oldValue) {
          return;
        }

        this.reset();
      },
      immediate: true
    },
    initialVariant (newValue: string, oldValue: string) {
      if (!newValue && oldValue) {
        this.selectedVariant = undefined;
      }
    }
  }
})
</script>

<style lang="scss" scoped>
.m-extra-faces {
    margin-top: 1em;

    ._step-description {
        margin: 1em 0;
    }

    ._step-title {
        font-size: var(--font-base);
        font-weight: 800;
        text-align: left;
    }

    ._extra-face-uploader-wrapper {
        margin-top: 0.25em;
        margin-bottom: 0.5em;
    }

    ._error-text {
        font-size: 0.8em;
        margin-top: 0.5em;
    }

    &.-skin-petsies {
        ._error-text {
            color: var(--c-danger-variant);
        }
    }
}
</style>
