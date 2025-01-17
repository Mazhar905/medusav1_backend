const dotenv = require("dotenv");

let ENV_FILE_NAME = "";
switch (process.env.NODE_ENV) {
	case "production":
		ENV_FILE_NAME = ".env.production";
		break;
	case "staging":
		ENV_FILE_NAME = ".env.staging";
		break;
	case "test":
		ENV_FILE_NAME = ".env.test";
		break;
	case "development":
	default:
		ENV_FILE_NAME = ".env";
		break;
}

try {
	dotenv.config({ path: process.cwd() + "/" + ENV_FILE_NAME });
} catch (e) {}

// CORS when consuming Medusa from admin
const ADMIN_CORS = process.env.ADMIN_CORS || "http://localhost:7000,http://localhost:7001";

// CORS to avoid issues when consuming Medusa from a client
const STORE_CORS = process.env.STORE_CORS || "http://localhost:8000";

const DATABASE_URL = process.env.DATABASE_URL || "postgres://localhost/medusa-starter-default";

const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";

const plugins = [
	`medusa-fulfillment-manual`,
	`medusa-payment-manual`,
	{
		resolve: "@medusajs/admin",
		/** @type {import('@medusajs/admin').PluginOptions} */
		options: {},
	},
	{
		resolve: `medusa-plugin-wishlist`,
	},
	{
		resolve: `@medusajs/file-local`,
		options: {
			upload_dir: "uploads",
		},
	},
	{
		resolve: `medusa-plugin-algolia`,
		options: {
			applicationId: process.env.ALGOLIA_APP_ID,
			adminApiKey: process.env.ALGOLIA_ADMIN_API_KEY,
			settings: {
				indexName: {
					indexSettings: {
						// searchableAttributes,
						attributesToRetrieve: [
							"id",
							"title",
							"description",
							"handle",
							"thumbnail",
							"variants",
							"variant_sku",
							"options",
							"collection_title",
							"collection_handle",
							"images",
						],
					},
					transformer: (product) => ({
						objectID: product.id,
						// other attributes...
					}),
				},
			},
		},
	},
	// {
	// 	resolve: "medusa-plugin-category-images",
	// 	options: {
	// 		enableUI: true,
	// 	},
	// },
	{
		resolve: "@medusajs/admin",
		/** @type {import('@medusajs/admin').PluginOptions} */
		options: {
			serve: true,
			autoRebuild: true,
			path: "/app",
			outDir: "build",
			develop: {
				open: true,
				port: 7001,
				host: "example.com",
				logLevel: "error",
				stats: "normal",
				allowedHosts: "auto",
				webSocketURL: undefined,
			},
		},
	},
];

const modules = {
	eventBus: {
		resolve: "@medusajs/event-bus-redis",
		options: {
			redisUrl: REDIS_URL,
		},
	},
	cacheService: {
		resolve: "@medusajs/cache-redis",
		options: {
			redisUrl: REDIS_URL,
		},
	},
};

/** @type {import('@medusajs/medusa').ConfigModule["projectConfig"]} */
const projectConfig = {
	jwt_secret: process.env.JWT_SECRET || "supersecret",
	cookie_secret: process.env.COOKIE_SECRET || "supersecret",
	store_cors: STORE_CORS,
	database_url: DATABASE_URL,
	admin_cors: ADMIN_CORS,
	// Uncomment the following lines to enable REDIS
	redis_url: REDIS_URL,
	database_extra:
		process.env.NODE_ENV !== "development"
			? {
					ssl: {
						rejectUnauthorized: false,
					},
			  }
			: {},
};

/** @type {import('@medusajs/medusa').ConfigModule} */
module.exports = {
	projectConfig,
	plugins,
	modules,
};
