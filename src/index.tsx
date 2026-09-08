import { K8s, registerRoute, registerSidebarEntry } from '@kinvolk/headlamp-plugin/lib';
import { SimpleTable } from '@kinvolk/headlamp-plugin/lib/CommonComponents';

export class NodeReadinessRule extends K8s.crd.makeCustomResourceClass({
  apiInfo: [{
    group: 'readiness.node.x-k8s.io',
    version: 'v1alpha1',
  }],
  isNamespaced: false,
  pluralName: 'nodereadinessrules',
  singularName: 'nodereadinessrule',
  kind: 'NodeReadinessRule',
}) {}

function ReadinessRulesPage() {
  return (
    <SimpleTable
      columns={[
        { label: 'Name', getter: (item) => item.name || 'Unknown' },
        { label: 'Age', getter: (item) => item.metadata?.creationTimestamp || 'Unknown' },
      ]}
      data={[]}
    />
  );
}

registerRoute({
  path: '/nrc-rules',
  component: () => <ReadinessRulesPage />,
  exact: true,
  name: 'Readiness Rules',
  sidebar: 'nrc-rules-list',
});

// 1. Register the top-level parent menu
registerSidebarEntry({
  name: 'nrc-plugin',
  label: 'Node Readiness',
  icon: 'mdi:shield-check',
  url: '/nrc-rules',
});

// 2. Register "Readiness Rules" as a child under the new menu
registerSidebarEntry({
  parent: 'nrc-plugin',
  name: 'nrc-rules-list',
  label: 'Readiness Rules',
  url: '/nrc-rules',
});
