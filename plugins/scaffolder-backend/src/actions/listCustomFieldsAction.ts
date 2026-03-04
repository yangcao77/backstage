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
import { ActionsRegistryService } from '@backstage/backend-plugin-api/alpha';
import { DEFAULT_SCAFFOLDER_FIELD_EXTENSION_METADATA } from './fieldExtensionMetadata';

export const createListCustomFieldsAction = ({
  actionsRegistry,
}: {
  actionsRegistry: ActionsRegistryService;
}) => {
  actionsRegistry.register({
    name: 'list-scaffolder-custom-fields',
    title: 'List Scaffolder Custom Fields',
    attributes: {
      destructive: false,
      readOnly: true,
      idempotent: true,
    },
    description:
      'Returns the list of default scaffolder custom field extensions and their YAML specifications.',
    schema: {
      input: z => z.object({}),
      output: z =>
        z.object({
          fields: z
            .array(
              z.object({
                name: z.string().describe('Field extension name'),
                description: z.string().describe('What the field does'),
                yamlSpec: z
                  .string()
                  .describe(
                    'Example YAML snippet for using this field in a template',
                  ),
              }),
            )
            .describe('Default scaffolder field extensions with YAML specs'),
        }),
    },
    action: async () => {
      return {
        output: {
          fields: DEFAULT_SCAFFOLDER_FIELD_EXTENSION_METADATA.map(
            ({ name, description, yamlSpec }) => ({
              name,
              description,
              yamlSpec,
            }),
          ),
        },
      };
    },
  });
};
