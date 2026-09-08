import { K8s, registerRoute, registerSidebarEntry } from '@kinvolk/headlamp-plugin/lib';
import { ResourceListView } from '@kinvolk/headlamp-plugin/lib/CommonComponents';

// Define the KubeObject for NodeReadinessRule
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
    <ResourceListView
      title="Node Readiness Rules"
      resourceClass={NodeReadinessRule}
      id="nrc-readiness-rules"
      columns={[
        'name',
        {
          id: 'enforcementMode',
          label: 'Enforcement Mode',
          getValue: (rule: InstanceType<typeof NodeReadinessRule>) =>
            rule.jsonData?.spec?.enforcementMode || 'N/A',
        },
        {
          id: 'taintKey',
          label: 'Taint Key',
          getValue: (rule: InstanceType<typeof NodeReadinessRule>) =>
            rule.jsonData?.spec?.taint?.key || 'None',
        },
        {
          id: 'conditionPolicy',
          label: 'Condition Policy',
          getValue: (rule: InstanceType<typeof NodeReadinessRule>) =>
            rule.jsonData?.spec?.conditionPolicy || 'N/A',
        },
        {
          id: 'conditions',
          label: 'Conditions',
          getValue: (rule: InstanceType<typeof NodeReadinessRule>) => {
            const conditions = rule.jsonData?.spec?.conditions;
            return conditions ? String(conditions.length) : '0';
          },
        },
        'age',
      ]}
    />
  );
}
// Register the route
registerRoute({
  path: '/nrc-rules',
  component: () => <ReadinessRulesPage />,
  exact: true,
  name: 'Readiness Rules',
  sidebar: 'nrc-rules-list', // Connects the route to the child sidebar item
});

// 1. Register the top-level parent menu
registerSidebarEntry({
  name: 'nrc-plugin',
  label: 'Node Readiness',
  icon: 'mdi:shield-check', // A nice shield icon for the controller
  url: '/nrc-rules',
});

// 2. Register "Readiness Rules" as a child under the new menu
registerSidebarEntry({
  parent: 'nrc-plugin',
  name: 'nrc-rules-list',
  label: 'Readiness Rules',
  url: '/nrc-rules',
});
