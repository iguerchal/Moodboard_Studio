  # MoodBoard Studio UI Design

  Outil de création de moodboards (UI/UX) en React + TypeScript + Vite, basé sur des primitives shadcn/ui + Radix + Framer Motion. Fidèle aux prompts Figma fournis, avec export, IA (mock), QA accessibilité et gestion de projet JSON.

  ## Tech stack

  - React 18 + TypeScript 5 + Vite
  - UI: shadcn/ui (Radix), Tailwind tokens (via index.css/styles/globals.css)
  - Animations: motion (Framer Motion API)
  - Icônes: lucide-react
  - Export: html-to-image, jsPDF

  ## Running the code

  - Run `npm i` to install the dependencies.
  - Run `npm run dev` to start the development server.
  - Optionnel: `npm run build` puis `npm run preview`.

  ## Structure (high-level)

  - `src/App.tsx`: shell de l’app, états globaux (thème, panneaux, éléments du canvas, layout)
  - `src/components`: Header, Sidebar, Canvas (+ CanvasElement), AI, layout, menus, QA, share/export, story, tools, ui
  - `src/utils`: `layout` (arrangeurs), `contrast` (WCAG), `fonts` (Google Fonts), `fontCatalog`

  ## Features (MVP fonctionnel)

  - Drag & Drop: texte, couleurs, formes depuis la Sidebar vers le Canvas.
  - IA (mock utile): Prompt‑to‑Board génère palette/typos/éléments; AI Suggestions insère/remplace images/couleurs/layouts.
  - Arrangeurs de layout: Grid, Masonry, Circle Pack, Editorial + Auto‑arrange.
  - Export: Image (PNG/JPG/WebP/SVG), PDF (pages palette/assets), Lien (mock via JSON copié), Project JSON (Import/Export).
  - Polices: chargement dynamique Google Fonts; changement de police par bloc texte (sélecteur contextuel au-dessus du bloc).
  - Persistance: `theme`, `layout` et `canvasElements` sauvegardés en localStorage.
  - Accessibilité: Contrast Checker (calcul WCAG, fix auto du texte), focus visibles, rôles ARIA sur modales.
  - Command Palette: Cmd/Ctrl+K pour actions rapides (theme, upload, layout, auto‑arrange, etc.).
  - Story Mode: timeline avec lecture automatique et overlay “Now Playing”.

  ## Guide d’usage

  ### Export avancé (Share → Export)
  - Image: choisissez Format (PNG/JPG/WebP/SVG), Quality et Resolution (Original / 1080p / 1440p / 2160p).
  - PDF: capture du board + pages “Color Palette” (swatches + hex) et “Assets & References” (images/fonts en colonnes). Les images externes sont inlinées pour éviter les erreurs CORS.
  - Link: copie un JSON du board dans le presse-papiers (mock partage de lien).
  - Project: Import/Export de projet JSON.
    - Export: génère `moodboard-project.json` contenant `theme`, `layout`, `elements`.
    - Import: charge votre JSON; fermez la fenêtre puis rechargez la page pour appliquer complètement (les polices se chargent automatiquement).

  ### Polices
  - Sidebar: sélection de polices (catalogue étendu). Les polices Google sont injectées dynamiquement.
  - Bloc texte existant: survoler/sélectionner un bloc → un sélecteur apparaît au-dessus pour changer la police instantanément.
  - IA: si une police est proposée par Prompt‑to‑Board, elle est chargée avant l’insertion pour éviter les flashs.

  ### Story Mode
  - Timeline en bas de page; Play pour lecture auto selon la durée de chaque frame; overlay du nom du frame courant.

  ## Raccourcis

  - Cmd/Ctrl+K: Ouvrir la Command Palette
  - Delete/Backspace: Supprimer l’élément sélectionné (ou le dernier si aucun sélectionné)
  - Esc: Fermer panneaux/modales ouverts et désélectionner
  - Cmd/Ctrl+S: Sauvegarder immédiatement l’état

  ## Accessibilité

  - Contrast Checker (WCAG): calcule le ratio et propose un “Fix” automatique du foreground texte.
  - Modales et sélecteurs: focus visibles, rôles ARIA et navigation clavier.

  ## Performance

  - `Canvas` et `CanvasElement` mémoïsés; callbacks stabilisés (`useCallback`).
  - Redimensionnement direct des éléments image/couleur avec poignée (drag), clampé 64→640 px.

  ## Notes et limites

  - IA et partage de lien sont simulés côté client (pas de backend).
  - Export vidéo/GIF non implémenté (placeholder dans UI).

  ## Roadmap courte

  - T13 (en cours): élargir encore le catalogue de polices et UI de recherche.
  - Améliorations Canvas: multi‑sélection, group/ungroup, guides d’alignement, undo/redo.
  - Optimisations: virtualisation si très grand nombre d’éléments; code‑splitting ciblé.

  ## Changelog (récent)

  - Sélection d’élément + suppression ciblée; contours visibilité renforcée.
  - Redimensionnement direct (poignée) avec blocage du drag pendant resize.
  - Export Image: WebP correct + résolutions; Export PDF enrichi (palette légendée, assets en colonnes) et fiabilisé (CORS).
  - Project JSON: Import/Export via onglet dédié.
  - Polices: chargement dynamique (AI/Sidebar/Import) + sélecteur sur bloc texte.
  - Story Mode: lecture auto + overlay “Now Playing”.