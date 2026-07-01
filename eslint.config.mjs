// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt({
  rules: {
    '@stylistic/no-multiple-empty-lines': 'off',
    '@stylistic/comma-dangle': 'off',

    

    // 💡 줄바꿈, 띄어쓰기 관련 잔소리들을 'off'로 끕니다.
    // '@stylistic/indent': 'off',
    // '@stylistic/quotes': 'off',
    // '@stylistic/semi': 'off',
    // '@stylistic/member-delimiter-style': 'off',
    // 'singleQuote': 'off', // 홑따옴표 잔소리 끄기
    
    // // 혹시 Vue 파일 내부 줄바꿈으로 난리치면 아래 것도 추가
    // 'vue/html-indent': 'off',
    // 'vue/max-attributes-per-line': 'off',
    // 'vue/first-attribute-linecap': 'off'
  }
})