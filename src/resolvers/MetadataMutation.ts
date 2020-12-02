import {
  Resolver, Mutation, Arg, Ctx, PubSub, PubSubEngine,
} from 'type-graphql';
import { PrismaClient } from '@prisma/client';
import { Inject } from 'typedi';
import { Context } from '../context';
import { ProjectSubscriptionTopics } from './ProjectSubscription';
import { projectsInclude } from '../queryUtils';
import { Metadata } from '../types/Metadata';
import { MetadataVisibility } from '../types/MetadataVisibility';
import { Project } from '../types/Project';

@Resolver(Metadata)
export class MetadataMutation {
  @Inject(() => PrismaClient)
  private readonly prisma : PrismaClient;

  @Mutation(() => Boolean)
  async setMetadata(
    @Ctx() { auth }: Context,
    @PubSub() pubSub: PubSubEngine,
    @Arg('project') project: string,
    @Arg('key') key: string,
    @Arg('value') value: string,
    @Arg('visibility', () => MetadataVisibility) visibility: MetadataVisibility,
  ): Promise<boolean> {
    const dbProject = <Project> await this.prisma.project.findFirst({ where: { id: project } });
    if (!dbProject || !auth.isProjectAdmin(dbProject)) throw new Error('No permission to edit this project.');

    const existingHigherVisibility = await this.prisma.metadata.count({
      where: {
        OR: auth.visibilityConditionsInvert(dbProject),
      },
    });

    if (existingHigherVisibility > 0) throw new Error(`${key} is already set, but requires higher permissions.`);
    if (!auth.canSetVisibility(dbProject, visibility)) throw new Error('Requested visibility level too high.');

    await this.prisma.metadata.upsert({
      update: { value, visibility },
      create: {
        key,
        value,
        visibility,
        project: {
          connect: {
            id: project,
          },
        },
      },
      where: {
        projectId_key: {
          projectId: project,
          key,
        },
      },
    });

    pubSub.publish(ProjectSubscriptionTopics.Edit, await this.prisma.project.findFirst({
      where: { id: project },
      include: projectsInclude,
    }));
    return true;
  }

  @Mutation(() => Boolean)
  async unsetMetadata(
    @Ctx() { auth }: Context,
    @PubSub() pubSub: PubSubEngine,
    @Arg('project') project: string,
    @Arg('key') key: string,
  ) : Promise<boolean> {
    const dbProject = <Project> await this.prisma.project.findFirst({ where: { id: project } });
    if (!dbProject || !auth.isProjectAdmin(dbProject)) throw new Error('No permission to edit this project.');

    const previousHigherVisibility = await this.prisma.metadata.count({
      where: {
        OR: auth.visibilityConditionsInvert(dbProject),
      },
    });
    if (previousHigherVisibility > 0) throw new Error(`${key} requires higher permission.`);

    await this.prisma.metadata.deleteMany({ where: { projectId: project, key } });

    pubSub.publish(ProjectSubscriptionTopics.Edit, await this.prisma.project.findFirst({
      where: { id: project },
      include: projectsInclude,
    }));
    return true;
  }
}
