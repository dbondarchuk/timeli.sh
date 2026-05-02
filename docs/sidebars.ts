import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const calendarsAndScheduling = [
  'apps/google-calendar',
  'apps/outlook',
  'apps/ics-feed',
  'apps/caldav',
  'apps/busy-events',
  'apps/url-busy-events',
  'apps/weekly-schedule',
  'apps/smart-schedule',
  'apps/calendar-writer',
  'apps/url-schedule-provider',
];

const meetings = ['apps/zoom'];

const payments = ['apps/stripe', 'apps/square', 'apps/paypal'];

const email = [
  'apps/smtp',
  'apps/email-notification',
  'apps/customer-email-notification',
  'apps/appointment-notifications',
  'apps/waitlist-notifications',
];

const sms = [
  'apps/text-belt',
  'apps/text-message-notification',
  'apps/customer-text-message-notification',
  'apps/text-message-auto-reply',
  'apps/text-message-resender',
];

const siteFeatures = [
  'apps/blog',
  'apps/waitlist',
  'apps/forms',
  'apps/gift-card-studio',
  'apps/my-cabinet',
  'apps/financial-overview',
];

const otherApps = ['apps/carddav', 'apps/webhooks'];

const sidebars: SidebarsConfig = {
  docsSidebar: [
    {
      type: 'category',
      label: 'Getting started',
      link: {
        type: 'generated-index',
        title: 'Getting started',
        description:
          'Create an account, choose a plan, pay if needed, then complete first-time setup—including your first bookable services.',
      },
      items: [
        'getting-started/introduction',
        'getting-started/what-is-timelish',
        'getting-started/sign-up',
        'getting-started/subscription-and-checkout',
        'getting-started/workspace-install-wizard',
      ],
    },
    {
      type: 'category',
      label: 'Using your workspace',
      link: {
        type: 'generated-index',
        title: 'Using your workspace',
        description:
          'After setup: first tasks, where settings live, and connecting your own web address.',
      },
      items: [
        'daily-use/first-steps-after-setup',
        'daily-use/settings',
        'daily-use/connect-domain',
      ],
    },
    {
      type: 'category',
      label: 'Apps',
      link: {
        type: 'doc',
        id: 'apps/overview',
      },
      items: [
        'apps/troubleshooting',
        {
          type: 'category',
          label: 'Calendars & scheduling',
          collapsed: true,
          items: calendarsAndScheduling,
        },
        {
          type: 'category',
          label: 'Meetings',
          collapsed: true,
          items: meetings,
        },
        {
          type: 'category',
          label: 'Payments',
          collapsed: true,
          items: payments,
        },
        {
          type: 'category',
          label: 'Email',
          collapsed: true,
          items: email,
        },
        {
          type: 'category',
          label: 'Text messaging',
          collapsed: true,
          items: sms,
        },
        {
          type: 'category',
          label: 'Website features',
          collapsed: true,
          items: siteFeatures,
        },
        {
          type: 'category',
          label: 'Contacts & automation',
          collapsed: true,
          items: otherApps,
        },
      ],
    },
  ],
};

export default sidebars;
