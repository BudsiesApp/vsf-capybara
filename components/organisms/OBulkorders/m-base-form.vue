<template>
  <form class="m-base-form">
    <validation-provider
      tag="div"
      class="_section"
      v-slot="{ errors }"
      name="Artwork"
      rules="requiredArtwork"
    >
      <AOrderedHeading
        :order="1"
        :level="3"
        :title="$t('Please upload your awesome design')"
        class="_title -required"
        ref="artworkAnchor"
      />

      <input type="hidden" :value="value.customerImages">

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
        v-if="errors[0]"
      >
        {{ errors[0] }}
      </div>
    </validation-provider>

    <validation-provider
      tag="div"
      class="_section"
      v-slot="{ errors }"
      name="Project Name"
      rules="required|min:1|max:40"
    >
      <AOrderedHeading
        :order="2"
        :level="3"
        :title="$t('Project Name')"
        class="_title"
        ref="projectNameAnchor"
      />

      <SfInput
        :label="$t('Project Name')"
        name="project-name"
        v-model="name"
        :disabled="isDisabled"
        class="sf-input--required"
        :valid="!errors.length"
        :error-message="errors[0]"
      />

      <span class="_hint">
        {{ $t('This could be the name of your character or name of your project (e.g., \'Danny the Dolphin\')') }}
      </span>
    </validation-provider>

    <validation-provider
      tag="div"
      class="_section"
      v-slot="{ errors }"
      rules="required|min:1|max:10000"
      name="Design"
    >
      <AOrderedHeading
        :order="3"
        :level="3"
        :title="$t('Describe your design')"
        class="_title -required"
        ref="designAnchor"
      />

      <textarea
        name="description"
        rows="5"
        v-model="description"
        :placeholder="$t('Give us any additional direction as we create your plush prototype').toString()"
        :disabled="isDisabled"
      />

      <div
        class="_error-text"
        v-if="errors.length"
      >
        {{ errors[0] }}
      </div>
    </validation-provider>

    <slot name="bodyparts" />

    <div class="_section">
      <AOrderedHeading
        :order="quantityStepOrder"
        :level="3"
        :title="$t('What quantity are you interested in?')"
        class="_title"
        ref="quantityAnchor"
      />

      <span class="_helper">
        {{ $t('Best price breaks occur at volumes of 100, 500, and 1,000.') }}
      </span>

      <slot name="quantity-helper" />

      <validation-provider
        tag="div"
        v-slot="{ errors, failedRules }"
        rules="required|min_value:50|max_value:1000000"
        name="Quantity"
      >
        <SfInput
          :label="$t('Quantity')"
          :disabled="isDisabled"
          name="quantity"
          class="sf-input--required -quantity"
          v-model="quantity"
          :valid="!errors.length"
        />

        <div
          class="_error-text"
          v-if="errors.length"
        >
          <template v-if="failedRules.required">
            {{ $t('This field is required') }}
          </template>

          <template v-else-if="failedRules.min_value">
            {{ $t('For orders less than 50, please upload your character to our sister company') }}

            <a :href="budsiesStoreDomain" target="_blank">
              Budsies.com
            </a>
          </template>

          <template v-else>
            {{ errors[0] }}
          </template>
        </div>
      </validation-provider>

      <validation-provider
        tag="div" v-slot="{ errors, failedRules }"
        rules="min_value:50|max_value:1000000"
        class="_additional-quantity"
        name="Additional Quantity"
        v-show="showAdditionalQuantity"
      >
        <span class="_helper">
          {{ $t('Don\'t worry, we will quote you the quantity you enter and the quantity with the next price break. However, you can also enter another quantity below and we\'ll quote you both!') }}
        </span>

        <SfInput
          :label="$t('Also quote this quantity:')"
          :disabled="isDisabled"
          name="additional-quantity"
          class="-quantity"
          ref="additionalQuantityAnchor"
          v-model="additionalQuantity"
        />

        <div
          class="_error-text"
          v-if="errors.length"
        >
          <template v-if="failedRules.min_value">
            {{ $t('For orders less than 50, please upload your character to our sister company') }}

            <a :href="budsiesStoreDomain" target="_blank">
              Budsies.com
            </a>
          </template>

          <template v-else>
            {{ errors[0] }}
          </template>
        </div>
      </validation-provider>

      <SfButton
        class="sf-button--text _quantity-button"
        @click="onAdditionalQuantityButtonClick"
      >
        {{ quantityButtonText }}
      </SfButton>
    </div>

    <div class="_section">
      <AOrderedHeading
        :order="deadlineStepOrder"
        :level="3"
        :title="$t('Do you have a deadline for delivery?')"
        ref="deadlineAnchor"
        class="_title -required"
      />

      <validation-provider
        tag="div"
        v-slot="{ errors }"
        rules="required"
        name="Deadline"
      >
        <SfRadio
          value="0"
          name="deadline-radio"
          :label="$t('No firm deadline - the sooner the better!')"
          :selected="deadline"
          @input="deadline = $event"
        />

        <SfRadio
          value="1"
          name="deadline-radio"
          :label="$t('I need them for a specific date')"
          :selected="deadline"
          @input="deadline = $event"
        />

        <div
          class="_error-text _deadline-input-error"
          v-if="errors.length"
        >
          {{ errors[0] }}
        </div>
      </validation-provider>

      <validation-provider
        tag="div"
        v-slot="{ errors }"
        name="Deadline Date"
        ref="deadlineDateAnchor"
        :rules="deadline === '1' ? `required|min_date:${minDeadlineDate}` : 'min_date:${minDeadlineDate}'"
      >
        <div
          class="sf-input _deadline-input"
          :class="{'--required': deadline && deadline !== '0'}"
        >
          <input
            v-model="deadlineDate"
            type="date"
            aria-label="Deadline Date"
            :disabled="!deadline || deadline === '0'"
            :min="minDeadlineDate"
          >

          <div
            class="_error-text"
            v-if="errors.length"
          >
            {{ errors[0] }}
          </div>
        </div>
      </validation-provider>
    </div>

    <slot name="size" />

    <validation-provider
      tag="div"
      class="_section"
      v-slot="{ errors }"
      rules="required"
      name="Country"
    >
      <AOrderedHeading
        :order="countryStepOrder"
        :level="3"
        :title="$t('Which country is the plush being delivered to?')"
        class="_title"
        ref="countryAnchor"
      />

      <div class="_helper">
        {{ $t('This helps us estimate freight costs.') }}
      </div>

      <MMultiselect
        class="_coutry-select"
        v-model="country"
        name="countries"
        :label="$t('Country').toString()"
        :required="true"
        id-field="code"
        label-field="name"
        :options="countries"
        :valid="!errors.length"
        :error-message="errors[0]"
        :disabled="isDisabled"
      />
    </validation-provider>

    <div class="_section --half">
      <AOrderedHeading
        :order="customerInfoStepOrder"
        :level="3"
        :title="$t('Customer Information')"
        class="_title"
      />

      <div class="_content --half">
        <validation-provider
          v-slot="{ errors }"
          rules="required|min:1|max:255"
          name="First Name"
          slim
        >
          <SfInput
            :label="$t('First Name')"
            ref="firstNameAnchor"
            name="first-name"
            v-model="customerFirstName"
            class="sf-input--required"
            :valid="!errors.length"
            :error-message="errors[0]"
          />
        </validation-provider>

        <validation-provider
          v-slot="{ errors }"
          rules="min:1|max:255"
          name="Last Name"
          slim
        >
          <SfInput
            :label="$t('Last Name')"
            name="last-name"
            v-model="customerLastName"
            :valid="!errors.length"
            :error-message="errors[0]"
          />
        </validation-provider>

        <validation-provider
          v-slot="{ errors }"
          rules="required|email|max:255"
          name="Email"
          slim
        >
          <SfInput
            :label="$t('Your e-mail address')"
            ref="emailAnchor"
            name="email"
            v-model="customerEmail"
            class="sf-input--required"
            :valid="!errors.length"
            :error-message="errors[0]"
          />
        </validation-provider>

        <validation-provider
          v-slot="{ errors }"
          :rules="phoneValidationRules"
          name="Phone Number"
          slim
        >
          <SfInput
            :label="$t('Phone Number')"
            ref="phoneNumberAnchor"
            name="phone-number"
            v-model="formattedPhoneNumber"
            class="sf-input--required"
            :valid="!errors.length"
            :error-message="errors[0]"
            @blur="onPhoneNumberBlur"
          />
        </validation-provider>
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
        class="sf-select--underlined _customer-type-selector"
      >
        <SfSelectOption
          v-for="item in customerTypeOptions"
          :key="item.id"
          :value="item.value"
        >
          {{ item.title }}
        </SfSelectOption>
      </SfSelect>

      <div
        v-if="$slots['last-question-after-customer-type']"
        class="_last-question-after-customer-type"
      >
        <slot name="last-question-after-customer-type" />
      </div>
    </div>

    <validation-provider
      v-slot="{ errors }"
      :rules="{ required: { allowFalse: false } }"
      name="Agreement"
      slim
    >
      <MCheckbox
        v-model="agreement"
        class="_agreement-checkbox"
        :disabled="isDisabled"
        ref="agreementAnchor"
      >
        <template #label>
          <div class="sf-checkbox__label">
            {{ $t('I have read and agree to the') }}

            <a href="/media/bulkOrder/agreement/Standard_Bulk_Order_Customer_Agreement.pdf" target="_blank">
              {{ $t('Bulk Order Customer Agreement') }}
            </a>
          </div>
        </template>
      </MCheckbox>

      <div
        class="_error-text _agreement-error"
        v-if="errors.length"
      >
        {{ errors[0] }}
      </div>
    </validation-provider>

    <MBulkordersCalculationAnimation
      :show-calculation-animation="showCalculationAnimation"
      @calculation-animation-finished="onCalculationAnimationFinished"
    />
  </form>
