import {
  Resolver, Query, Arg, registerEnumType,
} from 'type-graphql';
import { PrismaClient, PhotoOrderByInput } from '@prisma/client';
import { Inject } from 'typedi';
import { Photo } from '../types/Photo';
import { PhotosWhere } from '../inputs/PhotosWhere';
import { photosWhereToPrisma } from '../queryUtils';

enum PhotoOrderByArg {
  NEWEST = 'newest',
  OLDEST = 'oldest',
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

    return <Promise<Photo[]>><unknown> this.prisma.photo.findMany({
      skip,
      take: take || 25,
      orderBy: dbOrderBy,
      where: photosWhereToPrisma(where),
    });
  }
}
