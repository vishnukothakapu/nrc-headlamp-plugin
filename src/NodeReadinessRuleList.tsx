import { Link, ResourceListView } from '@kinvolk/headlamp-plugin/lib/CommonComponents';
import { Chip,Tooltip } from '@mui/material';
import { NodeReadinessRule } from './index';


export default function ReadinessRulesPage() {
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
            // dry-run rules don't enforce taints, so highlight them
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
            // no labels means it applies globally
            if (!labels) return 'All Nodes';
            
            const numLabels = Object.keys(labels).length;
            // pretty-print for tooltip
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
