# EFATA Frontend — Patch de domínio canônico PatroAI

## Objetivo

Substituir somente as referências SEO da URL técnica do Railway pelo domínio oficial:

`https://patroai.com`

## Arquivos

- `index.html`
- `public/robots.txt`
- `public/sitemap.xml`

## Aplicação

Aplicar estes três arquivos na raiz do repositório:

`https://github.com/patroaiconsultech/Plataforma-Efata-777-Frontend`

preservando os caminhos relativos.

Este pacote foi gerado sobre o `Plataforma-Efata-777-Frontend-main (14).zip`.

## O que muda

- canonical
- hreflang
- Open Graph URL/image
- Twitter image
- JSON-LD organization URL/logo
- robots sitemap URL
- sitemap canonical location

## O que não muda

- landing
- música
- Aurora
- AppConsole
- documentos
- autenticação
- API
- backend
- Realtime
- Team
- service worker

## Infraestrutura externa necessária

Antes do go-live definitivo, `patroai.com` deve estar configurado como custom domain do serviço frontend e o DNS deve apontar para o serviço correto.

Idealmente, padronizar o host canônico como `patroai.com` e redirecionar variantes/host técnico quando a infraestrutura permitir.

## Validação pós-deploy

Verificar:

- `https://patroai.com/`
- `https://patroai.com/robots.txt`
- `https://patroai.com/sitemap.xml`
- HTML `<link rel="canonical">`
- `og:url`
- `og:image`
- `twitter:image`
- JSON-LD `url` e `logo`
- hreflang PT/ES/EN
