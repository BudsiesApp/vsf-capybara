<template>
  <div
    class="production-time-option-card"
    :class="{
      '-selected': isSelected,
      '-disabled': isDisabled
    }"
  >
    <span class="_checkmark" aria-hidden="true">
      <SfIcon icon="check" size="12px" color="white" />
    </span>

    <span v-if="isFastestAvailable" class="_fastest-available-badge">
      {{ fastestAvailableTitle }}
    </span>

    <div class="_icon-wrapper" aria-hidden="true">
      <span
        class="_icon"
        :style="iconStyle"
      />
    </div>

    <div class="_content">
      <span class="_title">
        {{ shipTitle }}
      </span>

      <p class="_subtitle">
        {{ optionWeeksTitle }}
      </p>

      <span
        class="_slots-left -mobile"
        :class="slotsLeftClasses"
      >
        {{ slotsLeftTitle }}
      </span>
    </div>

    <div class="_meta">
      <div class="_price">
        {{ priceTitle }}
      </div>

      <span
        class="_slots-left -desktop"
        :class="slotsLeftClasses"
      >
        {{ slotsLeftTitle }}
      </span>
    </div>
  </div>
</template>

<script lang="ts">
import {
  computed,
  ComputedRef,
  defineComponent,
  PropType
} from '@vue/composition-api';
import { SfIcon } from '@storefront-ui/vue';
import { PriceHelper } from '@vue-storefront/core/helpers';

import { Currency, GET_ACTIVE_CURRENCY } from 'src/modules/currency';

import rushIcon from '../../assets/rush-upgrades/rush.svg';
import standardIcon from '../../assets/rush-upgrades/standard.svg';
import superRushIcon from '../../assets/rush-upgrades/super-rush.svg';

const oneWeekInDays = 7;

function addDays (date: Date, days: number): Date {
  const newDate = new Date(date.getTime());

  newDate.setDate(newDate.getDate() + days);

  return newDate;
}

function formatShortDate (date: Date): string {
  const month = date.toLocaleString('en-US', { month: 'short' });

  return `${month} ${date.getDate()}`;
}

export default defineComponent({
  name: 'ProductionTimeOptionCard',
  components: {
    SfIcon
  },
  props: {
    optionName: {
      type: String,
      required: true
    },
    price: {
      type: Object as PropType<PriceHelper.ProductPrice>,
      required: true
    },
    isDisabled: {
      type: Boolean,
      default: false
    },
    isFastestAvailable: {
      type: Boolean,
      default: false
    },
    isSelected: {
      type: Boolean,
      default: false
    },
    slotsLeft: {
      type: Number,
      required: true
    },
    turnaroundTime: {
      type: Number,
      required: true
    }
  },
  setup (props, { root }) {
    const selectedCurrency = computed<Currency>(() => {
      return root.$store.getters[GET_ACTIVE_CURRENCY];
    });

    const weeks = computed<number>(() => {
      return Math.ceil(props.turnaroundTime / oneWeekInDays);
    });

    const shipDate: ComputedRef<Date> = computed(() => {
      return addDays(new Date(), props.turnaroundTime);
    });

    const shipTitle = computed<string>(() => {
      return root.$t('Ships {date}', { date: formatShortDate(shipDate.value) }).toString();
    });

    const optionWeeksTitle = computed<string>(() => {
      const title = weeks.value === 1
        ? root.$t('{optionName} - 1 week', { optionName: props.optionName })
        : root.$t('{optionName} - {weeks} weeks', { optionName: props.optionName, weeks: weeks.value });

      return title.toString();
    });

    const iconSrc = computed<string>(() => {
      const optionName = props.optionName.toLowerCase();

      if (optionName.includes('standard')) {
        return standardIcon;
      }

      if (optionName.includes('super')) {
        return superRushIcon;
      }

      return rushIcon;
    });

    const iconStyle = computed<Record<string, string>>(() => {
      const iconMask = `url(${iconSrc.value}) center / contain no-repeat`;

      return {
        mask: iconMask,
        '-webkit-mask': iconMask
      };
    });

    const priceTitle = computed<string>(() => {
      const finalPrice = PriceHelper.getFinalPrice(props.price);

      if (finalPrice === 0) {
        return root.$t('Free').toString();
      }

      return `+ ${PriceHelper.formatPrice(finalPrice, selectedCurrency.value.symbol)}`;
    });

    const fastestAvailableTitle = computed<string>(() => {
      return root.$t('Fastest available').toString();
    });

    const hasInfiniteSlots = computed<boolean>(() => {
      return !Number.isFinite(props.slotsLeft);
    });

    const isSoldOut = computed<boolean>(() => {
      return props.slotsLeft === 0;
    });

    const slotsLeftTitle = computed<string>(() => {
      if (hasInfiniteSlots.value) {
        return root.$t('Always Available').toString();
      }

      if (props.slotsLeft === 0) {
        return root.$t('Sold out').toString();
      }

      if (props.slotsLeft === 1) {
        return root.$t('Only 1 slot left').toString();
      }

      return root.$t('Only {slotsLeft} slots left', { slotsLeft: props.slotsLeft }).toString();
    });

    const slotsLeftClasses = computed<Record<string, boolean>>(() => {
      return {
        '-always-available': hasInfiniteSlots.value,
        '-sold-out': isSoldOut.value
      };
    });

    return {
      fastestAvailableTitle,
      hasInfiniteSlots,
      iconStyle,
      isSoldOut,
      optionWeeksTitle,
      priceTitle,
      shipTitle,
      slotsLeftClasses,
      slotsLeftTitle
    };
  }
});
</script>

