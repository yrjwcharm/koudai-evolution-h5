module.exports = {
  root: true,
  parserOptions: {
    parser: 'babel-eslint',
    sourceType: 'module',
  },
  extends: ["react-app", "react-app/jest", "prettier"],
  rules: {
    'no-control-regex': 0,  //允许正则表达式中的控制字符
    'eqeqeq': 'off',//允许使用双等号
  }
};
