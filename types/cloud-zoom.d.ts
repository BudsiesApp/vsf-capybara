interface JQuery {
  CloudZoom: (options: Record<string, any>) => any
}

declare module '*.css' {
  const content: string;
  export default content;
}

declare module '@cabbiepete/cloud-zoom';
