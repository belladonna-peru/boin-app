import React, { createContext, useContext, useState } from 'react';

export const PALETTES = {
  dark: { bg:'#14121F', card:'#1E1B2E', border:'#2A2740', txt:'#F5F2EC', mut:'#9B96B0', acc:'#FF4E3A', acc2:'#FF6B3D', teal:'#35C9A5', gold:'#FFD23F' },
  light:{ bg:'#F7F4EE', card:'#FFFFFF', border:'#E4DED0', txt:'#26203A', mut:'#7A7490', acc:'#FF4E3A', acc2:'#FF6B3D', teal:'#0F6E56', gold:'#B4771B' },
};

export const TAB_COLORS = { Boin:'#FF6B3D', Home:'#FFC93F', Chat:'#35C9A5', Map:'#FF4E3A', Mercado:'#ED6FA0', Wallet:'#58C472', Yo:'#8F7DFF' };

const ThemeCtx = createContext();
export function ThemeProvider({ children }) {
  const [mode, setMode] = useState('dark');
  return <ThemeCtx.Provider value={{ t: PALETTES[mode], mode, setMode }}>{children}</ThemeCtx.Provider>;
}
export const useTheme = () => useContext(ThemeCtx);
