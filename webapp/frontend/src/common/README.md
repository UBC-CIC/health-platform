# Health Platform Admin Common Code

The code under `common` directory is used by both frontend and backend components. 

There are two files -
* `schema.graphql` - This defines the graphql schema for DDB tables created by backend stacks. 
* `.graphqlconfig.yml` - This contains configuration used by amplify CLI to -
   * generate types for use by typescript code for the types defined schema
   * generate graphql operations (mutations, subscriptions, queries) defined in schema

# How to generate types and operations?

When a DDB table schema changes or a new table is added we need to update the graphql schema and related types and operations files.

## Steps

1. First make changes to schema in `schema.graphql` file. Then execute the types and operations using below commands.
1. Follow  [Command to generate typescript types](#command-to-generate-typescript-types) section to generate `types/API.ts` file.
1. Follow  [Command to generate typescript graphql operations](#command-to-generate-typescript-graphql-operations) section to generate `types/API.ts` file.
1. Build frontend to copy over the common folder changes done in backend to frontend.
```
cd frontend
npm run build
```

### Command to generate typescript types

The following steps need [amplify CLI](https://docs.amplify.aws/cli/start/install). To install it run:-

```
npm install -g @aws-amplify/cli
```

Then run the following command to generate typescript types - 

```
cd common
amplify codegen types
```

This will generate `types/API.ts` file. 

### Command to generate typescript graphql operations

The following steps need [amplify-graphql-docs-generator](https://github.com/aws-amplify/amplify-cli/tree/eb9257eaee117d0ed53ebc23aa28ecd7b7510fa1/packages/amplify-graphql-docs-generator) tool. To install it run:-

```
npm install -g amplify-graphql-docs-generator
```

Then execute below commands to generate graphql operations :-

```
cd common
amplify-graphql-docs-generator --schema graphql/schema.graphql --output ./graphql --language typescript --separateFiles --maxDepth 10
```

This will generate following files - `graphql/mutations.ts`, `graphql/subscriptions.ts`, `graphql/queries.ts`.