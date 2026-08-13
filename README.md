# Legacy Ativos Judiciais — landing page

Site institucional multipágina, responsivo e orientado à conversão para a Legacy Ativos Judiciais.

## Páginas

- `index.html` — página inicial
- `sobre.html` — história, manifesto e princípios
- `como-funciona.html` — jornada completa da análise à formalização
- `parceiros.html` — proposta de parceria para advogados e intermediadores
- `seguranca.html` — transparência, dados, limites e referências oficiais
- `duvidas.html` — central de respostas com busca e filtros por assunto

## Visualização local

Na pasta do projeto, execute:

```powershell
python -m http.server 4173
```

Depois acesse `http://localhost:4173`.

## Publicação na Vercel

O projeto já inclui `vercel.json` e não precisa de etapa de build. Na Vercel, importe este repositório, mantenha o preset como **Other** e deixe os campos Build Command e Output Directory vazios.

## Direção de design

- Paleta: preto mineral, marfim e dourado envelhecido da identidade visual.
- Tipografia: Newsreader para a voz editorial e Source Sans 3 para leitura e interface.
- Assinatura: linha dourada de progresso e uma composição inspirada em documentos, valor e passagem do tempo.
- Movimento: transições entre páginas, cenas 3D reativas, documentos em profundidade, cartões com iluminação localizada, reveal orquestrado, parallax sutil, resposta magnética nos CTAs e fallback completo para `prefers-reduced-motion`.
- Jornada de valor: carrossel cilíndrico 3D com cinco marcos da negociação, frente e verso, arraste, teclado, controles acessíveis e pausa automática durante a interação.
- Fundos claros: ondas WebGL adaptadas à paleta marfim e dourado da Legacy, renderizadas apenas quando visíveis e com fallback estático para movimento reduzido ou ausência de WebGL.
- UX: ação principal concentrada no WhatsApp, prova de experiência, processo em três etapas, conteúdo para titulares e parceiros, FAQ e ressalvas informativas.

## Implementação

Sem framework ou dependências de JavaScript. O site usa HTML semântico, CSS responsivo e JavaScript nativo com `IntersectionObserver` e `requestAnimationFrame`. As interações 3D usam apenas `transform` e propriedades compostas para preservar a fluidez.

O número de WhatsApp configurado é `+55 11 94817-9546`, conforme o material fornecido.

## Imagens editoriais geradas por IA

As imagens foram criadas especificamente para a identidade da Legacy, otimizadas em WebP e integradas às composições 3D das páginas:

- `assets/legacy-about-book.webp`: livro de registros e dossiê, em Sobre nós
- `assets/legacy-analysis-desk.webp`: mesa de análise documental, em Como funciona
- `assets/legacy-partnership.webp`: entrega de pasta entre profissionais, em Parceiros
- `assets/legacy-security-vault.webp`: dossiê protegido em cofre, em Segurança
- `assets/legacy-questions-book.webp`: livro jurídico de referência, em Dúvidas
- `assets/legacy-card-black.webp`, `legacy-card-blue.webp`, `legacy-card-emerald.webp`, `legacy-card-burgundy.webp` e `legacy-card-champagne.webp`: superfícies exclusivas dos cartões 3D da jornada de valor

## Fontes de conteúdo e boas práticas

- CNJ — definição e gestão de precatórios: https://www.cnj.jus.br/programas-e-acoes/precatorios/
- Constituição Federal, art. 100 — cessão total ou parcial: https://www.planalto.gov.br/ccivil_03/constituicao/constituicaocompilado.htm
- web.dev — animações performáticas e Core Web Vitals: https://web.dev/articles/animations-and-performance
- W3C/WCAG — contraste e movimento reduzido: https://www.w3.org/TR/WCAG21/
- Referência técnica de scroll: https://github.com/darkroomengineering/lenis (conceito estudado; biblioteca não incluída para preservar leveza)