<style lang="scss" scoped>
@import "~@storefront-ui/shared/styles/helpers/breakpoints";

.production-time-option-card {
  $section-gap: var(--spacer-xs);
  $item-gap: var(--spacer-2xs);

  position: relative;
  display: grid;
  grid-template-columns: 23px minmax(0, 1fr) auto;
  column-gap: var(--spacer-sm);
  align-items: center;
  padding: var(--spacer-sm);
  box-sizing: border-box;
  background: var(--c-white);
  color: var(--c-text);
  font-family: var(--font-family-secondary);
  border: 1.5px solid #D2D2D2;

  &.-selected {
    background: var(--c-secondary);

    ._checkmark {
      visibility: visible;
    }
  }

  &.-disabled {
    ._icon {
      background: var(--c-text-muted);
    }
  }

  ._checkmark {
    display: flex;
    visibility: hidden;
    align-items: center;
    justify-content: center;
    width: 23px;
    height: 23px;
    background: var(--c-primary);
  }

  ._fastest-available-badge {
    position: absolute;
    top: 0;
    right: var(--spacer-sm);
    z-index: 1;
    padding: 2px var(--spacer-xs);
    background: var(--c-primary);
    color: var(--c-white);
    font-size: var(--font-sm);
    font-weight: var(--font-bold);
    line-height: 1.2;
    transform: translateY(-50%);
    white-space: nowrap;
  }

  ._icon-wrapper {
    display: none;
    align-items: center;
    justify-content: center;
  }

  ._icon {
    display: block;
    width: 36px;
    height: 36px;
    background: var(--c-primary);
  }

  ._content {
    display: flex;
    flex-direction: column;
    row-gap: $item-gap;
    text-align: left;
  }

  ._title {
    margin: 0;
    font-size: var(--font-lg);
    font-weight: var(--font-bold);
  }

  ._subtitle {
    margin: 0;
    color: var(--c-text-muted);
    font-size: var(--font-base);
  }

  ._meta {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    row-gap: $item-gap;
  }

  ._price {
    color: var(--c-accent);
    font-size: var(--font-base);
    font-weight: var(--font-bold);
    white-space: nowrap;
  }

  ._slots-left {
    display: inline-block;
    color: var(--c-warning);
    font-size: var(--font-sm);
    font-weight: var(--font-bold);
    text-align: center;
    white-space: normal;

    &.-always-available,
    &.-sold-out {
      color: var(--c-text-muted);
    }

    &.-desktop {
      display: none;
    }

    &.-mobile {
      text-align: left;
    }
  }

  @include for-desktop {
    grid-template-columns: 1fr;
    justify-items: center;
    row-gap: $section-gap;
    width: 100%;
    min-height: 253px;
    padding: var(--spacer-lg) var(--spacer-sm) var(--spacer-sm);

    &.-selected {
      ._checkmark {
        display: flex;
      }
    }

    ._checkmark {
      position: absolute;
      top: var(--spacer-xs);
      left: var(--spacer-xs);
      display: none;
      visibility: visible;
    }

    ._fastest-available-badge {
      right: auto;
      left: 50%;
      transform: translate(-50%, -50%);
    }

    ._icon-wrapper {
      display: flex;
    }

    ._content {
      text-align: center;
    }

    ._meta {
      align-items: center;
    }

    ._slots-left {
      &.-desktop {
        display: inline-block;
      }

      &.-mobile {
        display: none;
      }
    }
  }
}
</style>
