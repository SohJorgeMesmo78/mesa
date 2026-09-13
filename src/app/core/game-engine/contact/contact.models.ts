export type ContactPhase = 'ready' | 'countdown' | 'revealed';
export interface ContactSession { readonly game: 'contato'; readonly phase: ContactPhase; readonly word: string; readonly round: number; }
