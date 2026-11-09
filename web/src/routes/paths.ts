export const paths = {
  home: '/',
  item: (id: string) => `/items/${encodeURIComponent(id)}`,
}
