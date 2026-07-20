<template>
  <div
    :class="['m-coupon-item', `-${state}`]"
    role="status"
    aria-live="polite"
  >
    <span class="_icon" aria-hidden="true">🏷️</span>

    <div class="_content">
      <div class="_title">
        {{ title }}
      </div>

      <div class="_code">
        {{ $t('Code') }}: {{ couponCode }}
      </div>
    </div>

    <button
      type="button"
      class="_action"
      :disabled="isActionDisabled"
      :aria-label="actionText"
      @click="$emit('coupon-action')"
    >
      <span v-if="state === 'applying'" class="_spinner" />
      <span v-else>{{ actionText }}</span>
    </button>
  </div>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api';

export default defineComponent({
  name: 'MCouponItem',
  props: {
    actionText: {
      type: String,
      required: true
    },
    couponCode: {
      type: String,
      required: true
    },
    isActionDisabled: {
      type: Boolean,
      required: true
    },
    state: {
      type: String,
      required: true
    },
    title: {
      type: String,
      required: true
    }
  }
});
</script>

<style lang="scss" scoped>
@import "~@storefront-ui/shared/styles/helpers/breakpoints";

.m-coupon-item {
  --coupon-idle-background: var(--c-secondary-lighten);
  --coupon-idle-text: var(--c-blue);
  --coupon-idle-action-background: var(--c-primary-lighten);
  --coupon-spinner-track: rgba(var(--c-white-base), 0.4);
  --coupon-applied-background: #dff3e9;
  --coupon-applied-text: #0f5c49;
  --coupon-applied-action-background: #20a87c;
  --coupon-locked-background: var(--c-white-darken);
  --coupon-locked-text: var(--c-gray);
  --coupon-locked-action-background: var(--c-gray-light);
  --coupon-locked-action-text: var(--c-dark);

  display: flex;
  align-items: stretch;
  width: 100%;
  margin-top: var(--spacer-sm);
  border-radius: var(--coupon-border-radius, 0);
  overflow: hidden;
  position: relative;
  background: var(--coupon-idle-background);
  color: var(--coupon-idle-text);

  &::before,
  &::after {
    content: '';
    position: absolute;
    top: 50%;
    width: 0.875rem;
    height: 0.875rem;
    margin-top: -0.4375rem;
    border-radius: 50%;
    background: var(--c-white);
    z-index: 1;
  }

  &::before {
    left: -0.4375rem;
  }

  &::after {
    right: -0.4375rem;
  }

  ._content {
    display: flex;
    flex-direction: column;
    justify-content: center;
    min-width: 0;
    flex: 1;
    padding: var(--spacer-sm) var(--spacer-base) var(--spacer-sm) var(--spacer-sm);
  }

  ._icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex: 0 0 auto;
    padding: var(--spacer-sm) 0 var(--spacer-sm) var(--spacer-base);
    font-size: 1.25rem;
    line-height: 1;
  }

  ._title {
    font-size: var(--font-sm);
    font-weight: var(--font-semibold);
    line-height: 1.2;
  }

  ._code {
    margin-top: 0.25rem;
    font-size: var(--font-xs);
    line-height: 1.2;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  ._action {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex: 0 0 6rem;
    padding: var(--spacer-sm);
    border: 0;
    background: var(--coupon-idle-action-background);
    color: var(--c-white);
    font-size: 0.75rem;
    font-weight: var(--font-bold);
    letter-spacing: 0.06em;
    text-transform: uppercase;
    cursor: pointer;
    transition: opacity 0.2s ease;
  }

  ._action:disabled {
    cursor: default;
  }

  ._spinner {
    width: 0.875rem;
    height: 0.875rem;
    border: 2px solid var(--coupon-spinner-track);
    border-top-color: var(--c-white);
    border-radius: 50%;
    animation: coupon-spin 0.8s linear infinite;
  }

  &.-applied,
  &.-saved {
    background: var(--coupon-applied-background);
    color: var(--coupon-applied-text);

    ._action {
      background: var(--coupon-applied-action-background);
    }
  }

  &.-locked {
    background: var(--coupon-locked-background);
    color: var(--coupon-locked-text);

    ._action {
      background: var(--coupon-locked-action-background);
      color: var(--coupon-locked-action-text);
    }
  }

  @include for-desktop {
    ._icon {
      font-size: 1.5rem;
    }

    ._title {
      font-size: var(--font-base);
    }

    ._action {
      flex-basis: 6.5rem;
      font-size: var(--font-sm);
    }
  }
}

@keyframes coupon-spin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}
</style>
