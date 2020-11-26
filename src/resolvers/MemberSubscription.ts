/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
import {
  Resolver, Subscription, Arg, Root,
} from 'type-graphql';
import { Project } from '../types/Project';
import { Member } from '../types/Member';
import { ProjectsWhere } from '../inputs/ProjectsWhere';
import { matchProject } from '../subscriptionFilters';

interface MemberSubscriptionFilterParams {
  args: {
    where: ProjectsWhere
  }
  payload: Member
}

export enum MemberSubscriptionTopics {
  Add = 'MEMBER_ADD',
  Remove = 'MEMBER_REMOVE',
}

@Resolver(Member)
export class MemberSubscription {
  /**
   * Subscribes to notifications when a member is added to a project
   */
  @Subscription({
    topics: MemberSubscriptionTopics.Add,
    filter: ({ args, payload }: MemberSubscriptionFilterParams) => matchProject(args.where, payload.project),
  })
  memberAdded(
    @Root() member: Member,
    @Arg('where', () => ProjectsWhere, { nullable: true }) where?: ProjectsWhere,
  ): Member {
    return member;
  }

  /**
   * Subscribes to notifications when a member is removed from a project
   */
  @Subscription({
    topics: MemberSubscriptionTopics.Remove,
    filter: ({ args, payload }: MemberSubscriptionFilterParams) => matchProject(args.where, payload.project),
  })
  memberRemoved(
    @Root() member: Member,
    @Arg('where', () => ProjectsWhere, { nullable: true }) where?: ProjectsWhere,
  ): Member {
    return member;
  }
}
