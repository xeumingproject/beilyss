import { Boom } from '@hapi/boom'
import type { UserFacingSocketConfig } from '../Types'
import type { BinaryNode } from '../WABinary'
import { executeWMexQuery } from './mex'

type GraphQLVariables = Record<string, unknown>
type GraphQLAuth = { accessToken?: string; credential?: string; userId?: string | number }
type GraphQLResponse = Record<string, unknown>

type GraphQLSocket = {
	executeWMexQuery: <T>(variables: GraphQLVariables, queryId: string, dataPath: string) => Promise<T>
	executeWWWGraphQL: typeof executeWWWGraphQL
	executeFacebookGraphQL: typeof executeFacebookGraphQL
	executeWamoGraphQL: typeof executeWamoGraphQL
}

const WWW_ENDPOINT = 'https://graph.whatsapp.com/graphql'
const FACEBOOK_ENDPOINT = 'https://acs.whatsapp.com/graphql'
const WAMO_APP_ID = '1015890928915437'
const DEFAULT_TOKEN = `WA|${WAMO_APP_ID}|3201f239340c1c8ec6262a6dad04200e`

const parseGraphQLResponse = (json: GraphQLResponse, dataPath?: string) => {
	const errors = Array.isArray(json.errors) ? (json.errors as GraphQLResponse[]) : []
	if (errors.length) {
		const message = errors.map(error => String(error.message || 'Unknown error')).join(', ')
		const first = errors[0]
		const extensions = first?.extensions as GraphQLResponse | undefined
		throw new Boom(`GraphQL error: ${message}`, {
			statusCode: Number(extensions?.error_code || 400),
			data: first
		})
	}

	const data = json.data as GraphQLResponse | undefined
	const result = dataPath ? data?.[dataPath] : data
	if (result === undefined) {
		throw new Boom('Unexpected GraphQL response structure', { statusCode: 400, data: json })
	}

	return result
}

export const executeWWWGraphQL = async (
	docId: string | number,
	variables: GraphQLVariables,
	accessToken?: string,
	dataPath?: string,
	lang = 'en',
	endpoint = WWW_ENDPOINT
) => {
	const response = await fetch(endpoint, {
		method: 'POST',
		headers: { 'content-type': 'application/json' },
		body: JSON.stringify({
			access_token: accessToken || DEFAULT_TOKEN,
			doc_id: String(docId),
			variables,
			lang
		})
	})

	if (!response.ok) {
		throw new Boom(`GraphQL HTTP error ${response.status}`, { statusCode: response.status })
	}

	return parseGraphQLResponse((await response.json()) as GraphQLResponse, dataPath)
}

export const executeFacebookGraphQL = (
	docId: string | number,
	variables: GraphQLVariables,
	accessToken?: string,
	dataPath?: string,
	lang = 'en'
) => executeWWWGraphQL(docId, variables, accessToken, dataPath, lang, FACEBOOK_ENDPOINT)

export const executeWamoGraphQL = async (
	docId: string | number,
	variables: GraphQLVariables,
	auth: GraphQLAuth = {},
	dataPath?: string,
	host = 'wamo.whatsapp.net'
) => {
	const params = new URLSearchParams({
		access_token: auth.accessToken || DEFAULT_TOKEN,
		credential: auth.credential || '',
		user_id: String(auth.userId || ''),
		app_id: WAMO_APP_ID,
		doc_id: String(docId),
		variables: JSON.stringify(variables)
	})
	const response = await fetch(`https://${host}/api/wamo/graphql/`, {
		method: 'POST',
		headers: { 'content-type': 'application/x-www-form-urlencoded' },
		body: params
	})

	if (!response.ok) {
		throw new Boom(`Wamo GraphQL HTTP error ${response.status}`, { statusCode: response.status })
	}

	return parseGraphQLResponse((await response.json()) as GraphQLResponse, dataPath)
}

export const makeGraphQLSocket = <
	T extends {
		query: (node: BinaryNode) => Promise<BinaryNode>
		generateMessageTag: () => string
	}
>(
	sock: T,
	_config?: UserFacingSocketConfig
): T & GraphQLSocket => ({
	...sock,
	executeWMexQuery: <R>(variables: GraphQLVariables, queryId: string, dataPath: string) =>
		executeWMexQuery<R>(variables, queryId, dataPath, sock.query, sock.generateMessageTag),
	executeWWWGraphQL,
	executeFacebookGraphQL,
	executeWamoGraphQL
})
