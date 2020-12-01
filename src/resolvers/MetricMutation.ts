import {
  Resolver, Mutation, Arg, Ctx,
} from 'type-graphql';
import { PrismaClient } from '@prisma/client';
import { Inject } from 'typedi';
import { Context } from '../context';
import { Metric } from '../types/Metric';
import { Project } from '../types/Project';

@Resolver(Metric)
export class MetricMutation {
  @Inject(() => PrismaClient)
  private readonly prisma : PrismaClient;

  @Mutation(() => Boolean)
  async recordMetric(
    @Ctx() { auth }: Context,
    @Arg('project') project: string,
    @Arg('member') member: string,
    @Arg('name') name: string,
    @Arg('value') value: number,
  ): Promise<boolean> {
    const dbProject = <Project> await this.prisma.project.findFirst({ where: { id: project } });
    if (!dbProject || !auth.isEventAdmin(dbProject.eventId)) {
      throw new Error('No permission to instrument this project.');
    }

    const dbMemberExists = (await this.prisma.member.count({ where: { username: member, projectId: project } })) > 0;
    if (!dbMemberExists) throw new Error('User is not a member of this project.');

    await this.prisma.metric.create({
      data: {
        project: { connect: { id: project } },
        member: { connect: { projectId_username: { projectId: project, username: member } } },
        name,
        value,
      },
    });

    return true;
  }
}
