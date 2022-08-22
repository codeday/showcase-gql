import {
  Resolver, Mutation, Arg, Ctx,
} from 'type-graphql';
import { PrismaClient } from '@prisma/client';
import { Inject } from 'typedi';
import Uploader from '@codeday/uploader-node';
import { GraphQLUpload, FileUpload } from 'graphql-upload';
import { Photo } from '../types/Photo';
import { Context } from '../context';
import { ImportPhotoInput } from '../inputs/ImportPhotoInput';

@Resolver(Photo)
export class PhotoMutation {
  @Inject(() => PrismaClient)
  private readonly prisma: PrismaClient;

  @Inject(() => Uploader)
  private readonly uploader : Uploader;

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

  @Mutation(() => Photo)
  async uploadPhoto(
    @Ctx() { auth }: Context,
    @Arg('upload', () => GraphQLUpload) upload: FileUpload,
    @Arg('eventId', () => String) eventId: string,
    @Arg('programId', () => String, { nullable: true }) programId?: string,
    @Arg('regionId', () => String, { nullable: true }) regionId?: string,
    @Arg('eventGroupId', () => String, { nullable: true }) eventGroupId?: string,
    @Arg('thanks', () => String, { nullable: true }) thanks?: string,
  ): Promise<Photo> {
    if (!(auth.isGlobalAdmin || auth.isEventAdmin(eventId))) throw new Error('No permission to upload photos.');

    const chunks = [];
    // eslint-disable-next-line no-restricted-syntax
    for await (const chunk of upload.createReadStream()) {
      chunks.push(chunk);
    }
    const uploadBuffer = Buffer.concat(chunks);

    // Upload an image
    const result = await this.uploader.image(uploadBuffer, upload.filename || '_.jpg');
    return <Photo><unknown> this.prisma.photo.create({
      data: {
        url: result.url,
        urlLarge: result.urlResize.replace('{width}', '1920').replace('{height}', '1080'),
        urlMedium: result.urlResize.replace('{width}', '800').replace('{height}', '600'),
        urlSmall: result.urlResize.replace('{width}', '256').replace('{height}', '125'),
        eventId,
        eventGroupId,
        regionId,
        programId,
        thanks,
      },
    });
  }

}
