export interface NavigationItem {
  id: string;
  title: string;
  type: 'item' | 'collapse' | 'group';
  translate?: string;
  icon?: string;
  hidden?: boolean;
  url?: string;
  classes?: string;
  exactMatch?: boolean;
  external?: boolean;
  target?: boolean;
  breadcrumbs?: boolean;
  children?: NavigationItem[];
}

export const NavigationItems: NavigationItem[] = [
  {
    id: 'navigation',
    title: 'Navigation',
    type: 'group',
    icon: 'icon-navigation',
    children: [
      {
        id: 'dashboard',
        title: 'Dashboard',
        type: 'item',
        url: '/dashboard',
        icon: 'feather icon-home',
        classes: 'nav-item'
      }
    ]
  },
  {
    id: 'categories',
    title: 'Catégories',
    type: 'group',
    icon: 'icon-group',
    children: [
      {
        id: 'categories-list',
        title: 'Toutes les catégories',
        type: 'item',
        url: '/categories',
        classes: 'nav-item',
        icon: 'feather icon-tag'
      },
      {
        id: 'categories-new',
        title: 'Nouvelle catégorie',
        type: 'item',
        url: '/categories/new',
        classes: 'nav-item',
        icon: 'feather icon-plus-circle'
      }
    ]
  },
  {
    id: 'formations',
    title: 'Formations',
    type: 'group',
    icon: 'icon-group',
    children: [
      {
        id: 'formations-list',
        title: 'Toutes les formations',
        type: 'item',
        url: '/formations',
        classes: 'nav-item',
        icon: 'feather icon-book'
      },
      {
        id: 'formations-new',
        title: 'Nouvelle formation',
        type: 'item',
        url: '/formations/new',
        classes: 'nav-item',
        icon: 'feather icon-plus-circle'
      }
    ]
  },
  {
    id: 'consulting',
    title: 'Consulting',
    type: 'group',
    icon: 'icon-group',
    children: [
      {
        id: 'consulting-offers',
        title: 'Offres de consulting',
        type: 'item',
        url: '/consulting',
        classes: 'nav-item',
        icon: 'feather icon-briefcase'
      },
      {
        id: 'consulting-offer-new',
        title: 'Nouvelle offre',
        type: 'item',
        url: '/consulting/new',
        classes: 'nav-item',
        icon: 'feather icon-plus-circle'
      },
      {
        id: 'consulting-requests',
        title: 'Demandes de consulting',
        type: 'item',
        url: '/consulting/requests',
        classes: 'nav-item',
        icon: 'feather icon-message-square'
      }
    ]
  },
  {
    id: 'user-management',
    title: 'Utilisateurs',
    type: 'group',
    icon: 'icon-group',
    children: [
      {
        id: 'users-list',
        title: 'Tous les utilisateurs',
        type: 'item',
        url: '/users',
        classes: 'nav-item',
        icon: 'feather icon-users'
      }
    ]
  }
];
