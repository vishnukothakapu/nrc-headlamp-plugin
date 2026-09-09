import { useParams } from 'react-router-dom';
import { Resource, SimpleTable } from '@kinvolk/headlamp-plugin/lib/CommonComponents';
import { Chip, Box } from '@mui/material';
import { NodeReadinessRule } from './index'; 

export default function NodeReadinessRuleDetails() {
  const { name } = useParams<{ name: string }>();

  return (
    <Resource.DetailsGrid
      resourceType={NodeReadinessRule}
      name={name!}
      extraInfo={(rule: InstanceType<typeof NodeReadinessRule> | null) => {
        if (!rule) return [];
        const spec = rule.jsonData?.spec || {};
        
        return [
          {
            name: 'Node Selector',
            value: spec.nodeSelector?.matchLabels
              ? (
                <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                  {Object.entries(spec.nodeSelector.matchLabels).map(([key, val]) => (
                    <Chip key={key} label={`${key}: ${val}`} size="small" variant="outlined" />
                  ))}
                </Box>
              )
              : 'None (Matches all nodes)'
          },
          {
            name: 'Enforcement Mode',
            value: <Chip label={spec.enforcementMode || 'N/A'} size="small" variant="outlined" />
          },
          {
            name: 'Dry-run',
            value: spec.dryRun 
              ? <Chip label="🟡 Yes" size="small" color="warning" />
              : <Chip label="🟢 No" size="small" color="success" />
          },
          {
            name: 'Condition Policy',
            value: spec.conditionPolicy || 'N/A'
          },
          {
            name: 'Taint',
            value: spec.taint
              ? `${spec.taint.key}:${spec.taint.effect}`
              : 'None'
          },
          {
            name: 'Node Status',
            value: (
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Chip label="Targeted: -" size="small" />
                <Chip label="Satisfied: -" size="small" color="success" />
                <Chip label="Unsatisfied: -" size="small" color="error" />
                <Chip label="Failed: -" size="small" color="warning" />
              </Box>
            )
          },
          {
            name: 'Conditions to Evaluate',
            value: (
              <SimpleTable
                columns={[
                  { label: 'Condition Type', getter: (c: any) => c.type },
                  { label: 'Required Status', getter: (c: any) => c.requiredStatus },
                  { label: 'Default Status', getter: (c: any) => c.defaultStatus || 'Unknown' },
                ]}
                data={spec.conditions || []}
                emptyMessage="No conditions defined."
              />
            )
          }
        ];
      }}
    />
  );
}
