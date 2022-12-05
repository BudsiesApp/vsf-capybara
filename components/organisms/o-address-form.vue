<template>
  <div class="o-address-form">
    <p class="_message">
      {{ $t('Keep your addresses and contact details updated.') }}
    </p>

    <div class="form">
      <SfInput
        v-model="firstname"
        name="firstname"
        :label="$t('First name')"
        required
        :valid="!$v.address.firstname || !$v.address.firstname.$error"
        :error-message="
          $v.address.firstname && !$v.address.firstname.required
            ? $t('Field is required.')
            : $t('Name must have at least 2 letters.')
        "
        class="form__element form__element--half"
      />

      <SfInput
        v-model="lastname"
        name="lastname"
        :label="$t('Last name')"
        required
        :valid="!$v.address.lastname || !$v.address.lastname.$error"
        :error-message="$t('Field is required.')"
        class="form__element form__element--half form__element--half-even"
      />

      <SfInput
        v-model="streetName"
        name="streetName"
        :label="$t('Street Name')"
        required
        :valid="!$v.address.streetName || !$v.address.streetName.$error"
        :error-message="$t('Field is required.')"
        class="form__element"
      />

      <SfInput
        v-model="apartment"
        name="apartment"
        :label="$t('House/Apartment number')"
        required
        :valid="!$v.address.apartment || !$v.address.apartment.$error"
        :error-message="$t('Field is required.')"
        class="form__element"
      />

      <SfInput
        v-model="city"
        name="city"
        :label="$t('City')"
        required
        :valid="!$v.address.city || !$v.address.city.$error"
        :error-message="$t('Field is required.')"
        class="form__element form__element--half"
      />

      <SfInput
        v-model="state"
        name="state"
        :label="$t('State/Province')"
        class="form__element form__element--half form__element--half-even"
      />

      <SfInput
        v-model="postcode"
        name="postcode"
        :label="$t('Zip-code')"
        required
        :valid="!$v.address.postcode || !$v.address.postcode.$error"
        :error-message="
          $v.address.postcode && !$v.address.postcode.required
            ? $t('Field is required.')
            : $t('Zip-code must have at least 3 letters.')
        "
        class="form__element form__element--half"
      />

      <SfSelect
        v-model="country"
        name="country"
        :label="$t('Country')"
        required
        :valid="!$v.address.country || !$v.address.country.$error"
        :error-message="$t('Field is required.')"
        :should-lock-scroll-on-open="isMobile"
        class="sf-select--underlined form__select form__element form__element--half form__select form__element--half-even"
      >
        <SfSelectOption
          v-for="countryItem in countries"
          :key="countryItem.code"
          :value="countryItem.code"
        >
          {{ countryItem.name }}
        </SfSelectOption>
      </SfSelect>

      <SfInput
        v-model="telephone"
        name="telephone"
        :label="$t('Phone number')"
        class="form__element"
      />

      <SfButton class="action-button" @click="onActionButtonClick">
        {{ actionButtonText }}
      </SfButton>
    </div>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';
import { required, minLength } from 'vuelidate/lib/validators';
import { unicodeAlpha, unicodeAlphaNum } from '@vue-storefront/core/helpers/validators';
import {
  mapMobileObserver,
  unMapMobileObserver
} from '@storefront-ui/vue/src/utilities/mobile-observer';
import { SfInput, SfButton, SfSelect } from '@storefront-ui/vue';

import { state } from 'src/modules/budsies/store/state';

const Countries = require('@vue-storefront/i18n/resource/countries.json');

interface Address {
  firstname: string,
  lastname: string,
  streetName: string,
  apartment: string,
  city: string,
  state: string,
  postcode: string,
  country: string,
  telephone: string
}

export default Vue.extend({
  name: 'OAddressForm',
  props: {
    actionButtonText: {
      type: String,
      required: true
    },
    existingAddress: {
      type: Object as PropType<Address | undefined>,
      default: undefined
    },
    submitAction: {
      type: Function as PropType<(address: any) => Promise<void>>,
      required: true
    }
  },
  components: {
    SfInput,
    SfButton,
    SfSelect
  },
  data () {
    return {
      firstname: '',
      lastname: '',
      streetName: '',
      apartment: '',
      city: '',
      state: '',
      postcode: '',
      country: '',
      telephone: '',
      isSubmitting: false,
      countries: Countries
    }
  },
  computed: {
    ...mapMobileObserver()
  },
  created (): void {
    this.onChangeAddress(this.existingAddress);
  },
  beforeDestroy () {
    unMapMobileObserver();
  },
  methods: {
    clearFields (): void {
      this.firstname = ''
      this.lastname = ''
      this.streetName = ''
      this.apartment = ''
      this.city = ''
      this.state = ''
      this.postcode = ''
      this.country = ''
      this.telephone = ''
    },
    fillDataFromExistingAddress (address: Address): void {
      this.firstname = address.firstname;
      this.lastname = address.lastname;
      this.streetName = address.streetName;
      this.apartment = address.apartment;
      this.city = address.city;
      this.state = address.state;
      this.postcode = address.postcode;
      this.country = address.country;
      this.telephone = address.telephone;
    },
    async onActionButtonClick (): Promise<void> {
      if (this.isSubmitting) {
        return;
      }

      this.isSubmitting = true;

      // 'city'       => 'Boynton Beach',
      //           'country_id' => 'US',
      //           'firstname'  => 'Jeff',
      //           'lastname'   => 'Johnson',
      //           'postcode'   => '33435',
      //           'region'     => ['region' => 'Florida'],
      //           'street'     => ['Seacrest Blvd', '1115 S'],
      //           'telephone'  => '2565853162'

      try {
        await this.submitAction({
          address: {
            firstname: this.firstname,
            lastname: this.lastname,
            street: [this.streetName, this.apartment],
            // apartment: this.apartment,
            city: this.city,
            region: this.state,
            postcode: this.postcode,
            country_id: this.country,
            telephone: this.telephone
          }
        });
      } finally {
        this.isSubmitting = false;
      }
    },
    onChangeAddress (address: Address | undefined): void {
      this.clearFields()
      this.$v.$reset();

      if (!address) {
        return;
      }

      this.fillDataFromExistingAddress(address);
    }
  },
  validations: {
    address: {
      firstname: {
        required,
        minLength: minLength(2),
        unicodeAlpha
      },
      lastname: {
        required
      },
      streetName: {
        required,
        unicodeAlphaNum
      },
      apartment: {
        required,
        unicodeAlphaNum
      },
      city: {
        required,
        unicodeAlpha
      },
      postcode: {
        required,
        minLength: minLength(3)
      },
      country: {
        required
      }
    }
  }
})
</script>

<style lang="scss" scoped>
@import "~@storefront-ui/shared/styles/helpers/breakpoints";
.o-address-form {
._message {
  margin: 0 0 var(--spacer-base) 0;
}

.form {
  @include for-desktop {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
  }

  &__element {
    margin: 0 0 var(--spacer-base) 0;
    @include for-desktop {
      flex: 0 0 100%;
    }

    &--half {
      @include for-desktop {
        flex: 1 1 50%;
      }

      &-even {
        @include for-desktop {
          padding: 0 0 0 var(--spacer-lg);
        }
      }
    }
  }

  &__select {
    padding-bottom: calc(var(--font-xs) * 1.2);
  }

  --select-dropdown-position: relative;
}

.action-button {
  --button-width: 100%;
  @include for-desktop {
    --button-width: auto;
  }
}
}
</style>
