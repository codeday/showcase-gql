import { ApolloServer } from 'apollo-server-express';
import Express from 'express';
import { graphqlUploadExpress } from 'graphql-upload';
import { createSchema } from './schema';
import { createContext } from './context';
import config from './config';

export default async function server(): Promise<void> {
  const apollo = new ApolloServer({
    schema: await createSchema(),
    context: createContext,
    playground: config.debug,
    introspection: true,
    uploads: false,
  });
  const app = Express();
  app.use(graphqlUploadExpress({ maxFileSize: 100 * 1024 * 1024, maxFiles: 3 }));
  apollo.applyMiddleware({ app });

  // eslint-disable-next-line no-console
  app.listen(config.port, () => console.log(`Server ready at http://0.0.0.0:${config.port}${apollo.graphqlPath}`));
}
