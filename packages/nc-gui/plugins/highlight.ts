import 'highlight.js/styles/a11y-dark.css'

import hljs from 'highlight.js/lib/core'
import sql from 'highlight.js/lib/languages/sql'
import { defineNuxtPlugin } from 'nuxt/app'

hljs.registerLanguage('sql', sql)

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.directive('highlight', (el) => {
    const blocks = el.querySelectorAll('code')
    blocks.forEach((block) => {
      hljs.highlightBlock(block)
    })
  })
})
