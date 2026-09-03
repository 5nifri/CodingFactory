/**
 * Free, offline icon suggestion: matches keywords found in a consulting
 * offer's title/description against a curated list of Bootstrap Icons.
 * No external API or cost involved. Falls back to a generic icon when
 * nothing matches.
 */
const ICON_KEYWORDS: { keywords: string[]; icon: string }[] = [
  { keywords: ['cloud', 'aws', 'azure', 'saas', 'hébergement', 'hebergement'], icon: 'bi-cloud' },
  { keywords: ['sécurité', 'securite', 'security', 'cyber', 'cybersécurité', 'cybersecurite'], icon: 'bi-shield-check' },
  { keywords: ['donnée', 'donnees', 'data', 'base de données', 'base de donnees', 'database'], icon: 'bi-database' },
  { keywords: ['code', 'développement', 'developpement', 'dev web', 'programmation', 'logiciel'], icon: 'bi-code-slash' },
  { keywords: ['ia', 'intelligence artificielle', 'ai', 'machine learning', 'apprentissage automatique'], icon: 'bi-cpu' },
  { keywords: ['stratégie', 'strategie', 'strategy', 'conseil', 'idée', 'idee', 'innovation'], icon: 'bi-lightbulb' },
  { keywords: ['finance', 'comptabilité', 'comptabilite', 'budget', 'trésorerie', 'tresorerie'], icon: 'bi-cash-coin' },
  { keywords: ['formation', 'coaching', 'mentorat', 'éducation', 'education', 'apprentissage'], icon: 'bi-mortarboard' },
  { keywords: ['réseau', 'reseau', 'network', 'infrastructure', 'serveur'], icon: 'bi-hdd-network' },
  { keywords: ['projet', 'gestion de projet', 'planification', 'kanban'], icon: 'bi-kanban' },
  { keywords: ['juridique', 'legal', 'contrat', 'conformité', 'conformite'], icon: 'bi-briefcase' },
  { keywords: ['rh', 'ressources humaines', 'recrutement', 'équipe', 'equipe'], icon: 'bi-people' },
  { keywords: ['transformation digitale', 'digital', 'digitalisation', 'modernisation'], icon: 'bi-rocket-takeoff' },
  { keywords: ['audit', 'analyse', 'diagnostic', 'évaluation', 'evaluation'], icon: 'bi-graph-up' },
  { keywords: ['marketing', 'communication', 'image de marque', 'branding'], icon: 'bi-globe' },
  { keywords: ['performance', 'optimisation', 'vitesse', 'efficacité', 'efficacite'], icon: 'bi-speedometer2' },
  { keywords: ['design', 'ux', 'ui', 'interface'], icon: 'bi-palette' },
  { keywords: ['mobile', 'application', 'app'], icon: 'bi-phone' }
];

const DEFAULT_ICON = 'bi-briefcase';

export function suggestIcon(title: string, description: string): string {
  const text = `${title} ${description}`.toLowerCase();

  for (const entry of ICON_KEYWORDS) {
    if (entry.keywords.some(k => text.includes(k))) {
      return entry.icon;
    }
  }

  return DEFAULT_ICON;
}
