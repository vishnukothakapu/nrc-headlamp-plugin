import { registerSidebarEntry } from '@kinvolk/headlamp-plugin/lib';

// 1. Register the top-level parent menu
registerSidebarEntry({
  name: 'nrc-plugin',
  label: 'Node Readiness',
  icon: 'mdi:shield-check',
  url: '/nrc-rules',
});
