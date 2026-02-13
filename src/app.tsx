import React, { useState } from 'react';
import { Box, Text, useApp, useInput } from 'ink';
import { ThemeProvider, extendTheme, defaultTheme } from '@inkjs/ui';
import { useNavigation } from './hooks/use-navigation.js';
import { useConfig } from './hooks/use-config.js';
import { Header } from './components/header.js';
import { Footer } from './components/footer.js';
import { MainMenu } from './screens/main-menu.js';
import { HelpScreen } from './screens/help/help-screen.js';
import { IssueBrowser } from './screens/issues/issue-browser.js';
import { IssueDetail } from './screens/issues/issue-detail.js';
import { IssueActions } from './screens/issues/issue-actions.js';
import { IssueCreate } from './screens/issues/issue-create.js';
import { ActionHistory } from './screens/history/action-history.js';
import { RepoManagement } from './screens/repos/repo-management.js';
import { SettingsScreen } from './screens/settings/settings-screen.js';
import { ClaudeAgentLaunch } from './screens/agent/claude-agent-launch.js';
import { KnowledgeView } from './screens/knowledge/knowledge-view.js';
import { LoopConfig, type LoopLaunchConfig } from './screens/loop/loop-config.js';
import { LoopRunning } from './screens/loop/loop-running.js';
import type { GitEnvironment } from './types.js';
import { COLORS } from './constants.js';

const customTheme = extendTheme(defaultTheme, {
  components: {
    Select: {
      styles: {
        focusIndicator: () => ({ color: COLORS.primary }),
        label({ isFocused, isSelected }: { isFocused: boolean; isSelected: boolean }) {
          let color;
          if (isSelected) color = COLORS.secondary;
          if (isFocused) color = COLORS.primary;
          return { color, bold: isFocused };
        },
      },
    },
  },
});

interface AppProps {
  env: GitEnvironment;
}

export function App({ env }: AppProps) {
  const { exit } = useApp();
  const nav = useNavigation();
  const { config, updateConfig } = useConfig();
  const [loopLaunchConfig, setLoopLaunchConfig] = useState<LoopLaunchConfig | null>(null);

  useInput((input, _key) => {
    if (input === 'q' && nav.current.type === 'main-menu') {
      exit();
    }
    if (input === '?' && nav.current.type !== 'help') {
      nav.push({ type: 'help' });
    }
  });

  function renderScreen() {
    const screen = nav.current;
    switch (screen.type) {
      case 'main-menu':
        return <MainMenu onSelect={nav.push} env={env} />;
      case 'issue-browser':
        return <IssueBrowser onSelect={nav.push} onBack={nav.pop} env={env} />;
      case 'issue-detail':
        return <IssueDetail issueNumber={screen.issueNumber} onBack={nav.pop} env={env} />;
      case 'issue-actions':
        return <IssueActions issueNumber={screen.issueNumber} onSelect={nav.push} onBack={nav.pop} env={env} />;
      case 'issue-create':
        return <IssueCreate onBack={nav.pop} env={env} />;
      case 'action-history':
        return <ActionHistory onBack={nav.pop} />;
      case 'repo-management':
        return <RepoManagement config={config} onUpdateConfig={updateConfig} onBack={nav.pop} />;
      case 'settings':
        return <SettingsScreen config={config} onUpdateConfig={updateConfig} onBack={nav.pop} />;
      case 'claude-agent-launch':
        return <ClaudeAgentLaunch issueNumber={screen.issueNumber} onBack={nav.pop} env={env} />;
      case 'knowledge-view':
        return <KnowledgeView onBack={nav.pop} env={env} />;
      case 'loop-config':
        return (
          <LoopConfig
            onBack={nav.pop}
            onLaunch={(lc) => {
              setLoopLaunchConfig(lc);
              nav.push({ type: 'loop-running' });
            }}
            env={env}
            config={config}
          />
        );
      case 'loop-running':
        return loopLaunchConfig
          ? <LoopRunning launchConfig={loopLaunchConfig} onBack={nav.pop} env={env} />
          : <Placeholder type="loop-running" onBack={nav.pop} />;
      case 'help':
        return <HelpScreen onBack={nav.pop} />;
    }
  }

  return (
    <ThemeProvider theme={customTheme}>
      <Box flexDirection="column" width="100%">
        <Header breadcrumbs={nav.breadcrumbs} env={env} />
        <Box flexDirection="column" paddingX={1} flexGrow={1}>
          {renderScreen()}
        </Box>
        <Footer screen={nav.current} />
      </Box>
    </ThemeProvider>
  );
}

function Placeholder({ type, onBack }: { type: string; onBack: () => void }) {
  useInput((_input, key) => {
    if (key.escape) onBack();
  });

  return (
    <Box flexDirection="column" gap={1}>
      <Text color={COLORS.muted}>Screen "{type}" is not yet implemented.</Text>
      <Text color={COLORS.muted}>Press Esc to go back.</Text>
    </Box>
  );
}
