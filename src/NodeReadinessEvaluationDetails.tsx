import React, { useState } from 'react';
import { K8s } from '@kinvolk/headlamp-plugin/lib';
import { Resource, Link, SimpleTable, SectionBox } from '@kinvolk/headlamp-plugin/lib/CommonComponents';
import { useParams } from 'react-router-dom';
import {
  Chip,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Collapse,
} from '@mui/material';

// We redeclare the Custom Resource class so DetailsGrid can fetch it
export class NodeReadinessEvaluation extends K8s.crd.makeCustomResourceClass({
  apiInfo: [{ group: 'readiness.node.x-k8s.io', version: 'v1alpha1' }],
  isNamespaced: false,
  pluralName: 'nodereadinessevaluations',
  singularName: 'nodereadinessevaluation',
  kind: 'NodeReadinessEvaluation',
}) {}

interface RuleRowProps {
  rule: any;
}

function RuleEvaluationRow({ rule }: RuleRowProps) {
  const [open, setOpen] = useState(false);

  const isSatisfied = rule.ruleStatus === 'Satisfied';
  const conditions = rule.conditions || [];
  const totalConditions = conditions.length;
  const satisfiedConditions = conditions.filter(
    (c: any) => c.satisfied === true || c.satisfied === 'True'
  ).length;
  const allConditionsSatisfied = totalConditions > 0 && satisfiedConditions === totalConditions;

  return (
    <>
      <TableRow hover sx={{ '& > *': { borderBottom: 'unset' } }}>
        <TableCell width="48px">
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => setOpen(!open)}
            sx={{ fontWeight: 'bold' }}
          >
            {open ? '▲' : '▼'}
          </IconButton>
        </TableCell>
        <TableCell>
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <Typography variant="body2" fontWeight="bold">
              {rule.ruleName}
            </Typography>
            <Link
              routeName="nrc-rule-details"
              params={{ name: rule.ruleName }}
              style={{ fontSize: '0.8rem', color: '#1976d2', textDecoration: 'none' }}
            >
              Visit Rule ↗
            </Link>
          </Box>
        </TableCell>
        <TableCell>
          <Chip
            label={rule.ruleStatus || 'Unknown'}
            size="small"
            style={{
              backgroundColor: isSatisfied ? '#e8f5e9' : '#ffebee',
              color: isSatisfied ? '#2e7d32' : '#c62828',
              fontWeight: 'bold',
            }}
          />
        </TableCell>
        <TableCell>
          {rule.taintKey ? (
            <Chip label={rule.taintKey} size="small" variant="outlined" />
          ) : (
            '-'
          )}
        </TableCell>
        <TableCell>
          <Chip
            label={rule.conditionPolicy || 'AllSatisfied'}
            size="small"
            variant="outlined"
            color="primary"
          />
        </TableCell>
        <TableCell>
          <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            {allConditionsSatisfied ? '✅' : '⚠️'} {satisfiedConditions} / {totalConditions} satisfied
          </Typography>
        </TableCell>
      </TableRow>

      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 2, p: 2.5, backgroundColor: 'action.hover', borderRadius: 1 }}>
              <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                Rule Evaluation Details
              </Typography>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: 2,
                  mb: 3,
                }}
              >
                <Box>
                  <Typography variant="caption" color="textSecondary" display="block">
                    Reason
                  </Typography>
                  <Typography variant="body2" fontWeight="500">
                    {rule.reason || '-'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="textSecondary" display="block">
                    Message
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {rule.message || '-'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="textSecondary" display="block">
                    First Evaluation At
                  </Typography>
                  <Typography variant="body2">
                    {rule.firstEvaluationAt || '-'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="textSecondary" display="block">
                    Last Evaluation At
                  </Typography>
                  <Typography variant="body2">
                    {rule.lastEvaluationAt || '-'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="textSecondary" display="block">
                    Taint Observed At
                  </Typography>
                  <Typography variant="body2">
                    {rule.taintObservedAt || '-'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="textSecondary" display="block">
                    Taint Added At
                  </Typography>
                  <Typography variant="body2">
                    {rule.taintAddedAt || '-'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="textSecondary" display="block">
                    Taint Removed At
                  </Typography>
                  <Typography variant="body2">
                    {rule.taintRemovedAt || '-'}
                  </Typography>
                </Box>
              </Box>

              <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                Condition Evaluation Breakdown
              </Typography>
              <SimpleTable
                columns={[
                  { label: 'Condition Type', getter: (c: any) => c.type },
                  {
                    label: 'Satisfied',
                    getter: (c: any) => {
                      const satisfied = c.satisfied === true || c.satisfied === 'True';
                      return (
                        <Chip
                          label={satisfied ? 'Satisfied' : 'Unsatisfied'}
                          size="small"
                          color={satisfied ? 'success' : 'error'}
                          variant="outlined"
                        />
                      );
                    },
                  },
                  { label: 'Current Status', getter: (c: any) => c.currentStatus || '-' },
                  { label: 'Required Status', getter: (c: any) => c.requiredStatus || '-' },
                  { label: 'Default Status', getter: (c: any) => c.defaultStatus || '-' },
                ]}
                data={conditions}
                emptyMessage="No individual conditions evaluated for this rule."
              />
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
}

export default function NodeReadinessEvaluationDetails() {
  const { name } = useParams<{ name: string }>();

  return (
    <Resource.DetailsGrid
      resourceType={NodeReadinessEvaluation}
      name={name!}
      withEvents={true}
      extraInfo={(evaluation: InstanceType<typeof NodeReadinessEvaluation> | null) => {
        if (!evaluation) return [];

        const nodeName = evaluation.jsonData?.spec?.nodeName || 'N/A';
        const state = evaluation.jsonData?.status?.state;
        const isAvailable = state === 'Available';

        // Active taints
        const activeTaints = evaluation.jsonData?.status?.activeTaints || [];

        // Rule status counts
        const rules = evaluation.jsonData?.status?.rules || [];
        const total = rules.length;
        const satisfied = rules.filter((r: any) => r.ruleStatus === 'Satisfied').length;
        const failed = rules.filter((r: any) => r.ruleStatus === 'Failed').length;
        const unsatisfied = rules.filter(
          (r: any) => r.ruleStatus === 'Unsatisfied' || (!isAvailable && r.ruleStatus !== 'Satisfied')
        ).length;

        return [
          {
            name: 'Target Node',
            value: (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Typography variant="body2" fontWeight="bold">
                  {nodeName}
                </Typography>
                {nodeName !== 'N/A' && (
                  <Link
                    routeName="node"
                    params={{ name: nodeName }}
                    style={{ fontSize: '0.85rem', color: '#1976d2', textDecoration: 'none' }}
                  >
                    Visit Node ↗
                  </Link>
                )}
              </Box>
            ),
          },
          {
            name: 'State',
            value: (
              <Chip
                label={state || 'Unknown'}
                size="small"
                style={{
                  backgroundColor: isAvailable ? '#e8f5e9' : '#ffebee',
                  color: isAvailable ? '#2e7d32' : '#c62828',
                  fontWeight: 'bold',
                }}
              />
            ),
          },
          {
            name: 'Active Taints',
            value:
              activeTaints && activeTaints.length > 0 ? (
                <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                  {activeTaints.map((taint: string, i: number) => (
                    <Chip key={i} label={taint} size="small" color="error" variant="outlined" />
                  ))}
                </Box>
              ) : (
                'None'
              ),
          },
          {
            name: 'Rule Status',
            value: (
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
                <Chip label={`Total: ${total}`} size="small" variant="outlined" />
                <Chip label={`Satisfied: ${satisfied}`} size="small" color="success" />
                <Chip label={`Unsatisfied: ${unsatisfied}`} size="small" color="error" />
                {failed > 0 && <Chip label={`Failed: ${failed}`} size="small" color="warning" />}
              </Box>
            ),
          },
        ];
      }}
      extraSections={(evaluation: InstanceType<typeof NodeReadinessEvaluation> | null) => {
        if (!evaluation) return [];

        const conditions = evaluation.jsonData?.status?.conditions || [];
        const rules = evaluation.jsonData?.status?.rules || [];

        return [
          {
            id: 'nrc-evaluation-conditions',
            section: (
              <SectionBox title="Conditions">
                <SimpleTable
                  columns={[
                    { label: 'Type', getter: (c: any) => c.type },
                    {
                      label: 'Status',
                      getter: (c: any) => (
                        <Chip
                          label={c.status}
                          size="small"
                          color={c.status === 'True' ? 'success' : 'default'}
                          variant="outlined"
                        />
                      ),
                    },
                    { label: 'Reason', getter: (c: any) => c.reason || '-' },
                    { label: 'Message', getter: (c: any) => c.message || '-' },
                    { label: 'Last Transition', getter: (c: any) => c.lastTransitionTime || '-' },
                  ]}
                  data={conditions}
                  emptyMessage="No node conditions available."
                />
              </SectionBox>
            ),
          },
          {
            id: 'nrc-evaluation-rules',
            section: (
              <SectionBox title="Rule Evaluations">
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell width="48px" />
                        <TableCell>Rule Name</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Taint</TableCell>
                        <TableCell>Condition Policy</TableCell>
                        <TableCell>Conditions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {rules.map((rule: any, i: number) => (
                        <RuleEvaluationRow key={i} rule={rule} />
                      ))}
                      {rules.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={6} align="center">
                            <Typography variant="body2" color="textSecondary" sx={{ py: 2 }}>
                              No rules evaluated yet.
                            </Typography>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </SectionBox>
            ),
          },
        ];
      }}
    />
  );
}

