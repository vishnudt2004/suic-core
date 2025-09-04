import "react";

declare module "react" {
  // Add support for CSS custom properties
  interface CSSProperties {
    [key: `--${string}`]: string | undefined;
  }
}
