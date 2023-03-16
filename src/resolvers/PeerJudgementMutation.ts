import {
  Arg, Ctx, Mutation, Resolver,
} from 'type-graphql';
import { Container, Inject } from 'typedi';
import { PrismaClient } from '@prisma/client';
import { PeerJudgement } from '../types/PeerJudgement';
import { Context } from '../context';

@Resolver(PeerJudgement)
export class PeerJudgementMutation {
    @Inject(() => PrismaClient)
    private readonly prisma : PrismaClient;

    @Mutation(() => Boolean)
    async peerJudgeProjects(
        @Ctx() { auth }: Context,
        @Arg('eventId') eventId: string,
        @Arg('projects', () => [String]) projects: string[],
    ): Promise<boolean> {
      if (!auth.username) throw new Error('Auth token does not include username');
      if (!auth.isEventParticipant(eventId)) throw new Error('You are not a member of any projects at this event!');
      if (await Container.get(PrismaClient).peerJudgement.findFirst({ where: { eventId, username: auth.username } })) {
        // throw new Error('You have already voted');
        // This way people can submit new votes really easily. Probably a better way to handle this but this is simple
        await Container.get(PrismaClient).peerJudgement.deleteMany({ where: { eventId, username: auth.username } });
      }
      const dbProjects = await Container.get(PrismaClient).project.findMany(
        { where: { id: { in: projects } }, select: { eventId: true, members: true, id: true } },
      );
      if (!dbProjects.every((p) => p.eventId === eventId)) throw new Error('eventId mismatch');
      if (dbProjects.some((p) => p.members.some((m) => m.username === auth.username))) {
        throw new Error('You cannot vote for your own project!');
      }
      // CreateMany does not exist in this version of prisma
      dbProjects.forEach(async (project) => {
        await Container.get(PrismaClient).peerJudgement.create({
          data: {
            project: {
              connect: {
                id: project.id,
              },
            },
            eventId: project.eventId,
            username: auth.username as string,
          },
        });
      });
      return true;
    }
}
