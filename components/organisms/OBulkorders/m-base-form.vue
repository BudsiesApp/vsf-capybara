<template>
  <div class="m-base-form">
    <div class="_section">
      <AOrderedHeading
        :order="1"
        :level="3"
        :title="$t('Please upload your awesome design')"
        class="_title -required"
      />

      <MArtworkUpload
        :allow-multiple="true"
        :disabled="isDisabled"
        :product-id="backendProductId"
        :upload-url="artworkUploadUrl"
        :max-files="3"
        @file-added="onArtworkAdd"
        @file-removed="onArtworkRemove"
      />

      <div
        class="_error-text"
        v-if="$v.value.customerImages && $v.value.customerImages.$error"
      >
        {{ $t('Please provide your artwork to continue.') }}
      </div>
    </div>

    <div class="_section">
      <AOrderedHeading
        :order="2"
        :level="3"
        :title="$t('Project Name')"
        class="_title"
      />

      <SfInput
        :label="$t('Project Name')"
        v-model="name"
        :disabled="isDisabled"
        class="sf-input--required"
        :valid="!$v.value.name || !$v.value.name.$error"
        :error-message="$t('This field should not be blank.')"
      />

      <span class="_hint">
        {{ $t('This could be the name of your character or name of your project(e.g., \'Danny the Dolphin\')') }}
      </span>
    </div>

    <div class="_section">
      <AOrderedHeading
        :order="3"
        :level="3"
        :title="$t('Describe your design')"
        class="_title -required"
      />

      <textarea
        name="description"
        rows="5"
        v-model="description"
        :placeholder="$t('Give us any additional direction as we create your plush prototype')"
        :disabled="isDisabled"
      />

      <div
        class="_error-text"
        v-if="$v.value.description && $v.value.description.$error"
      >
        {{ $t('This field should not be blank.') }}
      </div>
    </div>

    <slot name="bodyparts" />

    <div class="_section">
      <AOrderedHeading
        :order="quantityStepOrder"
        :level="3"
        :title="$t('What quantity are you interested in?')"
        class="_title"
      />

      <span class="_helper">
        {{ $t('Best price breaks occur at volumes of 100, 500, and 1,000.') }}
      </span>

      <slot name="quantity-helper" />

      <SfInput
        :label="$t('Quantity')"
        :disabled="isDisabled"
        class="sf-input--required -quantity"
        v-model="quantity"
        :valid="!$v.value.quantity || !$v.value.quantity.$error"
      />

      <div
        class="_error-text"
        v-if="$v.value.quantity && $v.value.quantity.$error"
      >
        <template v-if="!$v.value.quantity || !$v.value.quantity.required">
          {{ $t('This field is required') }}
        </template>

        <template v-else>
          {{ $t('For orders less than 50, please upload your character to our sister company') }}

          <a :href="budsiesStoreDomain" target="_blank">
            Budsies.com
          </a>
        </template>
      </div>

      <div class="_additional-quantity" v-show="showAdditionalQuantity">
        <span class="_helper">
          {{ $t('Don\'t worry, we will quote you the quantity you enter and the quantity with the next price break. However, you can also enter another quantity below and we\'ll quote you both!') }}
        </span>

        <SfInput
          :label="$t('Also quote this quantity:')"
          :disabled="isDisabled"
          v-model="additionalQuantity"
        />
      </div>

      <SfButton
        class="sf-button--text _quantity-button"
        @click="showAdditionalQuantity = !showAdditionalQuantity"
      >
        {{ quantityButtonText }}
      </SfButton>
    </div>

    <div class="_section">
      <AOrderedHeading
        :order="deadlineStepOrder"
        :level="3"
        :title="$t('Do you have a deadline for delivery?')"
        class="_title -required"
      />

      <SfRadio
        value="0"
        :label="$t('No firm deadline - the sooner the better!')"
        v-model="deadline"
      />

      <SfRadio
        value="1"
        :label="$t('I need them for a specific date')"
        v-model="deadline"
      />

      <div
        class="_error-text"
        v-if="$v.value.deadline && $v.value.deadline.$error"
      >
        {{ $t('This field is required') }}
      </div>

      <div
        class="sf-input _deadline-input"
        :class="{'--required': deadline && deadline !== '0'}"
      >
        <input
          v-model="deadlineDate"
          type="date"
          :disabled="!deadline || deadline === '0'"
        >

        <div
          class="_error-text"
          v-if="$v.value.deadlineDate && $v.value.deadlineDate.$error"
        >
          {{ $t('This field is required') }}
        </div>
      </div>
    </div>

    <slot name="size" />

    <div class="_section">
      <AOrderedHeading
        :order="countryStepOrder"
        :level="3"
        :title="$t('Which country is the plush being delivered to?')"
        class="_title"
      />

      <div class="_helper">
        {{ $t('This helps us estimate freight costs.') }}
      </div>

      <MMultiselect
        v-model="country"
        name="countries"
        :label="$t('Country')"
        :required="true"
        id-field="code"
        label-field="name"
        :options="countries"
        :valid="!$v.value.country || !$v.value.country.$error"
        :error-message="$t('Field is required')"
        :disabled="isDisabled"
      />
    </div>

    <div class="_section --half">
      <AOrderedHeading
        :order="customerInfoStepOrder"
        :level="3"
        :title="$t('Customer Information')"
        class="_title"
      />

      <div class="_content --half">
        <SfInput
          :label="$t('First Name')"
          v-model="customerFirstName"
          class="sf-input--required"
          :valid="!$v.value.customerFirstName || !$v.value.customerFirstName.$error"
          :error-message="$t('Field is required')"
        />

        <SfInput
          :label="$t('Last Name')"
          v-model="customerLastName"
        />

        <SfInput
          :label="$t('Your e-mail address')"
          v-model="customerEmail"
          class="sf-input--required"
          :valid="!$v.value.customerEmail || !$v.value.customerEmail.$error"
          :error-message="
            $v.value.customerEmail && $v.value.customerEmail.required
              ? $t('Please, enter correct Email')
              : $t('Field is required')
          "
        />

        <SfInput
          :label="$t('Phone number')"
          v-model="customerPhone"
          class="sf-input--required"
          :valid="!$v.value.customerPhone || !$v.value.customerPhone.$error"
          :error-message="
            $v.value.customerPhone && $v.value.customerPhone.required
              ? $t('Please, enter valid phone number')
              : $t('Field is required')
          "
          @blur="() => $v.value.customerPhone && $v.value.customerPhone.$touch()"
        />
      </div>
    </div>

    <div class="_section">
      <AOrderedHeading
        :order="customerTypeStepOrder"
        :level="3"
        :title="$t('Last question')"
        class="_title"
      />

      <div class="_helper">
        {{ $t('Which of the following best describes you?') }}
      </div>

      <SfSelect
        v-model="customerType"
        :should-lock-scroll-on-open="isMobile"
        class="sf-select--underlined"
      >
        <SfSelectOption
          v-for="item in customerTypeOptions"
          :key="item.id"
          :value="item.value"
        >
          {{ item.title }}
        </SfSelectOption>
      </SfSelect>
    </div>

    <MCheckbox
      v-model="agreement"
      :disabled="isDisabled"
      :label="$t('I have read and agree to the Bulk Order Customer Agreement')"
    />

    <div
      class="_error-text"
      v-if="$v.value.agreement && $v.value.agreement.$error"
    >
      {{ $t('This field is required') }}
    </div>
  </div>
