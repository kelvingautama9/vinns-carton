import React, { createContext, useContext, useEffect, useState } from 'react';

export type AppTheme = 'default' | 'liquid-glass' | 'light-white' | 'beige';

interface ThemeContextType {
  theme: AppTheme;
  setTheme: (theme: AppTheme) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'default',
  setTheme: () => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<AppTheme>(() => {
    const saved = localStorage.getItem('app_theme');
    if (saved === 'liquid-glass' || saved === 'light-white' || saved === 'beige' || saved === 'default') {
      return saved as AppTheme;
    }
    return 'default';
  });

  const setTheme = (newTheme: AppTheme) => {
    setThemeState(newTheme);
    localStorage.setItem('app_theme', newTheme);
  };

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('theme-default', 'theme-liquid-glass', 'theme-light-white', 'theme-beige');
    root.classList.add(`theme-${theme}`);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useAppTheme = () => useContext(ThemeContext);
