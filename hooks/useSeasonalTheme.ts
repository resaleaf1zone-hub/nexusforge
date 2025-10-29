import { useState, useEffect } from 'react';

type Theme = 'default' | 'halloween' | 'christmas';

const useSeasonalTheme = (): Theme => {
  const [theme, setTheme] = useState<Theme>('default');

  useEffect(() => {
    const date = new Date();
    const month = date.getMonth(); // 0-11 (Jan-Dec)

    if (month === 9) { // October
      setTheme('halloween');
    } else if (month === 11) { // December
      setTheme('christmas');
    } else {
      setTheme('default');
    }
  }, []);

  return theme;
};

export default useSeasonalTheme;
