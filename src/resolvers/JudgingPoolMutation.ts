import {
  Resolver, Mutation, Arg, Ctx,
} from 'type-graphql';
import { PrismaClient } from '@prisma/client';
import { Inject } from 'typedi';
import { Context } from '../context';
import { JudgingPool } from '../types/JudgingPool';
import { CreateJudgingPoolInput } from '../inputs/CreateJudgingPoolInput';

@Resolver(JudgingPool)
export class JudgingPoolMutation {
  @Inject(() => PrismaClient)
  private readonly prisma : PrismaClient;

  /**
   * Admin function to create a judging pool (which is a discrete set of criteria and judgements)
   */
  @Mutation(() => JudgingPool)
  async createJudgingPool(
    @Ctx() { auth }: Context,
    @Arg('judgingPool', () => CreateJudgingPoolInput) judgingPool: CreateJudgingPoolInput,
  ): Promise<JudgingPool> {
    if (!auth.isGlobalAdmin()) throw new Error('You must be a global admin to create judging pools.');
    if (!judgingPool.eventId && !judgingPool.eventGroupId && !judgingPool.regionId && !judgingPool.programId) {
      throw new Error('You must set at least one project filter.');
    }
    if (judgingPool.judgingCriteria?.length === 0) throw new Error('You must add at least one criteria.');

    const criteriaWeightSum = judgingPool.judgingCriteria
      .reduce((accum, c) => accum + c.weight, 0);

    return <JudgingPool><unknown> await this.prisma.judgingPool.create({
      data: {
        name: judgingPool.name,
        eventId: judgingPool.eventId,
        regionId: judgingPool.regionId,
        programId: judgingPool.programId,
        judgingCriteria: {
          create: judgingPool.judgingCriteria.map((c) => ({
            name: c.name,
            weight: c.weight / criteriaWeightSum,
          })),
        },
      },
    });
  }

  /**
   * Removes a judging pool.
   */
  @Mutation(() => Boolean)
  async removeJudgingPool(
    @Ctx() { auth }: Context,
    @Arg('judgingPool') judgingPool: string,
  ): Promise<boolean> {
    if (!auth.isGlobalAdmin()) throw new Error('You must be a global admin to remove judging pools.');

    await this.prisma.judgement.deleteMany({ where: { judgingPoolId: judgingPool } });
    await this.prisma.judgingCriteria.deleteMany({ where: { judgingPoolId: judgingPool } });
    await this.prisma.judgingPool.deleteMany({ where: { id: judgingPool } });

    return true;
  }
}
