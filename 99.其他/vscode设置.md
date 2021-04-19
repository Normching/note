用户代码段

vue2.x

```json
{
	// Place your snippets for vue here. Each snippet is defined under a snippet name and has a prefix, body and 
	// description. The prefix is what is used to trigger the snippet and the body will be expanded and inserted. Possible variables are:
	// $1, $2 for tab stops, $0 for the final cursor position, and ${1:label}, ${2:another} for placeholders. Placeholders with the 
	// same ids are connected.
	"vue-template": {
		"prefix": "vue",
		"body": [
			"<template>",
			"  <div class=\"$1\">",
			"",
			"  </div>",
			"</template>",
			"",
			"<script>",
			"export default {",
			"  name: '$1',",
			"",
			"  mixins: [],",
			"",
			"  components: {},",
			"",
			"  props: {},",
			"",
			"  data () {",
			"    return {}",
			"  },",
			"",
			"  computed: {},",
			"",
			"  watch: {},",
			"",
			"  created () {},",
			"",
			"  mounted () {},",
			"",
			"  destroyed () {},",
			"",
			"  methods: {}",
			"}",
			"</script>",
			"",
			"<style lang=\"\" scoped>",
			"  .$1{",
			"",
			"  }",
			"</style>"
		],
		"description": "my vue template"
	}
}
```



vue3.0

```json
{
	"Vue Template":{
		"prefix":"vue3Template",
		"body":[
		"<template>\n\t<div>\n\n\t</div>\n</template>",
		"<script lang=\"ts\">\nimport{ defineComponent }from 'vue';\nexport default defineComponent({\n\tname: \"\",\n\tsetup: () => {\n\n\t}\n})\n</script>",
		"<style lang=\"\" scoped>\n\n</style>"
		],
		"description":"生成vue3文件"
	}
}
```



插件

any-rule 正则表达式

Auto Close Tag

Auto Rename Tag

Beautify

Beautify css/sass/scss/less

Better Align 格式化 对齐

Bracket Pair Colorizer 括号颜色

Color Highlight 颜色高亮

EditorConfig for VS Code

ESLint

Git Graph

Import Cost 查看引入文件大小

JavaScript (ES6) code snippets

Path Autocomplete 路径

Todo Tree

Vetur

VS Code Counter代码统计

vscode-icons vs图标

