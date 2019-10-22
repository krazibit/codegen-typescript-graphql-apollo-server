"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const graphql_1 = require("graphql");
const visitor_1 = require("./visitor");
exports.GraphQLRequestVisitor = visitor_1.GraphQLRequestVisitor;
const path_1 = require("path");
exports.plugin = (schema, documents, config) => {
    const allAst = graphql_1.concatAST(documents.reduce((prev, v) => {
        return [...prev, v.content];
    }, []));
    const allFragments = [
        ...allAst.definitions.filter(d => d.kind === graphql_1.Kind.FRAGMENT_DEFINITION).map(fragmentDef => ({ node: fragmentDef, name: fragmentDef.name.value, onType: fragmentDef.typeCondition.name.value, isExternal: false })),
        ...(config.externalFragments || []),
    ];
    const visitor = new visitor_1.GraphQLRequestVisitor(schema, allFragments, config);
    const visitorResult = graphql_1.visit(allAst, { leave: visitor });
    return {
        prepend: visitor.getImports(),
        content: [visitor.fragments, ...visitorResult.definitions.filter(t => typeof t === 'string'), visitor.sdkContent].join('\n'),
    };
};
exports.validate = async (schema, documents, config, outputFile) => {
    if (path_1.extname(outputFile) !== '.ts') {
        throw new Error(`Plugin "typescript-graphql-request" requires extension to be ".ts"!`);
    }
};
//# sourceMappingURL=index.js.map