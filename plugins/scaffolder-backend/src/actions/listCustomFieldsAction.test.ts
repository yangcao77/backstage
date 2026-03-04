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
import { actionsRegistryServiceMock } from '@backstage/backend-test-utils/alpha';
import { createListCustomFieldsAction } from './listCustomFieldsAction';
import { DEFAULT_SCAFFOLDER_FIELD_EXTENSION_METADATA } from './fieldExtensionMetadata';

type FieldsOutput = {
  fields: Array<{ name: string; description: string; yamlSpec: string }>;
};

describe('createListCustomFieldsAction', () => {
  it('should return all default field extensions', async () => {
    const mockActionsRegistry = actionsRegistryServiceMock();

    createListCustomFieldsAction({ actionsRegistry: mockActionsRegistry });

    const result = await mockActionsRegistry.invoke({
      id: 'test:list-scaffolder-custom-fields',
      input: {},
    });

    const output = result.output as FieldsOutput;
    expect(output.fields).toHaveLength(
      DEFAULT_SCAFFOLDER_FIELD_EXTENSION_METADATA.length,
    );
  });

  it('should return fields with name, description and yamlSpec', async () => {
    const mockActionsRegistry = actionsRegistryServiceMock();

    createListCustomFieldsAction({ actionsRegistry: mockActionsRegistry });

    const result = await mockActionsRegistry.invoke({
      id: 'test:list-scaffolder-custom-fields',
      input: {},
    });

    const output = result.output as FieldsOutput;
    for (const field of output.fields) {
      expect(typeof field.name).toBe('string');
      expect(field.name.length).toBeGreaterThan(0);
      expect(typeof field.description).toBe('string');
      expect(field.description.length).toBeGreaterThan(0);
      expect(typeof field.yamlSpec).toBe('string');
      expect(field.yamlSpec.length).toBeGreaterThan(0);
    }
  });

  it('should include the expected default field names', async () => {
    const mockActionsRegistry = actionsRegistryServiceMock();

    createListCustomFieldsAction({ actionsRegistry: mockActionsRegistry });

    const result = await mockActionsRegistry.invoke({
      id: 'test:list-scaffolder-custom-fields',
      input: {},
    });

    const output = result.output as FieldsOutput;
    const names = output.fields.map(f => f.name);
    expect(names).toEqual(
      expect.arrayContaining([
        'EntityPicker',
        'EntityNamePicker',
        'EntityTagsPicker',
        'RepoUrlPicker',
        'OwnerPicker',
        'OwnedEntityPicker',
        'MyGroupsPicker',
        'Secret',
        'MultiEntityPicker',
        'RepoBranchPicker',
        'RepoOwnerPicker',
      ]),
    );
  });

  it('should produce yamlSpec that references the field name in ui:field', async () => {
    const mockActionsRegistry = actionsRegistryServiceMock();

    createListCustomFieldsAction({ actionsRegistry: mockActionsRegistry });

    const result = await mockActionsRegistry.invoke({
      id: 'test:list-scaffolder-custom-fields',
      input: {},
    });

    const output = result.output as FieldsOutput;
    for (const field of output.fields) {
      expect(field.yamlSpec).toContain(`ui:field: ${field.name}`);
    }
  });

  it('should produce yamlSpec that uses the field name as the property key', async () => {
    const mockActionsRegistry = actionsRegistryServiceMock();

    createListCustomFieldsAction({ actionsRegistry: mockActionsRegistry });

    const result = await mockActionsRegistry.invoke({
      id: 'test:list-scaffolder-custom-fields',
      input: {},
    });

    const output = result.output as FieldsOutput;
    for (const field of output.fields) {
      expect(field.yamlSpec).toContain(`      ${field.name}:`);
    }
  });

  it('should match the exact yamlSpec for RepoUrlPicker', async () => {
    const mockActionsRegistry = actionsRegistryServiceMock();

    createListCustomFieldsAction({ actionsRegistry: mockActionsRegistry });

    const result = await mockActionsRegistry.invoke({
      id: 'test:list-scaffolder-custom-fields',
      input: {},
    });

    const output = result.output as FieldsOutput;
    const repoUrlPicker = output.fields.find(f => f.name === 'RepoUrlPicker');
    expect(repoUrlPicker).toBeDefined();
    expect(repoUrlPicker!.yamlSpec).toBe(
      [
        'parameters:',
        '  - title: RepoUrlPicker Example',
        '    properties:',
        '      RepoUrlPicker:',
        '        ui:field: RepoUrlPicker',
        '        ui:options: {}',
      ].join('\n'),
    );
  });

  it('should include type: array in yamlSpec for array-returning fields', async () => {
    const mockActionsRegistry = actionsRegistryServiceMock();

    createListCustomFieldsAction({ actionsRegistry: mockActionsRegistry });

    const result = await mockActionsRegistry.invoke({
      id: 'test:list-scaffolder-custom-fields',
      input: {},
    });

    const output = result.output as FieldsOutput;
    const arrayFields = ['EntityTagsPicker', 'MultiEntityPicker'];
    for (const name of arrayFields) {
      const field = output.fields.find(f => f.name === name);
      expect(field).toBeDefined();
      expect(field!.yamlSpec).toContain('type: array');
      expect(field!.yamlSpec).toContain('items:');
    }
  });
});
