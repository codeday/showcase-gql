import {
  Resolver, Mutation, Arg, Ctx,
} from 'type-graphql';
import { PrismaClient } from '@prisma/client';
import { Inject } from 'typedi';
import { Context } from '../context';
import { Award } from '../types/Award';

@Resolver(Award)
export class MemberMutation {
  @Inject(() => PrismaClient)
  private readonly prisma : PrismaClient;

  @Mutation(() => Boolean)
  async addAward(
    @Ctx() { auth }: Context,
    @Arg('project') project: string,
    @Arg('type') type: string,
    @Arg('modifier', { nullable: true }) modifier?: string,
  ): Promise<boolean> {
    const dbProject = await this.prisma.project.findFirst({ where: { id: project } });
    if (!dbProject || !await auth.isEventAdmin(dbProject.eventId)) {
      throw new Error('No permission to admin this project.');
    }

    await this.prisma.award.upsert({
      create: {
        type,
        modifier,
        project: {
          connect: {
            id: project,
          },
        },
      },
      update: { },
      where: {
        projectId_type_modifier: {
          projectId: project,
          type,
          modifier,
        },
      },
    });

    return true;
  }

  @Mutation(() => Boolean)
  async removeAward(
    @Ctx() { auth }: Context,
    @Arg('project') project: string,
    @Arg('type') type: string,
    @Arg('modifier', { nullable: true }) modifier?: string,
  ) : Promise<boolean> {
    const dbProject = await this.prisma.project.findFirst({ where: { id: project } });
    if (!dbProject || !await auth.isEventAdmin(dbProject.eventId)) {
      throw new Error('No permission to admin this project.');
    }

    await this.prisma.award.deleteMany({ where: { projectId: project, type, modifier } });
    return true;
  }
}
