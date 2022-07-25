import {
  Resolver, Mutation, Arg, Ctx,
} from 'type-graphql';
import { PrismaClient } from '@prisma/client';
import { Inject } from 'typedi';
import { Photo } from '../types/Photo';
import { Context } from '../context';
import { ImportPhotoInput } from '../inputs/ImportPhotoInput';

@Resolver(Photo)
export class PhotoMutation {
  @Inject(() => PrismaClient)
  private readonly prisma: PrismaClient;

  @Mutation(() => Boolean)
  async importPhotos(
    @Ctx() { auth }: Context,
    @Arg('photos', () => [ImportPhotoInput]) photos: [ImportPhotoInput],
  ): Promise<boolean> {
    if (!auth.isGlobalAdmin()) throw new Error('Only global admins can import photos.');
    photos.forEach(async (photo) => {
      await this.prisma.photo.create({
        data: {
          ...photo,
        },
      });
    });

    return true;
  }
}
