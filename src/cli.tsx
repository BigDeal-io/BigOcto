import React from 'react';
import { render } from 'ink';
import { Command } from 'commander';
import { App } from './app.js';
import { APP_AUTHOR, APP_AUTHOR_URL, APP_COMPANY, APP_NAME, APP_VERSION } from './constants.js';
import type { GitEnvironment } from './types.js';

const program = new Command();

program
  .name(APP_NAME)
  .description('BIGOCTO \u2014 GitHub issues, the easy way')
  .version(APP_VERSION, '-v, --version')
  .addHelpText('after', `\nA product of ${APP_AUTHOR} \u2014 a service of ${APP_COMPANY}\n${APP_AUTHOR_URL}`);

program.action(() => {
  // Minimal git detection for Phase 1 — will be replaced in Phase 2
  const env: GitEnvironment = {
    isGitRepo: false,
    ghAuthenticated: false,
  };

  const { waitUntilExit } = render(<App env={env} />, {
    exitOnCtrlC: true,
  });

  waitUntilExit().then(() => {
    process.exit(0);
  });
});

program.parse();
