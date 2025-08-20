const config = {
  requireModule: ['ts-node/register'],
  require: [
    'features/step-definitions/**/*.ts',
    'src/hooks/**/*.ts'
  ],
  format: [
    'progress-bar',
    'json:reports/cucumber-report.json',
    'html:reports/cucumber-report.html',
    '@cucumber/pretty-formatter'
  ],
  formatOptions: {
    snippetInterface: 'async-await',
    snippetSyntax: 'typescript'
  },
  publishQuiet: true,
  dryRun: false,
  failFast: false,
  strict: true,
  worldParameters: {},
  parallel: parseInt(process.env.PARALLEL_WORKERS || '1')
};

module.exports = {
  default: config
};