</template>

<script lang="ts">
import config from 'config';
import Vue, { PropType, VueConstructor } from 'vue';
import { required, requiredIf, minValue, email, sameAs, helpers } from 'vuelidate/lib/validators';
import { TranslateResult } from 'vue-i18n';
import { SfButton, SfInput, SfRadio, SfSelect } from '@storefront-ui/vue';
import {
  mapMobileObserver,
  unMapMobileObserver
} from '@storefront-ui/vue/src/utilities/mobile-observer';

import Product from 'core/modules/catalog/types/Product';
import { Dictionary, ProductId, ProductValue } from 'src/modules/budsies';
import { ImageHandlerService, Item } from 'src/modules/file-storage';
import { CustomerImage } from 'src/modules/shared';
import BulkordersBaseFormData from 'theme/components/interfaces/bulkorders-base-form-data.interface';
import CustomerType from 'theme/components/interfaces/customer-type.interface';

import AOrderedHeading from 'theme/components/atoms/a-ordered-heading.vue';
import MArtworkUpload from 'theme/components/molecules/m-artwork-upload.vue';
import MCheckbox from 'theme/components/molecules/m-checkbox.vue';
import MMultiselect from 'theme/components/molecules/m-multiselect.vue';

const Countries = require('@vue-storefront/i18n/resource/countries.json');

interface InjectedServices {
  imageHandlerService: ImageHandlerService
}

