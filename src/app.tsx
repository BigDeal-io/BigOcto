import React from 'react';
import { Box, useApp, useInput } from 'ink';
import { ThemeProvider, extendTheme, defaultTheme } from '@inkjs/ui';
import { useNavigation } from './hooks/use-navigation.js';
import { Header } from './components/header.js';
import { Footer } from './components/footer.js';
import { MainMenu } from './screens/main-menu.js';
import { HelpScreen } from './screens/help/help-screen.js';
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

  useInput((input, _key) => {
    if (input === 'q' && nav.current.type === 'main-menu') {
      exit();
    }
    if (input === '?' && nav.current.type !== 'help') {
      nav.push({ type: 'help' });
    }
  });

  function renderScreen() {
    switch (nav.current.type) {
      case 'main-menu':
        return <MainMenu onSelect={nav.push} env={env} />;
      case 'help':
        return <HelpScreen onBack={nav.pop} />;
      default:
        return <MainMenu onSelect={nav.push} env={env} />;
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
