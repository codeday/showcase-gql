import {
  Resolver, Mutation, Arg, Ctx,
} from 'type-graphql';
import { PrismaClient } from '@prisma/client';
import { Inject } from 'typedi';
import { Context } from '../context';
import { Metadata } from '../types/Metadata';

@Resolver(Metadata)
export class MetadataMutation {
  @Inject(() => PrismaClient)
  private readonly prisma : PrismaClient;

  @Mutation(() => Boolean)
  async setMetadata(
    @Arg('project') project: string,
    @Arg('key') key: string,
    @Arg('value') value: string,
    @Ctx() { auth }: Context,
  ): Promise<boolean> {
    if (!await auth.isProjectAdmin(project)) throw new Error('No permission to edit this project.');

    await this.prisma.metadata.upsert({
      update: { value },
      create: {
        key,
        value,
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
    if (!await auth.isProjectAdmin(project)) throw new Error('No permission to edit this project.');

    await this.prisma.metadata.deleteMany({ where: { projectId: project, key } });
    return true;
  }
}
