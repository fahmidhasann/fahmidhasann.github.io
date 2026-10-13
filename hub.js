/* Hub: send old one-page links (/#projects, /#videos …) to where that content lives now. */
(() => {
  const STUDIO = 'https://fahmidhasann.github.io/video-editor-portfolio/';
  const map = {
    hero: '/lab/', journey: '/lab/#journey', 'ai-education': '/lab/#ai-education',
    'side-projects': '/lab/#side-projects', projects: '/lab/#projects', contact: '/lab/#contact',
    'book-a-call': '/lab/#contact', youtubeExplainers: '/lab/#ai-education',
    videos: STUDIO + '#work', 'client-projects': STUDIO + '#reels'
  };
  const id = decodeURIComponent(location.hash.slice(1));
  if (id.startsWith('project-')) { location.replace('/lab/#' + id); return; }
  if (map[id]) location.replace(map[id]);
})();
