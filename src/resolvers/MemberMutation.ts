import {
  Resolver, Mutation, Arg, Ctx,
} from 'type-graphql';
import { PrismaClient } from '@prisma/client';
import { Inject } from 'typedi';
import { Context } from '../context';
import { Member } from '../types/Member';

@Resolver(Member)
export class MemberMutation {
  @Inject(() => PrismaClient)
  private readonly prisma : PrismaClient;

  @Mutation(() => Member)
  async addMember(
    @Arg('project') project: string,
    @Arg('username') username: string,
    @Ctx() { auth }: Context,
  ): Promise<Member> {
    if (!await auth.isProjectAdminById(project)) throw new Error('No permission to edit this project.');
    if (await this.prisma.member.count({ where: { projectId: project, username } }) > 0) {
      throw new Error(`${username} is already a member of this project.`);
    }

    return <Promise<Member>><unknown> this.prisma.member.create({
      data: {
        username,
        project: {
          connect: {
            id: project,
          },
        },
      },
    });
  }

  @Mutation(() => Boolean)
  async removeMember(
    @Arg('project') project: string,
    @Arg('username') username: string,
    @Ctx() { auth }: Context,
  ) : Promise<boolean> {
    if (!await auth.isProjectAdminById(project)) throw new Error('No permission to edit this project.');
    if (username === auth.username) throw new Error('You cannot remove yourself from a project.');

    await this.prisma.member.deleteMany({ where: { projectId: project, username } });
    return true;
  }
}
