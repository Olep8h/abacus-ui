import { addons } from "storybook/manager-api"
import { create } from "storybook/theming"

addons.setConfig({
  theme: create({
    base: "light",
    brandTitle: "Abacus UI",
    brandUrl: "https://github.com/Olep8h/abacus-ui",
    brandTarget: "_blank",
  }),
})
