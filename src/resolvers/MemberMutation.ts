import {
  Resolver, Mutation, Arg, Ctx, PubSub, PubSubEngine,
} from 'type-graphql';
import { PrismaClient } from '@prisma/client';
import { Inject } from 'typedi';
import { Context } from '../context';
import { Member } from '../types/Member';
import { MemberSubscriptionTopics } from './MemberSubscription';

@Resolver(Member)
export class MemberMutation {
  @Inject(() => PrismaClient)
  private readonly prisma : PrismaClient;

  @Mutation(() => Member)
  async addMember(
    @Ctx() { auth }: Context,
    @PubSub() pubSub: PubSubEngine,
    @Arg('project') project: string,
    @Arg('username') username: string,
  ): Promise<Member> {
    if (!await auth.isProjectAdminById(project)) throw new Error('No permission to edit this project.');
    if (await this.prisma.member.count({ where: { projectId: project, username } }) > 0) {
      throw new Error(`${username} is already a member of this project.`);
    }

    const addedMember = <Promise<Member>><unknown> this.prisma.member.create({
      data: {
        username,
        project: {
          connect: {
            id: project,
          },
        },
      },
      include: {
        project: {
          include: {
            members: true,
            media: true,
            awards: true,
            metadata: true,
          },
        },
      },
    });

    pubSub.publish(MemberSubscriptionTopics.Add, addedMember);
    return addedMember;
  }

  @Mutation(() => Boolean)
  async removeMember(
    @Ctx() { auth }: Context,
    @PubSub() pubSub: PubSubEngine,
    @Arg('project') project: string,
    @Arg('username') username: string,
  ) : Promise<boolean> {
    if (!await auth.isProjectAdminById(project)) throw new Error('No permission to edit this project.');
    if (username === auth.username) throw new Error('You cannot remove yourself from a project.');

    const removingMember = await this.prisma.member.findFirst({
      where: {
        projectId: project,
        username,
      },
      include: {
        project: {
          include: {
            members: true,
            media: true,
            awards: true,
            metadata: true,
          },
        },
      },
    });

    if (!removingMember) return false;

    await this.prisma.metric.deleteMany({ where: { projectId: project, username } });
    await this.prisma.member.deleteMany({ where: { projectId: project, username } });
    pubSub.publish(MemberSubscriptionTopics.Remove, removingMember);
    return true;
  }
}
