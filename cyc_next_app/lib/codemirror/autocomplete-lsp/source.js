import { Facet } from '@codemirror/state';
const useLast = (values) => values.reduce((_, v) => v, '');

export const MaxInfoWidth = 300;

export const serverUri = Facet.define({ combine: useLast });
export const rootUri = Facet.define({ combine: useLast });
export const documentUri = Facet.define({ combine: useLast });
export const languageId = Facet.define({ combine: useLast });
