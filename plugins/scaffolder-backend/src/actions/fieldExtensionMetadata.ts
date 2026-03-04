/*
 * Copyright 2026 The Backstage Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

interface ScaffolderFieldExtensionMetadata {
  name: string;
  description: string;
  yamlSpec: string;
}

// Matches the sampleFieldTemplate format produced by CustomFieldExplorer:
//   parameters:
//     - title: <Name> Example
//       properties:
//         <Name>:
//           [type: array + items for array-returning fields]
//           ui:field: <Name>
//           ui:options: {}
export const DEFAULT_SCAFFOLDER_FIELD_EXTENSION_METADATA: readonly ScaffolderFieldExtensionMetadata[] =
  [
    {
      name: 'EntityPicker',
      description:
        'Allows the user to pick a catalog entity by entity reference.',
      yamlSpec: [
        'parameters:',
        '  - title: EntityPicker Example',
        '    properties:',
        '      EntityPicker:',
        '        ui:field: EntityPicker',
        '        ui:options: {}',
      ].join('\n'),
    },
    {
      name: 'EntityNamePicker',
      description:
        'Allows the user to input a name for a new catalog entity, validated against Backstage naming rules.',
      yamlSpec: [
        'parameters:',
        '  - title: EntityNamePicker Example',
        '    properties:',
        '      EntityNamePicker:',
        '        ui:field: EntityNamePicker',
        '        ui:options: {}',
      ].join('\n'),
    },
    {
      name: 'EntityTagsPicker',
      description:
        'Allows the user to pick or create tags to apply to a catalog entity.',
      yamlSpec: [
        'parameters:',
        '  - title: EntityTagsPicker Example',
        '    properties:',
        '      EntityTagsPicker:',
        '        type: array',
        '        items:',
        '          type: string',
        '        ui:field: EntityTagsPicker',
        '        ui:options: {}',
      ].join('\n'),
    },
    {
      name: 'RepoUrlPicker',
      description:
        'Allows the user to pick a repository URL, with structured host/owner/repo fields per SCM provider.',
      yamlSpec: [
        'parameters:',
        '  - title: RepoUrlPicker Example',
        '    properties:',
        '      RepoUrlPicker:',
        '        ui:field: RepoUrlPicker',
        '        ui:options: {}',
      ].join('\n'),
    },
    {
      name: 'OwnerPicker',
      description:
        'Allows the user to pick a catalog owner (user or group) by entity reference.',
      yamlSpec: [
        'parameters:',
        '  - title: OwnerPicker Example',
        '    properties:',
        '      OwnerPicker:',
        '        ui:field: OwnerPicker',
        '        ui:options: {}',
      ].join('\n'),
    },
    {
      name: 'OwnedEntityPicker',
      description:
        'Allows the user to pick a catalog entity that is owned by the current user or their groups.',
      yamlSpec: [
        'parameters:',
        '  - title: OwnedEntityPicker Example',
        '    properties:',
        '      OwnedEntityPicker:',
        '        ui:field: OwnedEntityPicker',
        '        ui:options: {}',
      ].join('\n'),
    },
    {
      name: 'MyGroupsPicker',
      description:
        'Allows the user to pick one of the groups they belong to in the catalog.',
      yamlSpec: [
        'parameters:',
        '  - title: MyGroupsPicker Example',
        '    properties:',
        '      MyGroupsPicker:',
        '        ui:field: MyGroupsPicker',
        '        ui:options: {}',
      ].join('\n'),
    },
    {
      name: 'Secret',
      description:
        'Allows the user to input a secret value that is masked in the UI and excluded from task logs.',
      yamlSpec: [
        'parameters:',
        '  - title: Secret Example',
        '    properties:',
        '      Secret:',
        '        ui:field: Secret',
        '        ui:options: {}',
      ].join('\n'),
    },
    {
      name: 'MultiEntityPicker',
      description:
        'Allows the user to pick multiple catalog entities by entity reference.',
      yamlSpec: [
        'parameters:',
        '  - title: MultiEntityPicker Example',
        '    properties:',
        '      MultiEntityPicker:',
        '        type: array',
        '        items:',
        '          type: string',
        '        ui:field: MultiEntityPicker',
        '        ui:options: {}',
      ].join('\n'),
    },
    {
      name: 'RepoBranchPicker',
      description:
        'Allows the user to pick a branch from a repository, driven by the value of a RepoUrlPicker field.',
      yamlSpec: [
        'parameters:',
        '  - title: RepoBranchPicker Example',
        '    properties:',
        '      RepoBranchPicker:',
        '        ui:field: RepoBranchPicker',
        '        ui:options: {}',
      ].join('\n'),
    },
    {
      name: 'RepoOwnerPicker',
      description:
        'Allows the user to pick a repository owner (organisation or user) from a supported SCM provider.',
      yamlSpec: [
        'parameters:',
        '  - title: RepoOwnerPicker Example',
        '    properties:',
        '      RepoOwnerPicker:',
        '        ui:field: RepoOwnerPicker',
        '        ui:options: {}',
      ].join('\n'),
    },
  ];
