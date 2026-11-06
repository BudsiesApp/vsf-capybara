<template>
  <div
    v-if="isReady"
    class="order-item-photo-upload-form"
    :class="{ '-editable': !isSubmitted }"
  >
    <div role="status" aria-live="polite" aria-atomic="true">
      <div
        v-if="isSubmitted"
        ref="confirmation"
        class="_submitted"
        tabindex="-1"
      >
        <SfIcon
          class="_submitted-icon"
          icon="check"
          size="12px"
          color="white"
        />
        <p class="_submitted-text">
          {{ $t('Your photos have been submitted.') }}
        </p>
      </div>
    </div>

    <template v-if="!isSubmitted">
      <div class="_header">
        <SfIcon class="_header-icon" size="1.1rem">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <path d="M4 7h3l2-3h6l2 3h3a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1z" />
            <circle cx="12" cy="13" r="3.5" />
          </svg>
        </SfIcon>

        <div class="_header-text">
          <h4 :id="headingId" class="_title">
            {{ $t('Photos needed') }}
          </h4>
          <p class="_intro">
            {{ $t("We're waiting for your photos. Please upload them here or send them by email.") }}
          </p>
          <div v-if="$scopedSlots['alternative-action']" class="_alternative-action">
            <slot name="alternative-action" />
          </div>
        </div>

        <SfButton
          v-show="!isFormOpen"
          ref="openButton"
          class="_button _open-button color-primary"
          :aria-controls="bodyId"
          :aria-expanded="isFormOpen ? 'true' : 'false'"
          @click="onOpen"
        >
          {{ $t('Upload photos') }}
        </SfButton>
      </div>

      <div
        :id="bodyId"
        class="_collapsible"
        :class="{ '-expanded': isFormOpen }"
      >
        <div class="_collapsible-inner">
          <div
            ref="body"
            class="_body"
            role="region"
            tabindex="-1"
            :aria-labelledby="headingId"
          >
            <validation-observer
              v-if="isFormOpen"
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
                image-upload-appearance="order-history"
                @input="updateCustomizationOptionValue"
                @customization-option-busy-state-changed="onEntityBusyChanged"
              />

              <p
                class="_status"
                :class="{ '-error': !!submissionError }"
                role="status"
                aria-live="polite"
                aria-atomic="true"
              >
                {{ statusMessage }}
              </p>

              <div class="_actions">
                <m-spinner-button
                  class="_button _submit-button"
                  :disabled="isSubmitDisabled"
                  :show-spinner="isPending"
                  @click="submitPhotos"
                >
                  {{ $t('Submit photos') }}
                </m-spinner-button>

                <SfButton
                  class="_button _cancel-button color-secondary"
                  :disabled="isCancelDisabled"
                  @click="onCancel"
                >
                  {{ $t('Cancel') }}
                </SfButton>
              </div>
            </validation-observer>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
  nextTick,
  ref,
  toRef,
  watch
} from 'vue';
import { useI18n } from '@vue-storefront/core/application-services';
import { SfButton, SfIcon } from '@storefront-ui/vue';
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
    SfIcon,
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
    const i18n = useI18n();
    const validationObserver = ref<InstanceType<typeof ValidationObserver> | null>(null);
    const openButton = ref<InstanceType<typeof SfButton> | null>(null);
    const body = ref<HTMLElement | null>(null);
    const confirmation = ref<HTMLElement | null>(null);
    const photoUpload = useOrderItemPhotoUpload(
      toRef(props, 'orderItemId'),
      toRef(props, 'productSku'),
      async () => validationObserver.value ? validationObserver.value.validate() : false,
      () => emit('submitted')
    );
    const headingId = computed(() => `order-item-photo-upload-heading-${props.orderItemId}`);
    const bodyId = computed(() => `order-item-photo-upload-body-${props.orderItemId}`);

    const statusMessage = computed<string>(() => {
      if (photoUpload.submissionError.value) {
        return photoUpload.submissionError.value;
      }

      if (photoUpload.isPending.value) {
        return i18n.t('Submitting your photos...').toString();
      }

      if (photoUpload.isUploading.value) {
        return i18n.t('Uploading photos...').toString();
      }

      const count = photoUpload.imageCount.value;
      if (count === 0) {
        return i18n.t('Choose photos to submit.').toString();
      }

      return count === 1
        ? i18n.t('1 photo selected').toString()
        : i18n.t('{count} photos selected', { count }).toString();
    });

    watch(photoUpload.isReady, value => emit('ready-changed', value), { immediate: true });
    watch(photoUpload.isSubmitted, async value => {
      if (!value) {
        return;
      }

      await nextTick();
      confirmation.value?.focus();
    });

    async function onOpen (): Promise<void> {
      photoUpload.openForm();
      await nextTick();
      body.value?.focus();
    }

    async function onCancel (): Promise<void> {
      if (photoUpload.isCancelDisabled.value) {
        return;
      }

      photoUpload.cancel();
      await nextTick();
      (openButton.value?.$el as HTMLElement | undefined)?.focus();
    }

    return {
      ...photoUpload,
      body,
      bodyId,
      confirmation,
      headingId,
      onCancel,
      onOpen,
      openButton,
      statusMessage,
      validationObserver
    };
  }
});
</script>

