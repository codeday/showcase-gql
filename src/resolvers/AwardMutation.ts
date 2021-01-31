import {
  Resolver, Mutation, Arg, Ctx, PubSub, PubSubEngine,
} from 'type-graphql';
import { PrismaClient } from '@prisma/client';
import { Inject } from 'typedi';
import { Context } from '../context';
import { projectsInclude } from '../queryUtils';
import { ProjectSubscriptionTopics } from './ProjectSubscription';
import { Award } from '../types/Award';

@Resolver(Award)
export class MemberMutation {
  @Inject(() => PrismaClient)
  private readonly prisma : PrismaClient;

  /**
   * Adds an award to a project. (The definition of "awards" are not tracked in Showcase, and should be loaded from a
   * different federated schema or hard-coded into the end client.)
   */
  @Mutation(() => Award)
  async addAward(
    @Ctx() { auth }: Context,
    @PubSub() pubSub: PubSubEngine,
    @Arg('project') project: string,
    @Arg('type') type: string,
    @Arg('modifier', { nullable: true }) modifier?: string,
  ): Promise<Award> {
    const dbProject = await this.prisma.project.findFirst({ where: { id: project } });
    if (!dbProject || !await auth.isEventAdmin(dbProject.eventId)) {
      throw new Error('No permission to admin this project.');
    }

    if (await this.prisma.award.count({ where: { type, modifier, projectId: project } }) > 0) {
      throw new Error('Project has already recieved this award.');
    }

    const result = await this.prisma.award.create({
      data: {
        type,
        modifier,
        project: {
          connect: {
            id: project,
          },
        },
      },
    });

    const editedProject = await this.prisma.project.findFirst({
      where: {
        id: project,
      },
      include: projectsInclude,
    });

    pubSub.publish(ProjectSubscriptionTopics.Edit, editedProject);
    return <Award><unknown> result;
  }

  /**
   * Removes an award from a project.
   */
  @Mutation(() => Boolean)
  async removeAward(
    @Ctx() { auth }: Context,
    @PubSub() pubSub: PubSubEngine,
    @Arg('id') id: string,
  ) : Promise<boolean> {
    const dbAward = await this.prisma.award.findFirst({ where: { id }, include: { project: true } });
    if (!dbAward || !await auth.isEventAdmin(dbAward.project.eventId)) {
      throw new Error('No permission to admin this project.');
    }

    const removingAward = await this.prisma.award.findFirst({ where: { id } });
    if (!removingAward) return false;

    await this.prisma.award.delete({ where: { id } });

    const editedProject = await this.prisma.project.findFirst({
      where: {
        id: removingAward?.projectId,
      },
      include: projectsInclude,
    });

    pubSub.publish(ProjectSubscriptionTopics.Edit, editedProject);
    return true;
  }
}
