<script lang="ts" setup></script>

<template>
  <div class="backlight">
    <slot></slot>
  </div>
</template>

<style scoped lang="scss">
// https://codepen.io/georgehastings/pen/xgwxgo

@mixin backlight($x, $y, $spread, $size, $colorA, $colorB, $duration) {
  &:after {
    position: absolute;
    content: "";
    top: $y;
    left: $x;
    width: 100%;
    height: 100%;
    right: 0;
    z-index: -1;
    margin: 0 auto;
    transform: scale($size);
    -webkit-filter: blur($spread);
    -moz-filter: blur($spread);
    -ms-filter: blur($spread);
    filter: blur($spread);
    background: linear-gradient(270deg, $colorA, $colorB);
    background-size: 200% 200%;
    animation: animateGlow $duration ease infinite;

    @keyframes animateGlow {
      0% {
        background-position: 0% 50%;
      }
      50% {
        background-position: 100% 50%;
      }
      100% {
        background-position: 0% 50%;
      }
    }
  }
}

.backlight {
  position: relative;
  text-align: center;
  animation: textColor 10s ease infinite;
  @include backlight(0, 0, 5vh, 0.75, #0fffc1, #7e0fff, 10s);

  @keyframes textColor {
    0% {
      color: #7e0fff;
    }
    50% {
      color: #0fffc1;
    }
    100% {
      color: #7e0fff;
    }
  }
}
</style>
