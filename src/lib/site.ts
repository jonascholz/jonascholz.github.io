export const site = {
  name: 'Jona Scholz',
  title: 'Jona Scholz',
  description:
    'PhD candidate at KIT working on generalist robots. Notes on robot learning, deep learning and spiking neural networks.',
  url: 'https://jonascholz.github.io',
  email: 'jona.m.scholz@gmail.com',
  location: 'Karlsruhe, Germany',
  affiliation: { name: 'ITIV, Karlsruhe Institute of Technology', url: 'https://www.itiv.kit.edu/21_10571.php' },
  links: [
    { label: 'GitHub', url: 'https://github.com/jonascholz' },
    { label: 'Scholar', url: 'https://scholar.google.com/citations?user=XjXwo3EAAAAJ&hl=de&oi=ao' },
    { label: 'ORCID', url: 'https://orcid.org/0009-0000-6241-2244' },
    { label: 'LinkedIn', url: 'https://www.linkedin.com/in/jona-scholz' },
  ],
  nav: [
    { label: 'Writing', href: '/blog/' },
    { label: 'Projects', href: '/projects/' },
    { label: 'Lab', href: '/lab/' },
    { label: 'About', href: '/cv/' },
  ],
} as const;

export const formatDate = (d: Date) =>
  d.toLocaleDateString('en-GB', { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' });
