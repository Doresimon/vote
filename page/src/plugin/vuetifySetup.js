import Vue from "vue";
import Vuetify from "vuetify"; // index.js or main.js
import "vuetify/dist/vuetify.min.css"; // Ensure you are using css-loader

/** use Material Icons from google */
import "material-design-icons-iconfont/dist/material-design-icons.css";
// iconfont: 'md';
// npm install material-design-icons-iconfont -D
// ref: https://material.io/tools/icons

/** use Material Design Icons from google */
// import '@mdi/font/css/materialdesignicons.css';
// iconfont: 'mdi';
// npm install @mdi/font -D

Vue.use(Vuetify, {
  // iconfont: 'md' // md || mdi || fa || fa4
  breakpoint: {
    thresholds: {
      // xs: 360
    },
    scrollbarWidth: 0
  }
});