const phoneValidator = helpers.regex('phone', /\(?([0-9]{3})\)?([ .-]?)([0-9]{3})\2([0-9]{4})/);

export default (Vue as VueConstructor<Vue & InjectedServices>).extend({
  name: 'MBaseForm',
  components: {
    AOrderedHeading,
    MArtworkUpload,
    MCheckbox,
    MMultiselect,
    SfButton,
    SfInput,
    SfRadio,
    SfSelect
  },
  props: {
    product: {
      type: Object as PropType<Product>,
      required: true
    },
    artworkUploadUrl: {
      type: String,
      required: true
    },
    isDisabled: {
      type: Boolean,
      default: false
    },
    value: {
      type: Object as PropType<BulkordersBaseFormData>,
      required: true
    },
    hasSize: {
      type: Boolean,
      default: false
    },
    hasBodyparts: {
      type: Boolean,
      default: false
    }
  },
  inject: {
    imageHandlerService: { from: 'ImageHandlerService' }
  },
  data () {
    return {
      countries: Countries,
      showAdditionalQuantity: false
    }
  },
  computed: {
    ...mapMobileObserver(),
    agreement: {
      get (): boolean {
        return this.value.agreement;
      },
      set (value: boolean) {
        this.updateValue({ agreement: value })
      }
    },
    backendProductId (): string | undefined {
      if (!this.product) {
        return undefined;
      }

      switch (this.product.id) {
        case ProductId.BULK_PLUSH_SAMPLE:
          return ProductValue.BULK_SAMPLE;
        case ProductId.BULK_PILLOW_SAMPLE:
          return ProductValue.PILLOW_BULK_SAMPLE;
        case ProductId.BULK_KEYCHAIN_SAMPLE:
          return ProductValue.KEYCHAIN_BULK_SAMPLE;
        default:
          throw new Error(
            `Can't resolve Backend product ID for Magento '${this.product.id}' product ID`
          );
      }
    },
    budsiesStoreDomain (): string {
      return `https://${config.budsies.budsiesStoreDomain}`;
    },
    customerTypeOptions (): CustomerType[] {
      const customerTypes: Dictionary<string> | undefined = this.$store.getters['budsies/getCustomerTypes'];

      if (!customerTypes) {
        return [];
      }

      return Object.entries(customerTypes)
        .map(([key, value]) => {
          return {
            id: key,
            value: key,
            title: value
          }
        });
    },
    quantityStepOrder (): number {
      return this.hasBodyparts ? 5 : 4;
    },
    deadlineStepOrder (): number {
      return this.quantityStepOrder + 1;
    },
    countryStepOrder (): number {
      return this.hasSize
        ? this.deadlineStepOrder + 2
        : this.deadlineStepOrder + 1;
    },
    customerInfoStepOrder (): number {
      return this.countryStepOrder + 1;
    },
    customerTypeStepOrder (): number {
      return this.customerInfoStepOrder + 1;
    },
    customerType: {
      get (): string | undefined {
        return this.value.customerType
      },
      set (value: string) {
        this.updateValue({ customerType: value });
      }
    },
    name: {
      get (): string {
        return this.value.name;
      },
      set (value: string) {
        this.updateValue({ name: value });
      }
    },
    description: {
      get (): string {
        return this.value.description;
      },
      set (value: string) {
        this.updateValue({ description: value });
      }
    },
    quantity: {
      get (): number | undefined {
        return this.value.quantity;
      },
      set (value: number) {
        this.updateValue({ quantity: value });
      }
    },
    additionalQuantity: {
      get (): number | undefined {
        return this.value.additionalQuantity;
      },
      set (value: number) {
        this.updateValue({ additionalQuantity: value });
      }
    },
    deadline: {
      get (): '0' | '1' | undefined {
        return this.value.deadline;
      },
      set (value: '0' | '1' | undefined) {
        this.updateValue({ deadline: value });
      }
    },
    deadlineDate: {
      get (): string | undefined {
        return this.value.deadlineDate;
      },
      set (value: any) {
        this.updateValue({ deadlineDate: value })
      }
    },
    country: {
      get (): string {
        return this.value.country;
      },
      set (value: string) {
        this.updateValue({ country: value });
      }
    },
    customerFirstName: {
      get (): string {
        return this.value.customerFirstName;
      },
      set (value: string) {
        this.updateValue({ customerFirstName: value });
      }
    },
    customerLastName: {
      get (): string | undefined {
        return this.value.customerLastName;
      },
      set (value: string | undefined) {
        this.updateValue({ customerLastName: value });
      }
    },
    customerEmail: {
      get (): string {
        return this.value.customerEmail;
      },
      set (value: string) {
        this.updateValue({ customerEmail: value });
      }
    },
    customerPhone: {
      get (): string {
        return this.value.customerPhone;
      },
      set (value: string) {
        this.updateValue({ customerPhone: value });
      }
    },
    quantityButtonText (): TranslateResult {
      return this.showAdditionalQuantity
        ? this.$t('Remove')
        : this.$t('Not Sure?');
    }
  },
  methods: {
    getValidationState (): boolean {
      this.$v.$touch();
      return !this.$v.$invalid;
    },
    onArtworkAdd (value: Item): void {
      const customerImages = [...this.value.customerImages];

      customerImages.push({
        id: value.id,
        url: this.imageHandlerService.getOriginalImageUrl(value.url)
      });

      this.updateValue({ customerImages })
    },
    onArtworkRemove (storageItemId: string): void {
      const customerImages = [...this.value.customerImages];

      const index = customerImages.findIndex(({ id }) => id === storageItemId);

      if (index === -1) {
        return;
      }

      customerImages.splice(index, 1);

      this.updateValue({ customerImages });
    },
    updateValue (value: Partial<BulkordersBaseFormData>): void {
      this.$emit('input', { ...this.value, ...value })
    }
  },
  beforeDestroy () {
    unMapMobileObserver();
  },
  validations (): any {
    const isDeadlineDateRequired = requiredIf(() => this.deadline === '1');

    return {
      value: {
        customerImages: {
          required
        },
        name: {
          required
        },
        description: {
          required
        },
        quantity: {
          required,
          minValue: minValue(50)
        },
        deadline: {
          required
        },
        deadlineDate: {
          required: isDeadlineDateRequired
        },
        country: {
          required
        },
        customerFirstName: {
          required
        },
        customerEmail: {
          required,
          email
        },
        customerPhone: {
          required,
          phoneValidator
        },
        agreement: {
          sameAs: sameAs(() => true)
        }
      }
    }
  }
})
</script>

