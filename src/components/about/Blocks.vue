<template>
  <div class="box-top-container">
    <div class="box-container">
      <div class="box-holder"><div class="box"></div></div>
      <div class="box-holder"><div class="box"></div></div>
      <div class="box-holder"><div class="box"></div></div>
    </div>
  </div>
</template>

<style scoped>
/* https://codepen.io/codesofra/pen/XxRwQQ */

.box-top-container {
  position: relative;
}

.box-container {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  transform-style: preserve-3d;
  perspective: 2000px;
  transform: rotateX(-30deg) rotateY(-45deg);
}
.box-holder {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  transform-style: preserve-3d;
  transform: translate3d(0em, 3em, 1.5em);
}
.box-holder:last-child {
  transform: rotateY(-90deg) rotateX(90deg) translate3d(0, 3em, 1.5em);
}
.box-holder:first-child {
  transform: rotateZ(-90deg) rotateX(-90deg) translate3d(0, 3em, 1.5em);
}
.box-holder:nth-child(1) .box {
  background-color: #1fbcd3;
}
.box-holder:nth-child(1) .box:before {
  background-color: #126d7a;
}
.box-holder:nth-child(1) .box:after {
  background-color: #1894a7;
}
.box-holder:nth-child(2) .box {
  background-color: #b5e2b4;
}
.box-holder:nth-child(2) .box:before {
  background-color: #6ac66b;
}
.box-holder:nth-child(2) .box:after {
  background-color: #8fd490;
}
.box-holder:nth-child(3) .box {
  background-color: #d6b6f6;
}
.box-holder:nth-child(3) .box:before {
  background-color: #b15beb;
}
.box-holder:nth-child(3) .box:after {
  background-color: #cc89f0;
}

.box {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  transform-style: preserve-3d;
  animation: ani-box 24s infinite;
  width: 3em;
  height: 3em;
}
.box:before,
.box:after {
  position: absolute;
  width: 100%;
  height: 100%;
  content: "";
}
.box:before {
  left: 100%;
  bottom: 0;
  transform: rotateY(90deg);
  transform-origin: 0 50%;
}
.box:after {
  left: 0;
  bottom: 100%;
  transform: rotateX(90deg);
  transform-origin: 0 100%;
}

@keyframes ani-box {
  8.33% {
    transform: translate3d(-50%, -50%, 0) scaleZ(2);
  }
  16.7% {
    transform: translate3d(-50%, -50%, -3em) scaleZ(1);
  }
  25% {
    transform: translate3d(-50%, -100%, -3em) scaleY(2);
  }
  33.3% {
    transform: translate3d(-50%, -150%, -3em) scaleY(1);
  }
  41.7% {
    transform: translate3d(-100%, -150%, -3em) scaleX(2);
  }
  50% {
    transform: translate3d(-150%, -150%, -3em) scaleX(1);
  }
  58.3% {
    transform: translate3d(-150%, -150%, 0) scaleZ(2);
  }
  66.7% {
    transform: translate3d(-150%, -150%, 0) scaleZ(1);
  }
  75% {
    transform: translate3d(-150%, -100%, 0) scaleY(2);
  }
  83.3% {
    transform: translate3d(-150%, -50%, 0) scaleY(1);
  }
  91.7% {
    transform: translate3d(-100%, -50%, 0) scaleX(2);
  }
  100% {
    transform: translate3d(-50%, -50%, 0) scaleX(1);
  }
}
</style>
