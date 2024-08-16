<template>
  <div class="o-budsies-pals-kit-product-order-form">
    <a-product-price :product="product" />

    <form class="_form">
      <validation-observer v-slot="{ passes }">
        <div class="_row">
          <div class="_field">
            <div class="_title">
              {{ $t('Hospital Or Nonprofit') }}:
            </div>

            <validation-provider
              v-slot="{ errors }"
              :name="`'${$t('Hospital')}'`"
              rules="required"
              tag="div"
            >
              <SfSelect
                class="sf-select--underlined _select"
                v-model="selectedHospital"
                :disabled="isSubmitting"
                :valid="!errors.length"
                :error-message="errors[0]"
              >
                <SfSelectOption
                  v-for="option in hospitalsList"
                  :key="option.name"
                  :value="option.name"
                >
                  {{ option.name }}
                </SfSelectOption>
              </SfSelect>
            </validation-provider>
          </div>
        </div>

        <div class="_button-container">
          <div class="_field">
            <div class="_title">
              {{ $t('Quantity') }}:
            </div>

            <a-custom-product-quantity
              class="_quantity-selector"
              v-model="quantity"
              :disabled="isSubmitting"
            />
          </div>

          <SfButton
            class="_button"
            :disabled="isSubmitting"
            @click.prevent="passes(() => onSubmit())"
          >
            {{ $t('Purchase') }}
          </SfButton>
        </div>
      </validation-observer>
    </form>

    <div class="_disclaimer">
      {{ $t('We respect each facility\'s and family\'s privacy, but do our best to share photo and video updates of the children after they receive their magical creations.') }}
    </div>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';
import { ValidationObserver, ValidationProvider, extend } from 'vee-validate';
import { required } from 'vee-validate/dist/rules';

import { SfButton, SfSelect } from '@storefront-ui/vue';

import Product from '@vue-storefront/core/modules/catalog/types/Product';
import { PRODUCT_SET_CUSTOM_OPTION } from '@vue-storefront/core/modules/catalog/store/product/mutation-types';
import { Hospital } from 'src/modules/budsies';

import AProductPrice from 'theme/components/atoms/a-product-price.vue';
import ACustomProductQuantity from 'theme/components/atoms/a-custom-product-quantity.vue';
import { CustomOption } from 'core/modules/catalog/types/CustomOption';

extend('required', {
  ...required,
  message: 'The {_field_} field is required'
});

const hospitalCustomOptionTitle = 'hospital name';

export default Vue.extend({
  name: 'OBudsiesPalsKitProductOrderForm',
  props: {
    product: {
      type: Object as PropType<Product>,
      required: true
    },
    hospitalsList: {
      type: Array as PropType<Hospital[]>,
      default: () => ([])
    }
  },
  components: {
    ACustomProductQuantity,
    AProductPrice,
    SfButton,
    SfSelect,
    ValidationObserver,
    ValidationProvider
  },
  data () {
    return {
      selectedHospital: undefined as string | undefined,
      quantity: 1,
      isSubmitting: false
    }
  },
  computed: {
    hospitalCustomOption (): CustomOption | undefined {
      return this.product.custom_options?.find(
        (option) => option.title.toLowerCase() === hospitalCustomOptionTitle
      );
    }
  },
  methods: {
    async onSubmit (): Promise<void> {
      if (this.isSubmitting) {
        return;
      }

      this.isSubmitting = true;

      try {
        await this.$store.dispatch(
          'product/setCustomOptions',
          {
            product: this.product,
            customOptions: this.$store.state.product.current_custom_options
          }
        );

        await this.$store.dispatch('cart/addItem', {
          productToAdd: Object.assign({}, this.product, {
            qty: this.quantity
          })
        });

        this.$router.push({
          name: 'cross-sells',
          params: {
            parentSku: this.product.sku
          }
        });
      } finally {
        this.isSubmitting = false;
      }
    },
    setCustomOptionValue (optionId: number, optionValue?: string): void {
      this.$store.commit('product' + '/' + PRODUCT_SET_CUSTOM_OPTION, { optionId, optionValue });
    }
  },
  watch: {
    selectedHospital (val: string | undefined): void {
      if (!this.hospitalCustomOption) {
        return;
      }

      this.setCustomOptionValue(
        this.hospitalCustomOption.option_id,
        val
      );
    }
  }
});
</script>

<style lang="scss">
.o-budsies-pals-kit-product-order-form {
  ._title {
    font-weight: var(--font-medium);
  }

  ._select {
    --select-padding: 0;
  }

  ._form {
    margin-top: var(--spacer-lg);
  }

  ._button-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: var(--spacer-base);
  }

  ._disclaimer {
    margin-top: var(--spacer-lg);
    font-size: var(--font-xs);
    text-align: center;
    opacity: 0.7;
  }

  ._quantity-selector {
    margin-top: var(--spacer-2xs);
  }
}
</style>
