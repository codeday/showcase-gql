import Express from 'express';
import http from 'http';
import { ApolloServer } from 'apollo-server-express';
import { graphqlUploadExpress } from 'graphql-upload';
import ws from 'ws';
import { execute, subscribe } from 'graphql';
import { useServer } from 'graphql-ws/lib/use/ws';
import { createSchema } from './schema';
import { createContext } from './context';
import config from './config';

export default async function server(): Promise<void> {
  const schema = await createSchema();
  const apollo = new ApolloServer({
    schema,
    context: createContext,
    playground: config.debug,
    introspection: true,
    uploads: false,
  });

  const app = Express();
  app.use(graphqlUploadExpress({ maxFileSize: 250 * 1024 * 1024, maxFiles: 3 }));
  apollo.applyMiddleware({ app });

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
