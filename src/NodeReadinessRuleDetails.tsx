import { useParams } from 'react-router-dom';
// Notice we import Resource here to get access to DetailsGrid
import { NameValueTable, SimpleTable, Resource } from '@kinvolk/headlamp-plugin/lib/CommonComponents';
import { NodeReadinessRule } from './index'; 

export default function NodeReadinessRuleDetails() {
  const { name } = useParams<{ name: string }>();

  return (
    <Resource.DetailsGrid
      resourceType={NodeReadinessRule}
      name={name!}
      // DetailsGrid allows us to inject our custom tables perfectly via extraInfo
      extraInfo={(rule: InstanceType<typeof NodeReadinessRule> | null) => {
        if (!rule) return [];
        const spec = rule.jsonData?.spec || {};
        
        return [
          {
            name: 'Configuration',
            value: (
              <NameValueTable
                rows={[
                  { name: 'Enforcement Mode', value: spec.enforcementMode || 'N/A' },
                  { name: 'Condition Policy', value: spec.conditionPolicy || 'allOf' },
                  { name: 'Dry Run', value: spec.dryRun ? 'True' : 'False' },
                  { 
                    name: 'Node Selector', 
                    value: spec.nodeSelector?.matchLabels 
                      ? JSON.stringify(spec.nodeSelector.matchLabels) 
                      : 'None (Matches all nodes)' 
                  },
                ]}
              />
            )
          },
          {
            name: 'Taint applied on failure',
            value: (
              <NameValueTable
                rows={[
                  { name: 'Key', value: spec.taint?.key || 'None' },
                  { name: 'Effect', value: spec.taint?.effect || 'None' },
                  { name: 'Value', value: spec.taint?.value || '-' },
                ]}
              />
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
