<template>
  <div class="m-address-item">
    <address class="_content">
      <p class="_address">
        <span class="_client-name">{{ address.firstname }} {{ address.lastname }}</span><br>
        {{ street }}<br>
        {{ address.postcode }}
        {{ address.city }},<br>{{ getCountryById(address.country_id) }}
      </p>

      <p class="_address">
        {{ formatPhoneNumber(address.telephone, address.country_id) }}
      </p>
    </address>

    <div class="_actions">
      <slot name="actions" />
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { parsePhoneNumberWithError } from 'libphonenumber-js';

import { currentStoreView } from '@vue-storefront/core/lib/multistore';
import { createPhoneHelpers } from 'src/modules/shared';

const Countries = require('@vue-storefront/i18n/resource/countries.json');
const phoneHelpers = createPhoneHelpers(parsePhoneNumberWithError);

export default Vue.extend({
  name: 'MAddressItem',
  props: {
    address: {
      type: Object,
      required: true
    }
  },
  computed: {
    street (): string {
      if (!this.address.street) {
        return ''
      }

      return this.address.street.join(' ');
    }
  },
  methods: {
    focusFirstAction (): void {
      const action = this.$el.querySelector('._actions a, ._actions button') as HTMLElement | null;

      action?.focus();
    },
    getCountryById (id: string): string {
      const countryObject = Countries.filter((country: any) => country.code === id)
      return countryObject.length > 0 ? countryObject[0].name : id
    },
    formatPhoneNumber (phoneNumber: string, countryId: string): string {
      if (!phoneNumber) {
        return phoneNumber;
      }

      const { i18n } = currentStoreView();

      return phoneHelpers.formatPhoneNumberForDisplay(
        phoneNumber,
        countryId || i18n.defaultCountry
      );
    }
  }
});

</script>

<style lang="scss" scoped>
@import "~@storefront-ui/shared/styles/helpers/breakpoints";

.m-address-item {
  display: flex;
  padding: var(--spacer-base) 0;
  border: 1px solid var(--c-light);
  border-width: 1px 0 0 0;

  &:last-child {
    border-width: 1px 0 1px 0;
  }

  ._content {
    flex: 1;
    color: var(--c-text);
  }

  ._actions {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-end;

    ._action-item {
        margin-bottom: var(--spacer-sm);
    }
  }

  ._address {
    margin: 0 0 var(--spacer-base) 0;

    &:last-child {
      margin: 0;
    }
  }
}
</style>
