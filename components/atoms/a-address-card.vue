<template>
  <div
    class="a-address-card"
    :class="{ '-suggested': isSuggested }"
  >
    <p class="_street">
      {{ address.streetAddress }}
    </p>

    <p class="_location">
      {{ address.city }}, {{ stateName }} {{ address.zipCode }}
    </p>

    <p class="_country">
      {{ address.country }}
    </p>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, computed } from '@vue/composition-api';

const States = require('@vue-storefront/i18n/resource/states.json');

interface Address {
  streetAddress?: string,
  city?: string,
  zipCode?: string,
  country?: string,
  state?: string,
  region_id?: number
}

export default defineComponent({
  name: 'AAddressCard',
  props: {
    address: {
      type: Object as PropType<Address>,
      required: true
    },
    isSuggested: {
      type: Boolean,
      default: false
    }
  },
  setup (props) {
    const stateName = computed<string>(() => {
      if (props.address.state) {
        return props.address.state;
      }

      if (props.address.region_id && props.address.country) {
        const countryData = States[props.address.country.toUpperCase()];

        if (countryData) {
          const stateItem = countryData.find((stateData: { code: string, name: string, id: number }) => {
            return stateData.id === props.address.region_id;
          });

          return stateItem?.name || '';
        }
      }

      return '';
    });

    return {
      stateName
    };
  }
});
</script>

<style lang="scss" scoped>
.a-address-card {
  flex-grow: 1;

  &.-suggested {
    border-color: var(--c-primary);
  }

  p {
    margin: 0 0 var(--spacer-2xs) 0;
    line-height: 1.6;
    color: var(--c-text);

    &:last-child {
      margin-bottom: 0;
    }
  }

  ._street {
    font-size: var(--font-base);
  }

  ._location {
    font-size: var(--font-base);
  }

  ._country {
    font-size: var(--font-sm);
    color: var(--c-text-muted);
  }
}
</style>
