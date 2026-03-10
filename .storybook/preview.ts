import type { Preview } from "@storybook/react";
import "../src/index.css";

const preview: Preview = {
  parameters: {
    backgrounds: {
      default: "eva-dark",
      values: [
        { name: "eva-dark", value: "#0a0a0a" },
        { name: "pure-black", value: "#000000" },
      ],
    },
  },
  globalTypes: {
    palette: {
      description: "Eva palette",
      toolbar: {
        title: "Palette",
        items: [
          { value: "normal", title: "Normal (Green)" },
          { value: "caution", title: "Caution (Orange)" },
          { value: "emergency", title: "Emergency (Red)" },
        ],
        dynamicTitle: true,
      },
    },
    locale: {
      description: "Eva locale",
      toolbar: {
        title: "Locale",
        items: [
          { value: "ja", title: "Japanese" },
          { value: "en", title: "English" },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: {
    palette: "normal",
    locale: "ja",
  },
};

export default preview;
