import { Injectable, Logger } from '@nestjs/common';
import { createClient, SanityClient } from '@sanity/client';
import {
  PublishSanityDocumentRequest,
  PublishSanityDocumentResponse,
  SanityCredentials,
} from '../interfaces/sanity.interfaces';
import { htmlToPortableText } from '../utils/html-to-portable-text.util';

const API_VERSION = '2024-01-01';

function slugify(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 96);
}

@Injectable()
export class SanityService {
  private readonly logger = new Logger(SanityService.name);

  private client({
    projectId,
    dataset,
    apiToken,
  }: SanityCredentials): SanityClient {
    return createClient({
      projectId,
      dataset,
      token: apiToken,
      apiVersion: API_VERSION,
      useCdn: false,
    });
  }

  async testConnection(credentials: SanityCredentials): Promise<void> {
    try {
      await this.client(credentials).datasets.list();
    } catch (error) {
      throw new Error(`Failed to connect to Sanity: ${error.message}`);
    }
  }

  async publishDocument(
    request: PublishSanityDocumentRequest,
  ): Promise<PublishSanityDocumentResponse> {
    try {
      const client = this.client(request);
      const documentId = `postwise.${request.documentId}`;

      let coverImageAsset: { _type: 'reference'; _ref: string } | undefined;
      if (request.coverImageUrl) {
        coverImageAsset = await this.uploadImageAsset(
          client,
          request.coverImageUrl,
        );
      }

      const doc = await client.createOrReplace({
        _id: documentId,
        _type: request.documentType,
        title: request.title ?? undefined,
        slug: request.title
          ? { _type: 'slug', current: slugify(request.title) }
          : undefined,
        excerpt: request.excerpt ?? undefined,
        body: htmlToPortableText(request.bodyHtml),
        seoTitle: request.seoTitle ?? undefined,
        seoDescription: request.seoDescription ?? undefined,
        canonicalUrl: request.canonicalUrl ?? undefined,
        ...(coverImageAsset
          ? { coverImage: { _type: 'image', asset: coverImageAsset } }
          : {}),
      });

      return {
        external_id: doc._id,
        external_url: `https://${request.projectId}.sanity.studio/desk/${request.documentType};${doc._id}`,
      };
    } catch (error) {
      this.logger.error(`Failed to publish Sanity document: ${error.message}`);
      throw new Error(`Failed to publish Sanity document: ${error.message}`);
    }
  }

  private async uploadImageAsset(
    client: SanityClient,
    imageUrl: string,
  ): Promise<{ _type: 'reference'; _ref: string } | undefined> {
    try {
      const response = await fetch(imageUrl);
      if (!response.ok) return undefined;

      const buffer = Buffer.from(await response.arrayBuffer());
      const asset = await client.assets.upload('image', buffer);
      return { _type: 'reference', _ref: asset._id };
    } catch (error) {
      this.logger.warn(
        `Failed to upload cover image to Sanity: ${error.message}`,
      );
      return undefined;
    }
  }
}
