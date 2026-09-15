import { K8s, registerRoute, registerSidebarEntry } from '@kinvolk/headlamp-plugin/lib';
import { Link, ResourceListView } from '@kinvolk/headlamp-plugin/lib/CommonComponents';
import { Chip, Typography } from '@mui/material'; 
import NodeReadinessEvaluationDetails from './NodeReadinessEvaluationDetails';
import NodeReadinessRuleDetails from './NodeReadinessRuleDetails';
import ReadinessRulesPage from './NodeReadinessRuleList';


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


export class NodeReadinessEvaluation extends K8s.crd.makeCustomResourceClass({
  apiInfo: [{ group: 'readiness.node.x-k8s.io', version: 'v1alpha1' }],
  isNamespaced: false,
  pluralName: 'nodereadinessevaluations',
  singularName: 'nodereadinessevaluation',
  kind: 'NodeReadinessEvaluation',
}) {}



function NodeReadinessEvaluationsPage() {
  return (
    <ResourceListView
      title="Node Evaluations"
      resourceClass={NodeReadinessEvaluation}
    
      headerProps={{
        titleSideActions: [],
      }}
      columns={[
        {
          id: 'name',
          label: 'Name',
          getValue: (nre: InstanceType<typeof NodeReadinessEvaluation>) =>
            nre.jsonData?.spec?.nodeName || nre.metadata.name,
          render: (nre: InstanceType<typeof NodeReadinessEvaluation>) => {
            // fallback to resource name if nodeName isn't specified
            const nodeName = nre.jsonData?.spec?.nodeName || nre.metadata.name;
            return (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <Link
                  routeName="nrc-evaluation-details"
                  params={{ name: nre.metadata.name }}
                  style={{ fontWeight: 'bold' }}
                >
                  {nre.metadata.name}
                </Link>
                <Link
                  routeName="node"
                  params={{ name: nodeName }}
                  style={{ fontSize: '0.85em', color: '#888' }}
                >
                  View Node
                </Link>
              </div>
            );
          },
        },
        {
          id: 'state',
          label: 'State',
          getValue: (nre: InstanceType<typeof NodeReadinessEvaluation>) =>
            nre.jsonData?.status?.state,
          render: (nre: InstanceType<typeof NodeReadinessEvaluation>) => {
            const state = nre.jsonData?.status?.state;
            const isAvailable = state === 'Available';
            
            return (
              <Chip
                label={state || 'Unknown'}
                size="small"
                style={{
                  backgroundColor: isAvailable ? '#e8f5e9' : '#ffebee',
                  color: isAvailable ? '#2e7d32' : '#c62828',
                }}
              />
            );
          },
        },
        {
          id: 'rulesStatus',
          label: 'Rules Status',
          getValue: (nre: InstanceType<typeof NodeReadinessEvaluation>) => {
            const rules = nre.jsonData?.status?.rules || [];
            const satisfiedCount = rules.filter((r: any) => r.ruleStatus === 'Satisfied').length;
            return `${satisfiedCount} / ${rules.length}`;
          },
          render: (nre: InstanceType<typeof NodeReadinessEvaluation>) => {
            const rules = nre.jsonData?.status?.rules || [];
            const total = rules.length;
            const satisfied = rules.filter((r: any) => r.ruleStatus === 'Satisfied').length;
            const isAllSatisfied = total > 0 && satisfied === total;

            return (
              <Typography
                variant="body2"
                style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                {isAllSatisfied ? '✅' : '⚠️'} {satisfied} / {total} satisfied
              </Typography>
            );
          },
        },
        'age',
      ]}
    />
  );
}


// --- ROUTING & SIDEBAR REGISTRATION ---

// 1. Register the route for the main List View
registerRoute({
  path: '/nrc-rules',
  component: () => <ReadinessRulesPage />,
  exact: true,
  name: 'Readiness Rules',
  sidebar: 'nrc-rules-list',
});

// 2. Register the CUSTOM route for the Details View
registerRoute({
  path: '/nrc-rules/:name',
  component: () => <NodeReadinessRuleDetails />,
  exact: true,
  name: 'nrc-rule-details',
  sidebar: 'nrc-rules-list',
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


// 5. Register "Node Evaluations" as a child under the new menu
registerSidebarEntry({
  parent: 'nrc-plugin',
  name: 'nrc-evaluations-list',
  label: 'Node Evaluations',
  url: '/nrc-evaluations',
});

// 6. Register the route for the Evaluation List View
registerRoute({
  path: '/nrc-evaluations',
  sidebar: 'nrc-evaluations-list',
  name: 'Node Evaluations',
  exact: true,
  component: () => <NodeReadinessEvaluationsPage />,
});

// 7. Register the route for the Evaluation Details View
registerRoute({
  path: '/nrc-evaluations/:name',
  sidebar: 'nrc-evaluations-list',
  name: 'nrc-evaluation-details',
  exact: true,
  component: () => <NodeReadinessEvaluationDetails />,
});

