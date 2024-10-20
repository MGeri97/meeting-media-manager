import Vue from 'vue'
// @ts-ignore: VueMask has implicitly an any type
import VueMask from 'v-mask'
import { library, config } from '@fortawesome/fontawesome-svg-core'
import {
  FontAwesomeIcon,
  FontAwesomeLayers,
} from '@fortawesome/vue-fontawesome'
import {
  faChevronDown,
  faCaretDown,
  faTimesCircle,
} from '@fortawesome/free-solid-svg-icons'

// Font-Awesome
config.autoAddCss = false
library.add(faChevronDown, faCaretDown, faTimesCircle)

Vue.component('FontAwesomeIcon', FontAwesomeIcon)
Vue.component('FontAwesomeLayers', FontAwesomeLayers)

// V-mask
Vue.use(VueMask)
