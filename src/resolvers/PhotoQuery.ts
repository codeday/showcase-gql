import {
  Resolver, Query, Arg, registerEnumType,
} from 'type-graphql';
import { PrismaClient, PhotoOrderByInput } from '@prisma/client';
import { Inject } from 'typedi';
import shuffle from 'knuth-shuffle-seeded';
import { Photo } from '../types/Photo';
import { PhotosWhere } from '../inputs/PhotosWhere';
import { photosWhereToPrisma } from '../queryUtils';

enum PhotoOrderByArg {
  NEWEST = 'newest',
  OLDEST = 'oldest',
  RANDOM = 'random',
}
registerEnumType(PhotoOrderByArg, { name: 'PhotoOrderByArg' });

@Resolver(Photo)
export class PhotoQuery {
  @Inject(() => PrismaClient)
  private readonly prisma : PrismaClient;

  @Query(() => Photo)
  async photo(
    @Arg('id', { nullable: true }) id: string,
  ): Promise<Photo> {
    return <Promise<Photo>><unknown> this.prisma.photo.findFirst({
      where: { id },
    });
  }

  @Query(() => [Photo])
  async photos(
    @Arg('skip', () => Number, { nullable: true }) skip?: number,
    @Arg('take', () => Number, { nullable: true }) take?: number,
    @Arg('orderBy', () => PhotoOrderByArg, { nullable: true }) orderBy?: PhotoOrderByArg,
    @Arg('where', () => PhotosWhere, { nullable: true }) where?: PhotosWhere,
  ): Promise<Photo[]> {
    let dbOrderBy: PhotoOrderByInput = { createdAt: 'desc' };
    if (orderBy === PhotoOrderByArg.OLDEST) {
      dbOrderBy = { createdAt: 'asc' };
    }

    // Not a particularly great way to do this
    if (orderBy === PhotoOrderByArg.RANDOM) {
      const ids = shuffle((await this.prisma.photo.findMany({
        where: photosWhereToPrisma(where),
        select: { id: true },
      })).map((e) => e.id)).slice(0, take);

      return <Promise<Photo[]>><unknown> this.prisma.photo.findMany({ where: { id: { in: ids } } });
    }

    return <Promise<Photo[]>><unknown> this.prisma.photo.findMany({
      skip,
      take: take || 25,
      orderBy: dbOrderBy,
      where: photosWhereToPrisma(where),
    });

  }
}
