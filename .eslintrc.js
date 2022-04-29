module.exports = {
  "env": {
      "browser": true,
      "es6": true ,
      "node": true
  },
  "extends": [
      "react-app",
      "eslint:recommended"
  ],
  "parserOptions": {
      "ecmaVersion": 6,
      "sourceType": "module"
  },
  "plugins": [
    "prettier"
  ],
  rules : {
    'no-console': 0,
    'comma-dangle': 0,
    'no-unused-vars': 0,
    'no-control-regex':0,
  }
  
}