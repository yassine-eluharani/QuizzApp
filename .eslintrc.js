module.exports = {
  root: true,
  extends: ['expo', 'prettier'],
  ignorePatterns: [
    'node_modules',
    'backend',
    'dist',
    '.expo',
    'assets/data/questions',
    'assets/quizzes',
  ],
  rules: {
    'react-hooks/exhaustive-deps': 'warn',
    'no-empty': ['error', { allowEmptyCatch: true }],
  },
};
