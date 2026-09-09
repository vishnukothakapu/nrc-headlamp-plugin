import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ApiProxy } from '@kinvolk/headlamp-plugin/lib'; 
import { SectionBox, NameValueTable, SimpleTable, Loader, BackLink, SectionHeader } from '@kinvolk/headlamp-plugin/lib/CommonComponents';

export default function NodeReadinessRuleDetails() {
  const { name } = useParams<{ name: string }>();
  const [rule, setRule] = useState<any>(null);
  const [error, setError] = useState<any>(null);

  // Fetch the rule directly from the Kubernetes API
  useEffect(() => {
    ApiProxy.request(`/apis/readiness.node.x-k8s.io/v1alpha1/nodereadinessrules/${name}`)
      .then(setRule)
      .catch(setError);
  }, [name]);

  if (error) {
    return <div>Error loading rule: {error.message || "Unknown error"}</div>;
  }
  if (!rule) {
    return <Loader title="Loading Rule Details..." />;
  }

  const spec = rule.spec || {};

  return (
    <>
      <BackLink />
      <SectionHeader title={`Rule: ${name}`} />
      
      <SectionBox title="Configuration">
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
      </SectionBox>

      <SectionBox title="Taint applied on failure">
        <NameValueTable
          rows={[
            { name: 'Key', value: spec.taint?.key || 'None' },
            { name: 'Effect', value: spec.taint?.effect || 'None' },
            { name: 'Value', value: spec.taint?.value || '-' },
          ]}
        />
      </SectionBox>

      <SectionBox title="Conditions to Evaluate">
        <SimpleTable
          columns={[
            { label: 'Condition Type', getter: (c: any) => c.type },
            { label: 'Required Status', getter: (c: any) => c.requiredStatus },
            { label: 'Default Status', getter: (c: any) => c.defaultStatus || 'Unknown' },
          ]}
          data={spec.conditions || []}
          emptyMessage="No conditions defined."
        />
      </SectionBox>
    </>
  );
}
