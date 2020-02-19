'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

const graphql = require('graphql');
const visitorPluginCommon = require('@graphql-codegen/visitor-plugin-common');
const autoBind = _interopDefault(require('auto-bind'));
const path = require('path');

class GraphQLRequestVisitor extends visitorPluginCommon.ClientSideBaseVisitor {
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
            const optionalVariables = !o.node.variableDefinitions || o.node.variableDefinitions.length === 0 || o.node.variableDefinitions.every(v => v.type.kind !== graphql.Kind.NON_NULL_TYPE || v.defaultValue);
            return `${o.node.name.value}(variables${optionalVariables ? '?' : ''}: ${o.operationVariablesTypes}): Promise<${o.operationResultType}> {
  return client.executeOperation({query: print(${o.documentVariableName}), variables})
    .then((r) => {
      if (r.errors) throw r.errors[0]
      return {...(r.data as ${o.operationResultType})}
    });
}`;
        })
            .map(s => visitorPluginCommon.indentMultiline(s, 2));
        return `export function getSdk(client: ApolloServerBase) {
  return {
${allPossibleActions.join(',\n')}
  };
}`;
    }
}

const plugin = (schema, documents, config) => {
    const allAst = graphql.concatAST(documents.map(v => v.document));
    const allFragments = [
        ...allAst.definitions.filter(d => d.kind === graphql.Kind.FRAGMENT_DEFINITION).map(fragmentDef => ({ node: fragmentDef, name: fragmentDef.name.value, onType: fragmentDef.typeCondition.name.value, isExternal: false })),
        ...(config.externalFragments || []),
    ];
    const visitor = new GraphQLRequestVisitor(schema, allFragments, config);
    const visitorResult = graphql.visit(allAst, { leave: visitor });
    return {
        prepend: visitor.getImports(),
        content: [visitor.fragments, ...visitorResult.definitions.filter(t => typeof t === 'string'), visitor.sdkContent].join('\n'),
    };
};
const validate = async (schema, documents, config, outputFile) => {
    if (path.extname(outputFile) !== '.ts') {
        throw new Error(`Plugin "typescript-graphql-apollo-server" requires extension to be ".ts"!`);
    }
};

exports.GraphQLRequestVisitor = GraphQLRequestVisitor;
exports.plugin = plugin;
exports.validate = validate;
