<template>
  <validation-observer
    v-if="isReady"
    ref="validationObserver"
    tag="div"
    class="order-item-photo-upload-form"
  >
    <customization-option
      :product-id="+product.id"
      :customization="customization"
      :value="customizationOptionValue[customization.id]"
      :field-name-prefix="orderItem.item_id.toString()"
      :is-disabled="isPending"
      @input="updateCustomizationOptionValue"
      @customization-option-busy-state-changed="onEntityBusyChanged"
    />
    <m-spinner-button
      :disabled="isSubmitDisabled"
      :show-spinner="isPending"
      @click="submitPhotos"
    >
      {{ $t('Submit photos') }}
    </m-spinner-button>
  </validation-observer>
</template>

<script lang="ts">
import {
  defineComponent,
  PropType,
  ref,
  toRef,
  watch
} from 'vue';
import { ValidationObserver } from 'vee-validate';

import { OrderItem } from 'src/modules/orders-history/types/order-item';

import { useOrderItemPhotoUpload } from 'theme/helpers/use-order-item-photo-upload';

import CustomizationOption from 'theme/components/customization-system/customization-option.vue';
import MSpinnerButton from 'theme/components/molecules/m-spinner-button.vue';

export default defineComponent({
  name: 'OrderItemPhotoUploadForm',
  components: {
    CustomizationOption,
    MSpinnerButton,
    ValidationObserver
  },
  props: {
    orderItem: {
      type: Object as PropType<OrderItem>,
      required: true
    }
  },
  setup (props, { emit }) {
    const validationObserver = ref<InstanceType<typeof ValidationObserver> | null>(null);
    const photoUpload = useOrderItemPhotoUpload(toRef(props, 'orderItem'), async () => {
      return validationObserver.value ? validationObserver.value.validate() : false;
    });
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
  display: flex;
  flex-direction: column;
  gap: var(--spacer-sm);
}
</style>
