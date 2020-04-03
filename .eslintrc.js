const ERROR = 'error';
const WARN = 'warn';
const OFF = 'off';

module.exports = {
	'env': {
		'commonjs': true,
		'es6': true,
        'node': true,
        "mocha": true,
		//browser: true,   this line is in the standard indeed eslint plugin, but is not true for Starfish
	},
    'extends': 'eslint:recommended',
    'plugins': ['gettext'],
	'globals': {
		'Atomics': 'readonly',
		'SharedArrayBuffer': 'readonly'
	},
	'parserOptions': {
		'ecmaVersion': 2018
	},
	'settings': {
		polyfills: ['promises']
	},
	'rules': {

		//from eslintrc.js generation
		'indent': [
			ERROR,
			4,
			{
				SwitchCase: 1
			}
		],
		'linebreak-style': [
			'error',
			'unix'
		],
		'quotes': [
			'error',
			'single'
		],
		'semi': [
			'error',
			'always'
		],

		//from Indeed's common-npm-scripts .eslintrc.js 
		//https://code.corp.indeed.com/node/common-npm-scripts/blob/master/.eslintrc.js
		'no-console': 'off',
		'no-sync': 'off',
		'no-loops/no-loops': 'off',

		//from Indeed's "base" rules
		//https://code.corp.indeed.com/frontend/eslint-plugin-indeed/blob/master/settings.js
		'array-callback-return': ERROR,
        'comma-spacing': [
            ERROR,
            {
                before: false,
                after: true
            }
        ],
        'comma-style': [ERROR, 'last'],
        //'compat/compat': 'error',
        complexity: [WARN, 10],
        curly: ERROR,
        'dot-notation': ERROR,
        eqeqeq: ERROR,
        'gettext/no-variable-string': ERROR,
        'gettext/required-positional-markers-for-multiple-variables': ERROR,
        'handle-callback-err': ERROR,
        'linebreak-style': [ERROR, 'unix'],
        'max-params': [ERROR, 5],
        'no-alert': ERROR,
        'no-array-constructor': ERROR,
        'no-caller': ERROR,
        'no-catch-shadow': ERROR,
        'no-confusing-arrow': ERROR,
        'no-duplicate-imports': ERROR,
        'no-eval': ERROR,
        'no-extend-native': ERROR,
        'no-extra-bind': ERROR,
        'no-floating-decimal': ERROR,
        'no-implicit-globals': ERROR,
        'no-implied-eval': ERROR,
        'no-inner-declarations': ERROR,
        'no-labels': ERROR,
        'no-loop-func': ERROR,
        'no-native-reassign': ERROR,
        'no-nested-ternary': ERROR,
        'no-new-func': ERROR,
        'no-new-object': ERROR,
        'no-new-wrappers': ERROR,
        'no-octal-escape': ERROR,
        'no-path-concat': ERROR,
        'no-proto': WARN,
        'no-return-assign': ERROR,
        'no-script-url': ERROR,
        'no-self-compare': ERROR,
        'no-sequences': ERROR,
        'no-shadow': ERROR,
        'no-shadow-restricted-names': ERROR,
        'no-throw-literal': WARN,
        'no-undef-init': ERROR,
        'no-unmodified-loop-condition': ERROR,
        'no-unneeded-ternary': ERROR,
        'no-unused-expressions': ERROR,
        'no-unused-vars': ERROR,
        'no-use-before-define': ERROR,
        'no-useless-call': ERROR,
        'no-useless-concat': ERROR,
        'no-with': ERROR,
        quotes: [ERROR, 'single', 'avoid-escape'],
        semi: [ERROR, 'always'],
        'semi-spacing': [
            ERROR,
            {
                before: false,
                after: true
            }
		],
		
		//from Indeed's style rules
		'brace-style': [ERROR, '1tbs'],
        'block-spacing': ERROR,
        camelcase: ERROR,
        'dot-location': [ERROR, 'property'],
        'eol-last': [ERROR, 'always'],
        indent: [
            ERROR,
            4,
            {
                SwitchCase: 1
            }
        ],
        'key-spacing': [
            ERROR,
            {
                beforeColon: false,
                afterColon: true
            }
        ],
        'keyword-spacing': ERROR,
        'new-parens': ERROR,
        'newline-before-return': ERROR,
        'newline-per-chained-call': ERROR,
        'no-implicit-coercion': [
            ERROR,
            {
                allow: ['!!']
            }
        ],
        'no-lone-blocks': ERROR,
        'no-multi-spaces': ERROR,
        'no-multi-str': ERROR,
        'no-multiple-empty-lines': [ERROR, { max: 2, maxEOF: 0, maxBOF: 0 }],
        'no-spaced-func': ERROR,
        'no-trailing-spaces': ERROR,
        'no-whitespace-before-property': ERROR,
        'object-curly-spacing': [ERROR, 'always'],
        'one-var-declaration-per-line': ERROR,
        'operator-linebreak': [
            ERROR,
            'after',
            {
                overrides: { '?': 'before', ':': 'before' }
            }
        ],
        'padded-blocks': [ERROR, { blocks: 'never', classes: 'never', switches: 'never' }],
        'space-in-parens': [ERROR, 'never'],
        'space-infix-ops': ERROR,
        'space-unary-ops': ERROR,
		yoda: [ERROR, 'never'],
		
		//from Indeed's ES6 rules
		


	
	}
};