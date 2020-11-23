import {
  Resolver, Mutation, Arg, Ctx,
} from 'type-graphql';
import { PrismaClient, ProjectUpdateInput } from '@prisma/client';
import { Inject } from 'typedi';
import { Context } from '../context';
import { Project } from '../types/Project';
import { CreateProjectInput } from '../inputs/CreateProjectInput';
import { EditProjectInput } from '../inputs/EditProjectInput';

@Resolver(Project)
export class ProjectMutation {
  @Inject(() => PrismaClient)
  private readonly prisma : PrismaClient;

  /**
   * Creates a new project (with the event information coming from the user's token).
   */
  @Mutation(() => Project)
  async createProject(
    @Arg('project', () => CreateProjectInput) project: CreateProjectInput,
    @Ctx() { auth }: Context,
  ): Promise<Project> {
    if (!auth.eventId || !auth.username) throw new Error('No permission to create projects.');

    return <Project><unknown> this.prisma.project.create({
      data: {
        eventId: auth.eventId,
        programId: auth.programId,
        eventGroupId: auth.eventGroupId,
        regionId: auth.regionId,
        members: {
          create: [
            {
              username: auth.username,
            },
          ],
        },
        ...project,
      },
      include: {
        members: true,
        media: true,
        awards: true,
        metadata: true,
      },
    });
  }

  /**
   * Edits the fields of a project.
   */
  @Mutation(() => Project)
  async editProject(
    @Arg('id') id: string,
    @Arg('project', () => EditProjectInput) project: EditProjectInput,
    @Ctx() { auth }: Context,
  ): Promise<Project> {
    if (!await auth.isProjectAdminById(id)) throw new Error('No permission to edit this project.');

    await this.prisma.project.update({
      where: {
        id,
      },
      data: <ProjectUpdateInput>project,
    });

    return <Project><unknown> this.prisma.project.findFirst({
      where: { id },
      include: {
        members: true,
        media: true,
        awards: true,
        metadata: true,
      },
    });
  }

  /**
   * Deletes a project entirely.
   */
  @Mutation(() => Boolean)
  async deleteProject(
    @Arg('id') id: string,
    @Ctx() { auth }: Context,
  ): Promise<boolean> {
    if (!await auth.isProjectAdminById(id)) throw new Error('No permission to edit this project.');

    await this.prisma.project.delete({
      where: { id },
    });

    return true;
  }

  /**
   * Marks a project as featured / not featured.
   */
  @Mutation(() => Boolean)
  async featureProject(
    @Ctx() { auth }: Context,
    @Arg('id') id: string,
    @Arg('isFeatured', { nullable: true }) isFeatured?: boolean,
  ): Promise<boolean> {
    const dbProject = await this.prisma.project.findFirst({ where: { id } });
    if (!dbProject || !await auth.isEventAdmin(dbProject.eventId)) {
      throw new Error('No permission to admin this project.');
    }

    await this.prisma.project.update({
      where: {
        id,
      },
      data: {
        featured: typeof isFeatured !== 'undefined' ? isFeatured : true,
      },
    });

    return true;
  }
}
