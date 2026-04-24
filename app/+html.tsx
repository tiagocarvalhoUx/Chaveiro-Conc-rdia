import { ScrollViewStyleReset } from "expo-router/html";
import type { PropsWithChildren } from "react";

/**
 * Documento HTML raiz para a versão Web/PWA.
 * Carregado pelo Expo Router apenas no bundler `metro`.
 */
export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="pt-BR">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no, viewport-fit=cover"
        />
        <meta name="theme-color" content="#FFD700" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
        <meta name="apple-mobile-web-app-title" content="Chaveiro Concórdia" />
        <meta name="application-name" content="Chaveiro Concórdia" />
        <meta
          name="description"
          content="Chaveiro Concórdia — Atendimento 24h em Araçatuba/SP. Abertura de veículos, fechaduras digitais e emergências para automóveis, empresa e residência."
        />
        <meta name="keywords" content="chaveiro, chaveiro 24 horas, Araçatuba, abertura de carro, fechadura digital, chave de carro, chaveiro automotivo, emergência" />
        <meta name="author" content="Chaveiro Concórdia" />
        <meta name="robots" content="index, follow" />

        {/* Open Graph (Facebook, WhatsApp, LinkedIn, Discord) */}
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Chaveiro Concórdia" />
        <meta property="og:title" content="Chaveiro Concórdia — 24h em Araçatuba/SP" />
        <meta
          property="og:description"
          content="Atendimento 24 horas para abertura de veículos, residências e empresas. Cópia de chaves, codificação de telecomandos e fechaduras digitais. Ligue (18) 99102-0078."
        />
        <meta property="og:url" content="https://chaveiro-conc-rdia.vercel.app/" />
        <meta property="og:image" content="https://chaveiro-conc-rdia.vercel.app/icon-512.png" />
        <meta property="og:image:width" content="512" />
        <meta property="og:image:height" content="512" />
        <meta property="og:image:alt" content="Logo Chaveiro Concórdia" />
        <meta property="og:locale" content="pt_BR" />

        {/* Twitter Cards */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Chaveiro Concórdia — 24h em Araçatuba/SP" />
        <meta
          name="twitter:description"
          content="Atendimento 24 horas para abertura de veículos, residências e empresas. Cópia de chaves, fechaduras digitais e emergências. (18) 99102-0078."
        />
        <meta name="twitter:image" content="https://chaveiro-conc-rdia.vercel.app/icon-512.png" />

        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <link rel="canonical" href="https://chaveiro-conc-rdia.vercel.app/" />

        <ScrollViewStyleReset />

        <style dangerouslySetInnerHTML={{ __html: globalStyle }} />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker
                    .register('/sw.js')
                    .catch(function(err) { console.warn('SW registration failed', err); });
                });
              }
            `,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}

const globalStyle = `
html, body, #root {
  background-color: #1A1A1A;
  color: #FFFFFF;
}
body {
  margin: 0;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
}
input, textarea {
  caret-color: #FFD700;
}
`;
