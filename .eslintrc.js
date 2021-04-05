module.exports = {
  "env": {
    "browser": true,
    "es2021": true
  },
  "extends": [
    "plugin:@typescript-eslint/recommended",
    "airbnb"
  ],
  "settings": {
    "import/resolver": {
      "node": {
        "extensions": [".js", ".ts"]
      }
    }
  },
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "ecmaFeatures": {
      "jsx": true
    },
    "ecmaVersion": 12,
    "sourceType": "module"
  },
  "ignorePatterns": ['demo/**/*.js', '**/*.min.js', '**/.*.js'],
  "plugins": [
    "react",
    "@typescript-eslint"
  ],
  "rules": {
    // prevent argument of function error in .ts
    "no-unused-vars": "off",
    "@typescript-eslint/no-unused-vars": ["error"],

    // prevent enum declaration error in .ts
    "no-shadow": "off",
    "@typescript-eslint/no-shadow": ["error"],

    "import/extensions": ["error", "ignorePackages", {
      js: 'never',
      mjs: 'never',
      jsx: 'never',
      ts: 'never',
      tsx: 'never',
    }],
  }
};
