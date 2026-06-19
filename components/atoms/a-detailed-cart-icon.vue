<template>
  <SfButton
    class="sf-button--pure a-microcart-icon a-detailed-cart-icon"
    :aria-label="ariaLabel"
    :class="extraCssClasses"
    @click="openDetailedCart"
  >
    <SfIcon
      size="xs"
      color="white"
      :icon="floatingIcon ? 'add_to_cart' : 'empty_cart'"
      :class="floatingIcon ? 'sf-bottom-navigation__floating-icon' : 'sf-header__icon'"
    >
      <template #badge>
        <SfBadge v-show="!floatingIcon && totalQuantity" class="sf-icon__badge sf-badge--number">
          {{ totalQuantity }}
        </SfBadge>
      </template>
    </SfIcon>
  </SfButton>
</template>

<script>
import { mapGetters } from 'vuex';
import { SfIcon, SfButton, SfBadge } from '@storefront-ui/vue';

import getCurrentThemeClass from 'theme/helpers/get-current-theme-class';

export default {
  components: { SfIcon, SfButton, SfBadge },
  props: {
    floatingIcon: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    ...mapGetters({
      totalQuantity: 'cart/getItemsTotalQuantity'
    }),
    extraCssClasses () {
      return [getCurrentThemeClass()];
    },
    ariaLabel () {
      if (!this.totalQuantity) {
        return this.$t('Open Cart');
      }

      const itemsCountText = this.totalQuantity > 1
        ? this.$t('{count} items', { count: this.totalQuantity })
        : this.$t('1 item');

      return this.$t('Open Cart') + ', ' + itemsCountText;
    }
  },
  methods: {
    openDetailedCart () {
      this.$router.push({ name: 'detailed-cart' })
    }
  }
};
</script>

<style lang="scss" scoped>
.a-detailed-cart-icon {
  position: relative;

  .sf-header__icon {
    cursor: pointer;
  }

  &.-skin-bulkorders {
    .sf-icon__badge {
      --badge-background: var(--c-primary);
    }

    .sf-header__icon:hover {
      --icon-color: var(--c-secondary);
    }
  }
}
</style>
