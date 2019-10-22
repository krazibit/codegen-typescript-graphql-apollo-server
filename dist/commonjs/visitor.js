"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const visitor_plugin_common_1 = require("@graphql-codegen/visitor-plugin-common");
const autoBind = require("auto-bind");
const graphql_1 = require("graphql");
class GraphQLRequestVisitor extends visitor_plugin_common_1.ClientSideBaseVisitor {
    constructor(schema, fragments, rawConfig) {
        super(schema, fragments, rawConfig, {});
        this._operationsToInclude = [];
        autoBind(this);
        this._additionalImports.push(`import { ApolloServerBase } from 'apollo-server-core'';`);
        this._additionalImports.push(`import { print } from 'graphql';`);
    }
    buildOperation(node, documentVariableName, operationType, operationResultType, operationVariablesTypes) {
        this._operationsToInclude.push({
            node,
            documentVariableName,
            operationType,
            operationResultType,
            operationVariablesTypes,
        });
        return null;
    }
    get sdkContent() {
        const allPossibleActions = this._operationsToInclude
            .map(o => {
            const optionalVariables = !o.node.variableDefinitions || o.node.variableDefinitions.length === 0 || o.node.variableDefinitions.every(v => v.type.kind !== graphql_1.Kind.NON_NULL_TYPE || v.defaultValue);
            return `${o.node.name.value}(variables${optionalVariables ? '?' : ''}: ${o.operationVariablesTypes}): Promise<${o.operationResultType}> {
  return client.executeOperation({query: print(${o.documentVariableName}), variables}).then((r) => ({...(r.data as ${o.operationResultType})}));
}`;
        })
            .map(s => visitor_plugin_common_1.indentMultiline(s, 2));
        return `export function getSdk(client: ApolloServerBase) {
  return {
${allPossibleActions.join(',\n')}
  };
}`;
    }
}
exports.GraphQLRequestVisitor = GraphQLRequestVisitor;
//# sourceMappingURL=visitor.js.map