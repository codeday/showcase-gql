/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
import {
  Resolver, Subscription, Arg, Root,
} from 'type-graphql';
import { Project } from '../types/Project';
import { ProjectsWhere } from '../inputs/ProjectsWhere';
import { matchProject } from '../subscriptionFilters';

interface ProjectSubscriptionFilterParams {
  args: {
    where: ProjectsWhere
  }
  payload: Project
}

export enum ProjectSubscriptionTopics {
  Create = 'PROJECT_CREATE',
  Edit = 'PROJECT_EDIT',
  Delete = 'PROJECT_DELETE',
  React = 'PROJECT_REACT',
}

@Resolver(Project)
export class ProjectSubscription {
  /**
   * Subscribes to notifications when a project is created
   */
  @Subscription({
    topics: ProjectSubscriptionTopics.Create,
    filter: ({ args, payload }: ProjectSubscriptionFilterParams) => matchProject(args.where, payload),
  })
  projectCreated(
    @Root() project: Project,
    @Arg('where', () => ProjectsWhere, { nullable: true }) where?: ProjectsWhere,
  ): Project {
    return project;
  }

  /**
   * Subscribes to notifications when a project is edited
   */
  @Subscription({
    topics: ProjectSubscriptionTopics.Edit,
    filter: ({ args, payload }: ProjectSubscriptionFilterParams) => matchProject(args.where, payload),
  })
  projectEdited(
    @Root() project: Project,
    @Arg('where', () => ProjectsWhere, { nullable: true }) where?: ProjectsWhere,
  ): Project {
    return project;
  }

  /**
   * Subscribes to notifications when a project is deleted
   */
  @Subscription({
    topics: ProjectSubscriptionTopics.Delete,
    filter: ({ args, payload }: ProjectSubscriptionFilterParams) => matchProject(args.where, payload),
  })
  projectDeleted(
    @Root() project: Project,
    @Arg('where', () => ProjectsWhere, { nullable: true }) where?: ProjectsWhere,
  ): Project {
    return project;
  }
}
