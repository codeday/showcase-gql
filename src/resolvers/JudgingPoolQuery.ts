import {
  Resolver, Query, Ctx,
} from 'type-graphql';
import { PrismaClient } from '@prisma/client';
import { Inject } from 'typedi';
import { Context } from '../context';
import { JudgingPool } from '../types/JudgingPool';

@Resolver(JudgingPool)
export class JudgingPoolQuery {
  @Inject(() => PrismaClient)
  private readonly prisma : PrismaClient;

  @Query(() => [JudgingPool])
  async judgingPools(
    @Ctx() { auth }: Context,
  ): Promise<JudgingPool[]> {
    if (!auth.isGlobalAdmin()) throw new Error('Only global admins can list judging pools.');
    return <Promise<JudgingPool[]>><unknown> this.prisma.judgingPool.findMany({
      include: {
        judgingCriteria: true,
      },
    });
  }

  @Query(() => JudgingPool)
  async myJudgingPool(
    @Ctx() { auth }: Context,
  ): Promise<JudgingPool> {
    if (!auth.judgingPoolId) throw new Error('You are not authorized to judge in a judging pool.');
    const pool = <JudgingPool><unknown> await this.prisma.judgingPool.findFirst({
      where: { id: auth.judgingPoolId },
      include: {
        judgingCriteria: true,
      },
    });

    if (!pool) throw new Error(`No judging pool with ID ${auth.judgingPoolId}.`);
    return pool;
  }
}
