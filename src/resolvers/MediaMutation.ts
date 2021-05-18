import {
  Resolver, Mutation, Arg, Ctx,
} from 'type-graphql';
import { PrismaClient } from '@prisma/client';
import { Inject } from 'typedi';
import Uploader from '@codeday/uploader-node';
import { GraphQLUpload, FileUpload } from 'graphql-upload';
import { Context } from '../context';
import { Media } from '../types/Media';
import { Project } from '../types/Project';
import { MediaType } from '../types/MediaType';
import { MediaTopic } from '../types/MediaTopic';

// TODO(@tylermenezes) add subscription support

@Resolver(Media)
export class MediaMutation {
  @Inject(() => PrismaClient)
  private readonly prisma : PrismaClient;

  @Inject(() => Uploader)
  private readonly uploader : Uploader;

  @Mutation(() => Media)
  async uploadMedia(
    @Arg('project') project: string,
    @Arg('type', () => MediaType) type: MediaType,
    @Arg('topic', () => MediaTopic) topic: MediaTopic,
    @Arg('upload', () => GraphQLUpload) upload: FileUpload,
    @Ctx() { auth }: Context,
  ): Promise<Media> {
    const dbProject = <Project><unknown> await this.prisma.project.findFirst({ where: { id: project } });
    if (!dbProject) throw new Error('Project does not exist.');

    if (topic === MediaTopic.JUDGES
        && !(
          (auth.isJudgeForProject(dbProject) && auth.judgingPoolCanUploadMedia)
          || auth.isEventAdmin(dbProject.eventId)
        )
    ) {
      throw new Error(`No permission to edit judges' media for this project.`);
    } else if (!await auth.isProjectAdminById(project)) throw new Error('No permission to edit this project.');

    const chunks = [];
    // eslint-disable-next-line no-restricted-syntax
    for await (const chunk of upload.createReadStream()) {
      chunks.push(chunk);
    }
    const uploadBuffer = Buffer.concat(chunks);

    // Upload a video
    if (type === MediaType.VIDEO) {
      const result = await this.uploader.video(uploadBuffer, upload.filename || '_.mp4');
      return <Media><unknown> this.prisma.media.create({
        data: {
          type,
          topic,
          project: {
            connect: { id: project },
          },
          image: result.image,
          stream: result.stream,
          download: result.url,
        },
      });
    }

    // Upload an image
    const result = await this.uploader.image(uploadBuffer, upload.filename || '_.jpg');
    return <Media><unknown> this.prisma.media.create({
      data: {
        type,
        topic,
        project: {
          connect: { id: project },
        },
        image: result.url,
        download: result.url,
      },
    });
  }

  @Mutation(() => Boolean)
  async deleteMedia(
    @Arg('id') id: string,
    @Ctx() { auth }: Context,
  ) : Promise<boolean> {
    const media = await this.prisma.media.findFirst({ where: { id } });
    if (!media || !await auth.isProjectAdminById(media.projectId)) throw new Error('No permission to edit this media.');

    await this.prisma.media.delete({ where: { id } });
    return true;
  }
}
