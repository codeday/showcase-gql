import { ApolloServer } from 'apollo-server';
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
    subscriptions: {
      path: '/subscriptions',
    },
  });

  // eslint-disable-next-line no-console
  apollo.listen({ port: config.port }).then(({ url }) => console.log(url));
}
