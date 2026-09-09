import { K8s, registerRoute, registerSidebarEntry } from '@kinvolk/headlamp-plugin/lib';
import { ResourceListView, Link } from '@kinvolk/headlamp-plugin/lib/CommonComponents';
import NodeReadinessRuleDetails from './NodeReadinessRuleDetails';

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
        {
          id: 'name',
          label: 'Name',
          // OVERRIDE: We point this directly to our custom Details route!
          getValue: (rule: InstanceType<typeof NodeReadinessRule>) => (
            <Link routeName="nrc-rule-details" params={{ name: rule.metadata.name }}>
              {rule.metadata.name}
            </Link>
          ),
        },
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

// 1. Register the route for the main List View
registerRoute({
  path: '/nrc-rules',
  component: () => <ReadinessRulesPage />,
  exact: true,
  name: 'Readiness Rules',
  sidebar: 'nrc-rules-list',
});

// 2. Register the COMPLETELY CUSTOM route for the Details View!
registerRoute({
  path: '/nrc-rules/:name',
  component: () => <NodeReadinessRuleDetails />,
  exact: true,
  name: 'nrc-rule-details',
  sidebar: 'nrc-rules-list', // <--- Add this line!
});


// 3. Register the top-level parent menu
registerSidebarEntry({
  name: 'nrc-plugin',
  label: 'Node Readiness',
  icon: 'mdi:shield-check',
  url: '/nrc-rules',
});

// 4. Register "Readiness Rules" as a child under the new menu
registerSidebarEntry({
  parent: 'nrc-plugin',
  name: 'nrc-rules-list',
  label: 'Readiness Rules',
  url: '/nrc-rules',
});
