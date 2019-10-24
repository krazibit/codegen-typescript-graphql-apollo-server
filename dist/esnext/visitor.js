import { ClientSideBaseVisitor, indentMultiline } from '@graphql-codegen/visitor-plugin-common';
import * as autoBind from 'auto-bind';
import { Kind } from 'graphql';
export class GraphQLRequestVisitor extends ClientSideBaseVisitor {
    constructor(schema, fragments, rawConfig) {
        super(schema, fragments, rawConfig, {});
        this._operationsToInclude = [];
        autoBind(this);
        this._additionalImports.push(`import { ApolloServerBase } from 'apollo-server-core';`);
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
            const optionalVariables = !o.node.variableDefinitions || o.node.variableDefinitions.length === 0 || o.node.variableDefinitions.every(v => v.type.kind !== Kind.NON_NULL_TYPE || v.defaultValue);
            return `${o.node.name.value}(variables${optionalVariables ? '?' : ''}: ${o.operationVariablesTypes}): Promise<${o.operationResultType}> {
  return client.executeOperation({query: print(${o.documentVariableName}), variables})
    .then((r) => {
      if (r.errors) throw r.errors[0]
      return {...(r.data as ${o.operationResultType})}
    });
}`;
        })
            .map(s => indentMultiline(s, 2));
        return `export function getSdk(client: ApolloServerBase) {
  return {
${allPossibleActions.join(',\n')}
  };
}`;
    }
}
//# sourceMappingURL=visitor.js.map