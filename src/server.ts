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
  });

  const { url } = await apollo.listen({ port: 5000 });

  // eslint-disable-next-line no-console
  console.log(`Server ready at ${url}`);
}
