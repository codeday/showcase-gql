import Express from 'express';
import http from 'http';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@as-integrations/express4';
import { graphqlUploadExpress } from 'graphql-upload';
import ws from 'ws';
import { execute, subscribe } from 'graphql';
import { useServer } from 'graphql-ws/lib/use/ws';
import { createSchema } from './schema';
import { Context, createContext } from './context';
import config from './config';

export default async function server(): Promise<void> {
  const schema = await createSchema();
  const apollo = new ApolloServer<Context>({
    schema,
    introspection: true,
  });
  await apollo.start();

  const app = Express();
  app.use(
    '/graphql',
    graphqlUploadExpress({ maxFileSize: 250 * 1024 * 1024, maxFiles: 3 }),
    Express.json(),
    expressMiddleware(apollo, {
      context: async ({ req }) => createContext({ req }),
    }),
  );

  const server = http.createServer(app);

  const wsServer = new ws.Server({
    server,
    path: '/graphql',
  });

  server.listen(config.port, () => {
    useServer(
      {
        schema,
        execute,
        subscribe,
        context: createContext,
      },
      wsServer,
    );
    console.log(`Listening on http://0.0.0.0:${config.port}`);
  });
}