<style lang="scss" scoped>
.m-base-form {
    --select-margin: 0;
    --select-padding: 0;

    text-align: left;
    display: flex;
    flex-direction: column;

    ._section {
        margin-bottom: var(--spacer-2xl);
        display: flex;
        flex-direction: column;

        ._title {
            margin-bottom: var(--spacer-base);

            &.-required {
              ::v-deep .sf-heading__title {
                &::after {
                    content: "*";
                    color: var(--c-warning);
                    margin-left: -0.3em;
                }
              }
            }
        }

        ._content {
          display: flex;

          &.--half {
          flex-direction: row;
          flex-wrap: wrap;
          align-items: center;

          .sf-input {
            flex-basis: 40%;
            flex-grow: 1;

            &:nth-child(odd) {
              margin-right: var(--spacer-sm);
            }

            &:nth-child(1),
            &:nth-child(2) {
              margin-bottom: var(--spacer-sm);
            }
          }
        }
        }
    }

    ._hint {
      font-size: var(--font-xs);
    }

    .sf-input {
      &--required {
        --input-label-required: " *"
      }

      &.-quantity {
        --input-margin: 0;

        &::v-deep {
          .sf-input__error-message {
            display: none;
          }
        }
      }
    }

    textarea {
      box-sizing: border-box;
      border: 1px solid var(--c-light);
      width: 100%;
      padding: 0.5em;
      font-family: var(--font-family-primary);
      resize: vertical;
    }

    ._helper {
      margin-bottom: var(--spacer-sm);
    }

    ._additional-quantity {
      display: flex;
      flex-direction: column;
      margin-top: var(--spacer-sm);
    }

    ._quantity-button {
      align-self: flex-start;
      margin-top: var(--spacer-sm);
    }

    ._error-text {
      color: var(--c-danger-variant);
      font-size: var(--font-xs);
      margin-top: var(--spacer-sm);
      height: calc(var(--font-xs) * 1.2);
    }

    ._deadline-input {
      margin-top: var(--spacer-sm);
      position: relative;

      &.--required {
        &::before {
          content: '*';
          color: var(--c-primary);
          font-size: var(--font-base);
          position: absolute;
          top: 0;
          left: 0;
        }
      }
    }

    .m-multiselect {
      --tags-min-height: 56px;

      width: 100%;
      margin: 0;

      &::v-deep {
        .m-multiselect__label {
          left: 0;
        }
      }
    }
}
</style>
