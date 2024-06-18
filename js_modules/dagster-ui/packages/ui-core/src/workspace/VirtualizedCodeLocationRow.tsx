import {Box, JoinedButtons, MiddleTruncate} from '@dagster-io/ui-components';
import * as React from 'react';
import {Link} from 'react-router-dom';
import styled from 'styled-components';

import {CodeLocationMenu} from './CodeLocationMenu';
import {ImageName, LocationStatus, ModuleOrPackageOrFile, ReloadButton} from './CodeLocationRowSet';
import {RepositoryCountTags} from './RepositoryCountTags';
import {WorkspaceRepositoryLocationNode} from './WorkspaceContext';
import {buildRepoAddress} from './buildRepoAddress';
import {repoAddressAsHumanString} from './repoAddressAsString';
import {
  WorkspaceLocationNodeFragment,
  WorkspaceRepositoryFragment,
} from './types/WorkspaceQueries.types';
import {workspacePathFromAddress} from './workspacePath';
import {TimeFromNow} from '../ui/TimeFromNow';
import {HeaderCell, HeaderRow, RowCell} from '../ui/VirtualizedTable';

export type CodeLocationRowStatusType = 'Failed' | 'Updating' | 'Loaded' | 'Loading';

export type CodeLocationRowType =
  | {
      type: 'repository';
      codeLocation: WorkspaceLocationNodeFragment;
      repository: WorkspaceRepositoryFragment;
      status: CodeLocationRowStatusType;
    }
  | {type: 'error'; node: WorkspaceLocationNodeFragment; status: CodeLocationRowStatusType};

const TEMPLATE_COLUMNS = '3fr 1fr 1fr 240px 160px';

interface ErrorRowProps {
  locationNode: WorkspaceRepositoryLocationNode;
  index: number;
}

export const VirtualizedCodeLocationErrorRow = React.forwardRef(
  (props: ErrorRowProps, ref: React.ForwardedRef<HTMLDivElement>) => {
    const {locationNode, index} = props;
    const {name} = locationNode;
    return (
      <div ref={ref} data-index={index}>
        <RowGrid border="bottom">
          <RowCell>
            <MiddleTruncate text={name} />
          </RowCell>
          <RowCell>
            <div>
              <LocationStatus location={name} locationOrError={locationNode} />
            </div>
          </RowCell>
          <RowCell>
            <div style={{whiteSpace: 'nowrap'}}>
              <TimeFromNow unixTimestamp={locationNode.updatedTimestamp} />
            </div>
          </RowCell>
          <RowCell>{'\u2013'}</RowCell>
          <RowCell>
            <JoinedButtons>
              <ReloadButton location={name} />
              <CodeLocationMenu locationNode={locationNode} />
            </JoinedButtons>
          </RowCell>
        </RowGrid>
      </div>
    );
  },
);

interface Props {
  codeLocation: WorkspaceRepositoryLocationNode;
  repository: WorkspaceRepositoryFragment;
  index: number;
  // measure: (node: Element | null) => void;
}

export const VirtualizedCodeLocationRow = React.forwardRef(
  (props: Props, ref: React.ForwardedRef<HTMLDivElement>) => {
    const {codeLocation, repository, index} = props;
    const repoAddress = buildRepoAddress(repository.name, repository.location.name);

    const allMetadata = [...codeLocation.displayMetadata, ...repository.displayMetadata];

    return (
      <div ref={ref} data-index={index}>
        <RowGrid border="bottom">
          <RowCell>
            <Box flex={{direction: 'column', gap: 4}}>
              <div style={{fontWeight: 500}}>
                <Link to={workspacePathFromAddress(repoAddress)}>
                  <MiddleTruncate text={repoAddressAsHumanString(repoAddress)} />
                </Link>
              </div>
              <ImageName metadata={allMetadata} />
              <ModuleOrPackageOrFile metadata={allMetadata} />
            </Box>
          </RowCell>
          <RowCell>
            <div>
              <LocationStatus location={repository.name} locationOrError={codeLocation} />
            </div>
          </RowCell>
          <RowCell>
            <div style={{whiteSpace: 'nowrap'}}>
              <TimeFromNow unixTimestamp={codeLocation.updatedTimestamp} />
            </div>
          </RowCell>
          <RowCell>
            <RepositoryCountTags repo={repository} repoAddress={repoAddress} />
          </RowCell>
          <RowCell style={{alignItems: 'flex-end'}}>
            <JoinedButtons>
              <ReloadButton location={codeLocation.name} />
              <CodeLocationMenu locationNode={codeLocation} />
            </JoinedButtons>
          </RowCell>
        </RowGrid>
      </div>
    );
  },
);

export const VirtualizedCodeLocationHeader = () => {
  return (
    <HeaderRow templateColumns={TEMPLATE_COLUMNS} sticky>
      <HeaderCell>Name</HeaderCell>
      <HeaderCell>Status</HeaderCell>
      <HeaderCell>Updated</HeaderCell>
      <HeaderCell>Definitions</HeaderCell>
      <HeaderCell style={{textAlign: 'right'}}>Actions</HeaderCell>
    </HeaderRow>
  );
};

const RowGrid = styled(Box)`
  display: grid;
  grid-template-columns: ${TEMPLATE_COLUMNS};
`;
