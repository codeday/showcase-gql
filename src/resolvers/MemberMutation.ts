import {
  Resolver, Mutation, Arg, Ctx, PubSub, PubSubEngine,
} from 'type-graphql';
import { PrismaClient, Project as PrismaProject } from '@prisma/client';
import { Inject } from 'typedi';
import { Context } from '../context';
import { Member } from '../types/Member';
import { projectsInclude } from '../queryUtils';
import { MemberSubscriptionTopics } from './MemberSubscription';
import { Project } from '../types/Project';

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
    if (await this.prisma.member.count({ where: { projectId: project, username: { equals: username, mode: 'insensitive' } } }) > 0) {
      throw new Error(`${username} is already a member of this project.`);
    }

    const addedMember = <Promise<Member>><unknown> this.prisma.member.create({
      data: {
        username: username.toLowerCase(),
        project: {
          connect: {
            id: project,
          },
        },
      },
      include: {
        project: {
          include: projectsInclude,
        },
      },
    });

    pubSub.publish(MemberSubscriptionTopics.Add, addedMember);
    return addedMember;
  }

  @Mutation(() => Project)
  async joinProject(
    @Ctx() { auth }: Context,
    @PubSub() pubSub: PubSubEngine,
    @Arg('joinCode') joinCode: string,
  ): Promise<PrismaProject> {
    if (!auth.username) throw new Error('Not logged in.');
    const fixedJoinCode = joinCode.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const project = await this.prisma.project.findFirst({
      where: { joinCode: { equals: fixedJoinCode, mode: 'insensitive' } }
    });
    if (!project) throw new Error(`Join code not found.`);

    if (await this.prisma.member.count({ where: { projectId: project.id, username: { equals: auth.username, mode: 'insensitive' } } }) > 0) {
      throw new Error(`You are already a member of this project.`);
    }

    const addedMember = await this.prisma.member.create({
      data: {
        username: auth.username.toLowerCase(),
        project: {
          connect: {
            id: project.id,
          },
        },
      },
      include: {
        project: {
          include: projectsInclude,
        },
      },
    });

    pubSub.publish(MemberSubscriptionTopics.Add, <Member><unknown>addedMember);
    return addedMember.project;
  }

  @Mutation(() => Boolean)
  async removeMember(
    @Ctx() { auth }: Context,
    @PubSub() pubSub: PubSubEngine,
    @Arg('project') project: string,
    @Arg('username') username: string,
  ) : Promise<boolean> {
    if (!await auth.isProjectAdminById(project)) throw new Error('No permission to edit this project.');
    if (username === auth.username && !auth.isGlobalAdmin) throw new Error('You cannot remove yourself from a project.');

    const removingMember = await this.prisma.member.findFirst({
      where: {
        projectId: project,
        username: { equals: username, mode: 'insensitive' },
      },
      include: {
        project: {
          include: projectsInclude,
        },
      },
    });

    if (!removingMember) return false;

    await this.prisma.metric.deleteMany({ where: { projectId: project, username: { equals: username, mode: 'insensitive' } } });
    await this.prisma.member.deleteMany({ where: { projectId: project, username: { equals: username, mode: 'insensitive' } } });
    pubSub.publish(MemberSubscriptionTopics.Remove, removingMember);
    return true;
  }
}
