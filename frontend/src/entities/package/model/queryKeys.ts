export const packageKeys = {
  all: ['packages'] as const,
  list: () => [...packageKeys.all, 'list'] as const,
}
