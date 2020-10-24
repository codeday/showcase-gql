import {
  Resolver, Mutation, Arg, Ctx,
} from 'type-graphql';
import { PrismaClient } from '@prisma/client';
import { Inject } from 'typedi';
import { Context } from '../context';
import { Metadata } from '../types/Metadata';
import { MetadataVisibility } from '../types/MetadataVisibility';
import { Project } from '../types/Project';

@Resolver(Metadata)
export class MetadataMutation {
  @Inject(() => PrismaClient)
  private readonly prisma : PrismaClient;

  @Mutation(() => Boolean)
  async setMetadata(
    @Arg('project') project: string,
    @Arg('key') key: string,
    @Arg('value') value: string,
    @Arg('visibility', () => MetadataVisibility) visibility: MetadataVisibility,
    @Ctx() { auth }: Context,
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

    return true;
  }

  @Mutation(() => Boolean)
  async unsetMetadata(
    @Arg('project') project: string,
    @Arg('key') key: string,
    @Ctx() { auth }: Context,
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
    return true;
  }
}
