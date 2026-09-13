export interface WordListSession { readonly game: 'jogo-da-lista'; readonly phase: 'setup' | 'ready' | 'revealed'; readonly count: number; readonly words: readonly string[]; readonly round: number; }
