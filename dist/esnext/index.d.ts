import { PluginValidateFn, PluginFunction } from '@graphql-codegen/plugin-helpers';
import { RawClientSideBasePluginConfig } from '@graphql-codegen/visitor-plugin-common';
import { GraphQLRequestVisitor } from './visitor';
export declare const plugin: PluginFunction<RawClientSideBasePluginConfig>;
export declare const validate: PluginValidateFn<any>;
export { GraphQLRequestVisitor };
