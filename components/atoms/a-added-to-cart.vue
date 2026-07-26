<template>
  <div class="added-to-cart">
    <SfIcon
      icon="check"
      size="xs"
      class="added-to-cart__icon"
    />

    <span class="added-to-cart__text">{{ $t('In Cart') }}</span>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { SfIcon } from '@storefront-ui/vue';

export default defineComponent({
  components: {
    SfIcon
  }
});
</script>

<style lang="scss" scoped>
  .added-to-cart {
    display: flex;
    align-items: center;
    color: var(--c-primary);
    font-size: var(--font-sm);
    font-weight: var(--font-bold);

    &__icon {
      --icon-color: var(--c-primary);
      margin-right: var(--spacer-2xs);
    }
  }
</style>
