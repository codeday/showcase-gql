import {
  Resolver, Mutation, Arg, Ctx, PubSub, PubSubEngine,
} from 'type-graphql';
import { PrismaClient, ProjectUpdateInput } from '@prisma/client';
import { Inject } from 'typedi';
import { Context } from '../context';
import { projectsInclude } from '../queryUtils';
import { Project } from '../types/Project';
import { ProjectSubscriptionTopics } from './ProjectSubscription';
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
    @Ctx() { auth }: Context,
    @PubSub() pubSub: PubSubEngine,
    @Arg('project', () => CreateProjectInput) project: CreateProjectInput,
  ): Promise<Project> {
    if (!auth.eventId || !auth.username) throw new Error('No permission to create projects.');

    const newProject = <Project><unknown> this.prisma.project.create({
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
      include: projectsInclude,
    });

    pubSub.publish(ProjectSubscriptionTopics.Create, newProject);
    return newProject;
  }

  /**
   * Edits the fields of a project.
   */
  @Mutation(() => Project)
  async editProject(
    @Ctx() { auth }: Context,
    @PubSub() pubSub: PubSubEngine,
    @Arg('id') id: string,
    @Arg('project', () => EditProjectInput) project: EditProjectInput,
  ): Promise<Project> {
    if (!await auth.isProjectAdminById(id)) throw new Error('No permission to edit this project.');

    await this.prisma.project.update({
      where: {
        id,
      },
      data: <ProjectUpdateInput>project,
    });

    const editedProject = <Project><unknown> this.prisma.project.findFirst({
      where: { id },
      include: projectsInclude,
    });

    pubSub.publish(ProjectSubscriptionTopics.Edit, editedProject);
    return editedProject;
  }

  /**
   * Deletes a project entirely.
   */
  @Mutation(() => Boolean)
  async deleteProject(
    @Ctx() { auth }: Context,
    @PubSub() pubSub: PubSubEngine,
    @Arg('id') id: string,
  ): Promise<boolean> {
    if (!await auth.isProjectAdminById(id)) throw new Error('No permission to edit this project.');

    const projectToDelete = await this.prisma.project.findFirst({
      where: {
        id,
      },
      include: projectsInclude,
    });
    if (!projectToDelete) return false;

    await this.prisma.metadata.deleteMany({ where: { projectId: id } });
    await this.prisma.metric.deleteMany({ where: { projectId: id } });
    await this.prisma.media.deleteMany({ where: { projectId: id } });
    await this.prisma.member.deleteMany({ where: { projectId: id } });
    await this.prisma.award.deleteMany({ where: { projectId: id } });
    await this.prisma.project.delete({
      where: { id },
    });

    pubSub.publish(ProjectSubscriptionTopics.Delete, projectToDelete);
    return true;
  }

  /**
   * Marks a project as featured / not featured.
   */
  @Mutation(() => Boolean)
  async featureProject(
    @Ctx() { auth }: Context,
    @PubSub() pubSub: PubSubEngine,
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

    const editedProject = await this.prisma.project.findFirst({
      where: {
        id,
      },
      include: projectsInclude,
    });

    pubSub.publish(ProjectSubscriptionTopics.Edit, editedProject);
    return true;
  }
}