</template>

<script lang="ts">
import { parsePhoneNumberWithError } from 'libphonenumber-js';
import Vue, { PropType, computed, inject, ref } from 'vue';
import config from 'config';
import { ValidationProvider, extend } from 'vee-validate';
import { email, required, max, min, min_value, max_value, regex } from 'vee-validate/dist/rules';
import { TranslateResult } from 'vue-i18n';
import { SfButton, SfInput, SfRadio, SfSelect } from '@storefront-ui/vue';
import {
  mapMobileObserver,
  unMapMobileObserver
} from '@storefront-ui/vue/src/utilities/mobile-observer';

import Product from 'core/modules/catalog/types/Product';
import { Dictionary, ProductId, ProductValue } from 'src/modules/budsies';
import { ImageHandlerService, Item } from 'src/modules/file-storage';
import { createPhoneHelpers } from 'src/modules/shared';

import { FormRef, FormRefs } from 'theme/helpers/use-form-validation';

import BulkordersBaseFormData from 'theme/components/interfaces/bulkorders-base-form-data.interface';
import CustomerType from 'theme/components/interfaces/customer-type.interface';

import AOrderedHeading from 'theme/components/atoms/a-ordered-heading.vue';
import MArtworkUpload from 'theme/components/molecules/m-artwork-upload.vue';
import MCheckbox from 'theme/components/molecules/m-checkbox.vue';
import MMultiselect from 'theme/components/molecules/m-multiselect.vue';
import MBulkordersCalculationAnimation from './m-calculation-animation.vue';
import { usePersistedEmail, usePersistedFirstName, usePersistedLastName, usePersistedPhoneNumber, usePersistedShippingCountry } from 'src/modules/persisted-customer-data';

