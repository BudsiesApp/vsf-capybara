<template>
  <div
    v-if="isReady"
    class="order-item-photo-upload-form"
  >
    <div class="_collapsible" :class="{ '-expanded': !isFormOpen }">
      <div class="_collapsible-inner">
        <SfButton
          class="_button color-secondary"
          @click="openForm"
        >
          {{ $t('Upload photos') }}
        </SfButton>
      </div>
    </div>

    <div class="_collapsible" :class="{ '-expanded': isFormOpen }">
      <div class="_collapsible-inner">
        <validation-observer
          ref="validationObserver"
          tag="div"
          class="_form"
        >
          <customization-option
            :product-id="+product.id"
            :customization="customization"
            :value="customizationOptionValue[customization.id]"
            :field-name-prefix="orderItemId.toString()"
            :is-disabled="isPending"
            @input="updateCustomizationOptionValue"
            @customization-option-busy-state-changed="onEntityBusyChanged"
          />

          <div class="_actions">
            <SfButton
              class="_button color-secondary"
              :disabled="isCancelDisabled"
              @click="cancel"
            >
              {{ $t('Cancel') }}
            </SfButton>

            <m-spinner-button
              class="_button _submit-button"
              :disabled="isSubmitDisabled"
              :show-spinner="isPending"
              @click="submitPhotos"
            >
              {{ $t('Submit photos') }}
            </m-spinner-button>
          </div>
        </validation-observer>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  ref,
  toRef,
  watch
} from 'vue';
import { SfButton } from '@storefront-ui/vue';
import { ValidationObserver } from 'vee-validate';

import { useOrderItemPhotoUpload } from 'theme/helpers/use-order-item-photo-upload';

import CustomizationOption from 'theme/components/customization-system/customization-option.vue';
import MSpinnerButton from 'theme/components/molecules/m-spinner-button.vue';

export default defineComponent({
  name: 'OrderItemPhotoUploadForm',
  components: {
    CustomizationOption,
    MSpinnerButton,
    SfButton,
    ValidationObserver
  },
  props: {
    orderItemId: {
      type: Number,
      required: true
    },
    productSku: {
      type: String,
      required: true
    }
  },
  setup (props, { emit }) {
    const validationObserver = ref<InstanceType<typeof ValidationObserver> | null>(null);
    const photoUpload = useOrderItemPhotoUpload(
      toRef(props, 'orderItemId'),
      toRef(props, 'productSku'),
      async () => validationObserver.value ? validationObserver.value.validate() : false,
      () => emit('submitted')
    );
    watch(photoUpload.isReady, value => emit('ready-changed', value), { immediate: true });

    return {
      ...photoUpload,
      validationObserver
    };
  }
});
</script>

<style lang="scss" scoped>
.order-item-photo-upload-form {
  align-self: stretch;

  ._button {
    --button-font-size: var(--font-xs);
    --button-padding: var(--spacer-xs) var(--spacer-sm);
  }

  // Matches the 2px border of the secondary action buttons so all buttons share one height.
  ._submit-button {
    --button-border-width: 2px;
    --button-border-color: transparent;
  }

  ._button.color-secondary:hover {
    color: var(--c-white);
  }

  ._collapsible {
    display: grid;
    grid-template-rows: 0fr;
    visibility: hidden;
    transition: grid-template-rows 300ms ease-in-out, visibility 0s linear 300ms;
    will-change: grid-template-rows;

    &.-expanded {
      grid-template-rows: 1fr;
      visibility: visible;
      transition: grid-template-rows 300ms ease-in-out, visibility 0s linear 0s;
    }
  }

  ._collapsible-inner {
    overflow: hidden;
    min-height: 0;
  }

  ._form {
    display: flex;
    flex-direction: column;
    gap: var(--spacer-sm);
  }

  ._actions {
    display: flex;
    justify-content: flex-end;
    gap: var(--spacer-xs);
  }
}
</style>
