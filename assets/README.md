# Assets — Chaveiro Concórdia

Os PNGs binários precisam ser adicionados manualmente (não foi possível gerá-los em código).
Sugestão: use a logo da marca (chave estilizada sobre fundo amarelo `#FFD700`).

| Arquivo            | Tamanho  | Onde é usado                                     |
|--------------------|----------|--------------------------------------------------|
| `icon.png`         | 1024x1024| Ícone principal do app (Expo)                    |
| `adaptive-icon.png`| 1024x1024| Ícone adaptativo Android (apenas o foreground)   |
| `splash.png`       | 1242x2436| Splash screen (mascote centralizado)             |
| `favicon.png`      | 48x48    | Favicon Web                                      |

## PWA (em /public)

| Arquivo        | Tamanho   | Observação                                |
|----------------|-----------|-------------------------------------------|
| `icon-192.png` | 192x192   | Ícone PWA (usado pelo manifest.json)      |
| `icon-512.png` | 512x512   | Ícone PWA grande                          |
| `favicon.ico`  | 16/32/48  | Favicon clássico                          |

> Enquanto não houver os arquivos, o app roda normalmente — apenas faltarão os ícones.
> O Expo emite warning, mas não bloqueia execução.
