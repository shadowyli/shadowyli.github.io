import { createApp, h, reactive } from 'vue';
import GridMotion from './GridMotion.vue';
import logos from '../../assets/mengshou-logos/manifest.json';
import './wall.css';

const section = document.getElementById('case-logo-wall');
const host = section?.querySelector<HTMLElement>('[data-grid-motion]');

if (section && host) {
  const viewport = window.matchMedia('(max-width: 720px)');
  const state = reactive({
    compact: viewport.matches,
    theme: document.documentElement.dataset.theme === 'light' ? 'light' as const : 'dark' as const
  });
  let app: ReturnType<typeof createApp> | null = null;
  const fallback = host.innerHTML;
  const assets = new URL('./mengshou-logos/', import.meta.url);
  const items = logos.map(logo => ({
    src: new URL(logo.file, assets).href,
    alt: logo.group + ' · ' + logo.name
  }));
  const syncLabel = () => {
    const english = document.documentElement.lang === 'en';
    section.setAttribute('aria-label', english ? 'S13 team logos' : 'S13 战队 Logo');
  };
  const syncTheme = () => {
    state.theme = document.documentElement.dataset.theme === 'light' ? 'light' : 'dark';
    syncLabel();
  };
  const resize = () => { state.compact = viewport.matches; };
  const mount = () => {
    if (app) return;
    app = createApp({
      render: () => h(GridMotion, {
        items,
        rows: 5,
        aspectRatio: 1.33,
        gap: state.compact ? 8 : 16,
        radius: state.compact ? 10 : 14,
        angle: state.compact ? -6 : -8,
        tilt: 0,
        speed: 24,
        direction: 'alternate',
        parallax: 0,
        spotlight: 0,
        dim: 0,
        fade: state.compact ? 0.1 : 0.18,
        grayscale: false,
        theme: state.theme,
        tileColor: 'var(--surface)',
        textColor: 'var(--text)',
        style: { '--gm-image-fit': 'contain', '--gm-image-padding': state.compact ? '4px' : '8px' }
      })
    });
    app.mount(host);
    syncLabel();
  };
  const nearby = new IntersectionObserver(entries => {
    if (entries.some(entry => entry.isIntersecting)) mount();
  }, { rootMargin: '240px' });
  const themeObserver = new MutationObserver(syncTheme);
  nearby.observe(section);
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme', 'lang'] });
  viewport.addEventListener('change', resize);
  syncLabel();
  window.addEventListener('pagehide', event => {
    if (event.persisted) return;
    nearby.disconnect();
    themeObserver.disconnect();
    viewport.removeEventListener('change', resize);
    app?.unmount();
    host.innerHTML = fallback;
  }, { once: true });
}