const Countries = require('@vue-storefront/i18n/resource/countries.json');

const phoneHelpers = createPhoneHelpers(parsePhoneNumberWithError);

extend('required', {
  ...required,
  message: 'The \'{_field_}\' field is required'
});

extend('requiredArtwork', {
  ...required,
  message: 'Please provide your artwork to continue'
});

extend('min_value', {
  ...min_value,
  message: 'The \'{_field_}\' field should be greater than {min}'
});

extend('max_value', {
  ...max_value,
  message: 'The \'{_field_}\' field should be lower than {max}'
});

extend('min', {
  ...min,
  message: 'The \'{_field_}\' length should be greater than {length}'
});
extend('max', {
  ...max,
  message: 'The \'{_field_}\' length should be less than {length}'
});

extend('email', email);

extend('regex', {
  ...regex,
  message: 'Please, enter valid phone number'
});

extend('phone', {
  params: ['country'],
  validate (value, { country }: Record<string, any>) {
    return phoneHelpers.isValidPhoneNumber(value, country);
  },
  message: 'Please, enter valid phone number'
});

extend('min_date', {
  params: ['min'],
  validate (value, { min }: Record<string, any>) {
    const dateValue = new Date(value);
    const minDate = new Date(min);
    return dateValue.getTime() > minDate.getTime()
  },
  message: 'The date must be on or after {min}'
});

