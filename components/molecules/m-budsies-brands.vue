<template>
  <div class="m-budsies-brands">
    <div class="_slogan">
      {{ $t('Explore Our Other Huggable Brands') }}
    </div>

    <div class="_brand-section">
      <a
        v-for="item in brandItems"
        :key="item.code"
        :class="item.className"
        class="_brand-item"
        target="_blank"
        :href="item.link"
      />
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';

import config from 'config';
import { currentStoreView } from '@vue-storefront/core/lib/multistore';

enum BrandCode {
  BUDSIES = 'budsies',
  PETSIES = 'petsies',
  BULKORDERS = 'bulkorders',
  WAGGABLES = 'waggables'
}

interface Item {
  code: BrandCode,
  className: string,
  link: string
}

export default Vue.extend({
  name: 'MBudsiesBrands',
  computed: {
    brandLinks (): Record<BrandCode, string> {
      return {
        [BrandCode.BUDSIES]: `https://${config.budsies.budsiesStoreDomain}/`,
        [BrandCode.PETSIES]: `https://${config.budsies.petsiesStoreDomain}/`,
        [BrandCode.BULKORDERS]: `https://${config.budsies.bulkordersStoreDomain}/`,
        [BrandCode.WAGGABLES]: `https://${config.budsies.waggablesStoreDomain}/`
      }
    },
    brandItems (): Item[] {
      const { storeCode } = currentStoreView();
      const items: Item[] = [];

      for (const item of Object.values(BrandCode)) {
        if (item === storeCode) {
          continue;
        }

        items.push({
          code: item,
          className: `-${item}`,
          link: this.brandLinks[item]
        })
      }

      return items;
    }
  }
})
</script>

<style lang="scss" scoped>
.m-budsies-brands {
  display: flex;
  flex-direction: column;
  justify-content: center;
  width: 100%;
  padding: 0 var(--spacer-sm);
  box-sizing: border-box;

  ._slogan {
    text-align: center;
    color: var(--brands-slogan-color, var(--c-light-variant));
    font-family: var(--font-family-secondary);
    font-size: var(--font-xl);
    margin: var(--spacer-xl) 0 var(--spacer-sm);
    width: 100%;
  }

  ._brand-section {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    width: 100%;

    ._brand-item {
      height: 60px;
      min-width: 200px;
      flex-basis: 27%;
      background-size: 50%;
      background-position: center;
      background-repeat: no-repeat;

      &.-budsies {
        background-image: url(/assets/footer/budsies-logo.png);
      }

      &.-petsies {
        background-image: url(/assets/footer/petsies-logo.png);
      }

      &.-waggables {
        background-image: url(/assets/footer/waggables-logo.png);
      }

      &.-bulkorders {
        background-image: url(/assets/footer/bulkorders-logo.png);
      }
    }
  }
}
</style>
