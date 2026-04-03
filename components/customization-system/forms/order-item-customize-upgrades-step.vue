<template>
  <alteration-product-form
    :alteration-product="alterationProduct"
    :is-expandable="false"
    :order-item="orderItem"
    @added-to-cart="onAddedToCart"
    class="order-item-customize-upgrades-step"
  >
    <template #actions>
      <SfButton
        class="color-secondary"
        :disabled="isNavigating"
        @click="onContinueWithoutUpgradesClick"
      >
        {{ $t('Continue without Upgrades') }}
      </SfButton>
    </template>
  </alteration-product-form>
</template>

<script lang="ts">
import {
  defineComponent,
  PropType,
  ref
} from '@vue/composition-api';
import { SfButton } from '@storefront-ui/vue';

import Product from '@vue-storefront/core/modules/catalog/types/Product';

import { OrderItem } from 'src/modules/orders-history';

import AlterationProductForm from 'theme/components/customization-system/forms/alteration-product-form.vue';

export default defineComponent({
  name: 'OrderItemCustomizeUpgradesStep',
  components: {
    AlterationProductForm,
    SfButton
  },
  props: {
    orderItem: {
      type: Object as PropType<OrderItem>,
      required: true
    },
    alterationProduct: {
      type: Object as PropType<Product | undefined>,
      default: undefined
    }
  },
  setup (_, context) {
    const isNavigating = ref<boolean>(false);

    function onAddedToCart (): void {
      context.root.$router.replace({ name: 'detailed-cart' });
    }

    function onContinueWithoutUpgradesClick (): void {
      if (isNavigating.value) {
        return;
      }

      isNavigating.value = true;
      context.root.$router.replace({ name: 'orders-history' });
    }

    return {
      isNavigating,
      onAddedToCart,
      onContinueWithoutUpgradesClick
    };
  }
});
</script>

<style lang="scss" scoped>
@import "~@storefront-ui/shared/styles/helpers/breakpoints";

.order-item-customize-upgrades-step {
  --alteration-form-buttons-flex-direction: column-reverse;

  border: none;

  @include for-desktop() {
    --alteration-form-buttons-flex-direction: row;
  }
}
</style>
