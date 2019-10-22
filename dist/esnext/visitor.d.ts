import { ClientSideBaseVisitor, ClientSideBasePluginConfig, LoadedFragment, RawClientSideBasePluginConfig } from '@graphql-codegen/visitor-plugin-common';
import { GraphQLSchema } from 'graphql';
import { OperationDefinitionNode } from 'graphql';
export declare class GraphQLRequestVisitor extends ClientSideBaseVisitor<RawClientSideBasePluginConfig, ClientSideBasePluginConfig> {
    private _operationsToInclude;
    constructor(schema: GraphQLSchema, fragments: LoadedFragment[], rawConfig: RawClientSideBasePluginConfig);
    protected buildOperation(node: OperationDefinitionNode, documentVariableName: string, operationType: string, operationResultType: string, operationVariablesTypes: string): string;
    readonly sdkContent: string;
}
