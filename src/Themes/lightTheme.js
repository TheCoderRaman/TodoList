import { createTheme } from "@nextui-org/react";

export const lightTheme = createTheme({
  type: "light",
  theme: {
    colors: {
        primaryLight: '$green200',
        primaryLightHover: '$green300',
        primaryLightActive: '$green400',
        primaryLightContrast: '$green600',
        primary: '#4ADE7B',
        primaryBorder: '$green500',
        primaryBorderHover: '$green600',
        primarySolidHover: '$green700',
        primarySolidContrast: '$white',
        primaryShadow: '$green500',
  
        gradient: 'linear-gradient(to right, #2c3e50, #fd746c)',

        link: '#5E1DAD',
        myColor: '#ff4ecd'
      },
      space: {},
      fonts: {}
  },
});
