// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route } from 'react-router-dom';
import { vi, expect, describe, it } from 'vitest';
import NodeReadinessRuleDetails from './NodeReadinessRuleDetails';

// intercept NodeReadinessRule class (inside factory to avoid hoisting issues)
vi.mock('./index', () => {
  class MockNodeReadinessRule {
    jsonData: any;
    metadata: any;
    constructor(data: any) {
      this.jsonData = data;
      this.metadata = data?.metadata || {};
    }
  }
  return { NodeReadinessRule: MockNodeReadinessRule };
});

// mock DetailsGrid to pass a synthetic rule to extraInfo and test data mappings
vi.mock('@kinvolk/headlamp-plugin/lib/CommonComponents', () => ({
  Resource: {
    DetailsGrid: ({ extraInfo }: any) => {
      // Create a mock rule to pass to extraInfo
      const mockRule = {
        apiVersion: 'readiness.node.x-k8s.io/v1alpha1',
        kind: 'NodeReadinessRule',
        metadata: { name: 'test-rule' },
        jsonData: {
          spec: {
            enforcementMode: 'Enforced',
            dryRun: false,
            conditionPolicy: 'All',
            taint: { key: 'node.kubernetes.io/not-ready', effect: 'NoSchedule' },
            nodeSelector: { matchLabels: { 'node-role.kubernetes.io/worker': 'true' } },
            conditions: [
              { type: 'Ready', requiredStatus: 'True', defaultStatus: 'Unknown' }
            ]
          }
        }
      };

      // Call extraInfo to get the array of info objects
      const infoArray = extraInfo(mockRule) || [];

      return (
        <div data-testid="mock-details-grid">
          {infoArray.map((item: any, i: number) => (
            <div key={i} data-testid={`info-${item.name}`}>
              <div className="info-name">{item.name}</div>
              <div className="info-value">{item.value}</div>
            </div>
          ))}
        </div>
      );
    },
  },
  SimpleTable: ({ data, columns }: any) => (
    <div data-testid="mock-simple-table">
      {data.map((row: any, i: number) => (
        <div key={i}>
          {columns.map((col: any, j: number) => (
            <span key={j}>{col.getter(row)}</span>
          ))}
        </div>
      ))}
    </div>
  ),
}));

describe('NodeReadinessRuleDetails', () => {
  it('renders the Rule Details with basic info, Enforced mode, and Taint', () => {
    render(
      // match route path so useParams() works
      <MemoryRouter initialEntries={['/nrc-rules/test-rule']}>
        <Route path="/nrc-rules/:name">
          <NodeReadinessRuleDetails />
        </Route>
      </MemoryRouter>
    );

    expect(screen.getByTestId('mock-details-grid')).toBeInTheDocument();
    
    // Test Case 1: basic info, Enforced mode badge, Taint, Conditions
    expect(screen.getByText('Node Selector')).toBeInTheDocument();
    expect(screen.getByText('node-role.kubernetes.io/worker: true')).toBeInTheDocument();
    
    expect(screen.getByText('Enforcement Mode')).toBeInTheDocument();
    expect(screen.getByText('Enforced')).toBeInTheDocument();

    expect(screen.getByText('Taint Managed')).toBeInTheDocument();
    expect(screen.getByText('node.kubernetes.io/not-ready:NoSchedule')).toBeInTheDocument();
    
    expect(screen.getByText('Conditions to Evaluate')).toBeInTheDocument();
    expect(screen.getByTestId('mock-simple-table')).toBeInTheDocument();
  });
});
