// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi, expect, describe, it } from 'vitest';
import ReadinessRulesPage from './NodeReadinessRuleList';

// needs to be inside vi.mock to avoid hoisting issues
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

// mock ResourceListView as a simple table to test column definitions
vi.mock('@kinvolk/headlamp-plugin/lib/CommonComponents', () => ({
  ResourceListView: ({ title, columns }: any) => {
    const mockRule = {
      apiVersion: 'readiness.node.x-k8s.io/v1alpha1',
      kind: 'NodeReadinessRule',
      metadata: { name: 'dry-run-rule' },
      jsonData: {
        spec: {
          enforcementMode: 'Ignore',
          dryRun: true,
          taint: { key: 'custom-taint', effect: 'NoExecute' }
        }
      }
    };

    return (
      <div data-testid="mock-resource-list">
        <h1>{title}</h1>
        <table>
          <thead>
            <tr>
              {columns.map((col: any, i: number) => {
                const label = typeof col === 'string' ? col : col.label;
                return <th key={i}>{label}</th>;
              })}
            </tr>
          </thead>
          <tbody>
            <tr>
              {columns.map((col: any, i: number) => {
                if (typeof col === 'string') return <td key={i}>-</td>;
                const value = col.getValue ? col.getValue(mockRule) : '';
                return <td key={i} data-testid={`col-${col.id}`}>{value}</td>;
              })}
            </tr>
          </tbody>
        </table>
      </div>
    );
  },
  Link: ({ children }: any) => <a href="/">{children}</a>
}));

describe('NodeReadinessRuleList', () => {
  it('renders the Rule List table with correct columns (Name, Mode, Dry-run, Taint)', () => {
    render(
      // wrap in MemoryRouter for Headlamp's <Link> component
      <MemoryRouter>
        <ReadinessRulesPage />
      </MemoryRouter>
    );

    expect(screen.getByTestId('mock-resource-list')).toBeInTheDocument();
    expect(screen.getByText('Node Readiness Rules')).toBeInTheDocument();

    // Verify column headers exist
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Mode')).toBeInTheDocument();
    expect(screen.getByText('Dry-run')).toBeInTheDocument();
    expect(screen.getByText('Taint')).toBeInTheDocument();

    // Verify values rendered from our mock rule
    expect(screen.getByTestId('col-name')).toHaveTextContent('dry-run-rule');
    expect(screen.getByTestId('col-mode')).toHaveTextContent('Ignore');
    expect(screen.getByTestId('col-dryRun')).toHaveTextContent('Dry Run');
    expect(screen.getByTestId('col-taintKey')).toHaveTextContent('custom-taint');
  });
});
