import { K8s, registerRoute, registerSidebarEntry } from '@kinvolk/headlamp-plugin/lib';
import { Link, ResourceListView } from '@kinvolk/headlamp-plugin/lib/CommonComponents';
import { Chip, Tooltip, Typography } from '@mui/material'; 
import NodeReadinessRuleDetails from './NodeReadinessRuleDetails';
import NodeReadinessEvaluationDetails from './NodeReadinessEvaluationDetails';

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

class NodeReadinessEvaluation extends K8s.crd.makeCustomResourceClass({
  apiInfo: [{ group: 'readiness.node.x-k8s.io', version: 'v1alpha1' }],
  isNamespaced: false,
  pluralName: 'nodereadinessevaluations',
  singularName: 'nodereadinessevaluation',
  kind: 'NodeReadinessEvaluation',
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
          getValue: (rule: InstanceType<typeof NodeReadinessRule>) => (
            <Link routeName="nrc-rule-details" params={{ name: rule.metadata.name }}>
              {rule.metadata.name}
            </Link>
          ),
        },
        {
          id: 'mode',
          label: 'Mode',
          getValue: (rule: InstanceType<typeof NodeReadinessRule>) => {
            const mode = rule.jsonData?.spec?.enforcementMode || 'N/A';
            return (
              <Tooltip title={mode}>
                <Chip label={mode} size="small" variant="outlined" />
              </Tooltip>
            );
          },
        },
        {
          id: 'dryRun',
          label: 'Dry-run',
          getValue: (rule: InstanceType<typeof NodeReadinessRule>) => {
            const isDryRun = rule.jsonData?.spec?.dryRun;
            return isDryRun ? <Chip label="Dry Run" size="small" color="warning" /> : '-';
          },
        },
        {
          id: 'satisfied',
          label: 'Satisfied',
          // Placeholder until we implement NodeReadinessEvaluation logic
          getValue: () => '-',
        },
        {
          id: 'failedNodes',
          label: 'Failed Nodes',
          show: false,
          // Placeholder until we implement NodeReadinessEvaluation logic
          getValue: () => '-',
        },
        {
          id: 'missingConditions',
          label: 'Missing Conditions',
          show: false,
          // Placeholder until we implement NodeReadinessEvaluation logic
          getValue: () => '-',
        },
        {
          id: 'nodeSelector',
          label: 'Node Selector',
          getValue: (rule: InstanceType<typeof NodeReadinessRule>) => {
            const labels = rule.jsonData?.spec?.nodeSelector?.matchLabels;
            if (!labels) return 'All Nodes';
            
            const numLabels = Object.keys(labels).length;
            const tooltipText = JSON.stringify(labels, null, 2); 
            
            return (
              <Tooltip title={<pre style={{ margin: 0, fontSize: '0.75rem' }}>{tooltipText}</pre>}>
                <Chip label={`${numLabels} Label${numLabels > 1 ? 's' : ''}`} size="small" />
              </Tooltip>
            );
          },
        },
        {
          id: 'taintKey',
          label: 'Taint',
          getValue: (rule: InstanceType<typeof NodeReadinessRule>) =>
            rule.jsonData?.spec?.taint?.key || 'None',
        },
        {
          id: 'taintEffect',
          label: 'Effect',
          getValue: (rule: InstanceType<typeof NodeReadinessRule>) => {
            const effect = rule.jsonData?.spec?.taint?.effect || 'None';
            return <Chip label={effect} size="small" />;
          },
        },
        {
          id: 'conditionPolicy',
          label: 'Condition Policy',
          getValue: (rule: InstanceType<typeof NodeReadinessRule>) => {
            const policy = rule.jsonData?.spec?.conditionPolicy || 'N/A';
            return <Chip label={policy} size="small" color="primary" variant="outlined" />;
          },
        },
        'age',
      ]}
    />
  );
}

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