<style lang="scss" scoped>
// Layout adapts to the width this form actually gets (the order item column is narrower than the
// viewport): the defaults below are the narrow layout, and the unscoped container rules at the end
// of this file override only the custom properties it reads.
.order-item-photo-upload-form {
  align-self: stretch;
  width: 100%;
  container: photo-upload-form / inline-size;

  &.-editable {
    border: 1px solid var(--c-warning-variant);
    background-color: var(--c-white);
  }

  ._submitted {
    display: flex;
    align-items: center;
    column-gap: var(--spacer-xs);
    padding: var(--spacer-xs) var(--spacer-sm);
    background-color: var(--c-success);
    color: var(--c-white);

    &:focus {
      outline: none;
    }
  }

  ._submitted-text {
    margin: 0;
  }

  ._header {
    display: grid;
    grid-template-columns: var(--photo-form-header-columns, auto minmax(0, 1fr));
    align-items: center;
    column-gap: var(--spacer-sm);
    row-gap: var(--spacer-sm);
    padding: var(--spacer-sm);
    border-left: 4px solid var(--c-warning);
    background-color: var(--c-warning-variant);
  }

  ._header-icon {
    box-sizing: content-box;
    flex: none;
    padding: var(--spacer-xs);
    border-radius: 50%;
    background-color: var(--c-white);
    color: var(--c-warning);
  }

  ._header-text {
    min-width: 0;
  }

  ._title {
    margin: 0;
    color: var(--c-blue);
    font-size: var(--font-base);
    font-weight: var(--font-semibold);
  }

  ._intro {
    margin: calc(var(--spacer-xs) / 2) 0 0;
    font-size: var(--font-sm);
  }

  ._alternative-action {
    margin-top: var(--spacer-xs);
  }

  ._open-button {
    grid-column: var(--photo-form-open-column, 1 / -1);
    width: var(--photo-form-open-width, 100%);
  }

  ._button {
    --button-font-size: var(--font-xs);
    --button-padding: var(--spacer-xs) var(--spacer-sm);
  }

  ._button.color-secondary:hover {
    color: var(--c-white);
  }

  // Matches the 2px border of the secondary action buttons so all buttons share one height.
  ._submit-button {
    --button-border-width: 2px;
    --button-border-color: transparent;

    min-width: 11.5rem;

    ::v-deep .sf-button {
      width: 100%;
    }
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

  ._body {
    padding: var(--spacer-sm);

    &:focus {
      outline: none;
    }
  }

  ._form {
    display: flex;
    flex-direction: column;
    gap: var(--spacer-xs);
  }

  ._status {
    // Reserves the lines the count, progress and error text normally need so they do not move the actions.
    min-height: calc(var(--font-sm) * 1.4 * var(--photo-form-status-lines, 2));
    margin: 0;
    font-size: var(--font-sm);
    line-height: 1.4;

    &.-error {
      padding-left: var(--spacer-xs);
      border-left: 3px solid var(--c-danger-variant);
    }
  }

  // Wraps instead of clipping when the row is too narrow, even without container query support.
  ._actions {
    display: flex;
    flex-direction: var(--photo-form-actions-direction, row);
    flex-wrap: wrap;
    justify-content: flex-start;
    align-items: stretch;
    gap: var(--spacer-xs);
    margin-top: var(--spacer-xs);
  }

  ._submit-button,
  ._cancel-button {
    width: var(--photo-form-actions-button-width, auto);
  }
}
</style>

<!-- The scoped style plugin does not rewrite @container rules, so these only set custom properties. -->
<style lang="scss">
// Room for the icon, a readable text column and the opening action on one row.
@container photo-upload-form (min-width: 32rem) {
  .order-item-photo-upload-form > * {
    --photo-form-header-columns: auto minmax(0, 1fr) auto;
    --photo-form-open-column: auto;
    --photo-form-open-width: auto;
    --photo-form-status-lines: 1;
  }
}

// Below the width of Submit, Cancel and the body padding side by side, stack the actions.
@container photo-upload-form (max-width: 22rem) {
  .order-item-photo-upload-form > * {
    --photo-form-actions-direction: column;
    --photo-form-actions-button-width: 100%;
  }
}
</style>
