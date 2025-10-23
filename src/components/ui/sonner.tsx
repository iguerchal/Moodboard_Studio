"use client";

import { Toaster as Sonner, ToasterProps } from "sonner";

type AppToasterProps = ToasterProps & { appTheme?: "light" | "dark" };

const Toaster = ({ appTheme = "light", ...props }: AppToasterProps) => {
  return (
    <Sonner
      theme={appTheme as ToasterProps["theme"]}
      className="toaster group"
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };
