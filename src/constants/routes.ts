/**
 * App-level route constants. Import ROUTES instead of hardcoding
 * href strings so route changes happen in one place.
 */
export const ROUTES = {
  home: "/",
  auth: {
    signIn: "/auth/sign-in",
    signUp: "/auth/sign-up",
    forgotPassword: "/auth/forgot-password",
    resetPassword: "/auth/reset-password",
    verifyEmail: "/auth/verify-email",
  },
  dashboard: {
    root: "/dashboard",
    note: "/dashboard/note",
    artboard: "/dashboard/artboard",
    todo: "/dashboard/todo",
    database: "/dashboard/database",
    experts: "/dashboard/experts",
    files: "/dashboard/files",
    components: "/dashboard/components",
    presets: "/dashboard/presets",
    profile: "/dashboard/profile",
    settings: "/dashboard/settings",
    storage: "/dashboard/storage",
    tools: "/dashboard/tools",
    extensions: "/dashboard/extensions",
    ideSnippet: "/dashboard/ide-snippet",
    commands: {
      root: "/dashboard/commands",
      github: "/dashboard/commands/github",
      linux: "/dashboard/commands/linux",
      vps: "/dashboard/commands/vps",
      server: "/dashboard/commands/server",
      nextjs: "/dashboard/commands/nextjs",
      nodejs: "/dashboard/commands/nodejs",
      shopify: "/dashboard/commands/shopify",
    },
    mvc: {
      root: "/dashboard/mvc",
      nextjs: "/dashboard/mvc/nextjs",
      remixjs: "/dashboard/mvc/remixjs",
      nestjs: "/dashboard/mvc/nestjs",
      expressjs: "/dashboard/mvc/expressjs",
      wxt: "/dashboard/mvc/wxt",
      reactNative: "/dashboard/mvc/react-native",
    },
  },
} as const;
