export const siteKeys = {
  all: ['site'] as const,
  public: () => [...siteKeys.all, 'public'] as const,
  adminSettings: () => [...siteKeys.all, 'admin', 'settings'] as const,
  adminTheme: () => [...siteKeys.all, 'admin', 'theme'] as const,
  adminSections: () => [...siteKeys.all, 'admin', 'sections'] as const,
}
