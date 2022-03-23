import {
  Resolver, Mutation, Arg, Ctx, PubSub, PubSubEngine,
} from 'type-graphql';
import { PrismaClient, ProjectUpdateInput } from '@prisma/client';
import { Inject } from 'typedi';
import { Context } from '../context';
import { projectsInclude } from '../queryUtils';
import { MediaType } from '../types/MediaType';
import { Project } from '../types/Project';
import { ProjectSubscriptionTopics } from './ProjectSubscription';
import { CreateProjectInput } from '../inputs/CreateProjectInput';
import { EditProjectInput } from '../inputs/EditProjectInput';
import { AddReactionsInput } from '../inputs/AddReactionsInput';

const MAX_REACTIONS_PER_UPDATE = 50;

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
    if (project.slug) {
      // eslint-disable-next-line no-param-reassign
      project.slug = project.slug.toLowerCase()
        .replace(/[^a-zA-Z0-9-]/g, '-')
        .replace(/-+/g, '-');
      if ((await this.prisma.project.count({
        where: { slug: project.slug, id: { not: id } },
      })) > 0) {
        throw new Error('That slug is taken.');
      }

      const dbProject = await this.prisma.project.findUnique({
        where: { id },
        include: { media: { where: { type: MediaType.IMAGE } } },
      });
      if (!dbProject) throw new Error('No such project.');
      if (dbProject.slug && !auth.isGlobalAdmin) throw new Error('Project slug already set.');
      if (dbProject.media.length === 0 && !auth.isGlobalAdmin) {
        throw new Error('Upload at least one image to set a slug.');
      }
    }

    const { tags, ...projectData } = project;

    await this.prisma.project.update({
      where: {
        id,
      },
      data: {
        ...<ProjectUpdateInput>projectData,
        tags: { connectOrCreate: project.getSanitizedTags().map((t) => ({ where: { id: t }, create: { id: t } })) },
      },
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
    await this.prisma.reactionCount.deleteMany({ where: { projectId: id } });
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
    @Arg('isFeatured', () => Boolean, { nullable: true }) isFeatured?: boolean,
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

  /**
   * Adds reactions to a project. There are effectively no limits to how many reactions can be added per user. This
   * is intentional. No sorting option is provided for most-reactions for this reason.
   */
  @Mutation(() => Boolean)
  async addReactions(
    @PubSub() pubSub: PubSubEngine,
    @Arg('id') id: string,
    @Arg('reactions', () => [AddReactionsInput]) reactions: AddReactionsInput[],
  ): Promise<boolean> {
    const dbProjectExists = await this.prisma.project.count({ where: { id } });
    if (dbProjectExists === 0) throw Error('Project does not exist.');

    await Promise.all(reactions.map((r) => {
      const addReactions = Math.max(0, Math.min(r.count, MAX_REACTIONS_PER_UPDATE));
      this.prisma.$executeRaw`
        INSERT INTO "ReactionCount" (projectId, type, count)
        VALUES(${id}, ${r.type}, ${addReactions})
        ON CONFLICT (projectId) DO UPDATE SET count = count + ${addReactions}
      `;
    }));

    const reactedProject = await this.prisma.project.findFirst({
      where: {
        id,
      },
      include: projectsInclude,
    });

    pubSub.publish(ProjectSubscriptionTopics.React, reactedProject);
    return true;
  }
}
