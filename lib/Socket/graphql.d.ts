import type { UserFacingSocketConfig } from '../Types/index.js';
import type { BinaryNode } from '../WABinary/index.js';
type GraphQLVariables = Record<string, unknown>;
type GraphQLAuth = {
    accessToken?: string;
    credential?: string;
    userId?: string | number;
};
type GraphQLSocket = {
    executeWMexQuery: <T>(variables: GraphQLVariables, queryId: string, dataPath: string) => Promise<T>;
    executeWWWGraphQL: typeof executeWWWGraphQL;
    executeFacebookGraphQL: typeof executeFacebookGraphQL;
    executeWamoGraphQL: typeof executeWamoGraphQL;
};
export declare const executeWWWGraphQL: (docId: string | number, variables: GraphQLVariables, accessToken?: string, dataPath?: string, lang?: string, endpoint?: string) => Promise<{} | null>;
export declare const executeFacebookGraphQL: (docId: string | number, variables: GraphQLVariables, accessToken?: string, dataPath?: string, lang?: string) => Promise<{} | null>;
export declare const executeWamoGraphQL: (docId: string | number, variables: GraphQLVariables, auth?: GraphQLAuth, dataPath?: string, host?: string) => Promise<{} | null>;
export declare const makeGraphQLSocket: <T extends {
    query: (node: BinaryNode) => Promise<BinaryNode>;
    generateMessageTag: () => string;
}>(sock: T, _config?: UserFacingSocketConfig) => T & GraphQLSocket;
export {};
//# sourceMappingURL=graphql.d.ts.map