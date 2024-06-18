import {CaptionMono, Tooltip} from '@dagster-io/ui-components';
import * as React from 'react';

import {OpTags} from './OpTags';
import {DefinitionTag, buildDefinitionTag} from '../graphql/types';
import {
  linkToAssetTableWithComputeKindFilter,
  linkToAssetTableWithStorageKindFilter,
} from '../search/useGlobalSearch';

export const LEGACY_COMPUTE_KIND_TAG = 'kind';
export const COMPUTE_KIND_TAG = 'dagster/compute_kind';
export const STORAGE_KIND_TAG = 'dagster/storage_kind';

// Older code servers may be using the legacy compute kind tag, so we need to check for both
export const isCanonicalComputeKindTag = (tag: DefinitionTag) =>
  tag.key === COMPUTE_KIND_TAG || tag.key === LEGACY_COMPUTE_KIND_TAG;
export const isCanonicalStorageKindTag = (tag: DefinitionTag) => tag.key === STORAGE_KIND_TAG;
export const buildStorageKindTag = (storageKind: string): DefinitionTag =>
  buildDefinitionTag({key: 'dagster/storage_kind', value: storageKind});

export const AssetComputeKindTag = ({
  definition,
  linkToFilter: shouldLink,
  style,
  ...rest
}: {
  definition: {computeKind: string | null};
  style: React.CSSProperties;
  reduceColor?: boolean;
  reduceText?: boolean;
  reversed?: boolean;
  linkToFilter?: boolean;
}) => {
  if (!definition.computeKind) {
    return null;
  }
  return (
    <Tooltip
      content={
        shouldLink ? (
          <>
            View all <CaptionMono>{definition.computeKind}</CaptionMono> assets
          </>
        ) : (
          <>
            Compute kind <CaptionMono>{definition.computeKind}</CaptionMono>
          </>
        )
      }
      placement="bottom"
    >
      <OpTags
        {...rest}
        style={{...style, cursor: shouldLink ? 'pointer' : 'default'}}
        tags={[
          {
            label: definition.computeKind,
            onClick:
              shouldLink && definition.computeKind
                ? () => {
                    window.location.href = linkToAssetTableWithComputeKindFilter(
                      definition.computeKind || '',
                    );
                  }
                : () => {},
          },
        ]}
      />
    </Tooltip>
  );
};

export const AssetStorageKindTag = ({
  storageKind,
  style,
  linkToFilter: shouldLink,
  ...rest
}: {
  storageKind: string;
  style: React.CSSProperties;
  reduceColor?: boolean;
  reduceText?: boolean;
  reversed?: boolean;
  linkToFilter?: boolean;
}) => {
  return (
    <Tooltip
      content={
        shouldLink ? (
          <>
            View all <CaptionMono>{storageKind}</CaptionMono> assets
          </>
        ) : (
          <>
            Storage kind <CaptionMono>{storageKind}</CaptionMono>
          </>
        )
      }
      placement="bottom"
    >
      <OpTags
        style={{...style, cursor: shouldLink ? 'pointer' : 'default'}}
        {...rest}
        tags={[
          {
            label: storageKind,
            onClick: shouldLink
              ? () => {
                  window.location.href = linkToAssetTableWithStorageKindFilter(storageKind);
                }
              : () => {},
          },
        ]}
      />
    </Tooltip>
  );
};
