import {
  Resolver, Mutation, Arg, Ctx,
} from 'type-graphql';
import { PrismaClient } from '@prisma/client';
import { Inject } from 'typedi';
import { Context } from '../context';
import { Project } from '../types/Project';
import { Judgement } from '../types/Judgement';

@Resolver(Judgement)
export class JudgementMutation {
  @Inject(() => PrismaClient)
  private readonly prisma : PrismaClient;

  /**
   * Saves a judgement.
   */
  @Mutation(() => Boolean)
  async judgeProject(
    @Ctx() { auth }: Context,
    @Arg('project') project: string,
    @Arg('judgingCriteria') judgingCriteria: string,
    @Arg('value') value: number,
  ): Promise<boolean> {
    const dbProject = <Project><unknown> await this.prisma.project.findFirst({ where: { id: project }, include: { members: true } });
    if (!dbProject) throw new Error('Project does not exist.');

    const dbJudgingCriteria = await this.prisma.judgingCriteria.findFirst({ where: { id: judgingCriteria } });
    if (!dbJudgingCriteria) throw new Error('No such judging criteria.');
    if (dbJudgingCriteria.judgingPoolId !== auth.judgingPoolId) throw new Error('Judging criteria not available.');

    if (!auth.username) throw new Error('You must be logged in to judge projects.');
    if (!auth.isJudgeForProject(dbProject)) throw new Error('You do not have permission to judge this project.');
    if (dbProject.members.map((m) => m.username).includes(auth.username)) throw new Error('You cannot vote for your own project.');

    if (value < 0 || value > 1) throw new Error('Judgement value should be between 0 and 1.');

    await this.prisma.judgement.upsert({
      create: {
        project: { connect: { id: project } },
        judgingPool: { connect: { id: auth.judgingPoolId } },
        judgingCriteria: { connect: { id: judgingCriteria } },
        username: auth.username,
        value,
      },
      update: { value },
      where: {
        projectId_judgingCriteriaId_username: {
          projectId: project,
          judgingCriteriaId: judgingCriteria,
          username: auth.username,
        },
      },
    });

    return true;
  }
}