export default Vue.extend({
  name: 'MBaseForm',
  components: {
    AOrderedHeading,
    MArtworkUpload,
    MCheckbox,
    MMultiselect,
    SfButton,
    SfInput,
    SfRadio,
    SfSelect,
    MBulkordersCalculationAnimation,
    ValidationProvider
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
    },
    showCalculationAnimation: {
      type: Boolean,
      default: false
    },
    getFieldAnchorName: {
      type: Function as PropType<(fieldName: string) => string>,
      required: true
    }
  },
  setup (props, { emit }) {
    const imageHandlerService = inject<ImageHandlerService>('ImageHandlerService');

    if (!imageHandlerService) {
      throw new Error('ImageHandlerService is not provided');
    }

    const customerFirstName = computed({
      get (): string {
        return props.value.customerFirstName;
      },
      set (value: string) {
        emit('input', { ...props.value, ...{ customerFirstName: value } });
      }
    });
    const customerLastName = computed({
      get (): string | undefined {
        return props.value.customerLastName;
      },
      set (value: string | undefined) {
        emit('input', { ...props.value, ...{ customerLastName: value } });
      }
    });
    const customerEmail = computed({
      get (): string {
        return props.value.customerEmail;
      },
      set (value: string) {
        emit('input', { ...props.value, ...{ customerEmail: value } });
      }
    });
    const customerPhone = computed({
      get (): string {
        return props.value.customerPhone;
      },
      set (value: string) {
        emit('input', { ...props.value, ...{ customerPhone: value } });
      }
    });
    const country = computed({
      get (): string {
        return props.value.country;
      },
      set (value: string) {
        emit('input', { ...props.value, ...{ country: value } });
      }
    });

    const currentDate = new Date();
    currentDate.setDate(currentDate.getDate() + 1);

    const minDeadlineDate = currentDate.toISOString().split('T')[0];
    const artworkAnchor = ref<FormRef | null>(null);
    const projectNameAnchor = ref<FormRef | null>(null);
    const designAnchor = ref<FormRef | null>(null);
    const quantityAnchor = ref<FormRef | null>(null);
    const additionalQuantityAnchor = ref<FormRef | null>(null);
    const deadlineAnchor = ref<FormRef | null>(null);
    const deadlineDateAnchor = ref<FormRef | null>(null);
    const countryAnchor = ref<FormRef | null>(null);
    const firstNameAnchor = ref<FormRef | null>(null);
    const emailAnchor = ref<FormRef | null>(null);
    const phoneNumberAnchor = ref<FormRef | null>(null);
    const agreementAnchor = ref<FormRef | null>(null);

    const getFormValidationRefs = (): FormRefs => {
      const fieldRefs: [string, FormRef | null][] = [
        ['Artwork', artworkAnchor.value],
        ['Project Name', projectNameAnchor.value],
        ['Design', designAnchor.value],
        ['Quantity', quantityAnchor.value],
        ['Additional Quantity', additionalQuantityAnchor.value],
        ['Deadline', deadlineAnchor.value],
        ['Deadline Date', deadlineDateAnchor.value],
        ['Country', countryAnchor.value],
        ['First Name', firstNameAnchor.value],
        ['Email', emailAnchor.value],
        ['Phone Number', phoneNumberAnchor.value],
        ['Agreement', agreementAnchor.value]
      ];

      return fieldRefs.reduce<FormRefs>((refs, [field, anchor]) => {
        if (anchor) {
          refs[props.getFieldAnchorName(field)] = anchor;
        }

        return refs;
      }, {});
    };

    return {
      additionalQuantityAnchor,
      agreementAnchor,
      artworkAnchor,
      countryAnchor,
      deadlineAnchor,
      deadlineDateAnchor,
      designAnchor,
      emailAnchor,
      firstNameAnchor,
      getFormValidationRefs,
      imageHandlerService,
      customerLastName,
      customerFirstName,
      customerEmail,
      customerPhone,
      country,
      minDeadlineDate,
      phoneNumberAnchor,
      projectNameAnchor,
      quantityAnchor,
      ...usePersistedEmail(customerEmail),
      ...usePersistedLastName(customerLastName),
      ...usePersistedFirstName(customerFirstName),
      ...usePersistedPhoneNumber(customerPhone),
      ...usePersistedShippingCountry(country)
    }
  },
  data () {
    return {
      countries: Countries,
      showAdditionalQuantity: false,
      formattedPhoneNumber: ''
    }
  },
  computed: {
    ...mapMobileObserver(),
    phoneValidationRules (): any {
      return {
        required: true,
        phone: { country: this.country }
      }
    },
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
        case ProductId.BULK_PLUSH_KEYCHAIN_SAMPLE:
          return ProductValue.BULK_PLUSH_KEYCHAIN_SAMPLE;
        case ProductId.BULK_ACRYLIC_KEYCHAIN_SAMPLE:
          return ProductValue.BULK_ACRYLIC_KEYCHAIN_SAMPLE;
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
    quantityButtonText (): TranslateResult {
      return this.showAdditionalQuantity
        ? this.$t('Remove')
        : this.$t('Not Sure?');
    }
  },
  methods: {
    onAdditionalQuantityButtonClick (): void {
      this.showAdditionalQuantity = !this.showAdditionalQuantity;
      this.additionalQuantity = undefined;
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
    },
    onCalculationAnimationFinished (): void {
      this.$emit('calculation-animation-finished');
    },
    persistCustomerData (): void {
      this.persistLastUsedCustomerEmail(this.customerEmail);
      this.persistLastUsedCustomerFirstName(this.customerFirstName);
      this.persistLastUsedCustomerLastName(this.customerLastName);
      this.persistLastUsedCustomerPhoneNumber(this.customerPhone);
      this.persistLastUsedCustomerShippingCountry(this.country);
    },
    onPhoneNumberBlur (): void {
      if (!this.formattedPhoneNumber) {
        this.customerPhone = '';
        return;
      }

      const normalizedNumber = phoneHelpers.formatPhoneNumberToE164(this.formattedPhoneNumber, this.country);

      if (normalizedNumber === this.customerPhone) {
        this.updateFormattedPhoneNumber(normalizedNumber);
      }

      if (normalizedNumber) {
        this.customerPhone = normalizedNumber;
      }
    },
    updateFormattedPhoneNumber (phoneNumber: string): void {
      this.formattedPhoneNumber = phoneHelpers.formatPhoneNumberForDisplay(phoneNumber, this.country);
    }
  },
  beforeDestroy () {
    unMapMobileObserver();
  },
  watch: {
    customerPhone: {
      handler (value: string) {
        this.updateFormattedPhoneNumber(value);
      },
      immediate: true
    }
  }
})
</script>

<style lang="scss" scoped>
@import "~@storefront-ui/shared/styles/helpers/breakpoints";

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

  ._last-question-after-customer-type {
    margin-top: var(--spacer-lg);
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
   --multiselect-tags-min-height: 56px;

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
